import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecimalActionComponent } from './decimal-action.component';

describe('DecimalActionComponent', () => {
  let component: DecimalActionComponent;
  let fixture: ComponentFixture<DecimalActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecimalActionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DecimalActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
