import { XMLBuilder } from "fast-xml-parser";
import dayjs from "dayjs";
import { createSecurityHeader } from "../security/security-header";
import { signFullSaml } from "../security/sign";
import { namespaces } from "../namespaces";
import {
  ORGANIZATION_NAME_DEFAULT as metriportOrganization,
  METRIPORT_HOME_COMMUNITY_ID_NO_PREFIX,
  replyTo,
} from "../../carequality/shared";
import { wrapIdInUrnUuid } from "../utils";

const DATE_DASHES_REGEX = /-/g;

const action = "urn:hl7-org:v3:PRPA_IN201305UV02:CrossGatewayPatientDiscovery";

type XCPDBodyData = {
  id: string;
  gateway: {
    oid: string;
    url: string;
  };
  principalCareProviderIds: string[];
  samlAttributes: {
    subjectRole: {
      display: string;
    };
    organization: string;
    organizationId: string;
    homeCommunityId: string;
    purposeOfUse: string;
  };
  patientResource: {
    gender: string;
    birthDate: string;
    name: Array<{
      family: string;
      given: string[];
    }>;
    address: Array<{
      line: string[];
      city: string;
      state: string;
      postalCode: string;
      country: string;
    }>;
    telecom?: Array<{
      value: string;
    }>;
  };
};

function createSoapBody({
  bodyData,
  createdTimestamp,
}: {
  bodyData: XCPDBodyData;
  createdTimestamp: string;
}): object {
  const messageId = wrapIdInUrnUuid(bodyData.id);
  const receiverDeviceId = bodyData.gateway.oid;
  const toUrl = bodyData.gateway.url;
  const providerId = bodyData.principalCareProviderIds[0];
  const homeCommunityId = bodyData.samlAttributes.homeCommunityId;
  const patientGender = bodyData.patientResource.gender === "female" ? "F" : "M";
  const patientBirthtime = bodyData.patientResource.birthDate.replace(DATE_DASHES_REGEX, "");
  const patientFamilyName = bodyData.patientResource.name?.[0]?.family;
  const patientGivenName = bodyData.patientResource.name?.[0]?.given?.[0];
  const patientAddress = bodyData.patientResource.address?.[0];
  const patientTelecom = bodyData.patientResource.telecom?.[0]?.value ?? undefined;

  const soapBody = {
    "soap:Body": {
      "@_xmlns:urn": namespaces.urn,
      "urn:PRPA_IN201305UV02": {
        "@_ITSVersion": "XML_1.0",
        "urn:id": {
          "@_extension": messageId,
          "@_root": homeCommunityId,
        },
        "urn:creationTime": {
          "@_value": createdTimestamp,
        },
        "urn:interactionId": {
          "@_extension": "PRPA_IN201305UV02",
          "@_root": "2.16.840.1.113883.1.6",
        },
        "urn:processingCode": {
          "@_code": "P",
        },
        "urn:processingModeCode": {
          "@_code": "T",
        },
        "urn:acceptAckCode": {
          "@_code": "AL",
        },
        "urn:receiver": {
          "@_typeCode": "RCV",
          "urn:device": {
            "@_classCode": "DEV",
            "@_determinerCode": "INSTANCE",
            "urn:id": {
              "@_root": receiverDeviceId,
            },
            "urn:telecom": {
              "@_value": toUrl,
            },
            "urn:asAgent": {
              "@_classCode": "AGNT",
              "urn:representedOrganization": {
                "@_classCode": "ORG",
                "@_determinerCode": "INSTANCE",
                "urn:id": {
                  "@_root": receiverDeviceId,
                },
              },
            },
          },
        },
        "urn:sender": {
          "@_typeCode": "SND",
          "urn:device": {
            "@_classCode": "DEV",
            "@_determinerCode": "INSTANCE",
            "urn:id": {
              "@_root": METRIPORT_HOME_COMMUNITY_ID_NO_PREFIX,
            },
            "urn:asAgent": {
              "@_classCode": "AGNT",
              "urn:representedOrganization": {
                "@_classCode": "ORG",
                "@_determinerCode": "INSTANCE",
                "urn:id": {
                  "@_root": METRIPORT_HOME_COMMUNITY_ID_NO_PREFIX,
                },
                "urn:name": metriportOrganization,
              },
            },
          },
        },
        "urn:controlActProcess": {
          "@_classCode": "CACT",
          "@_moodCode": "EVN",
          "urn:code": {
            "@_code": "PRPA_TE201305UV02",
            "@_codeSystem": "2.16.840.1.113883.1.6",
          },
          "urn:queryByParameter": {
            "urn:queryId": {
              "@_extension": messageId,
              "@_root": homeCommunityId,
            },
            "urn:statusCode": {
              "@_code": "new",
            },
            "urn:responseModalityCode": {
              "@_code": "R",
            },
            "urn:responsePriorityCode": {
              "@_code": "I",
            },
            "urn:parameterList": {
              "urn:livingSubjectAdministrativeGender": {
                "urn:value": {
                  "@_code": patientGender,
                  "@_codeSystem": "2.16.840.1.113883.5.1",
                },
                "urn:semanticsText": "LivingSubject.administrativeGender",
              },
              "urn:livingSubjectBirthTime": {
                "urn:value": {
                  "@_value": patientBirthtime,
                },
                "urn:semanticsText": "LivingSubject.birthTime",
              },
              "urn:livingSubjectName": {
                "urn:value": {
                  "urn:family": patientFamilyName,
                  "urn:given": patientGivenName,
                },
                "urn:semanticsText": "LivingSubject.name",
              },
              "urn:patientAddress": patientAddress
                ? {
                    "urn:value": {
                      "urn:streetAddressLine": patientAddress.line.join(", "),
                      "urn:city": patientAddress.city,
                      "urn:state": patientAddress.state,
                      "urn:postalCode": patientAddress.postalCode,
                      "urn:country": patientAddress.country,
                    },
                    "urn:semanticsText": "Patient.addr",
                  }
                : {},
              "urn:patientTelecom": patientTelecom
                ? {
                    "urn:value": patientTelecom,
                    "urn:semanticsText": "Patient.telecom",
                  }
                : {},
              "urn:principalCareProviderId": {
                "urn:value": {
                  "@_extension": providerId,
                  "@_root": "2.16.840.1.113883.4.6",
                },
              },
            },
          },
        },
      },
    },
  };
  return soapBody;
}

export function createITI5SoapEnvelope({
  bodyData,
  publicCert,
}: {
  bodyData: XCPDBodyData;
  publicCert: string;
}): string {
  const messageId = wrapIdInUrnUuid(bodyData.id);
  const toUrl = bodyData.gateway.url;
  const subjectRole = bodyData.samlAttributes.subjectRole.display;
  const homeCommunityId = bodyData.samlAttributes.homeCommunityId;
  const purposeOfUse = bodyData.samlAttributes.purposeOfUse;

  const createdTimestamp = dayjs().toISOString();
  const expiresTimestamp = dayjs(createdTimestamp).add(1, "hour").toISOString();

  const securityHeader = createSecurityHeader({
    publicCert,
    createdTimestamp,
    expiresTimestamp,
    toUrl,
    subjectRole,
    metriportOrganization,
    homeCommunityId,
    purposeOfUse,
  });

  const soapBody = createSoapBody({ bodyData, createdTimestamp });

  const soapEnvelope = {
    "soap:Envelope": {
      "@_xmlns:soap": namespaces.soap,
      "soap:Header": {
        "@_xmlns:wsa": namespaces.wsa,
        "wsa:To": {
          "#text": toUrl,
          "@_mustUnderstand": "1",
        },
        "wsa:Action": {
          "#text": action,
          "@_mustUnderstand": "1",
        },
        "wsa:MessageID": messageId,
        "wsa:ReplyTo": {
          "wsa:Address": replyTo,
        },
        ...securityHeader,
      },
      ...soapBody,
    },
  };

  const options = {
    format: false,
    ignoreAttributes: false,
    suppressEmptyNode: true,
    declaration: {
      include: true,
      encoding: "UTF-8",
      version: "1.0",
    },
  };

  const builder = new XMLBuilder(options);
  const xmlContent = builder.build(soapEnvelope);
  return xmlContent;
}

export function createAndSignXCPDRequest(
  bodyData: XCPDBodyData,
  publicCert: string,
  privateKey: string
): string {
  const xmlString = createITI5SoapEnvelope({ bodyData, publicCert });
  const fullySignedSaml = signFullSaml({ xmlString, publicCert, privateKey });
  return fullySignedSaml;
}