import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NavbarComponent } from './navbar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
// at the top of navbar.component.spec.ts
import { RuntimeConfigService } from '../../services/RuntimeConfigService/runtime-config.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

 beforeEach(async () => {

 await TestBed.configureTestingModule({
   imports: [
     NavbarComponent,
     HttpClientTestingModule,   // gives you HttpClient
     RouterTestingModule        // gives you Router
   ],
   providers: [
     {
       provide: RuntimeConfigService,
       useValue: { domain: 'http://test.local' }  // stub the domain getter
     }
   ]
 })
     .compileComponents();
 
   fixture = TestBed.createComponent(NavbarComponent);
   component = fixture.componentInstance;
   fixture.detectChanges();
 });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
