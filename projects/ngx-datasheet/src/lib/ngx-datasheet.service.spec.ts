import { TestBed } from '@angular/core/testing';

import { NgxDatasheetService } from './ngx-datasheet.service';

describe('NgxDatasheetService', () => {
  let service: NgxDatasheetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxDatasheetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
