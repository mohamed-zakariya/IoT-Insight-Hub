// src/app/components/settings/settings.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { SettingsService }   from '../../services/settings.service';

type MetricType = 'integer'|'float'|'enum';

interface MetricDef {
  key: string;
  label: string;
  type: MetricType;
  min?: number;
  max?: number;
  unitOptions?: string[];
  allowedValues?: string[];
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
  // 1) Sensor categories
  sensors = [
    'Traffic Sensor',
    'Air Pollution Sensor',
    'Street Light Sensor'
  ];

  // 2) Metric definitions per category (from your DB constraints)
  metricMap: Record<string, MetricDef[]> = {
    'Traffic Sensor': [
      { key: 'trafficDensity',  label: 'Traffic Density',  type: 'integer', min: 0,   max: 500, unitOptions: ['vehicles/hour'] },
      { key: 'avgSpeed',        label: 'Average Speed',    type: 'float',   min: 0,   max: 120, unitOptions: ['km/h','mph'] },
      { key: 'congestionLevel', label: 'Congestion Level', type: 'enum',    allowedValues: ['Low','Moderate','High','Severe'] }
    ],
    'Air Pollution Sensor': [
      { key: 'co',             label: 'CO (ppm)',          type: 'float', min: 0,   max: 50,  unitOptions: ['ppm'] },
      { key: 'ozone',          label: 'Ozone (ppb)',       type: 'float', min: 0,   max: 300, unitOptions: ['ppb'] },
      { key: 'pollutionLevel', label: 'Pollution Level',   type: 'enum',  allowedValues: ['Good','Moderate','Unhealthy','Very Unhealthy','Hazardous'] }
    ],
    'Street Light Sensor': [
      { key: 'brightnessLevel',  label: 'Brightness Level',  type: 'integer', min: 0,    max: 100 },
      { key: 'powerConsumption', label: 'Power Consumption', type: 'float',   min: 0,    max: 5000, unitOptions: ['W'] },
      { key: 'status',           label: 'Status',            type: 'enum',    allowedValues: ['ON','OFF'] }
    ]
  };

  // 3) Example values for grey hints
  exampleMap: Record<string,string> = {
    trafficDensity:   '250',
    avgSpeed:         '60',
    congestionLevel:  'Moderate',
    co:               '10',
    ozone:            '100',
    pollutionLevel:   'Moderate',
    brightnessLevel:  '80',
    powerConsumption: '2000',
    status:           'ON'
  };

  // 4) Shared form state
  alertTypes = ['above','below'];
  selectedSensor = '';
  metrics: MetricDef[] = [];
  form: Record<string, { alertType: string; threshold: number|string|null; unit?: string }> = {};
  errors: Record<string,string> = {};

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    // nothing to fetch at init—categories are hard-coded
  }

  /** When the user picks a category, reset everything for those metrics */
  onSensorSelect(category: string): void {
    this.selectedSensor = category;
    this.metrics = this.metricMap[category] || [];
    this.form   = {};
    this.errors = {};

    this.metrics.forEach(m => {
      this.form[m.key] = {
        alertType: 'above',
        threshold: null,
        unit: m.unitOptions?.[0]
      };
      this.errors[m.key] = '';
    });
  }

  /** Validate according to type, min/max, enum, and set errors[m.key] */
  validate(m: MetricDef): boolean {
    const v = this.form[m.key].threshold;
    // required
    if (v === null || v === '') {
      this.errors[m.key] = 'Required';
      return false;
    }
    // enum
    if (m.type === 'enum') {
      if (!m.allowedValues!.includes(v as string)) {
        this.errors[m.key] = 'Invalid choice';
        return false;
      }
      this.errors[m.key] = '';
      return true;
    }
    // numeric
    const num = Number(v);
    if (isNaN(num)) {
      this.errors[m.key] = 'Must be a number';
      return false;
    }
    if (m.type === 'integer' && !Number.isInteger(num)) {
      this.errors[m.key] = 'Must be an integer';
      return false;
    }
    if (m.min != null && num < m.min) {
      this.errors[m.key] = `Min ${m.min}`;
      return false;
    }
    if (m.max != null && num > m.max) {
      this.errors[m.key] = `Max ${m.max}`;
      return false;
    }
    this.errors[m.key] = '';
    return true;
  }

  /** Fires when Adjust is clicked; logs the payload for now */
  onAdjust(m: MetricDef): void {
    if (!this.validate(m)) return;
    const f = this.form[m.key];
    console.log('POST threshold →', {
      category:   this.selectedSensor,
      metric:     m.key,
      alertType:  f.alertType,
      threshold:  f.threshold,
      unit:       f.unit
    });
    // TODO: call SettingsService.saveThreshold(...)
  }
}
