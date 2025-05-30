import { BaseSensorReading } from './base-sensor-reading.model';

export interface AirPollutionReading extends BaseSensorReading {
  co: number;
  no2: number;
  so2: number;
  ozone: number;
  pollutionLevel: string;
}
