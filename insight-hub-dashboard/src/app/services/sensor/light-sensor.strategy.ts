import { Injectable } from '@angular/core';
import { SensorStrategy } from './sensor-strategy.interface';
import { StreetLightReading } from '../../models/street-light-reading.model';
import { SensorService } from '../sensor.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LightSensorStrategy implements SensorStrategy<StreetLightReading> {
  constructor(private sensorService: SensorService) {}

  fetchData(): Observable<StreetLightReading[]> {
    return this.sensorService.getStreetLight();
  }

  transformData(data: StreetLightReading[]) {
    return {
      labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
      datasets: [
        { label: 'Brightness Level', data: data.map(d => d.brightnessLevel) },
        { label: 'Power Consumption', data: data.map(d => d.powerConsumption) }
      ]
    };
  }
  
}
