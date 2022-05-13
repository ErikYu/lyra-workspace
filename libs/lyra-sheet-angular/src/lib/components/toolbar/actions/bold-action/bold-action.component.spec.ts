import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoldActionComponent } from './bold-action.component';

describe('BoldActionComponent', () => {
  let component: BoldActionComponent;
  let fixture: ComponentFixture<BoldActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoldActionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoldActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
