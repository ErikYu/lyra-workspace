import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FontSizeDropdownComponent } from './font-size-dropdown.component';

describe('FontSizeDropdownComponent', () => {
  let component: FontSizeDropdownComponent;
  let fixture: ComponentFixture<FontSizeDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FontSizeDropdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FontSizeDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
