import { BaseSensorReading } from './base-sensor-reading.model';

export interface StreetLightReading extends BaseSensorReading {
  brightnessLevel: number;
  powerConsumption: number;
  status: 'ON' | 'OFF';
}
