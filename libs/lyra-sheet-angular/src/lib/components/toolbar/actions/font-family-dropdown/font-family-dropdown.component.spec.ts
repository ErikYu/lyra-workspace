import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FontFamilyDropdownComponent } from './font-family-dropdown.component';

describe('FontFamilyDropdownComponent', () => {
  let component: FontFamilyDropdownComponent;
  let fixture: ComponentFixture<FontFamilyDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FontFamilyDropdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FontFamilyDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
