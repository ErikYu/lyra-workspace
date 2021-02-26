import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextWrapDropdownComponent } from './text-wrap-dropdown.component';

describe('TextWrapDropdownComponent', () => {
  let component: TextWrapDropdownComponent;
  let fixture: ComponentFixture<TextWrapDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextWrapDropdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextWrapDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
