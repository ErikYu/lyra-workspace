import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaDropdownComponent } from './formula-dropdown.component';

describe('FormulaDropdownComponent', () => {
  let component: FormulaDropdownComponent;
  let fixture: ComponentFixture<FormulaDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormulaDropdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
