import { capitalize } from "lodash";

export function activityTypeReadable(activityType: string): string {
  // will the activity type mapping if it exists, and otherwise for example will change strings from:
  //    - "SWIM_TO_BIKE_TRANSITION_V2" to "Swim To Bike Transition"
  //    - "CROSS_COUNTRY_SKIING_WS" to "Cross Country Skiing"
  const stringToUse = activityTypeMapping[activityType] ?? activityType.replace(/_|V\d+|WS/g, " ");
  return capitalize(stringToUse).trim();
}

// see https://github.com/metriport/metriport-internal/issues/865 for context...
// these enums are current as of the Garmin API @ 1.0.3, and are out-of-date at the time of writing
// this @ 1.0.5 - keeping for backwards compatibility
export const activityTypeMapping: Record<string, string> = {
  RUNNING: "RUNNING",
  INDOOR_RUNNING: "INDOOR RUNNING",
  OBSTACLE_RUN: "OBSTACLE RUNNING",
  STREET_RUNNING: "STREET RUNNING",
  TRACK_RUNNING: "TRACK RUNNING",
  TRAIL_RUNNING: "TRAIL RUNNING",
  TREADMILL_RUNNING: "TREADMILL RUNNING",
  ULTRA_RUN: "ULTRA RUNNING",
  VIRTUAL_RUN: "VIRTUAL RUNNING",
  CYCLING: "CYCLING",
  BMX: "BMX",
  CYCLOCROSS: "CYCLOCROSS",
  DOWNHILL_BIKING: "DOWNHILL BIKING",
  E_BIKE_FITNESS: "EBIKING",
  E_BIKE_MOUNTAIN: "EMOUNTAINBIKING",
  GRAVEL_CYCLING: "GRAVEL/UNPAVED CYCLING",
  INDOOR_CYCLING: "INDOOR CYCLING",
  MOUNTAIN_BIKING: "MOUNTAIN BIKING",
  RECUMBENT_CYCLING: "RECUMBENT CYCLING",
  ROAD_BIKING: "ROAD CYCLING",
  TRACK_CYCLING: "TRACK CYCLING",
  VIRTUAL_RIDE: "VIRTUAL CYCLING",
  FITNESS_EQUIPMENT: "GYM & FITNESS EQUIPMENT",
  BOULDERING: "BOULDERING",
  ELLIPTICAL: "ELLIPTICAL",
  INDOOR_CARDIO: "CARDIO",
  HIIT: "HIIT",
  INDOOR_CLIMBING: "INDOOR CLIMBING",
  INDOOR_ROWING: "INDOOR ROWING",
  PILATES: "PILATES",
  STAIR_CLIMBING: "STAIR STEPPER",
  STRENGTH_TRAINING: "STRENGTH TRAINING",
  YOGA29: "YOGA",
  HIKING: "HIKING",
  SWIMMING: "SWIMMING",
  LAP_SWIMMING: "POOL SWIMMING",
  OPEN_WATER_SWIMMING: "OPEN WATER SWIMMING",
  WALKING: "WALKING/INDOOR WALKING",
  CASUAL_WALKING: "CASUAL WALKING",
  SPEED_WALKING: "SPEED WALKING",
  TRANSITION_V2: "TRANSITION",
  BIKE_TO_RUN_TRANSITION_V2: "BIKE TO RUN TRANSITION",
  RUN_TO_BIKE_TRANSITION_V2: "RUN TO BIKE TRANSITION",
  SWIM_TO_BIKE_TRANSITION_V2: "SWIM TO BIKE TRANSITION",
  MOTORCYCLING_V2: "MOTORCYCLING",
  ATV_V2: "ATV",
  MOTOCROSS_V2: "MOTOCROSS",
  OTHER: "OTHER",
  ASSISTANCE: "ASSISTANCE",
  AUTO_RACING: "AUTO RACING",
  BOATING_V2: "BOATING BOATING",
  BREATHWORK: "BREATHWORK",
  DISC_GOLF: "DISC GOLF",
  DRIVING_GENERAL: "DRIVING",
  E_SPORT: "ESPORTS",
  FLOOR_CLIMBING: "FLOOR CLIMBING",
  FLYING: "FLYING",
  GOLF: "GOLF",
  HANG_GLIDING: "HANG GLIDING",
  HORSEBACK_RIDING: "HORSEBACK RIDING",
  HUNTING_FISHING: "HUNTING/FISHING",
  HUNTING_V2: "HUNTING",
  FISHING_V2: "FISHING",
  INLINE_SKATING: "INLINE SKATING",
  KAYAKING_V2: "KAYAKING",
  KITEBOARDING_V2: "KITEBOARDING",
  MOUNTAINEERIN: "MOUNTAINEERING",
  OFFSHORE_GRINDING_V2: "OFFSHORE GRINDING",
  ONSHORE_GRINDING_V2: "ONSHORE GRINDING",
  PADDLING_V230: "PADDLING",
  RC_DRONE: "RC/DRONE",
  ROCK_CLIMBING: "ROCK CLIMBING",
  ROWING_V2: "ROWING",
  SAILING_V2: "SAILING",
  SKY_DIVING: "SKY DIVING",
  STAND_UP_PADDLEBOARDING: "STAND UP PADDLEBOARDING",
  STOP_WATCH: "STOPWATCH",
  SURFING_V2: "SURFING",
  TENNIS: "TENNIS",
  RAFTING: "RAFTING",
  WAKEBOARDING: "WAKEBOARDING",
  WHITEWATER_RAFTING_KAYAKING: "WHITEWATER KAYAKING/RAFTING",
  WINDSURFING_V2: "WIND SURFING",
  WINGSUIT_FLYING: "WINGSUIT FLYING",
  DIVING: "DIVING",
  APNEA_DIVING: "APNEA",
  APNEA_HUNTING: "APNEA HUNT",
  CCR_DIVING: "CCR DIVE",
  GAUGE_DIVING: "GAUGE DIVE",
  MULTI_GAS_DIVING: "MULTI-GAS DIVE",
  SINGLE_GAS_DIVING: "SINGLE-GAS DIVE",
  WINTER_SPORTS: "WINTER SPORTS",
  BACKCOUNTRY_SNOWBOARDING: "BACKCOUNTRY SNOWBOARDING",
  BACKCOUNTRY_SKIING: "BACKCOUNTRY SKIING",
  CROSS_COUNTRY_SKIING_WS: "CROSS COUNTRY CLASSIC SKIING",
  RESORT_SKIING_SNOWBOARDING_WS: "RESORT SKIING/SNOWBOARDING",
  SKATE_SKIING_WS: "CROSS COUNTRY SKATE SKIING",
  SKATING_WS: "SKATING",
  SNOW_SHOE_WS: "SNOWSHOEING",
  SNOWMOBILING_WS: "SNOWMOBILING",
};