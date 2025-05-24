// src/app/services/sensor.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TrafficReading {
  id:              string;
  location:        string;
  timestamp: string | Date;
  trafficDensity:  number;
  avgSpeed:        number;
  congestionLevel: 'Low' | 'Moderate' | 'High';
}

export interface AirPollutionReading {
  id:             string;
  location:       string;
  timestamp:      string;
  co:             number;
  no2:            number;
  so2:            number;
  ozone:          number;
  pollutionLevel: string;
}

export interface StreetLightReading {
  id:               string;
  location:         string;
  timestamp:        string;
  brightnessLevel:  number;
  powerConsumption: number;
  status:           'ON' | 'OFF';
}

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getTraffic(): Observable<TrafficReading[]> {
    return this.http.get<TrafficReading[]>(
      `${this.baseUrl}/traffic-sensors`
    );
  }

  getAirPollution(): Observable<AirPollutionReading[]> {
    return this.http.get<AirPollutionReading[]>(
      `${this.baseUrl}/air-pollution-sensors`
    );
  }

  getStreetLight(): Observable<StreetLightReading[]> {
    return this.http.get<StreetLightReading[]>(
      `${this.baseUrl}/street-light-sensors`
    );
  }
}
