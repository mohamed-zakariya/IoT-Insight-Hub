import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { TrafficReading } from '../models/traffic-reading.model';
import { AirPollutionReading } from '../models/air-pollution-reading.model';
import { StreetLightReading } from '../models/street-light-reading.model';
import { PagedResponse } from '../models/paged-response.model';
import { PagedRequest } from '../models/paged-request.model';
import { map } from 'rxjs/operators';
import { RuntimeConfigService } from './RuntimeConfigService/runtime-config.service';


@Injectable({
  providedIn: 'root'
})
export class SensorService {

  private readonly baseUrl!: string;

  constructor(private http: HttpClient, private configService: RuntimeConfigService) {
    this.baseUrl = `http://${this.configService.domain}:${this.configService.port}/api`;
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders().set('accessToken', token);
  }

  // ✅ FIXED: Implement the getLightReadingsFiltered method
  getLightReadingsFiltered(params: any): Observable<any> {
    let httpParams = new HttpParams();
    
    // Add all parameters to HttpParams
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get(`${this.baseUrl}/sensors/street_light`, {
      params: httpParams,
      headers: this.authHeaders()
    });
  }

  getTraffic(): Observable<TrafficReading[]> {
    return this.http.get<TrafficReading[]>(`${this.baseUrl}/traffic-sensors`,
      { headers: this.authHeaders() });
  }

getTrafficFiltered(params: PagedRequest): Observable<PagedResponse<TrafficReading>> {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') {

        if (
        (key === 'location' || key === 'congestionLevel') &&
        Array.isArray(value)
      ) {
        (value as string[]).forEach((oneVal: string) => {
          httpParams = httpParams.append(key, oneVal);
        });
      }

        else{
        httpParams = httpParams.set(key, value);}
      }
    });

    return this.http.get<PagedResponse<TrafficReading>>(
      `${this.baseUrl}/sensors/traffic`,
      { 
        params: httpParams,
        headers: this.authHeaders()
      }
    );
  }


  
   getTrafficLocations(
    page: number = 0,
    size: number = 10,
    sortDirection: 'ASC' | 'DESC' = 'DESC'
  ): Observable<PagedResponse<string>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortDirection', sortDirection);

    return this.http.get<PagedResponse<string>>(
      `${this.baseUrl}/sensors/traffic/locations`,
      {
        params,
        headers: this.authHeaders()
      }
    );
  }




  getAirPollution(): Observable<AirPollutionReading[]> {
    return this.http.get<AirPollutionReading[]>(`${this.baseUrl}/air-pollution-sensors`);
  }

  getStreetLight(): Observable<StreetLightReading[]> {
    return this.http.get<StreetLightReading[]>(`${this.baseUrl}/street-light-sensors`);
  }
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

