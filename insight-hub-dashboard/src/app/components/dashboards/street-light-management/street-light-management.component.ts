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
// import { SensorService, TrafficReading } from '../../services/sensor.service';
import { SensorService } from '../../../services/sensor.service';
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


export class StreetLightManagementComponent   implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['location', 'timestamp', 'brightnessLevel', 'powerConsumption', 'status'];
  dataSource = new MatTableDataSource<StreetLightReading>([]);
  totalItems = 0;
  pageSize = 5;
  currentPage = 0;
  currentSort: Sort = { active: 'timestamp', direction: 'desc' };
  pageSizeOptions = [5, 10, 25,40];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

 // Filters
  selectedDate = new FormControl<Date | null>(null);
  locationFilter = new FormControl<string[]>([]);
  locationSearch = new FormControl<string>('');
  // ADDED: New filter for street light status
  statusFilter = new FormControl<string[]>([]);
  locations: string[] = [];
  filteredLocations: string[] = [];
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

  constructor(private sensorService: SensorService) {}

    ngOnInit(): void {
    this.initializeChart();
    this.selectedDate.valueChanges.subscribe(() => this.loadData());
    this.locationFilter.valueChanges.subscribe(() => this.loadData());
    // CHANGED: Replaced congestionFilter with statusFilter
    this.statusFilter.valueChanges.subscribe(() => this.loadData());
    this.locationSearch.valueChanges.subscribe(value => this.filterLocationList(value));
    this.loadData();
    // ADDED: Setup auto-refresh every 1 minute as per requirements
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
      sortDirection: this.currentSort.direction || 'desc' // CHANGED: Default to desc for latest readings first
    };
     // CHANGED: Replaced congestion filter with status filter
    const status = this.statusFilter.value?.filter(Boolean);
    if (status && status.length > 0) {
      params.status = status[0]; // assuming single value supported
    }

  // Only include location if selected
  const locations = this.locationFilter.value?.filter(Boolean);
  if (locations && locations.length > 0) {
    params.location = locations[0]; // assuming single value supported
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

this.sensorService.getLightReadingsFiltered(params).subscribe({
      next: (res: { content: never[]; totalElements: number; }) => {
        console.log('Backend response:', res);

        // 1) Pull the array of readings from res.content
        const items: StreetLightReading[] = res.content || [];

        console.log('Light reading items:', items);

        // 2) Use res.totalElements instead of res.totalItems
        this.dataSource.data = items;
        this.totalItems = res.totalElements || 0;

        console.log('Total items:', this.totalItems);
        this.paginator.length = this.totalItems;
        this.paginator.pageSize = this.pageSize;
        this.paginator.pageIndex = this.currentPage;

        // CHANGED: Updated chart data for street light metrics
        this.chartData = {
          labels: items.map(r => new Date(r.timestamp).toLocaleTimeString()),
          datasets: [
            { 
              label: 'Brightness Level (%)', 
              data: items.map(r => r.brightnessLevel),
              borderColor: '#FFD700', // Gold color for brightness
              backgroundColor: 'rgba(255, 215, 0, 0.2)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 3,
              pointHoverRadius: 5
            },
            { 
              label: 'Power Consumption (W)', 
              data: items.map(r => r.powerConsumption),
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

        // ADDED: Update available locations from actual data
        this.updateAvailableLocations(items);
      },
      error: (err: any) => {
        console.error('Failed to fetch street light data:', err);
        this.dataSource.data = [];
        this.totalItems = 0;
        this.chartData = { labels: [], datasets: [] };
      }
    });
  }

  // ADDED: Method to update available locations from data
  private updateAvailableLocations(items: StreetLightReading[]): void {
    const uniqueLocations = [...new Set(items.map(r => r.location))].sort();
    if (uniqueLocations.length > 0) {
      this.locations = uniqueLocations;
      this.filteredLocations = uniqueLocations;
    }
  }

  resetFilters(): void {
    this.locationFilter.setValue([]);
    // CHANGED: Reset status filter instead of congestion filter
    this.statusFilter.setValue([]);
    this.locationSearch.setValue('');
    if (this.paginator) {
      this.paginator.firstPage();
    }
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

  // CHANGED: Updated auto-refresh to 1 minute (60000ms) as per requirements
  private setupAutoRefresh(): void {
    timer(60000, 60000).subscribe(() => {
      console.log('Auto-refreshing street light data...');
      this.loadData();
    });
  }

  // CHANGED: Updated method to handle street light data
  private handleDataUpdate(data: StreetLightReading[]): void {
    if (!data || data.length === 0) {
      console.warn('Received empty street light dataset');
      return;
    } 

    this.locations = [...new Set(data.map(r => r.location))].sort();
    this.updateTableData(data);
    this.chartData.labels = data.map(r => new Date(r.timestamp).toLocaleTimeString());
    // CHANGED: Updated to use street light metrics
    this.chartData.datasets[0].data = data.map(r => r.brightnessLevel);
    this.chartData.datasets[1].data = data.map(r => r.powerConsumption);
  }

  private updateTableData(data: StreetLightReading[]): void {
    this.dataSource.data = data;
    if (this.paginator) {
      this.paginator.length = data.length;
      this.paginator.pageSizeOptions = this.pageSizeOptions;
      this.paginator.pageSize = this.pageSize;
    }
  }

  // CHANGED: Updated sorting to handle street light data fields
  private getSortedData(data: StreetLightReading[]): StreetLightReading[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.slice().sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'location': return compare(a.location, b.location, isAsc);
        case 'timestamp': return compare(new Date(a.timestamp).getTime(), new Date(b.timestamp).getTime(), isAsc);
        case 'brightnessLevel': return compare(a.brightnessLevel, b.brightnessLevel, isAsc);
        case 'powerConsumption': return compare(a.powerConsumption, b.powerConsumption, isAsc);
        case 'status': return compare(a.status, b.status, isAsc);
        default: return 0;
      }
    });
  }

  setVisualization(type: ChartType): void {
    this.currentVisualization = type;
  }

  toggleShowAllData(): void {
    this.showAllData = !this.showAllData;
  }

  onXAxisScaleChange(): void {
    // Add logic to adjust chart zoom level
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

  sortData(field: string): void {
    console.log('[DEBUG] sortData() called with field:', field);

    if (this.sort.active === field) {
      this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sort.active = field;
      this.sort.direction = 'desc';
    }

    this.dataSource.sortingDataAccessor = (item: any, property: string) => item[property];
    this.dataSource.sort = this.sort;
    this.dataSource.sortData(this.dataSource.data, this.dataSource.sort);

    const sortedItems = this.dataSource.data;

    // CHANGED: Updated chart data for street light metrics
    this.chartData = {
      labels: sortedItems.map(r => new Date(r.timestamp).toLocaleTimeString()),
      datasets: [
        { 
          label: 'Brightness Level (%)', 
          data: sortedItems.map(r => r.brightnessLevel),
          borderColor: '#FFD700',
          backgroundColor: 'rgba(255, 215, 0, 0.2)'
        },
        { 
          label: 'Power Consumption (W)', 
          data: sortedItems.map(r => r.powerConsumption),
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.2)'
        }
      ]
    };
  }

  filterLocationList(searchTerm: string | null): void {
    const allLocations = this.locations || [];
    const lowerTerm = searchTerm?.toLowerCase() || '';
    this.filteredLocations = allLocations.filter(loc =>
      loc.toLowerCase().includes(lowerTerm)
    );
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