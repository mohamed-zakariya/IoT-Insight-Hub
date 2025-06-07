import { TestBed } from '@angular/core/testing';

import { RuntimeConfigService } from './runtime-config.service';

describe('RuntimeConfigService', () => {
  let service: RuntimeConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RuntimeConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
