import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficMonitoringComponent } from './traffic-monitoring.component';

describe('TrafficMonitoringComponent', () => {
  let component: TrafficMonitoringComponent;
  let fixture: ComponentFixture<TrafficMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficMonitoringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrafficMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
