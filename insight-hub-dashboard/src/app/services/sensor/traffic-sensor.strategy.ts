import { Injectable } from '@angular/core';
import { SensorStrategy } from './sensor-strategy.interface';
import { TrafficReading } from '../../models/traffic-reading.model';
import { SensorService } from '../sensor.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TrafficSensorStrategy implements SensorStrategy<TrafficReading> {
  constructor(private sensorService: SensorService) {}

  fetchData(): Observable<TrafficReading[]> {
    return this.sensorService.getTraffic();
  }

  transformData(data: TrafficReading[]) {
    return {
      labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
      datasets: [
        { label: 'Traffic Density', data: data.map(d => d.trafficDensity) },
        { label: 'Average Speed', data: data.map(d => d.avgSpeed) }
      ]
    };
  }
}
