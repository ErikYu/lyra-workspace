import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatDropdownComponent } from './format-dropdown.component';

describe('FormatDropdownComponent', () => {
  let component: FormatDropdownComponent;
  let fixture: ComponentFixture<FormatDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormatDropdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormatDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
