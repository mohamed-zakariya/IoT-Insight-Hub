import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { TrafficReading } from '../models/traffic-reading.model';
import { AirPollutionReading } from '../models/air-pollution-reading.model';
import { StreetLightReading } from '../models/street-light-reading.model';
import { PagedResponse } from '../models/paged-response.model';
import { PagedRequest } from '../models/paged-request.model';

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getTraffic(): Observable<TrafficReading[]> {
    return this.http.get<TrafficReading[]>(`${this.baseUrl}/traffic-sensors`);
  }


getTrafficFiltered(params: PagedRequest): Observable<PagedResponse<TrafficReading>> {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') {
        httpParams = httpParams.set(key, value);
      }
    });

    return this.http.get<PagedResponse<TrafficReading>>(
      `${this.baseUrl}/traffic-sensors/new`,
      { params: httpParams }
    );
  }



  // getTrafficFiltered(params: any): Observable<{
  //   items: TrafficReading[];
  //   totalItems: number;
  //   page: number;
  //   size: number;
  // }> {
  //   return this.http.get<{
  //     items: TrafficReading[];
  //     totalItems: number;
  //     page: number;
  //     size: number;
  //   }>(`${this.baseUrl}/traffic-sensors/new`, { params });
  // }

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
