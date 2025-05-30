import { Injectable } from '@angular/core';
import { SensorStrategy } from './sensor-strategy.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SensorContextService {
  private strategy!: SensorStrategy<any>;

  setStrategy(strategy: SensorStrategy<any>) {
    this.strategy = strategy;
  }

  fetchAndTransform(): Observable<any> {
    return new Observable(observer => {
      this.strategy.fetchData().subscribe({
        next: (data) => {
          observer.next(this.strategy.transformData(data));
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
}
