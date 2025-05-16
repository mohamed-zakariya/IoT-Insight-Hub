// src/main.ts

import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication }               from '@angular/platform-browser';
import { provideRouter }                      from '@angular/router';
import { provideAnimations }                  from '@angular/platform-browser/animations';
import { provideHttpClient }                  from '@angular/common/http';

import { Chart, registerables }               from 'chart.js';
import {
  NgChartsModule,
  NgChartsConfiguration
} from 'ng2-charts';

import { AppComponent } from './app/app.component';
import { routes }       from './app/app.routes';

// 1) Register all Chart.js controllers/elements/etc
Chart.register(...registerables);

// 2) Bootstrap your standalone app, pulling in the charts module
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(NgChartsModule),
    {
      provide: NgChartsConfiguration,
      useValue: {
        // optional defaults, e.g.:
        // generateColors: false
      }
    }
  ],
})
.catch(err => console.error(err));
