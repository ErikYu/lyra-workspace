import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FontColorDropdownComponent } from './font-color-dropdown.component';

describe('FontColorDropdownComponent', () => {
  let component: FontColorDropdownComponent;
  let fixture: ComponentFixture<FontColorDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FontColorDropdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FontColorDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
