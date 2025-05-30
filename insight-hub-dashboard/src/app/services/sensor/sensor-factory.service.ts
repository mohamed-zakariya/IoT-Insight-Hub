import { Injectable } from '@angular/core';
import { SensorStrategy } from './sensor-strategy.interface';
import { TrafficSensorStrategy } from './traffic-sensor.strategy';
import { AirSensorStrategy } from './air-sensor.strategy';
import { LightSensorStrategy } from './light-sensor.strategy';

@Injectable({ providedIn: 'root' })
export class SensorFactoryService {
  constructor(
    private traffic: TrafficSensorStrategy,
    private air: AirSensorStrategy,
    private light: LightSensorStrategy
  ) {}

  getStrategy(sensorType: string): SensorStrategy<any> {
    switch (sensorType.toLowerCase()) {
      case 'traffic': return this.traffic;
      case 'air': return this.air;
      case 'light': return this.light;
      default: throw new Error(`Unknown sensor type: ${sensorType}`);
    }
  }
}
