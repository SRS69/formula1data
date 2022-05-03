import { TestBed } from '@angular/core/testing';

import { StagioniService } from './stagioni.service';

describe('StagioniService', () => {
  let service: StagioniService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StagioniService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
