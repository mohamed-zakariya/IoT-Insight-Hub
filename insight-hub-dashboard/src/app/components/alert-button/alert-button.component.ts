import { Component, OnInit }      from '@angular/core';
import { CommonModule }           from '@angular/common';
import { RouterModule }           from '@angular/router';
import { Observable }             from 'rxjs';
import { map }                    from 'rxjs/operators';

import { AlertsService }          from '../../services/alerts.service';
import { AlertSummary }           from '../../models/alert-summary.model';

interface AlertGroup {
  dateLabel: string;
  alerts:    AlertSummary[];
}

@Component({
  standalone: true,
  selector: 'app-alert-button',
  imports: [CommonModule, RouterModule],
  templateUrl: './alert-button.component.html',
  styleUrls: ['./alert-button.component.css']
})
export class AlertButtonComponent implements OnInit {
  // full list from server
  allAlerts$!: Observable<AlertSummary[]>;

  // grouped into Today / Yesterday / older
  grouped$!: Observable<AlertGroup[]>;

  dropdownOpen = false;

  constructor(private alerts: AlertsService) {}

  ngOnInit() {
    this.allAlerts$ = this.alerts.getAlerts();

    this.grouped$ = this.allAlerts$.pipe(
      map(list => {
        // sort descending
        const sorted = list.slice().sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const groups: Record<string, AlertSummary[]> = {};

        const today     = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const fmt = (d: Date) => d.toDateString();

        sorted.forEach(a => {
          const d = new Date(a.timestamp);
          let label: string;
          if (fmt(d) === fmt(today)) {
            label = 'Today';
          } else if (fmt(d) === fmt(yesterday)) {
            label = 'Yesterday';
          } else {
            label = d.toLocaleDateString(); 
          }
          (groups[label] ||= []).push(a);
        });

        // transform to array
        return Object.entries(groups).map(([dateLabel, alerts]) => ({
          dateLabel,
          alerts
        }));
      })
    );
  }

  toggle() {
    this.dropdownOpen = !this.dropdownOpen;
  }
}
