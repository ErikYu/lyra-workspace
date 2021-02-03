import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollbarHComponent } from './scrollbar-h.component';

describe('ScrollbarHComponent', () => {
  let component: ScrollbarHComponent;
  let fixture: ComponentFixture<ScrollbarHComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScrollbarHComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollbarHComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
