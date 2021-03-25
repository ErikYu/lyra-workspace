import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyActionComponent } from './currency-action.component';

describe('CurrencyActionComponent', () => {
  let component: CurrencyActionComponent;
  let fixture: ComponentFixture<CurrencyActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrencyActionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
