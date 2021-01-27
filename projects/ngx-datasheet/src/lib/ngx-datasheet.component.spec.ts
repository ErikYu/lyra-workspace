import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxDatasheetComponent } from './ngx-datasheet.component';

describe('NgxDatasheetComponent', () => {
  let component: NgxDatasheetComponent;
  let fixture: ComponentFixture<NgxDatasheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxDatasheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxDatasheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
