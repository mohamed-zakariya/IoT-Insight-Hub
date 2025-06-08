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
import { switchMap } from 'rxjs/operators'; // I have updated: Added switchMap import like traffic dashboard
// import { SensorService, TrafficReading } from '../../services/sensor.service';
import { SensorService } from '../../../services/sensor.service'; // I have updated: Changed to match traffic dashboard import pattern
import { StreetLightReading  } from '../../../models/street-light-reading.model';

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
  selector: 'app-street-light-management',
  templateUrl: './street-light-management.component.html',
  styleUrls: ['./street-light-management.component.css'],
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

export class StreetLightManagementComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['location', 'timestamp', 'brightnessLevel', 'powerConsumption', 'status'];
  dataSource = new MatTableDataSource<StreetLightReading>([]);
  // I have updated: Removed pagination-related properties to match traffic dashboard approach
  pageSizeOptions = [5, 10, 25]; // I have updated: Simplified like traffic dashboard
  pageSize = 10; // I have updated: Changed from 5 to 10 to match traffic dashboard

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

 // Filters
  selectedDate = new FormControl<Date | null>(null);
  locationFilter = new FormControl<string[]>([]);
  locationSearch = new FormControl<string>('');
  // ADDED: New filter for street light status
  statusFilter = new FormControl<string[]>([]);
  locations: string[] = [];
  // I have updated: Removed filteredLocations property, will use getter like traffic dashboard
  // ADDED: Available status options for street lights
  statusOptions: string[] = ['ON', 'OFF', 'MAINTENANCE', 'ERROR'];

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
              // CHANGED: Updated tooltip labels for street light metrics
              if (context.dataset.label?.includes('Brightness')) {
                label += '%';
              } else if (context.dataset.label?.includes('Power')) {
                label += ' W';
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

  constructor(private sensorService: SensorService) {} // I have updated: Changed from svc to sensorService to match original

  ngOnInit(): void {
    this.initializeChart();
    // I have updated: Changed to match traffic dashboard pattern - removed individual subscriptions
    this.loadInitialData(); // I have updated: Added like traffic dashboard
    this.setupAutoRefresh(); // I have updated: Moved to match traffic dashboard pattern
    
    // I have updated: Initialize filter subscriptions like traffic dashboard
    this.setupFilterPredicate(); // I have updated: Added like traffic dashboard
  }

  ngAfterViewInit(): void {
    // I have updated: Simplified to match traffic dashboard approach
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // I have updated: Update visualization when sort changes like traffic dashboard
    this.sort.sortChange.subscribe(() => {
      this.updateVisualization(); // I have updated: Changed from loadData to updateVisualization
    });
  }

  // I have updated: Added getter for filtered locations like traffic dashboard
  get filteredLocations(): string[] {
    const term = this.locationSearch.value?.toLowerCase() || '';
    return this.locations.filter(loc => !term || loc.toLowerCase().includes(term));
  }

  // I have updated: Completely changed loadData to match traffic dashboard pattern
  private loadInitialData(): void {
    this.sensorService.getStreetLight().subscribe({ // I have updated: Changed method name to match street lights
      next: (data) => this.handleDataUpdate(data),
      error: (err) => console.error('Error loading initial street light data:', err) // I have updated: Updated error message
    });
  }

  // I have updated: Simplified resetFilters to match traffic dashboard pattern
  resetFilters(): void {
    // I have updated: Simplified reset logic like traffic dashboard
    this.selectedDate.setValue(null);
    this.locationFilter.setValue([]);
    this.statusFilter.setValue([]); // I have updated: Changed from congestionFilter to statusFilter
    this.locationSearch.setValue('');
    
    // I have updated: Added table filter reset like traffic dashboard
    this.dataSource.filter = '';

    // I have updated: Added sort reset like traffic dashboard
    if (this.sort) {
      this.sort.active = '';
      this.sort.direction = '';
      this.sort.sortChange.emit({ active: '', direction: '' });
    }

    // I have updated: Jump back to page 1 like traffic dashboard
    if (this.paginator) {
      this.paginator.firstPage();
    }

    // I have updated: Refresh chart like traffic dashboard
    this.updateVisualization();
  }

  private initializeChart(): void {
    // CHANGED: Updated initial chart setup for street light metrics
    this.chartData = {
      labels: [],
      datasets: [
        {
          data: [],
          label: 'Brightness Level (%)',
          borderColor: '#FFD700', // Gold color for brightness
          backgroundColor: 'rgba(255, 215, 0, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          data: [],
          label: 'Power Consumption (W)',
          borderColor: '#FF6B6B', // Red color for power consumption
          backgroundColor: 'rgba(255, 107, 107, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    };
  }

  // I have updated: Changed auto-refresh pattern to match traffic dashboard
  private setupAutoRefresh(): void {
    timer(60000, 60000).pipe( // I have updated: Added pipe with switchMap like traffic dashboard
      switchMap(() => this.sensorService.getStreetLight()) // I have updated: Changed to use switchMap pattern
    ).subscribe({
      next: (data) => this.handleDataUpdate(data),
      error: (err) => console.error('Error refreshing street light data:', err) // I have updated: Updated error message
    });
  }

  // I have updated: Updated method to handle street light data like traffic dashboard
  private handleDataUpdate(data: StreetLightReading[]): void {
    if (!data || data.length === 0) {
      console.warn('Received empty street light dataset');
      return;
    } 

    this.locations = [...new Set(data.map(r => r.location))].sort();
    this.updateTableData(data); // I have updated: Changed to match traffic dashboard pattern
    this.updateVisualization(); // I have updated: Added like traffic dashboard
  }

  private updateTableData(data: StreetLightReading[]): void {
    this.dataSource.data = data;
    if (this.paginator) {
      this.paginator.length = data.length;
      this.paginator.pageSizeOptions = this.pageSizeOptions;
      this.paginator.pageSize = this.pageSize;
    }
  }

  // I have updated: Added updateVisualization method like traffic dashboard
  updateVisualization(): void {
    if (this.dataSource.data.length === 0) return;

    // I have updated: Get filtered and sorted data like traffic dashboard
    let displayData = this.dataSource.filteredData.length > 0 
      ? this.dataSource.filteredData 
      : this.dataSource.data;

    // I have updated: Apply current sorting like traffic dashboard
    displayData = this.getSortedData(displayData);

    // I have updated: Apply scaling if showing window like traffic dashboard
    if (!this.showAllData) {
      const visiblePoints = Math.floor(displayData.length * this.xAxisScale);
      const start = Math.max(0, displayData.length - visiblePoints);
      displayData = displayData.slice(start, start + visiblePoints);
    }

    // I have updated: Update chart data like traffic dashboard
    const labels = displayData.map(r => new Date(r.timestamp).toLocaleTimeString());
    const brightnessData = displayData.map(r => r.brightnessLevel);
    const powerData = displayData.map(r => r.powerConsumption);

    this.chartData = {
      ...this.chartData,
      labels: labels,
      datasets: [
        {
          ...this.chartData.datasets[0],
          data: brightnessData
        },
        {
          ...this.chartData.datasets[1],
          data: powerData
        }
      ]
    };

    // I have updated: Update chart options like traffic dashboard
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

  // CHANGED: Updated sorting to handle street light data fields
  private getSortedData(data: StreetLightReading[]): StreetLightReading[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      // I have updated: Default sort by timestamp like traffic dashboard
      return [...data].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }

    // I have updated: Updated to use spread operator like traffic dashboard
    return [...data].sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'location': return compare(a.location, b.location, isAsc);
        case 'timestamp': return compare(a.timestamp, b.timestamp, isAsc); // I have updated: Compare timestamp strings directly
        case 'brightnessLevel': return compare(a.brightnessLevel, b.brightnessLevel, isAsc);
        case 'powerConsumption': return compare(a.powerConsumption, b.powerConsumption, isAsc);
        case 'status': return compare(a.status, b.status, isAsc);
        default: return 0;
      }
    });
  }

  setVisualization(type: ChartType): void {
    this.currentVisualization = type;
    this.updateVisualization(); // I have updated: Added updateVisualization call like traffic dashboard
  }

  toggleShowAllData(): void {
    this.showAllData = !this.showAllData;
    this.updateVisualization(); // I have updated: Added updateVisualization call like traffic dashboard
  }

  onXAxisScaleChange(): void {
    // I have updated: Added updateVisualization call like traffic dashboard
    this.updateVisualization();
  }

  formatScaleLabel(value: number): string {
    return `${value.toFixed(2)}x`;
  }

  // CHANGED: Updated chart titles for street light dashboard
  getChartTitle(): string {
    switch (this.currentVisualization) {
      case 'line': return 'Street Light Performance Over Time';
      case 'bar': return 'Street Light Metrics Comparison';
      case 'pie': return 'Street Light Status Distribution';
      case 'doughnut': return 'Operational Status Breakdown';
      case 'radar': return 'Location Performance Analysis';
      default: return 'Street Light Visualization';
    }
  }

  // I have updated: Simplified sortData method to match traffic dashboard pattern
  sortData(sortField: string): void {
    const sortState: Sort = { 
      active: sortField, 
      direction: this.sort?.direction === 'asc' && this.sort?.active === sortField ? 'desc' : 'asc'
    };
    this.sort.active = sortState.active;
    this.sort.direction = sortState.direction;
    this.sort.sortChange.emit(sortState);
  }

  // I have updated: Removed filterLocationList method, using getter instead

  // I have updated: Added setupFilterPredicate method like traffic dashboard
  private setupFilterPredicate(): void {
    this.dataSource.filterPredicate = (row, filterString) => {
      const filter = JSON.parse(filterString) as { date?: string; locations: string[]; statuses: string[]; }; // I have updated: Changed congestions to statuses
      const ts = new Date(row.timestamp).getTime();
      let meetsDate = true;
      if (filter.date) {
        const sel = new Date(filter.date);
        const start = new Date(sel).setHours(0,0,0,0);
        const end   = new Date(sel).setHours(24,0,0,0);
        meetsDate = ts >= start && ts < end;
      }
      const meetsLoc = !filter.locations.length || filter.locations.includes(row.location);
      const meetsStatus = !filter.statuses.length || filter.statuses.includes(row.status); // I have updated: Changed to status field
      return meetsDate && meetsLoc && meetsStatus;
    };

    const applyFilters = () => {
      const f: any = {
        locations: this.locationFilter.value || [],
        statuses: this.statusFilter.value || [] // I have updated: Changed from congestions to statuses
      };
      if (this.selectedDate.value) {
        f.date = this.selectedDate.value.toISOString();
      }
      this.dataSource.filter = JSON.stringify(f);
      this.paginator?.firstPage();
      this.updateVisualization();
    };

    this.selectedDate.valueChanges.subscribe(applyFilters);
    this.locationFilter.valueChanges.subscribe(applyFilters);
    this.statusFilter.valueChanges.subscribe(applyFilters); // I have updated: Changed from congestionFilter

    // I have updated: Added initial filter application like traffic dashboard
    applyFilters();
  }

  // ADDED: Method to get status color indicator for visual status representation
  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ON': return '#4CAF50'; // Green
      case 'OFF': return '#757575'; // Gray
      case 'MAINTENANCE': return '#FF9800'; // Orange
      case 'ERROR': return '#F44336'; // Red
      default: return '#757575'; // Default gray
    }
  }

  // ADDED: Method to get status icon for visual representation
  getStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ON': return 'lightbulb';
      case 'OFF': return 'lightbulb_outline';
      case 'MAINTENANCE': return 'build';
      case 'ERROR': return 'error';
      default: return 'help';
    }
  }
}

function compare(a: any, b: any, isAsc: boolean): number {
  return (a < b ? -1 : a > b ? 1 : 0) * (isAsc ? 1 : -1);
}