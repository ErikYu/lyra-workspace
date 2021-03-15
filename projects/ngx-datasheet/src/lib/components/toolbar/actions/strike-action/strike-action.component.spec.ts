import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrikeActionComponent } from './strike-action.component';

describe('StrikeActionComponent', () => {
  let component: StrikeActionComponent;
  let fixture: ComponentFixture<StrikeActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StrikeActionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrikeActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
