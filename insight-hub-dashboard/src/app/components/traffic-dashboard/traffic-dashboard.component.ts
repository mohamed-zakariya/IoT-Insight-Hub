import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';

import { SensorService, TrafficReading } from '../../services/sensor.service';

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
  standalone: true,
  selector: 'app-traffic-dashboard',
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
  templateUrl: './traffic-dashboard.component.html',
  styleUrls: ['./traffic-dashboard.component.css']
})
export class TrafficDashboardComponent implements OnInit {
  displayedColumns: string[] = [
    'location',
    'timestamp',
    'trafficDensity',
    'avgSpeed',
    'congestionLevel'
  ];
  dataSource = new MatTableDataSource<TrafficReading>([]);
  pageSizeOptions = [5, 10, 25];
  pageSize = 10;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Filters
  dateRange = new FormControl<{ begin: Date; end: Date } | null>(null);
  locationFilter = new FormControl<string[]>([]);
  congestionFilter = new FormControl<string[]>([]);
  locations: string[] = [];
  congestionLevels = ['Low', 'Moderate', 'High'];

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
              label += context.parsed.y.toFixed(1);
              if (context.dataset.label?.includes('Speed')) {
                label += ' km/h';
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

  constructor(private svc: SensorService) {}

  ngOnInit(): void {
    this.initializeChart();
    this.loadInitialData();
    this.setupAutoRefresh();
    
    // Initialize filter subscriptions
    this.setupFilterPredicate();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Update visualization when sort changes
    this.sort.sortChange.subscribe(() => {
      this.updateVisualization();
    });
  }

  formatScaleLabel(value: number): string {
    return `${value.toFixed(2)}x`;
  }

  private initializeChart(): void {
    this.chartData = {
      labels: [],
      datasets: [
        {
          data: [],
          label: 'Traffic Density',
          borderColor: '#0072FF',
          backgroundColor: 'rgba(0, 114, 255, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          data: [],
          label: 'Average Speed (km/h)',
          borderColor: '#00C6FF',
          backgroundColor: 'rgba(0, 198, 255, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    };
  }

  private loadInitialData(): void {
    this.svc.getTraffic().subscribe({
      next: (data) => this.handleDataUpdate(data),
      error: (err) => console.error('Error loading initial data:', err)
    });
  }

  private setupAutoRefresh(): void {
    timer(60000, 60000).pipe(
      switchMap(() => this.svc.getTraffic())
    ).subscribe({
      next: (data) => this.handleDataUpdate(data),
      error: (err) => console.error('Error refreshing data:', err)
    });
  }

  private handleDataUpdate(data: TrafficReading[]): void {
    if (!data || data.length === 0) {
      console.warn('Received empty dataset');
      return;
    }

    this.locations = [...new Set(data.map(r => r.location))].sort();
    this.updateTableData(data);
    this.updateVisualization();
  }

  private updateTableData(data: TrafficReading[]): void {
    this.dataSource.data = data;
    if (this.paginator) {
      this.paginator.length = data.length;
      this.paginator.pageSizeOptions = this.pageSizeOptions;
      this.paginator.pageSize = this.pageSize;
    }
  }

  updateVisualization(): void {
    if (this.dataSource.data.length === 0) return;

    // Get filtered and sorted data
    let displayData = this.dataSource.filteredData.length > 0 
      ? this.dataSource.filteredData 
      : this.dataSource.data;

    // Apply current sorting
    displayData = this.getSortedData(displayData);

    // Apply scaling if showing window
    if (!this.showAllData) {
      const visiblePoints = Math.floor(displayData.length * this.xAxisScale);
      const start = Math.max(0, displayData.length - visiblePoints);
      displayData = displayData.slice(start, start + visiblePoints);
    }

    // Update chart data
    const labels = displayData.map(r => new Date(r.timestamp).toLocaleTimeString());
    const densityData = displayData.map(r => r.trafficDensity);
    const speedData = displayData.map(r => r.avgSpeed);

    this.chartData = {
      ...this.chartData,
      labels: labels,
      datasets: [
        {
          ...this.chartData.datasets[0],
          data: densityData
        },
        {
          ...this.chartData.datasets[1],
          data: speedData
        }
      ]
    };

    // Update chart options
    this.chartOptions = {
      ...this.chartOptions,
      scales: {
        ...this.chartOptions.scales,
        x: {
          ...this.chartOptions.scales?.['x'],
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: this.showAllData ? Math.max(5, Math.floor(10 / this.xAxisScale)) : undefined
          }
        }
      }
    };
  }


  private getSortedData(data: TrafficReading[]): TrafficReading[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return [...data].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }

    return [...data].sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'location': return compare(a.location, b.location, isAsc);
        case 'timestamp': return compare(a.timestamp, b.timestamp, isAsc);
        case 'trafficDensity': return compare(a.trafficDensity, b.trafficDensity, isAsc);
        case 'avgSpeed': return compare(a.avgSpeed, b.avgSpeed, isAsc);
        case 'congestionLevel': return compare(a.congestionLevel, b.congestionLevel, isAsc);
        default: return 0;
      }
    });
  }

  onXAxisScaleChange(): void {
    this.updateVisualization();
  }

  toggleShowAllData(): void {
    this.showAllData = !this.showAllData;
    this.updateVisualization();
  }

  setVisualization(type: ChartType): void {
    this.currentVisualization = type;
    this.updateVisualization();
  }

  getChartTitle(): string {
    switch (this.currentVisualization) {
      case 'line': return 'Traffic Trends Over Time';
      case 'bar': return 'Traffic Metrics Comparison';
      case 'pie': return 'Congestion Level Distribution';
      case 'doughnut': return 'Congestion Level Breakdown';
      case 'radar': return 'Location Performance Comparison';
      default: return 'Traffic Visualization';
    }
  }

  sortData(sortField: string): void {
    const sortState: Sort = { 
      active: sortField, 
      direction: this.sort?.direction === 'asc' && this.sort?.active === sortField ? 'desc' : 'asc'
    };
    this.sort.active = sortState.active;
    this.sort.direction = sortState.direction;
    this.sort.sortChange.emit(sortState);
  }

  private setupFilterPredicate(): void {
    this.dataSource.filterPredicate = (row: TrafficReading, fstr: string): boolean => {
      const filter = JSON.parse(fstr) as {
        begin?: string;
        end?: string;
        locations: string[];
        congestions: string[];
      };
      
      const timestamp = new Date(row.timestamp).getTime();
      const meetsDateCriteria = (
        (!filter.begin || timestamp >= new Date(filter.begin).getTime()) &&
        (!filter.end || timestamp <= new Date(filter.end).getTime())
      );
      
      const meetsLocationCriteria = (
        filter.locations.length === 0 || 
        filter.locations.includes(row.location)
      );
      
      const meetsCongestionCriteria = (
        filter.congestions.length === 0 || 
        filter.congestions.includes(row.congestionLevel)
      );

      return meetsDateCriteria && meetsLocationCriteria && meetsCongestionCriteria;
    };

    const applyFilters = () => {
      const dateRange = this.dateRange.value;
      const filter: any = {
        locations: this.locationFilter.value || [],
        congestions: this.congestionFilter.value || []
      };

      if (dateRange) {
        filter.begin = dateRange.begin.toISOString();
        filter.end = dateRange.end.toISOString();
      }

      this.dataSource.filter = JSON.stringify(filter);
      if (this.paginator) {
        this.paginator.firstPage();
      }
      
      this.updateVisualization();
    };

    this.dateRange.valueChanges.subscribe(applyFilters);
    this.locationFilter.valueChanges.subscribe(applyFilters);
    this.congestionFilter.valueChanges.subscribe(applyFilters);
  }
}

function compare(a: any, b: any, isAsc: boolean): number {
  return (a < b ? -1 : a > b ? 1 : 0) * (isAsc ? 1 : -1);
}