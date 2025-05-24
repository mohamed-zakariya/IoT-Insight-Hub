import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficDashboardComponent } from './traffic-dashboard.component';

describe('TrafficDashboardComponent', () => {
  let component: TrafficDashboardComponent;
  let fixture: ComponentFixture<TrafficDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrafficDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
