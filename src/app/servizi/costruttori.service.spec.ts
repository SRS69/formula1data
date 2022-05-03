import { TestBed } from '@angular/core/testing';

import { CostruttoriService } from './costruttori.service';

describe('CostruttoriService', () => {
  let service: CostruttoriService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CostruttoriService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
