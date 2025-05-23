import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-entry-point',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entry-point.component.html',
  styleUrls: ['./entry-point.component.css',"../style/tailwind.css"]
})
export class EntryPointComponent {
  dashboards = [
    {
      title: 'Traffic Monitoring',
      description: 'Tracks live traffic, congestion levels, and suggests alternate routes.',
      route: '/traffic',
      image: 'assets/traffic.png'
    },
    {
      title: 'Street Light Management',
      description: 'Monitors and automates streetlights using sensors and schedules.',
      route: '/street-light-management',
      image: 'assets/streetlight.png'
    },
    {
      title: 'Air Pollution Monitoring',
      description: 'Measures AQI, detects pollutants, and issues air quality alerts.',
      route: '/air-pollution-monitoring',
      image: '.././../../assets/airpollution.png'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}