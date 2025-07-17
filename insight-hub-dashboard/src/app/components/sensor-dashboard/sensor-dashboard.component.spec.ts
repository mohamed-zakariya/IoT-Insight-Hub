
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

  //   tick();
  //   fixture.detectChanges();

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
});