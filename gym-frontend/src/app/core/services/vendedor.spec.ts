import { TestBed } from '@angular/core/testing';

import { Vendedor } from './vendedor';

describe('Vendedor', () => {
  let service: Vendedor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Vendedor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
