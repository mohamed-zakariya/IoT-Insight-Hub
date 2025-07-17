import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficDashboardComponent } from './traffic-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('TrafficDashboardComponent', () => {
  let component: TrafficDashboardComponent;
  let fixture: ComponentFixture<TrafficDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficDashboardComponent,HttpClientTestingModule]
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
