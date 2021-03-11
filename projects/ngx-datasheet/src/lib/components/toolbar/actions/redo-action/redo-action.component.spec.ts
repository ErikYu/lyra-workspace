import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedoActionComponent } from './redo-action.component';

describe('RedoActionComponent', () => {
  let component: RedoActionComponent;
  let fixture: ComponentFixture<RedoActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RedoActionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RedoActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
