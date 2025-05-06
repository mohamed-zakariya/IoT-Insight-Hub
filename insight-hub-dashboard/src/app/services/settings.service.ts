// src/app/services/settings.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface SettingsPayload {
  sensor: string;
  subSensor: string;
  value: number;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(/* no args here */) {}

  /** mock: replace with real HTTP call later */
  getSensorList(): Observable<string[]> {
    return new Observable(sub => {
      sub.next(['Temperature','Air Quality','Pressure']);
      sub.complete();
    });
  }

  adjustSubSensor(sensor: string, sub: string, val: number): Observable<any> {
    console.log('MOCK adjust', {sensor, sub, val});
    return new Observable(subj => { subj.next(true); subj.complete(); });
  }
}
