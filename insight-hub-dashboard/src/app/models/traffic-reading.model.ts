import { BaseSensorReading } from './base-sensor-reading.model';

export interface TrafficReading extends BaseSensorReading {
  trafficDensity: number;
  avgSpeed: number;
  congestionLevel: 'Low' | 'Moderate' | 'High';
}
