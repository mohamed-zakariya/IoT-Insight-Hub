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
import { SensorService } from '../../services/sensor.service';
import { TrafficReading } from '../../models/traffic-reading.model';





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
  selector: 'app-sensor-dashboard',
  templateUrl: './sensor-dashboard.component.html',
  styleUrls: ['./sensor-dashboard.component.css'],
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


export class SensorDashboardComponent implements OnInit, AfterViewInit {
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
  selectedDate = new FormControl<Date | null>(null);
  locationFilter = new FormControl<string[]>([]);
  congestionFilter = new FormControl<string[]>([]);
  locationSearch    = new FormControl<string>('');
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
  get filteredLocations(): string[] {
    const term = this.locationSearch.value?.toLowerCase() || '';
    return this.locations.filter(loc => !term || loc.toLowerCase().includes(term));
  }

  /** Clears date, location, congestion AND the location‐search field */
/** Clears date, location, congestion AND the location‐search field */
resetFilters(): void {
  // 1) clear all of your form-controls
  this.selectedDate.setValue(null);
  this.locationFilter.setValue([]);
  this.congestionFilter.setValue([]);
  this.locationSearch.setValue('');
  // subscriptions on .valueChanges will auto-apply the cleared filter

  // 2) clear the MatTableDataSource filter so the table shows everything
  this.dataSource.filter = '';

  // 3) reset sort state and emit so the table actually re-sorts
  if (this.sort) {
    this.sort.active    = '';
    this.sort.direction = '';
    this.sort.sortChange.emit({ active: '', direction: '' });
  }

  // 4) jump back to page 1
  if (this.paginator) {
    this.paginator.firstPage();
  }

  // 5) refresh your chart with the full, un-filtered data
  this.updateVisualization();
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
    this.dataSource.filterPredicate = (row, filterString) => {
      const filter = JSON.parse(filterString) as { date?: string; locations: string[]; congestions: string[]; };
      const ts = new Date(row.timestamp).getTime();
      let meetsDate = true;
      if (filter.date) {
        const sel = new Date(filter.date);
        const start = new Date(sel).setHours(0,0,0,0);
        const end   = new Date(sel).setHours(24,0,0,0);
        meetsDate = ts >= start && ts < end;
      }
      const meetsLoc  = !filter.locations.length || filter.locations.includes(row.location);
      const meetsCong = !filter.congestions.length || filter.congestions.includes(row.congestionLevel);
      return meetsDate && meetsLoc && meetsCong;
    };

    const applyFilters = () => {
      const f: any = {
        locations: this.locationFilter.value || [],
        congestions: this.congestionFilter.value || []
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
    this.congestionFilter.valueChanges.subscribe(applyFilters);

    // initial
    applyFilters();
  }
}  

function compare(a: any, b: any, isAsc: boolean): number {
  return (a < b ? -1 : a > b ? 1 : 0) * (isAsc ? 1 : -1);
}












































//   displayedColumns: string[] = ['location', 'timestamp', 'trafficDensity', 'avgSpeed', 'congestionLevel'];
//   dataSource = new MatTableDataSource<TrafficReading>([]);
//   totalItems = 0;
//   pageSize = 10;
//   currentPage = 0;
//   currentSort: Sort = { active: 'timestamp', direction: 'desc' };

//   selectedDate = new FormControl<Date | null>(null);
//   locationFilter = new FormControl<string[]>([]);
//   congestionFilter = new FormControl<string[]>([]);
//   locationSearch = new FormControl<string>('');
//   congestionLevels: string[] = ['Low', 'Moderate', 'High'];

//   filteredLocations: string[] = [];
//   locations: string[] = [];

// // Chart data
//   public currentVisualization: ChartType = 'line';
//   public chartData: ChartConfiguration['data'] = {
//     labels: [],
//     datasets: []
//   };
//   public chartOptions: CustomChartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     animation: {
//       duration: 1000,
//       easing: 'easeOutQuart'
//     },
//     scales: {
//       x: {
//         grid: {
//           display: false
//         },
//         ticks: {
//           maxRotation: 45,
//           minRotation: 45,
//           autoSkip: true
//         }
//       },
//       y: {
//         beginAtZero: true,
//         grid: {
//           color: 'rgba(0, 0, 0, 0.05)'
//         }
//       }
//     },
//     plugins: {
//       tooltip: {
//         mode: 'index',
//         intersect: false,
//         callbacks: {
//           label: (context) => {
//             let label = context.dataset.label || '';
//             if (label) label += ': ';
//             if (context.parsed.y !== null) {
//               label += context.parsed.y.toFixed(1);
//               if (context.dataset.label?.includes('Speed')) {
//                 label += ' km/h';
//               }
//             }
//             return label;
//           }
//         }
//       },
//       legend: {
//         position: 'top',
//         labels: {
//           boxWidth: 12,
//           padding: 20,
//           usePointStyle: true,
//           font: {
//             size: 12
//           }
//         }
//       }
//     }
//   };
//   showAllData: boolean = false;
//   xAxisScale: number = 1;


//   @ViewChild(MatPaginator) paginator!: MatPaginator;
//   @ViewChild(MatSort) sort!: MatSort;

//   // Define the chart type
  

//   constructor(private sensorService: SensorService) {}

//   ngOnInit(): void {
//     this.selectedDate.valueChanges.subscribe(() => this.loadData());
//     this.locationFilter.valueChanges.subscribe(() => this.loadData());
//     this.congestionFilter.valueChanges.subscribe(() => this.loadData());
//     this.locationSearch.valueChanges.subscribe(value => this.filterLocationList(value));
//     this.loadData();
//     // this.loadAvailableLocations();
//   }

//   ngAfterViewInit(): void {
//     this.sort.sortChange.subscribe(sort => {
//       this.currentSort = sort;
//       this.loadData();
//     });

//     this.paginator.page.subscribe(event => {
//       this.currentPage = event.pageIndex;
//       this.pageSize = event.pageSize;
//       this.loadData();
//     });
//   }
// loadData(): void {
//   const params: any = {
//     page: this.currentPage,
//     size: this.pageSize,
//     sortBy: this.currentSort.active || 'timestamp'
//   };

//   // Only include congestionLevel if it's selected
//   const congestion = this.congestionFilter.value?.filter(Boolean);
//   if (congestion && congestion.length > 0) {
//     params.congestionLevel = congestion[0]; // assuming single value supported
//   }

//   // Only include location if selected
//   const locations = this.locationFilter.value?.filter(Boolean);
//   if (locations && locations.length > 0) {
//     params.location = locations[0]; // assuming single value supported
//   }

//   // Only include date if selected
//   const date = this.selectedDate.value;
//   if (date) {
//     const start = new Date(date);
//     start.setHours(0, 0, 0, 0);
//     params.timestampStart = start.toISOString();

//     const end = new Date(date);
//     end.setHours(23, 59, 59, 999);
//     params.timestampEnd = end.toISOString();
//   }

// this.sensorService.getTrafficFiltered(params).subscribe({
//   next: res => {
//     const items = res?.items || [];

//     this.dataSource.data = items;
//     this.totalItems = res?.totalItems || 0;

//     this.chartData = {
//       labels: items.map(r => new Date(r.timestamp).toLocaleTimeString()),
//       datasets: [
//         { label: 'Traffic Density', data: items.map(r => r.trafficDensity) },
//         { label: 'Average Speed', data: items.map(r => r.avgSpeed) }
//       ]
//     };
//   },
//   error: err => {
//     console.error('Failed to fetch data:', err);
//     this.dataSource.data = [];
//     this.totalItems = 0;
//     this.chartData = { labels: [], datasets: [] };
//   }
// });
// }







  // loadAvailableLocations(): void {
  //   this.sensorService.getTrafficLocations().subscribe(locations => {
  //     this.locations = locations;
  //     this.filteredLocations = locations;
  //   });
  // }

  // resetFilters(): void {
  //   this.locationFilter.setValue([]);
  //   this.congestionFilter.setValue([]);
  //   this.locationSearch.setValue('');
  // }

 
  // setVisualization(type: ChartType): void {
  //   this.currentVisualization = type;
  // }





















  

  // toggleShowAllData(): void {
  //   this.showAllData = !this.showAllData;
  // }

  // onXAxisScaleChange(): void {
  //   // Add logic to adjust chart zoom level
  // }

  // formatScaleLabel(value: number): string {
  //   return value + 'x';
  // }

  // getChartTitle(): string {
  //   return 'Traffic Sensor Overview';
  // }

  








  



//   sortData(field: string): void {
//     this.dataSource.sortingDataAccessor = (item: any, property: string) => item[property];
//     this.dataSource.sort?.sort({ id: field, start: 'asc', disableClear: false });
//   }

//   filterLocationList(searchTerm: string | null): void {
//     const allLocations = this.locations || [];
//     const lowerTerm = searchTerm?.toLowerCase() || '';
//     this.filteredLocations = allLocations.filter(loc =>
//       loc.toLowerCase().includes(lowerTerm)
//     );
//   }
// }






