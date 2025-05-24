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
  styleUrls:  [ './alert-button.component.css' ]
})
export class AlertButtonComponent implements OnInit, OnDestroy {
  // your full alert stream
  allAlerts$!: Observable<AlertSummary[]>;
  // grouped for the dropdown
  grouped$!:   Observable<AlertGroup[]>;
  dropdownOpen = false;

  // unread badge count
  unreadCount = 0;

  // active toasts on screen
  toasts: Toast[] = [];
  private alertsSub!: Subscription;

  constructor(private alerts: AlertsService) {}

  ngOnInit() {
    // 1) fetch all alerts
    this.allAlerts$ = this.alerts.getAlerts();

    // 2) group into Today/Yesterday/Older
    this.grouped$ = this.allAlerts$.pipe(
      map(list => {
        const sorted = [...list].sort((a,b)=>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
        );

        const today     = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const fmt = (d: Date) => d.toDateString();
        const groups: Record<string, AlertSummary[]> = {};

        sorted.forEach(a => {
          const d     = new Date(a.timestamp);
          const label = fmt(d) === fmt(today)      ? 'Today'
                        : fmt(d) === fmt(yesterday) ? 'Yesterday'
                        : d.toLocaleDateString();
          (groups[label] ||= []).push(a);
        });

        return Object.entries(groups)
                     .map(([dateLabel, alerts]) => ({ dateLabel, alerts }));
      })
    );

    // 3) detect newly arriving alerts
    this.alertsSub = this.allAlerts$
      .pipe(startWith([] as AlertSummary[]), pairwise())
      .subscribe(([prev, curr]) => {
        if (curr.length > prev.length) {
          // pick the alert with the max timestamp
          const newAlert = curr.reduce((latest, a) =>
            new Date(a.timestamp).getTime() > new Date(latest.timestamp).getTime()
              ? a
              : latest
          , curr[0]);
  
          this.showToast(newAlert.message);
          this.unreadCount++;
        }
  
      });
  }

  ngOnDestroy() {
    this.alertsSub.unsubscribe();
  }

  /** toggle dropdown & clear unread count */
  toggle() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.unreadCount = 0;
    }
  }

  /** push and animate a toast, auto-remove after 5 s */
  private showToast(message: string) {
    const id = Date.now();
    this.toasts.push({ id, message, show: false });

    // trigger slide-in
    setTimeout(() => {
      const t = this.toasts.find(x => x.id === id);
      if (t) t.show = true;
    }, 10);

    // auto-dismiss in 5 s
    setTimeout(() => this.removeToast(id), 5_010);
  }

  /** fade out & remove toast */
  removeToast(id: number) {
    const idx = this.toasts.findIndex(x => x.id === id);
    if (idx < 0) return;
    this.toasts[idx].show = false;
    setTimeout(() => this.toasts.splice(idx, 1), 300);
  }
}
