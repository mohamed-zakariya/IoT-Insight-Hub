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
  /** Full list of sensor categories */
  sensors: string[] = [];

  /** For each category, the related sub-metrics */
  subSensorsMap: Record<string, string[]> = {
    Temperature:       ['Engine Temp', 'Ambient Temp', 'CPU Temp'],
    'Air Quality':     ['O₂ (ppm)', 'CO₂ (ppm)', 'NO₂ (ppb)', 'PM2.5 (µg/m³)', 'PM10 (µg/m³)'],
    Pressure:          ['Tire Pressure (psi)', 'Oil Pressure (bar)', 'Barometric Pressure (hPa)'],
    Humidity:          ['Relative Humidity (%)', 'Absolute Humidity (g/m³)'],
    'Wind Speed':      ['Wind Speed (mph)', 'Wind Gust (mph)'],
    Precipitation:     ['Rainfall Rate (in/h)', 'Snow Depth (in)'],
    'Traffic Density': ['Vehicles/hour', 'Average Speed (mph)'],
    'Noise Level':     ['dB(A)', 'dB(C)'],
    'Light Intensity': ['Illuminance (lux)', 'UV Index'],
    'CO Level':        ['CO (ppm)'],
    'VOC Level':       ['TVOC (ppb)']
  };

  selectedSensor = '';
  currentSubSensors: string[] = [];
  adjustments: Record<string, number> = {};

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    // For now: stubbed list, later fetch via API
    this.settingsService.getSensorList().subscribe(list => this.sensors = list);
  }

  onSensorSelect(sensor: string): void {
    this.selectedSensor = sensor;
    this.currentSubSensors = this.subSensorsMap[sensor] || [];
    this.adjustments = {};
    this.currentSubSensors.forEach(sub => this.adjustments[sub] = 0);
  }

  adjust(subSensor: string): void {
    const value = this.adjustments[subSensor];
    console.log(`MOCK API: set ${subSensor} of ${this.selectedSensor} → ${value}`);
    // TODO: implement real call:
    // this.settingsService.adjustSubSensor(this.selectedSensor, subSensor, value)
    //   .subscribe(() => alert(`${subSensor} updated!`));
  }
}
