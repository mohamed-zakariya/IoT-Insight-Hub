import { StreetLightReading } from './street-light-reading.model';
import { TrafficReading } from './traffic-reading.model';
import { AirPollutionReading } from './air-pollution-reading.model';

export type SensorReading =
  | StreetLightReading
  | TrafficReading
  | AirPollutionReading;
