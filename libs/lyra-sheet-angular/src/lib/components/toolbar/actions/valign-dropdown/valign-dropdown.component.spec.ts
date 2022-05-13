import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValignDropdownComponent } from './valign-dropdown.component';

describe('ValignDropdownComponent', () => {
  let component: ValignDropdownComponent;
  let fixture: ComponentFixture<ValignDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValignDropdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValignDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
