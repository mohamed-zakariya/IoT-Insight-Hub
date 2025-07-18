import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AlertSummary } from '../models/alert-summary.model';
import { RuntimeConfigService } from './RuntimeConfigService/runtime-config.service';

@Injectable({ providedIn: 'root' })
export class AlertsService {


    readonly url!: string;

  constructor(readonly http: HttpClient, readonly configService: RuntimeConfigService) {
      this.url = `http://${this.configService.domain}:${this.configService.port}/api/alerts`;

  }



  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') ?? '';
    return new HttpHeaders().set('accessToken', token);
  }

  /**
   * Poll the backend every 15 seconds (and immediately on subscribe)
   * for the latest alerts.
   */
  getAlerts(): Observable<AlertSummary[]> {
    return timer(0, 15000).pipe(
      switchMap(() =>
        this.http.get<AlertSummary[]>(
          this.url,
          { headers: this.authHeaders() }
        )
      )
    );
  }
}
