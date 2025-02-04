import { Patient } from "@metriport/core/domain/patient";
import { MedicalDataSource } from "@metriport/core/external/index";
import { executeAsynchronously } from "@metriport/core/util/concurrency";
import { errorToString } from "@metriport/core/util/error/shared";
import { out } from "@metriport/core/util/log";
import { capture } from "@metriport/core/util/notifications";
import { isCQDirectEnabledForCx } from "../../aws/app-config";
import { buildInterrupt } from "../../hie/reset-doc-query-progress";
import { scheduleDocQuery } from "../../hie/schedule-document-query";
import { setDocQueryProgress } from "../../hie/set-doc-query-progress";
import { setDocQueryStartAt } from "../../hie/set-doc-query-start";
import { makeOutboundResultPoller } from "../../ihe-gateway/outbound-result-poller-factory";
import { getCQDirectoryEntry } from "../command/cq-directory/get-cq-directory-entry";
import { getCQPatientData } from "../command/cq-patient-data/get-cq-data";
import { CQLink } from "../cq-patient-data";
import { getCQData } from "../patient";
import { createOutboundDocumentQueryRequests } from "./create-outbound-document-query-req";
import { makeIHEGatewayV2 } from "../../ihe-gateway-v2/ihe-gateway-v2-factory";
import { getCqInitiator } from "../shared";
import { isFacilityEnabledToQueryCQ } from "../../carequality/shared";
import { filterCqLinksByManagingOrg } from "./filter-oids-by-managing-org";

const resultPoller = makeOutboundResultPoller();

export async function getDocumentsFromCQ({
  requestId,
  facilityId,
  patient,
  cqManagingOrgName,
}: {
  requestId: string;
  facilityId?: string;
  patient: Patient;
  cqManagingOrgName?: string;
}) {
  const { log } = out(`CQ DQ - requestId ${requestId}, patient ${patient.id}`);
  const { cxId, id: patientId } = patient;

  const interrupt = buildInterrupt({
    patientId,
    requestId,
    cxId,
    source: MedicalDataSource.CAREQUALITY,
    log,
  });

  const isCqQueryEnabled = await isFacilityEnabledToQueryCQ(facilityId, { id: patientId, cxId });

  if (!resultPoller.isDQEnabled()) return interrupt(`IHE DQ result poller not available`);
  if (!(await isCQDirectEnabledForCx(cxId))) return interrupt(`CQ disabled for cx ${cxId}`);
  if (!isCqQueryEnabled) return interrupt(`CQ disabled for facility ${facilityId}`);

  try {
    const [cqPatientData] = await Promise.all([
      getCQPatientData({ id: patient.id, cxId }),
      setDocQueryProgress({
        patient: { id: patient.id, cxId: patient.cxId },
        downloadProgress: { status: "processing" },
        convertProgress: { status: "processing" },
        requestId,
        source: MedicalDataSource.CAREQUALITY,
      }),
    ]);

    // If DQ is triggered while the PD is in progress, schedule it to be done when PD is completed
    if (getCQData(patient.data.externalData)?.discoveryStatus === "processing") {
      await scheduleDocQuery({ requestId, patient, source: MedicalDataSource.CAREQUALITY });
      return;
    }
    if (!cqPatientData || cqPatientData.data.links.length <= 0) {
      return interrupt(`Patient has no CQ links, skipping DQ`);
    }

    await setDocQueryStartAt({
      patient: { id: patient.id, cxId: patient.cxId },
      source: MedicalDataSource.CAREQUALITY,
      startedAt: new Date(),
    });

    const linksWithDqUrl: CQLink[] = [];
    const addDqUrlToCqLink = async (patientLink: CQLink): Promise<void> => {
      const gateway = await getCQDirectoryEntry(patientLink.oid);

      if (!gateway) {
        const msg = `Gateway not found - Doc Query`;
        log(`${msg}: ${patientLink.oid} skipping...`);
        capture.message(msg, {
          extra: {
            context: `cq.pd.getCQDirectoryEntry`,
            patientId,
            requestId,
            cxId,
            gateway: patientLink,
          },
        });
        return;
      } else if (!gateway.urlDQ) {
        log(`Gateway ${gateway.id} has no DQ URL, skipping...`);
        return;
      }

      linksWithDqUrl.push({
        ...patientLink,
        url: gateway.urlDQ,
      });
    };
    await executeAsynchronously(cqPatientData.data.links, addDqUrlToCqLink, {
      numberOfParallelExecutions: 20,
    });

    const initiator = await getCqInitiator(patient);

    const cqLinks = cqManagingOrgName
      ? await filterCqLinksByManagingOrg(cqManagingOrgName, linksWithDqUrl)
      : linksWithDqUrl;

    const documentQueryRequestsV2 = createOutboundDocumentQueryRequests({
      requestId,
      patient,
      initiator,
      cxId,
      cqLinks,
    });

    // We send the request to IHE Gateway to initiate the doc query.
    // Then as they are processed by each gateway it will start
    // sending them to the internal route one by one
    if (documentQueryRequestsV2.length > 0) {
      log(`Starting document query - Gateway V2`);
      const iheGatewayV2 = makeIHEGatewayV2();
      await iheGatewayV2.startDocumentQueryGatewayV2({
        dqRequestsGatewayV2: documentQueryRequestsV2,
        requestId,
        patientId,
        cxId,
      });
    }

    await resultPoller.pollOutboundDocQueryResults({
      requestId,
      patientId: patient.id,
      cxId: patient.cxId,
      numOfGateways: documentQueryRequestsV2.length,
    });
  } catch (error) {
    const msg = `Failed to query and process documents - Carequality`;
    log(`${msg}. Error: ${errorToString(error)}`);

    await setDocQueryProgress({
      patient: { id: patient.id, cxId: patient.cxId },
      downloadProgress: { status: "failed" },
      convertProgress: { status: "failed" },
      requestId,
      source: MedicalDataSource.CAREQUALITY,
    });

    capture.error(msg, {
      extra: {
        context: `cq.queryAndProcessDocuments`,
        error,
        patientId: patient.id,
        requestId,
      },
    });
    throw error;
  }
}
