import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryPointComponent } from './entry-point.component';

describe('EntryPointComponent', () => {
  let component: EntryPointComponent;
  let fixture: ComponentFixture<EntryPointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntryPointComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntryPointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
