// src/app/components/settings/settings.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { SettingsService }   from '../../services/settings.service';

@Component({
  standalone: true,
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  providers: [SettingsService],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  // 1) Categories
  sensors: string[] = [];

  // 2) Sub-metrics per category
  subSensorsMap: Record<string, string[]> = {
    Temperature:       ['Engine Temp', 'Ambient Temp', 'CPU Temp'],
    'Air Quality':     ['O₂ (ppm)', 'CO₂ (ppm)', 'NO₂ (ppb)', 'PM2.5 (µg/m³)', 'PM10 (µg/m³)'],
    Pressure:          ['Tire Pressure (psi)', 'Oil Pressure (bar)', 'Barometric Pressure (hPa)'],
    Humidity:          ['Relative Humidity (%)', 'Absolute Humidity (g/m³)'],
    'Wind Speed':      ['Wind Speed', 'Wind Gust'],
    Precipitation:     ['Rainfall Rate', 'Snow Depth'],
    'Traffic Density': ['Vehicles/hour', 'Average Speed'],
    'Noise Level':     ['dB(A)', 'dB(C)'],
    'Light Intensity': ['Illuminance', 'UV Index'],
    'CO Level':        ['CO (ppm)'],
    'VOC Level':       ['TVOC (ppb)']
  };

  // 3) Units per category
  unitOptionsMap: Record<string, string[]> = {
    Temperature:       ['°C', '°F'],
    'Air Quality':     ['ppm', 'ppb', 'µg/m³'],
    Pressure:          ['psi', 'bar', 'hPa'],
    Humidity:          ['%'],
    'Wind Speed':      ['mph', 'km/h'],
    Precipitation:     ['in/h', 'mm/h'],
    'Traffic Density': ['vehicles/hour', 'vehicles/min'],
    'Noise Level':     ['dB(A)', 'dB(C)'],
    'Light Intensity': ['lux', 'UV Index'],
    'CO Level':        ['ppm'],
    'VOC Level':       ['ppb']
  };

  // 4) Placeholder examples
  exampleMap: Record<string, string> = {
    'Engine Temp': '72',    'Ambient Temp': '68',   'CPU Temp': '45',
    'O₂ (ppm)': '21',       'CO₂ (ppm)': '400',     'NO₂ (ppb)': '35',
    'PM2.5 (µg/m³)': '12',  'PM10 (µg/m³)': '20',
    'Tire Pressure (psi)': '32', 'Oil Pressure (bar)': '3', 'Barometric Pressure (hPa)': '1013',
    'Relative Humidity (%)': '45', 'Absolute Humidity (g/m³)': '10',
    'Wind Speed': '15',     'Wind Gust': '25',
    'Rainfall Rate': '0.1', 'Snow Depth': '0.5',
    'Vehicles/hour': '500', 'Average Speed': '40',
    'dB(A)': '60',          'dB(C)': '70',
    'Illuminance': '10000', 'UV Index': '3',
    'CO (ppm)': '8',        'TVOC (ppb)': '150'
  };

  // 5) Which categories allow negatives?
  negativeAllowedCategories = new Set<string>([
    'Temperature'
  ]);

  // UI state
  selectedSensor = '';
  currentSubSensors: string[] = [];
  adjustments: Record<string, number|null> = {};
  units:       Record<string, string>      = {};
  errors:      Record<string, string>      = {};

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    // Stubbed; replace with real API call later
    this.settingsService.getSensorList()
      .subscribe(list => this.sensors = list);
  }

  onSensorSelect(sensor: string): void {
    this.selectedSensor = sensor;
    this.currentSubSensors = this.subSensorsMap[sensor] || [];
    this.adjustments = {};
    this.units       = {};
    this.errors      = {};
    const opts = this.unitOptionsMap[sensor] || [];
    this.currentSubSensors.forEach(sub => {
      this.adjustments[sub] = null;
      this.units[sub]       = opts[0] || '';
      this.errors[sub]      = '';
    });
  }

  /**
   * Validates value for a sub-metric:
   *  - Must be numeric and non-null
   *  - Must be ≥0 unless its category allows negatives
   */
  validate(sub: string, value: any): void {
    const allowNeg = this.negativeAllowedCategories.has(this.selectedSensor);
    if (value == null || value === '' || isNaN(value)) {
      this.errors[sub] = 'Please enter a number';
    } else if (!allowNeg && value < 0) {
      this.errors[sub] = 'Value must be ≥ 0';
    } else {
      this.errors[sub] = '';
    }
  }

  /** Called when user clicks “Adjust” */
  adjust(sub: string): void {
    this.validate(sub, this.adjustments[sub]);
    if (this.errors[sub]) return;
    const value = this.adjustments[sub] as number;
    const unit  = this.units[sub];
    console.log(`MOCK API: set ${sub} → ${value} ${unit}`);
    // TODO: wire up real HTTP call here
  }
}
