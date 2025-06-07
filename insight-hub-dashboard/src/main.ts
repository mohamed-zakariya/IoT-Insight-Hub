// src/main.ts

import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { Chart, registerables } from 'chart.js';
import {
  NgChartsModule,
  NgChartsConfiguration
} from 'ng2-charts';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { RuntimeConfigService } from './app/services/RuntimeConfigService/runtime-config.service';

// 1) Register all Chart.js controllers/elements/etc
Chart.register(...registerables);

// 2) Create an instance of the config service
const configService = new RuntimeConfigService();

// 3) Load the config before bootstrapping the app
configService.loadConfig().then(() => {
  bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
      provideAnimations(),
      provideHttpClient(),
      importProvidersFrom(NgChartsModule),
      {
        provide: NgChartsConfiguration,
        useValue: {}
      },
      {
        provide: RuntimeConfigService,
        useValue: configService // Provide the loaded service
      }
    ],
  }).catch(err => console.error(err));
});
