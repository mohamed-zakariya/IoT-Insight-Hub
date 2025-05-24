import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetLightManagementComponent } from './street-light-management.component';

describe('StreetLightManagementComponent', () => {
  let component: StreetLightManagementComponent;
  let fixture: ComponentFixture<StreetLightManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreetLightManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreetLightManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
