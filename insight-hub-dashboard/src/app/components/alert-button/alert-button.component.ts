// src/app/components/alert-button/alert-button.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { RouterModule }                  from '@angular/router';
import { Observable, Subscription }      from 'rxjs';
import { map, startWith, pairwise }      from 'rxjs/operators';

import { AlertsService }    from '../../services/alerts.service';
import { AlertSummary }     from '../../models/alert-summary.model';

interface AlertGroup {
  dateLabel: string;
  alerts:    AlertSummary[];
}

interface Toast {
  id:      number;
  message: string;
  show:    boolean;
}

@Component({
  standalone: true,
  selector:   'app-alert-button',
  imports:    [ CommonModule, RouterModule ],
  templateUrl:'./alert-button.component.html',
  styleUrls:  ['./alert-button.component.css']
})
export class AlertButtonComponent implements OnInit, OnDestroy {
  allAlerts$!: Observable<AlertSummary[]>;
  grouped$!:   Observable<AlertGroup[]>;
  dropdownOpen = false;

  toasts: Toast[] = [];
  private alertsSub!: Subscription;

  constructor(private alerts: AlertsService) {}

  ngOnInit() {
    this.allAlerts$ = this.alerts.getAlerts();

    this.grouped$ = this.allAlerts$.pipe(
      map(list => {
        const sorted = [...list].sort((a,b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        const today     = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const fmt = (d: Date) => d.toDateString();

        const groups: Record<string, AlertSummary[]> = {};
        sorted.forEach(a => {
          const d = new Date(a.timestamp);
          let label = fmt(d) === fmt(today)
                    ? 'Today'
                    : fmt(d) === fmt(yesterday)
                      ? 'Yesterday'
                      : d.toLocaleDateString();
          (groups[label] ||= []).push(a);
        });

        return Object.entries(groups)
                     .map(([dateLabel, alerts]) => ({ dateLabel, alerts }));
      })
    );

    // detect new alerts to fire toast
    this.alertsSub = this.allAlerts$
      .pipe(startWith([] as AlertSummary[]), pairwise())
      .subscribe(([prev, curr]) => {
        if (curr.length > prev.length) {
          this.addToast(curr[curr.length - 1]);
        }
      });
  }

  ngOnDestroy() {
    this.alertsSub.unsubscribe();
  }

  toggle() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  private addToast(alert: AlertSummary) {
    const id = Date.now();
    this.toasts.push({ id, message: alert.message, show: false });

    // trigger slide-in
    setTimeout(() => {
      const t = this.toasts.find(x => x.id === id);
      if (t) t.show = true;
    }, 10);

    // auto-dismiss after 5s
    setTimeout(() => this.removeToast(id), 5_010);
  }

  private removeToast(id: number) {
    const idx = this.toasts.findIndex(x => x.id === id);
    if (idx === -1) return;
    this.toasts[idx].show = false;
    setTimeout(() => this.toasts.splice(idx, 1), 300);
  }
}
