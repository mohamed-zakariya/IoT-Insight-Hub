import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RuntimeConfigService {
  private config: any;

  loadConfig(): Promise<void> {
    return fetch('/assets/runtime-config.json')
      .then(response => response.json())
      .then(data => {
        this.config = data;
      });
  }

  get domain() {
    return this.config.domain;
  }

  get port() {
    return this.config.port;
  }
}
