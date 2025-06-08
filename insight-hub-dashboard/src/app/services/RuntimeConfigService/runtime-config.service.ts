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

  get domain(): string {
    return this.config?.domain;
  }

  get port(): string {
    return this.config?.port;
  }

  get apiUrl(): string {
    return `http://${this.domain}:${this.port}/api`;
  }

  get authUrl(): string {
    return `http://${this.domain}:${this.port}/auth`;
  }
}
