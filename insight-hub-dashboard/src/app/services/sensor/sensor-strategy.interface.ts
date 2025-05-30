import { Observable } from 'rxjs';

export interface SensorStrategy<T> {
  fetchData(): Observable<T[]>;
  transformData(data: T[]): any; // returns data suitable for charts
}
