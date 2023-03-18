import { Body } from "@metriport/api";
import convert from "convert-units";

import { PROVIDER_GOOGLE } from "../../shared/constants";
import { GoogleBody, sourceIdBodyFat, sourceIdHeight, sourceIdWeight } from "./models/body";

export const mapToBody = (googleBody: GoogleBody, date: string): Body => {
  const metadata = {
    date: date,
    source: PROVIDER_GOOGLE,
  };

  const body: Body = {
    metadata: metadata,
  };

  googleBody.bucket[0].dataset.forEach(data => {
    if (data.point.length) {
      const dataPoint = data.point[0];
      if (data.dataSourceId === sourceIdWeight) {
        body.weight_kg = dataPoint.value[0].fpVal;
      }

      if (data.dataSourceId === sourceIdHeight) {
        body.height_cm = convert(dataPoint.value[0].fpVal).from("m").to("cm");
      }

      if (data.dataSourceId === sourceIdBodyFat) {
        body.body_fat_pct = dataPoint.value[0].fpVal;
      }
    }
  });

  return body;
};