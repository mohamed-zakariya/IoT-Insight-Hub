
import { SensorDashboardComponent } from './sensor-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { SensorService } from '../../services/sensor.service';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

import { PagedResponse } from '../../models/paged-response.model';
import { TrafficReading } from '../../models/traffic-reading.model';




describe('SensorDashboardComponent', () => {
  let component: SensorDashboardComponent;
  let fixture: ComponentFixture<SensorDashboardComponent>;
    let mockService: jasmine.SpyObj<SensorService>;

  const fakePagedResponse: PagedResponse<TrafficReading> = {
    content: [
      { id: '1', location: 'A', timestamp: new Date().toISOString(), trafficDensity: 10, avgSpeed: 30, congestionLevel: 'Low' },
      { id: '2', location: 'B', timestamp: new Date().toISOString(), trafficDensity: 20, avgSpeed: 25, congestionLevel: 'Moderate' }
    ],
    totalElements: 2,
    totalPages: 1,
    last: true,
    first: true,
    number: 0,
    size: 5,
    numberOfElements: 2,
    sort: { sorted: true, unsorted: false, empty: false },
    empty: false,
    pageable: { pageNumber: 0, pageSize: 5, offset: 0, paged: true, unpaged: false, sort: { sorted: true, unsorted: false, empty: false } }
  };

  const fakeLocationsResponse: PagedResponse<string> = {
    content: ['A', 'B'],
    totalElements: 2,
    totalPages: 1,
    last: true,
    first: true,
    number: 0,
    size: 2,
    numberOfElements: 2,
    sort: { sorted: true, unsorted: false, empty: false },
    empty: false,
    pageable: { pageNumber: 0, pageSize: 2, offset: 0, paged: true, unpaged: false, sort: { sorted: true, unsorted: false, empty: false } }
  };

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('SensorService', ['getTrafficFiltered', 'getTrafficLocations']);
    mockService.getTrafficFiltered.and.returnValue(of(fakePagedResponse));
    mockService.getTrafficLocations.and.returnValue(of(fakeLocationsResponse));
    await TestBed.configureTestingModule({
    imports: [
        SensorDashboardComponent,  // <-- import standalone component
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatMenuModule,
        MatButtonModule,
        MatIconModule,
        MatSliderModule,
        MatCardModule,
        ReactiveFormsModule,
        FormsModule,
        NgChartsModule
      ],
      providers: [
        { provide: SensorService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SensorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });


  it('should load locations on init', () => {
    expect(mockService.getTrafficLocations).toHaveBeenCalled();
    expect(component.locations).toEqual(['A', 'B']);
    expect(component.filteredLocations).toEqual(['A', 'B']);
  });

  // it('should call loadData() on init and populate table & chart', fakeAsync(() => {
  //   expect(mockService.getTrafficFiltered).toHaveBeenCalledWith(
  //     jasmine.objectContaining({
  //       page: 0,
  //       size: component.pageSize,
  //       sortBy: component.currentSort.active,
  //       sortDirection: component.currentSort.direction
  //     })
  //   );



  //   expect(component.dataSource.data.length).toBe(2);
  //   expect(component.chartData.labels!.length).toBe(2);
  //   expect(component.totalItems).toBe(2);
  //   expect(component.paginator.length).toBe(2);
  // }));

  it('should re-fetch data when filter changes', () => {
    mockService.getTrafficFiltered.calls.reset();
    component.locationFilter.setValue(['A']);
    expect(mockService.getTrafficFiltered).toHaveBeenCalled();
  });

  // it('sortData() should toggle sort and re-fetch', () => {
  //   mockService.getTrafficFiltered.calls.reset();
  //   component.sortData('location');
  //   expect(component.currentSort.active).toBe('location');
  //   expect(component.currentSort.direction).toBe('desc');
  //   expect(mockService.getTrafficFiltered).toHaveBeenCalled();

  //   mockService.getTrafficFiltered.calls.reset();
  //   component.sortData('location');
  //   expect(component.currentSort.direction).toBe('asc');
  //   expect(mockService.getTrafficFiltered).toHaveBeenCalled();
  // });

    it('should update sort and call loadData when sort changes', () => {
  const sortSpy = spyOn(component, 'loadData');
  component.sort.sortChange.emit({ active: 'location', direction: 'asc' });
  expect(component.currentSort.active).toBe('location');
  expect(component.currentSort.direction).toBe('asc');
  expect(sortSpy).toHaveBeenCalled();
});

it('should update pagination and call loadData when page changes', () => {
  const pageSpy = spyOn(component, 'loadData');
  component.paginator.page.emit({ pageIndex: 1, pageSize: 10, length: 2 } as any);
  expect(component.currentPage).toBe(1);
  expect(component.pageSize).toBe(10);
  expect(pageSpy).toHaveBeenCalled();
});

it('should reset all filters and paginator', () => {
  component.locationFilter.setValue(['A']);
  component.congestionFilter.setValue(['MODERATE']);
  component.locationSearch.setValue('search');

  const paginatorSpy = spyOn(component.paginator, 'firstPage');

  component.resetFilters();

  expect(component.locationFilter.value).toEqual([]);
  expect(component.congestionFilter.value).toEqual([]);
  expect(component.locationSearch.value).toBe('');
  expect(paginatorSpy).toHaveBeenCalled();
});


it('should set the visualization type', () => {
  component.setVisualization('bar');
  expect(component.currentVisualization).toBe('bar');
});


it('should toggle the showAllData flag', () => {
  const initial = component.showAllData;
  component.toggleShowAllData();
  expect(component.showAllData).toBe(!initial);
});


it('should format the scale label', () => {
  expect(component.formatScaleLabel(1.23456)).toBe('1.23x');
});


it('should return correct chart title for each type', () => {
  const types: any = {
    line: 'Traffic Trends Over Time',
    bar: 'Traffic Metrics Comparison',
    pie: 'Congestion Level Distribution',
    doughnut: 'Congestion Level Breakdown',
    radar: 'Location Performance Comparison',
    unknown: 'Traffic Visualization'
  };

  for (const type in types) {
    component.currentVisualization = type as any;
    expect(component.getChartTitle()).toBe(types[type]);
  }
});


it('should filter location list based on search term', () => {
  component.locations = ['Downtown', 'Airport', 'Harbor'];
  component.filterLocationList('air');
  expect(component.filteredLocations).toEqual(['Airport']);
});


// it('sortData() should toggle sort and re-sort data', () => {
//   component.dataSource.data = fakePagedResponse.content!;
//   component.sort = { active: '', direction: '', sortChange: of() } as any;

//   component.sortData('location');
//   expect(component.sort.active).toBe('location');
//   expect(component.sort.direction).toBe('desc');

//   component.sortData('location');
//   expect(component.sort.direction).toBe('asc');
// });



});