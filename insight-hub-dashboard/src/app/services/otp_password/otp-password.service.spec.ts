import { TestBed } from '@angular/core/testing';

import { OtpPasswordService } from './otp-password.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('OtpPasswordService', () => {
  let service: OtpPasswordService;

  beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [ HttpClientTestingModule ],   // ← provide HttpClient
    // no need to stub RuntimeConfigService here (these services don’t use it)
  });
    service = TestBed.inject(OtpPasswordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
