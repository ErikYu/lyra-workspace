import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaBarComponent } from './formula-bar.component';

describe('FormulaBarComponent', () => {
  let component: FormulaBarComponent;
  let fixture: ComponentFixture<FormulaBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormulaBarComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
