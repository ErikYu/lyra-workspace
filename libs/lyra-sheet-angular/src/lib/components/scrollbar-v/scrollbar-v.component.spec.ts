import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollbarVComponent } from './scrollbar-v.component';

describe('ScrollbarVComponent', () => {
  let component: ScrollbarVComponent;
  let fixture: ComponentFixture<ScrollbarVComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScrollbarVComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollbarVComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
