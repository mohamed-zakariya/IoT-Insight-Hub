// src/app/components/settings/settings.component.ts

import { Component, OnInit }            from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { FormsModule }                  from '@angular/forms';
import {
  SettingsService,
  SettingsDTO
} from '../../services/settings.service';

type MetricType = 'integer' | 'float';

interface MetricDef {
  key: string;
  label: string;
  type: MetricType;
  min?: number;
  max?: number;
}

@Component({
  standalone: true,
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  providers: [SettingsService],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  // 1) Sensor Categories
  sensors = [
    'Traffic Sensor',
    'Air Pollution Sensor',
    'Street Light Sensor'
  ];

  // 2) Metrics per category
  metricMap: Record<string, MetricDef[]> = {
    'Traffic Sensor': [
      { key: 'trafficDensity', label: 'Traffic Density', type: 'integer', min: 0,   max: 500 },
      { key: 'avgSpeed',       label: 'Average Speed',   type: 'float',   min: 0,   max: 120 }
    ],
    'Air Pollution Sensor': [
      { key: 'co',    label: 'CO (ppm)',    type: 'float', min: 0,   max: 50 },
      { key: 'ozone', label: 'Ozone (ppb)', type: 'float', min: 0,   max: 300 }
    ],
    'Street Light Sensor': [
      { key: 'brightnessLevel',  label: 'Brightness Level',  type: 'integer', min: 0,   max: 100 },
      { key: 'powerConsumption', label: 'Power Consumption', type: 'float',   min: 0,   max: 5000 }
    ]
  };

  // 3) Alert‐type options for the dropdown
  alertTypes: Array<'ABOVE'|'BELOW'> = ['ABOVE','BELOW'];

  // 4) Cache of existing settings, keyed by SettingsDTO.type
  prefilled: Record<SettingsDTO['type'], Record<string, SettingsDTO>> = {
    Traffic:        {},
    Air_Pollution:  {},
    Street_Light:   {}
  };
  
  // 5) Current UI state
  selectedSensor = '';
  metrics        = [] as MetricDef[];
  form           = {} as Record<string, { alertType: 'ABOVE'|'BELOW'; threshold: number|null }>;
  errors         = {} as Record<string,string>;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    // Load saved settings once
    this.settingsService.getSettings().subscribe({
      next: (all: SettingsDTO[]) => {
        all.forEach(s => {
          this.prefilled[s.type] = this.prefilled[s.type] || {};
          this.prefilled[s.type][s.metric] = s;
        });
      },
      error: err => console.error('Could not load settings:', err)
    });
  }

  /** Convert "Traffic Sensor" → "Traffic", etc. */
  private categoryToType(cat: string): SettingsDTO['type'] {
    switch (cat) {
      case 'Traffic Sensor':       return 'Traffic';
      case 'Air Pollution Sensor': return 'Air_Pollution';
      case 'Street Light Sensor':  return 'Street_Light';
      default: throw new Error(`Unknown category: ${cat}`);
    }
  }

  /** When user picks a sensor, reset & pre-fill form */
  onSensorSelect(category: string): void {
    this.selectedSensor = category;
    this.metrics        = this.metricMap[category] || [];
    this.form           = {};
    this.errors         = {};

    const typeKey = this.categoryToType(category);
    const preset  = this.prefilled[typeKey] || {};

    this.metrics.forEach(m => {
      const existing = preset[m.key];
      this.form[m.key] = {
        alertType: existing?.alertType ?? 'ABOVE',
        threshold: existing?.thresholdValue ?? null
      };
      this.errors[m.key] = '';
    });
  }

  /** Validate required / numeric / integer / min / max */
  validate(m: MetricDef): boolean {
    const v = this.form[m.key].threshold;
    if (v === null) {
      this.errors[m.key] = 'Required';
      return false;
    }
    if (isNaN(v)) {
      this.errors[m.key] = 'Must be a number';
      return false;
    }
    if (m.type === 'integer' && !Number.isInteger(v)) {
      this.errors[m.key] = 'Must be an integer';
      return false;
    }
    if (m.min != null && v < m.min) {
      this.errors[m.key] = `Min ${m.min}`;
      return false;
    }
    if (m.max != null && v > m.max) {
      this.errors[m.key] = `Max ${m.max}`;
      return false;
    }
    this.errors[m.key] = '';
    return true;
  }

  /** Actually POST /api/settings with the proper DTO */
  onAdjust(m: MetricDef): void {
    if (!this.validate(m)) return;

    const f = this.form[m.key];
    const dto: SettingsDTO = {
      type:           this.categoryToType(this.selectedSensor),
      metric:         m.key,
      thresholdValue: f.threshold!,
      alertType:      f.alertType
    };

    this.settingsService.saveSetting(dto).subscribe({
      next: () => alert(`${m.label} saved!`),
      error: err => alert(`Save failed: ${err.error || err.message}`)
    });
  }
}
