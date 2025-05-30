import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { TrafficReading } from '../models/traffic-reading.model';
import { AirPollutionReading } from '../models/air-pollution-reading.model';
import { StreetLightReading } from '../models/street-light-reading.model';

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch traffic sensor data from backend.
   */
  getTraffic(): Observable<TrafficReading[]> {
    return this.http.get<TrafficReading[]>(`${this.baseUrl}/traffic-sensors`);
  }

  /**
   * Fetch air pollution sensor data from backend.
   */
  getAirPollution(): Observable<AirPollutionReading[]> {
    return this.http.get<AirPollutionReading[]>(`${this.baseUrl}/air-pollution-sensors`);
  }

  /**
   * Fetch street light sensor data from backend.
   */
  getStreetLight(): Observable<StreetLightReading[]> {
    return this.http.get<StreetLightReading[]>(`${this.baseUrl}/street-light-sensors`);
  }
}
