# InsightHub Dashboard — Front-End Developer Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Tech Stack & Tooling](#tech-stack--tooling)
3. [Project Structure](#project-structure)
4. [Bootstrapping & Configuration](#bootstrapping--configuration)

   * [4.1 src/main.ts](#41-srcmaints)
   * [4.2 src/app/app.config.ts](#42-srcappappconfigts)
5. [Routing & Navigation](#routing--navigation)
6. [Shared Models & Utilities](#shared-models--utilities)

   * [6.1 AlertSummary Model](#61-alertsummary-model)
   * [6.2 TrafficReading Model](#62-trafficreading-model)
   * [6.3 Utilities](#63-utilities)
   * [6.4 Custom Validators](#64-custom-validators)
7. [Services & Data Layer](#services--data-layer)

   * [7.1 AlertsService](#71-alertsservice)
   * [7.2 SensorService](#72-sensorservice)
   * [7.3 SettingsService](#73-settingsservice)
   * [7.4 Auth & OTP Services](#74-auth--otp-services)
8. [Core Components](#core-components)

   * [8.1 AppComponent & Navbar](#81-appcomponent--navbar)
   * [8.2 AlertButtonComponent & AlertsComponent](#82-alertbuttoncomponent--alertscomponent)
   * [8.3 TrafficDashboardComponent](#83-trafficdashboardcomponent)
   * [8.4 SensorSimulatorComponent](#84-sensorsimulatorcomponent)
   * [8.5 Other Dashboards](#85-other-dashboards)
9. [Styling & Theming](#styling--theming)
10. [Build & Deployment](#build--deployment)

    * [10.1 Local Development](#101-local-development)
    * [10.2 Production Build](#102-production-build)
    * [10.3 Docker](#103-docker)
11. [Running & Testing](#running--testing)
12. [Appendix: Code Snippets & Configuration Files](#appendix-code-snippets--configuration-files)

---

## Introduction

InsightHub Dashboard is an Angular 19 standalone-component SPA that presents real-time sensor data (traffic, air pollution, street lights) and alerts from a backend API. It uses Angular Material for UI, Chart.js (ng2-charts) for visualizations, and a simple router + HTTP client for navigation and data fetching.

This document explains how every piece fits together, from bootstrap to component template to service polling.

## Tech Stack & Tooling

* **Framework:** Angular 19.2.x (standalone components)
* **UI Library:** Angular Material & CDK 19.2.x
* **Charts:** Chart.js 4.x via ng2-charts 4.x
* **HTTP & Routing:** `@angular/common/http`, `@angular/router`
* **Animations:** `@angular/animations`
* **CSS:**

  * Base: Angular Material prebuilt theme (`azure-blue.css`)
  * Utility: Tailwind (configured but lightly used)
  * Component CSS: per-component `.css` files with `:host ::ng-deep` where needed
* **Build:** Angular CLI + Webpack under the hood
* **Containerization:** Docker (multi-stage build)
* **Proxy:** `proxy.config.json` forwards `/api` to `http://localhost:8080` (for dev)

## Project Structure

```text
insight-hub-dashboard/
├── public/
│   └── favicon.ico, images…
├── src/
│   ├── main.ts                # stand-alone bootstrap
│   ├── styles.css             # global styles + theme import
│   ├── index.html
│   └── app/
│       ├── app.component.ts
│       ├── app.component.html
│       ├── app.component.css
│       ├── app.config.ts      # ApplicationConfig providers
│       ├── app.routes.ts      # Client-side Route[] array
│       ├── components/
│       │   ├── navbar/
│       │   ├── alert-button/
│       │   ├── alerts/
│       │   ├── traffic-dashboard/
│       │   ├── entry-point/
│       │   ├── auth/
│       │   └── profile/
│       ├── services/
│       │   ├── alerts.service.ts
│       │   ├── sensor.service.ts
│       │   ├── settings.service.ts
│       │   ├── auth.service.ts
│       │   └── otp-password.service.ts
│       ├── models/            # interfaces: AlertSummary, TrafficReading, etc.
│       └── shared/            # utils.ts, custom validators
├── angular.json
├── package.json
├── proxy.config.json
├── tailwind.config.js
├── Dockerfile
└── README.md
```

## Bootstrapping & Configuration

### 4.1 src/main.ts

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent }         from './app/app.component';
import { provideRouter }        from '@angular/router';
import { provideAnimations }    from '@angular/platform-browser/animations';
import { provideHttpClient }    from '@angular/common/http';
import { NgChartsModule, NgChartsConfiguration } from 'ng2-charts';
import { routes }               from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    { provide: NgChartsConfiguration, useValue: {} },
    importProvidersFrom(NgChartsModule)
  ]
});
```

* `provideRouter(routes)` configures navigation
* `provideAnimations()` is required by Angular Material
* `provideHttpClient()` for all REST calls
* `NgChartsModule` imported globally for charts

### 4.2 src/app/app.config.ts

```ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter }    from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes }            from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(/* any extra modules */)
  ]
};
```

Used for SSR/prerendering in `app.config.server.ts`.

## Routing & Navigation

### src/app/app.routes.ts

```ts
import { Routes } from '@angular/router';
import { HomeComponent }            from './components/home/home.component';
import { AuthComponent }            from './components/auth/auth.component';
import { ProfileComponent }         from './components/profile/profile.component';
import { ForgotPasswordComponent }  from './components/forgot-password/forgot-password.component';
import { SensorSimulatorComponent } from './components/sensor-simulator/sensor-simulator.component';
import { AlertsComponent }          from './components/alerts/alerts.component';
import { TrafficDashboardComponent} from './components/traffic-dashboard/traffic-dashboard.component';
// plus air-pollution, street-light dashboards…

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'simulate', component: SensorSimulatorComponent },
  { path: 'alerts', component: AlertsComponent },
  { path: 'traffic', component: TrafficDashboardComponent },
  // …
];
```

*Default* path `''` leads to `HomeComponent`. No guards are set up yet.

## Shared Models & Utilities

### 6.1 AlertSummary Model

```ts
export interface AlertSummary {
  id:        string;
  message:   string;
  timestamp: string; // ISO date
  level:     'INFO' | 'WARN' | 'ERROR';
}
```

### 6.2 TrafficReading Model

```ts
export interface TrafficReading {
  id:              string;
  location:        string;
  timestamp:       string | Date;
  trafficDensity:  number;
  avgSpeed:        number;
  congestionLevel: 'Low' | 'Moderate' | 'High';
}
```

### 6.3 Utilities (`src/app/shared/utils.ts`)

Helper functions for date formatting, ID generation, etc.

### 6.4 Custom Validators (`src/app/shared/validators/custom-validators.ts`)

Reactive-form validators (email format, password strength).

## Services & Data Layer

### 7.1 AlertsService (`src/app/services/alerts.service.ts`)

```ts
@Injectable({ providedIn: 'root' })
export class AlertsService {
  private url = 'http://localhost:8081/api/alerts';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') ?? '';
    return new HttpHeaders().set('accessToken', token);
  }

  /**
   * Polls the alerts endpoint immediately and every 15 seconds.
   */
  getAlerts(): Observable<AlertSummary[]> {
    return timer(0, 15000).pipe(
      switchMap(() => this.http.get<AlertSummary[]>(this.url, { headers: this.authHeaders() }))
    );
  }
}
```

### 7.2 SensorService (`src/app/services/sensor.service.ts`)

```ts
@Injectable({ providedIn: 'root' })
export class SensorService {
  private readonly baseUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  getTraffic(): Observable<TrafficReading[]> {
    return this.http.get<TrafficReading[]>(`${this.baseUrl}/traffic-sensors`);
  }
  getAirPollution(): Observable<AirPollutionReading[]> { /* … */ }
  getStreetLight(): Observable<StreetLightReading[]> { /* … */ }
}
```

### 7.3 SettingsService (`src/app/services/settings.service.ts`)

CRUD for threshold settings:

```ts
getSettings(): Observable<SettingsDTO[]>;  // GET /api/settings
saveSetting(s: SettingsDTO): Observable<SettingsDTO>; // POST /api/settings
```

### 7.4 Auth & OTP Services

* **AuthService**: handles `/api/login`, token storage, logout
* **OtpPasswordService**: password‑reset flows via OTP

## Core Components

### 8.1 AppComponent & Navbar

* **Template**:

  ```html
  <app-navbar></app-navbar>
  <router-outlet></router-outlet>
  <app-alert-button></app-alert-button>
  ```
* **NavbarComponent** uses `MatToolbar`, `MatMenu`, `MatIcon` with links to `/traffic`, `/alerts`, `/simulate`, plus user menu.

### 8.2 AlertButtonComponent & AlertsComponent

* **AlertButtonComponent**:

  * Subscribes to `AlertsService.getAlerts()` via `timer()` + `switchMap()`
  * Shows a toast on new alerts and displays unread badge via `@angular/material/badge`
* **AlertsComponent**:

  * Renders full list in a `<mat-menu>` sorted by timestamp
  * “Mark all read” resets unread count

### 8.3 TrafficDashboardComponent

* **Filters**:

  * Date picker (`<mat-datepicker>`) bound to `FormControl<Date|null>`
  * Location multi‑select (`<mat-select multiple>`) with inline search input
  * Congestion-level multi‑select
* **Table**:

  * `<mat-table>` with `<matSort>` & `<matPaginator>`
  * Custom `filterPredicate` combining date, location, congestion
* **Chart**:

  * `ng2-charts` toggles (line, bar, pie, radar)
  * Data derived from filtered table
  * UI controls: `<mat-menu>` for chart type, `<mat-slider>` for zoom
* **Actions**:

  * Reset button clears filters, sort, paginator
  * Sort menu duplicates table sort options

### 8.4 SensorSimulatorComponent

UI to craft fake readings and `POST` to `/api/simulate` for QA/demo without real devices.

### 8.5 Other Dashboards (Air‑Pollution, Street‑Light)

Identical to TrafficDashboard: filters, chart + table, reset/sort, but using their respective models/services.

## Styling & Theming

### Global (`styles.css`)

```css
@import "~@angular/material/prebuilt-themes/azure-blue.css";
/* Base reset, layout (.page, .dashboard-grid), responsive breakpoints */
```

### Component CSS

* Scoped `.css` files per component for spacing, flex layouts, color overrides
* Use `:host ::ng-deep` to tweak Angular Material internals

### Tailwind

Configured in `tailwind.config.js`, lightly used for utility classes.

## Build & Deployment

### 10.1 Local Development

```bash
npm install
ng serve --open
```

Uses `proxy.config.json` to forward `/api` → `localhost:8080`.

### 10.2 Production Build

```bash
ng build --configuration production
```

Outputs to `dist/insight-hub-dashboard`.

### 10.3 Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=builder /app/dist/insight-hub-dashboard /usr/share/nginx/html
EXPOSE 80
```

Multi‑stage: build assets then serve via Nginx.

## Running & Testing

```bash
ng test   # Unit tests (Jasmine/Karma)
ng e2e    # E2E tests (Protractor/Cypress)
ng lint   # Linting
```

Include `ng build --configuration production` in CI/CD pipeline.

## Appendix: Code Snippets & Configuration Files

### proxy.config.json

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

### tailwind.config.js

```js
// purge paths, theme extensions etc.
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: { extend: {} },
  plugins: []
};
```

### .editorconfig & .gitignore

Standard Angular/Node settings, ignore `node_modules/`, `dist/`, environment files, etc.
