import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UndoActionComponent } from './undo-action.component';

describe('UndoActionComponent', () => {
  let component: UndoActionComponent;
  let fixture: ComponentFixture<UndoActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UndoActionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
