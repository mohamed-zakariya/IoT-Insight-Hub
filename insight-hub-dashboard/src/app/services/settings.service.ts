// src/app/services/settings.service.ts

import { Injectable }               from '@angular/core';
import { HttpClient, HttpHeaders }  from '@angular/common/http';
import { Observable }               from 'rxjs';

/**
 * Matches com.example.dxc_backend.dto.SettingsDTO
 */
export interface SettingsDTO {
  type:           'Traffic' | 'Air_Pollution' | 'Street_Light';
  metric:         string;
  thresholdValue: number;
  alertType:      'ABOVE' | 'BELOW';
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private baseUrl = 'http://localhost:8080/api/settings';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders().set('accessToken', token);
  }

  /** GET /api/settings */
  getSettings(): Observable<SettingsDTO[]> {
    return this.http.get<SettingsDTO[]>(
      this.baseUrl,
      { headers: this.authHeaders() }
    );
  }

  /** POST /api/settings */
  saveSetting(setting: SettingsDTO): Observable<SettingsDTO> {
    return this.http.post<SettingsDTO>(
      this.baseUrl,
      setting,
      { headers: this.authHeaders() }
    );
  }
}
