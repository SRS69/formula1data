import { TestBed } from '@angular/core/testing';

import { PilotiService } from './piloti.service';

describe('PilotiService', () => {
  let service: PilotiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PilotiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
