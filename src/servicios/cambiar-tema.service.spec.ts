import { TestBed } from '@angular/core/testing';

import { CambiarTemaService } from './cambiar-tema.service';

describe('CambiarTemaService', () => {
  let service: CambiarTemaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CambiarTemaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
