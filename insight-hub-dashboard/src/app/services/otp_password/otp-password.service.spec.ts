import { TestBed } from '@angular/core/testing';

import { OtpPasswordService } from './otp-password.service';

describe('OtpPasswordService', () => {
  let service: OtpPasswordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtpPasswordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
