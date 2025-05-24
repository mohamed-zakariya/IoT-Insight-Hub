// src/app/app.component.ts
import { Component, HostBinding }        from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { RouterModule, Router, Event, NavigationEnd } from '@angular/router';
import { filter }                        from 'rxjs/operators';

import { NavbarComponent }               from './components/navbar/navbar.component';
import { AlertButtonComponent }          from './components/alert-button/alert-button.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    AlertButtonComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  /** Adds/removes the `traffic-page` class on <app-root> */
  @HostBinding('class.traffic-page') isTrafficPage = false;

  showNavbar = true;
  showAlertButton = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(
        // Only let NavigationEnd events through
        filter((e): e is NavigationEnd => e instanceof NavigationEnd)
      )
      .subscribe((e: NavigationEnd) => {
        const url = e.urlAfterRedirects;

        // Shift content on /traffic
        this.isTrafficPage = url.startsWith('/traffic');

        // Hide navbar & alert-button on /auth
        const isAuthRoute = url.startsWith('/auth');
        this.showNavbar = !isAuthRoute;
        this.showAlertButton = !isAuthRoute;
      });
  }
}
