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
  displayedColumns: string[] = ['location', 'timestamp', 'trafficDensity', 'avgSpeed', 'congestionLevel'];
  dataSource = new MatTableDataSource<TrafficReading>([]);
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
  congestionFilter = new FormControl<string[]>([]);
  locationSearch    = new FormControl<string>('');
  locations: string[] = [];
  congestionLevels = ['Low', 'Moderate', 'High'];
  filteredLocations: string[] = [];

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

  constructor(private sensorService: SensorService) {}

  ngOnInit(): void {
 
    this.initializeChart();
    this.selectedDate.valueChanges.subscribe(() => this.loadData());
    this.locationFilter.valueChanges.subscribe(() => this.loadData());
    this.congestionFilter.valueChanges.subscribe(() => this.loadData());
    this.locationSearch.valueChanges.subscribe(value => this.filterLocationList(value));
    this.loadData();
    // this.loadAvailableLocations();
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
    sortDirection: this.currentSort.direction || 'asc'   // ← add this line
  };

  // Only include congestionLevel if it's selected
  const congestion = this.congestionFilter.value?.filter(Boolean);
  if (congestion && congestion.length > 0) {
    params.congestionLevel = congestion[0]; // assuming single value supported
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

this.sensorService.getTrafficFiltered(params).subscribe({
  next: res => {
    console.log('Backend response:', res);

    // 1) Pull the array of readings from res.content
    const items: TrafficReading[] = res.content || [];

    console.log('items outputs:', items);

    // 2) Use res.totalElements instead of res.totalItems
    this.dataSource.data = items;
    this.totalItems = res.totalElements || 0;

    console.log('Total items:', this.totalItems);
    this.paginator.length    = this.totalItems;
    this.paginator.pageSize  = this.pageSize;
    this.paginator.pageIndex = this.currentPage;


    // 3) Build chart data from `items` as before
    this.chartData = {
      labels: items.map(r => new Date(r.timestamp).toLocaleTimeString()),
      datasets: [
        { label: 'Traffic Density', data: items.map(r => r.trafficDensity) },
        { label: 'Average Speed', data: items.map(r => r.avgSpeed) }
      ]
    };
  },
  error: err => {
    console.error('Failed to fetch data:', err);
    this.dataSource.data = [];
    this.totalItems = 0;
    this.chartData = { labels: [], datasets: [] };
  }
});

}


  // loadAvailableLocations(): void {
  //   this.sensorService.getTrafficLocations().subscribe(locations => {
  //     this.locations = locations;
  //     this.filteredLocations = locations;
  //   });
  // }

  resetFilters(): void {
    this.locationFilter.setValue([]);
    this.congestionFilter.setValue([]);
    this.locationSearch.setValue('');
     if (this.paginator) {
    this.paginator.firstPage();
  }

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



  private setupAutoRefresh(): void {
  timer(60000, 60000).subscribe(() => this.loadData());
}




  private handleDataUpdate(data: TrafficReading[]): void {
    if (!data || data.length === 0) {
      console.warn('Received empty dataset');
      return;
    }

    this.locations = [...new Set(data.map(r => r.location))].sort();
    this.updateTableData(data);
    this.chartData.labels = data.map(r => new Date(r.timestamp).toLocaleTimeString());
    this.chartData.datasets[0].data = data.map(r => r.trafficDensity);
  }

  private updateTableData(data: TrafficReading[]): void {
    this.dataSource.data = data;
    if (this.paginator) {
      this.paginator.length = data.length;
      this.paginator.pageSizeOptions = this.pageSizeOptions;
      this.paginator.pageSize = this.pageSize;
    }
  }


  private getSortedData(data: TrafficReading[]): TrafficReading[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.slice().sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'location': return compare(a.location, b.location, isAsc);
        case 'timestamp': return compare(new Date(a.timestamp).getTime(), new Date(b.timestamp).getTime(), isAsc);
        case 'trafficDensity': return compare(a.trafficDensity, b.trafficDensity, isAsc);
        case 'avgSpeed': return compare(a.avgSpeed, b.avgSpeed, isAsc);
        case 'congestionLevel': return compare(a.congestionLevel, b.congestionLevel, isAsc);
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

sortData(field: string): void {
    console.log('[DEBUG] sortData() called with field:', field);

  if (this.sort.active === field) {
    this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
  }
  else {
    this.sort.active = field;
    this.sort.direction = 'desc';
  }

  
    this.dataSource.sortingDataAccessor = (item: any, property: string) => item[property];
    // this.dataSource.sort?.sort({ id: field, start: 'asc', disableClear: false });
    this.dataSource.sort = this.sort;
    this.dataSource.sortData(this.dataSource.data, this.dataSource.sort);

  const sortedItems = this.dataSource.data;

this.chartData = {
  labels: sortedItems.map(r => new Date(r.timestamp).toLocaleTimeString()),
  datasets: [
    { label: 'Traffic Density', data: sortedItems.map(r => r.trafficDensity) },
    { label: 'Average Speed', data: sortedItems.map(r => r.avgSpeed) }
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




}  

function compare(a: any, b: any, isAsc: boolean): number {
  return (a < b ? -1 : a > b ? 1 : 0) * (isAsc ? 1 : -1);
}


