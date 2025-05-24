import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirPollutionMonitoringComponent } from './air-pollution-monitoring.component';

describe('AirPollutionMonitoringComponent', () => {
  let component: AirPollutionMonitoringComponent;
  let fixture: ComponentFixture<AirPollutionMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirPollutionMonitoringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirPollutionMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
