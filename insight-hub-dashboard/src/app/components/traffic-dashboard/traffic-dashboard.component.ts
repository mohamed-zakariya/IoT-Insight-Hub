import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';

import { SensorService } from '../../services/sensor.service';
import { TrafficReading } from '../../models/traffic-reading.model';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

import { timer, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface CustomChartScales {
  x?: {
    min?: number;
    max?: number;
    type?: string;
    grid?: { display: boolean };
    ticks?: {
      maxRotation: number;
      minRotation: number;
      maxTicksLimit?: number;
      autoSkip?: boolean;
    };
    [key: string]: any;
  };
  y?: { beginAtZero?: boolean; grid?: { color: string }; [key: string]: any };
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
export class TrafficDashboardComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'location',
    'timestamp',
    'trafficDensity',
    'avgSpeed',
    'congestionLevel'
  ];
  dataSource = new MatTableDataSource<TrafficReading>([]);
  totalItems = 0;
  pageSizeOptions = [5, 10, 25];
  pageSize = 10;
  pageIndex = 0;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Filters
  selectedDate = new FormControl<Date | null>(null);
  locationFilter = new FormControl<string>('');
  congestionFilter = new FormControl<string>('');
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
        grid: { display: false },
        ticks: { maxRotation: 45, minRotation: 45, autoSkip: true }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
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
          font: { size: 12 }
        }
      }
    }
  };

  private refreshSub?: Subscription;

  constructor(private svc: SensorService) {}

  ngOnInit(): void {
    this.initializeChart();

    // Re-fetch whenever any filter changes
    this.selectedDate.valueChanges.subscribe(() => {
      this.pageIndex = 0;
      this.fetchPage();
    });
    this.locationFilter.valueChanges.subscribe(() => {
      this.pageIndex = 0;
      this.fetchPage();
    });
    this.congestionFilter.valueChanges.subscribe(() => {
      this.pageIndex = 0;
      this.fetchPage();
    });

    // Initial load
    this.loadInitialData();

    // Auto-refresh every 60s
    this.refreshSub = timer(60000, 60000)
      .pipe(switchMap(() => this.buildParamsAndCall()))
      .subscribe({
        next: (paged) => this.handlePagedResponse(paged),
        error: (err) => console.error('Error refreshing data:', err)
      });
  }

  ngAfterViewInit(): void {
    // Sort changes
    this.sort.sortChange.subscribe((sortState: Sort) => {
      this.pageIndex = 0;
      this.fetchPage();
    });

    // Pagination changes
    this.paginator.page.subscribe((pageEvt: PageEvent) => {
      this.pageIndex = pageEvt.pageIndex;
      this.pageSize = pageEvt.pageSize;
      this.fetchPage();
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
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
    // First page, no filters, sort by timestamp DESC
    this.pageIndex = 0;
    this.svc.getTrafficFiltered(
      undefined, // timestampStart
      undefined, // timestampEnd
      undefined, // location
      undefined, // congestionLevel
      0,         // page
      this.pageSize,
      'timestamp',
      'DESC'
    ).subscribe({
      next: (resp) => this.handlePagedResponse(resp),
      error: (err) => console.error('Error fetching initial page:', err)
    });
  }

  private buildParamsAndCall() {
    // 1) Build timestampStart / timestampEnd if a date is selected
    let tsStart: string | undefined, tsEnd: string | undefined;
    if (this.selectedDate.value) {
      const d = new Date(this.selectedDate.value);
      tsStart = new Date(d.setHours(0, 0, 0, 0)).toISOString();
      tsEnd   = new Date(d.setHours(24, 0, 0, 0)).toISOString();
    }
  
    // 2) Pull location & congestion filters if non‐empty
    const loc = this.locationFilter.value?.trim() || undefined;
  
    // Because congestionFilter is a string[] (multiple), only take the first selected or undefined
    const congArr = this.congestionFilter.value;
    const cong = Array.isArray(congArr) && congArr.length
      ? congArr[0].trim()
      : undefined;
  
    // 3) Determine current sort state (default to timestamp/DESC)
    const sortBy = this.sort?.active || 'timestamp';
    // Because “congestionLevel” was removed from the template, this.sort.active will never be “congestionLevel.”
    const sortDir = this.sort?.direction?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
    // 4) Current pageIndex and pageSize come from the component
    const page = this.pageIndex;
    const size = this.pageSize;
  
    // 5) Finally, return the Observable
    return this.svc.getTrafficFiltered(
      tsStart,
      tsEnd,
      loc,
      cong,
      page,
      size,
      sortBy,
      sortDir as 'ASC' | 'DESC'
    );
  }

  private fetchPage(): void {
    this.buildParamsAndCall().subscribe({
      next: (paged) => this.handlePagedResponse(paged),
      error: (err) => console.error('Error fetching page:', err)
    });
  }

  private handlePagedResponse(paged: {
    content: TrafficReading[];    // array of readings
    totalElements: number;        // total matching rows
    number: number;               // current page index
    size: number;                 // page size
  }): void {
    // 1) Populate the table with paged.content
    this.dataSource.data = Array.isArray(paged.content) ? paged.content : [];

    // 2) Update paginator’s total length from paged.totalElements
    this.totalItems = typeof paged.totalElements === 'number'
      ? paged.totalElements
      : 0;

    if (this.paginator) {
      this.paginator.length = this.totalItems;
    }

    // 3) If locations dropdown is still empty, populate it from paged.content
    if (!this.locations.length && Array.isArray(paged.content) && paged.content.length) {
      this.locations = Array.from(
        new Set(paged.content.map(r => r.location))
      ).sort();
    }

    // 4) Redraw chart using paged.content
    this.redrawChart(Array.isArray(paged.content) ? paged.content : []);
  }

  private redrawChart(pageItems: TrafficReading[]): void {
    const sorted = this.getSortedData(pageItems);

    // No zoom/window logic—just plot all pageItems
    const labels = sorted.map(r => new Date(r.timestamp).toLocaleTimeString());
    const densityData = sorted.map(r => r.trafficDensity);
    const speedData = sorted.map(r => r.avgSpeed);

    this.chartData = {
      ...this.chartData,
      labels,
      datasets: [
        { ...this.chartData.datasets[0], data: densityData },
        { ...this.chartData.datasets[1], data: speedData }
      ]
    };
  }

  private getSortedData(data: TrafficReading[]): TrafficReading[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return [...data].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }
    return [...data].sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'location':
          return compare(a.location, b.location, isAsc);
        case 'timestamp':
          return compare(a.timestamp, b.timestamp, isAsc);
        case 'trafficDensity':
          return compare(a.trafficDensity, b.trafficDensity, isAsc);
        case 'avgSpeed':
          return compare(a.avgSpeed, b.avgSpeed, isAsc);
        case 'congestionLevel':
          return compare(a.congestionLevel, b.congestionLevel, isAsc);
        default:
          return 0;
      }
    });
  }

  setVisualization(type: ChartType): void {
    this.currentVisualization = type;
    this.redrawChart(this.dataSource.data);
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
      direction:
        this.sort.direction === 'asc' && this.sort.active === sortField
          ? 'desc'
          : 'asc'
    };
    this.sort.active = sortState.active;
    this.sort.direction = sortState.direction;
    this.sort.sortChange.emit(sortState);
  }

  resetFilters(): void {
    this.selectedDate.setValue(null);
    this.locationFilter.setValue('');
    this.congestionFilter.setValue('');
    this.sort.active = '';
    this.sort.direction = '';
    this.pageIndex = 0;
    this.paginator.firstPage();
    this.fetchPage();
  }
}

function compare(a: any, b: any, isAsc: boolean): number {
  return (a < b ? -1 : a > b ? 1 : 0) * (isAsc ? 1 : -1);
}
