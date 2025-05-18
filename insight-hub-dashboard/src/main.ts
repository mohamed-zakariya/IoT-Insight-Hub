// src/main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter }        from '@angular/router';
import { importProvidersFrom }  from '@angular/core';
import { HttpClientModule }     from '@angular/common/http';
import { FormsModule }          from '@angular/forms';

import { AppComponent }         from './app/app.component';
import { routes }               from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule, FormsModule)
  ]
})
.catch(err => console.error('Bootstrap failed:', err));
