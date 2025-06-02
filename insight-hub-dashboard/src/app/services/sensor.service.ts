import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { TrafficReading } from '../models/traffic-reading.model';
import { AirPollutionReading } from '../models/air-pollution-reading.model';
import { StreetLightReading } from '../models/street-light-reading.model';
import { PagedResponse } from '../models/paged-response.model';

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getTraffic(): Observable<TrafficReading[]> {
    return this.http.get<TrafficReading[]>(`${this.baseUrl}/traffic-sensors`);
  }

  getTrafficFiltered(
    timestampStart?: string,
    timestampEnd?: string,
    location?: string,
    congestionLevel?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'timestamp',
    sortDirection: 'ASC' | 'DESC' = 'DESC'
  ): Observable<{
    content: TrafficReading[];
    totalElements: number;
    number: number;
    size: number;
    // you can add any other Page<T> fields if you need them
  }> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size))
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (timestampStart) {
      params = params.set('timestampStart', timestampStart);
    }
    if (timestampEnd) {
      params = params.set('timestampEnd', timestampEnd);
    }
    if (location) {
      params = params.set('location', location);
    }
    if (congestionLevel) {
      params = params.set('congestionLevel', congestionLevel);
    }

    return this.http.get<{
      content: TrafficReading[];
      totalElements: number;
      number: number;
      size: number;
    }>(`${this.baseUrl}/traffic-sensors/new`, { params });
  }


  /** ✅ Add this method */
  // getTrafficLocations(): Observable<string[]> {
  //   return this.http.get<string[]>(`${this.baseUrl}/traffic-sensors/locations`);
  // }

  getAirPollution(): Observable<AirPollutionReading[]> {
    return this.http.get<AirPollutionReading[]>(`${this.baseUrl}/air-pollution-sensors`);
  }

  getStreetLight(): Observable<StreetLightReading[]> {
    return this.http.get<StreetLightReading[]>(`${this.baseUrl}/street-light-sensors`);
  }
}
