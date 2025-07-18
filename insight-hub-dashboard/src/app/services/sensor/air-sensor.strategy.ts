import { Injectable } from '@angular/core';
import { SensorStrategy } from './sensor-strategy.interface';
import { AirPollutionReading } from '../../models/air-pollution-reading.model';
import { SensorService } from '../sensor.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AirSensorStrategy implements SensorStrategy<AirPollutionReading> {
  constructor(readonly sensorService: SensorService) {}

  fetchData(): Observable<AirPollutionReading[]> {
    return this.sensorService.getAirPollution();
  }

  transformData(data: AirPollutionReading[]) {
    return {
      labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
      datasets: [
        { label: 'CO', data: data.map(d => d.co) },
        { label: 'NO2', data: data.map(d => d.no2) },
        { label: 'SO2', data: data.map(d => d.so2) },
        { label: 'Ozone', data: data.map(d => d.ozone) }
      ]
    };
  }
}
