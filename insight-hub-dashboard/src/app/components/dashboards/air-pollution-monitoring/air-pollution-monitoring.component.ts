import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';

// Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

// ng2-charts
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

// RxJS
import { timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SensorService } from '../../../services/sensor.service';
import { AirPollutionReading } from '../../../models/air-pollution-reading.model';

interface CustomChartScales {
  x?: {
    min?: number;
    max?: number;
    type?: string;
    grid?: {
      display: boolean;
    };
    ticks?: {
      maxRotation: number;
      minRotation: number;
      maxTicksLimit?: number;
      autoSkip?: boolean;
    };
    [key: string]: any;
  };
  y?: {
    beginAtZero?: boolean;
    grid?: {
      color: string;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

interface CustomChartOptions extends ChartOptions {
  scales?: CustomChartScales;
}

@Component({
  selector: 'app-air-pollution-monitoring',
  templateUrl: './air-pollution-monitoring.component.html',
  styleUrls: ['./air-pollution-monitoring.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatSliderModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    NgChartsModule
  ],
})
export class AirPollutionMonitoringComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['location', 'timestamp', 'co', 'ozone', 'pollutionLevel'];
  dataSource = new MatTableDataSource<AirPollutionReading>([]);
  totalItems = 0;
  pageSize = 5;
  currentPage = 0;
  currentSort: Sort = { active: 'timestamp', direction: 'desc' };
  pageSizeOptions = [5, 10, 25, 40];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Filters
  selectedDate = new FormControl<Date | null>(null);
  locationFilter = new FormControl<string[]>([]);
  locationSearch = new FormControl<string>('');
  pollutionLevelFilter = new FormControl<string[]>([]);
  locations: string[] = [];
  filteredLocations: string[] = [];
  pollutionLevelOptions: string[] = ['Low', 'Moderate', 'High', 'Hazardous'];

  // Chart data
  public currentVisualization: ChartType = 'line';
  public chartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };
  public chartOptions: CustomChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
              if (context.dataset.label?.includes('CO')) {
                label += ' ppm';
              } else if (context.dataset.label?.includes('Ozone')) {
                label += ' ppm';
              }
            }
            return label;
          }
        }
      },
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      }
    }
  };
  
  // X-Axis Scaling
  public xAxisScale: number = 1;
  public showAllData: boolean = true;

  constructor(private sensorService: SensorService) {}

  ngOnInit(): void {
    this.initializeChart();
    this.selectedDate.valueChanges.subscribe(() => this.loadData());
    this.locationFilter.valueChanges.subscribe(() => this.loadData());
    this.pollutionLevelFilter.valueChanges.subscribe(() => this.loadData());
    this.locationSearch.valueChanges.subscribe(value => this.filterLocationList(value));
    this.loadData();
    this.setupAutoRefresh();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(sort => {
      this.currentSort = sort;
      this.currentPage = 0;
      this.paginator.pageIndex = 0;
      this.loadData();
    });

    this.paginator.page.subscribe(event => {
      this.currentPage = event.pageIndex;
      this.pageSize = event.pageSize;
      this.loadData();
    });
  }

  loadData(): void {
    const params: any = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.currentSort.active || 'timestamp',
      sortDirection: this.currentSort.direction || 'desc'
    };

    // Add pollution level filter
    const pollutionLevel = this.pollutionLevelFilter.value?.filter(Boolean);
    if (pollutionLevel && pollutionLevel.length > 0) {
      params.pollutionLevel = pollutionLevel[0];
    }

    // Only include location if selected
    const locations = this.locationFilter.value?.filter(Boolean);
    if (locations && locations.length > 0) {
      params.location = locations[0];
    }

    // Only include date if selected
    const date = this.selectedDate.value;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      params.timestampStart = start.toISOString();

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      params.timestampEnd = end.toISOString();
    }

    this.sensorService.getAirPollutionFiltered(params).subscribe({
      next: (res: { content: never[]; totalElements: number; }) => {
        console.log('Backend response:', res);

        // 1) Pull the array of readings from res.content
        const items: AirPollutionReading[] = res.content || [];

        console.log('Air pollution reading items:', items);

        // 2) Use res.totalElements instead of res.totalItems
        this.dataSource.data = items;
        this.totalItems = res.totalElements || 0;

        console.log('Total items:', this.totalItems);
        this.paginator.length = this.totalItems;
        this.paginator.pageSize = this.pageSize;
        this.paginator.pageIndex = this.currentPage;

        // Update chart data for air pollution metrics
        this.chartData = {
          labels: items.map(r => new Date(r.timestamp).toLocaleTimeString()),
          datasets: [
            { 
              label: 'CO (ppm)', 
              data: items.map(r => r.co),
              borderColor: '#FF6B6B',
              backgroundColor: 'rgba(255, 107, 107, 0.2)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 3,
              pointHoverRadius: 5
            },
            { 
              label: 'Ozone (ppm)', 
              data: items.map(r => r.ozone),
              borderColor: '#4ECDC4',
              backgroundColor: 'rgba(78, 205, 196, 0.2)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 3,
              pointHoverRadius: 5
            }
          ]
        };

        // Update available locations from actual data
        this.updateAvailableLocations(items);
      },
      error: (err: any) => {
        console.error('Error loading air pollution data:', err);
      }
    });
  }

  private updateAvailableLocations(items: AirPollutionReading[]): void {
    const uniqueLocations = [...new Set(items.map(item => item.location))];
    this.locations = uniqueLocations.sort();
    this.filteredLocations = [...this.locations];
  }

  resetFilters(): void {
    this.selectedDate.setValue(null);
    this.locationFilter.setValue([]);
    this.pollutionLevelFilter.setValue([]);
    this.locationSearch.setValue('');
    this.currentPage = 0;
    this.loadData();
  }

  private initializeChart(): void {
    this.chartData = {
      labels: [],
      datasets: [
        {
          label: 'CO (ppm)',
          data: [],
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'Ozone (ppm)',
          data: [],
          borderColor: '#4ECDC4',
          backgroundColor: 'rgba(78, 205, 196, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    };
  }

  private setupAutoRefresh(): void {
    timer(60000, 60000).subscribe(() => {
      console.log('Auto-refreshing air pollution data...');
      this.loadData();
    });
  }

  private handleDataUpdate(data: AirPollutionReading[]): void {
    console.log('Handling data update:', data);
    
    // Update table data
    this.dataSource.data = data;
    
    // Update chart data
    this.chartData = {
      labels: data.map(r => new Date(r.timestamp).toLocaleTimeString()),
      datasets: [
        { 
          label: 'CO (ppm)', 
          data: data.map(r => r.co),
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        { 
          label: 'Ozone (ppm)', 
          data: data.map(r => r.ozone),
          borderColor: '#4ECDC4',
          backgroundColor: 'rgba(78, 205, 196, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    };
    
    // Update available locations
    this.updateAvailableLocations(data);
  }



  setVisualization(type: ChartType): void {
    this.currentVisualization = type;
  }

  toggleShowAllData(): void {
    this.showAllData = !this.showAllData;
  }

  onXAxisScaleChange(): void {
    // Implement x-axis scaling logic if needed
  }

  formatScaleLabel(value: number): string {
    return `${value}x`;
  }

  getChartTitle(): string {
    const baseTitle = 'Air Pollution Monitoring';
    const metricNames = this.chartData.datasets.map(dataset => dataset.label).join(' & ');
    return `${baseTitle} - ${metricNames}`;
  }

  sortData(field: string): void {
    if (this.currentSort.active === field) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort.active = field;
      this.currentSort.direction = 'asc';
    }
    this.loadData();
  }

  filterLocationList(searchTerm: string | null): void {
    if (!searchTerm) {
      this.filteredLocations = [...this.locations];
    } else {
      this.filteredLocations = this.locations.filter(location =>
        location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  getPollutionLevelColor(level: string): string {
    switch (level.toLowerCase()) {
      case 'low':
        return '#4CAF50';
      case 'moderate':
        return '#FF9800';
      case 'high':
        return '#F44336';
      case 'hazardous':
        return '#9C27B0';
      default:
        return '#757575';
    }
  }

  getPollutionLevelIcon(level: string): string {
    switch (level.toLowerCase()) {
      case 'low':
        return 'air';
      case 'moderate':
        return 'warning';
      case 'high':
        return 'error';
      case 'hazardous':
        return 'dangerous';
      default:
        return 'help';
    }
  }
}

function compare(a: any, b: any, isAsc: boolean): number {
  if (a === null || a === undefined) return isAsc ? -1 : 1;
  if (b === null || b === undefined) return isAsc ? 1 : -1;
  
  if (typeof a === 'string' && typeof b === 'string') {
    return isAsc ? a.localeCompare(b) : b.localeCompare(a);
  }
  
  if (a instanceof Date && b instanceof Date) {
    return isAsc ? a.getTime() - b.getTime() : b.getTime() - a.getTime();
  }
  
  if (typeof a === 'number' && typeof b === 'number') {
    return isAsc ? a - b : b - a;
  }
  
  return 0;
}
