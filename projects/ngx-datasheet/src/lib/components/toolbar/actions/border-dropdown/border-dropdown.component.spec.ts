import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorderDropdownComponent } from './border-dropdown.component';

describe('BorderDropdownComponent', () => {
  let component: BorderDropdownComponent;
  let fixture: ComponentFixture<BorderDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BorderDropdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BorderDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
