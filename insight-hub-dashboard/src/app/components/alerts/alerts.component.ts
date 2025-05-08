import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { startWith, map }    from 'rxjs/operators';
import { AlertsService }     from '../../services/alerts.service';
import { AlertSummary }      from '../../models/alert-summary.model';

@Component({
  standalone: true,
  selector: 'app-alerts',
  imports: [CommonModule, FormsModule],
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {
  rawAlerts$!: Observable<AlertSummary[]>;
  filtered$!: Observable<AlertSummary[]>;

  /** form-like filter controls */
  private typeFilter$  = new BehaviorSubject<string>('');
  private sinceFilter$ = new BehaviorSubject<string>('');

  constructor(private alertsSvc: AlertsService) {}

  ngOnInit() {
    // 1) start polling AlertsService
    this.rawAlerts$ = this.alertsSvc.getAlerts();

    // 2) combine rawAlerts with filters to produce filtered$
    this.filtered$ = combineLatest([
      this.rawAlerts$,
      this.typeFilter$.pipe(startWith('')),
      this.sinceFilter$.pipe(startWith(''))
    ]).pipe(
      map(([alerts, type, since]) => 
        alerts.filter(a => {
          const byType = type
            ? a.message.toLowerCase().includes(type.toLowerCase())
            : true;
          const byTime = since
            ? new Date(a.timestamp) >= new Date(since)
            : true;
          return byType && byTime;
        })
      )
    );
  }

  onTypeChange(t: string)   { this.typeFilter$.next(t); }
  onSinceChange(s: string) { this.sinceFilter$.next(s); }
}
