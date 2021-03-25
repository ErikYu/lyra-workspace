import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentActionComponent } from './percent-action.component';

describe('PercentActionComponent', () => {
  let component: PercentActionComponent;
  let fixture: ComponentFixture<PercentActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PercentActionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
