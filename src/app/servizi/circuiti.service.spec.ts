import { TestBed } from '@angular/core/testing';

import { CircuitiService } from './circuiti.service';

describe('CircuitiService', () => {
  let service: CircuitiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CircuitiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
