import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlignDropdownComponent } from './align-dropdown.component';

describe('AlignDropdownComponent', () => {
  let component: AlignDropdownComponent;
  let fixture: ComponentFixture<AlignDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlignDropdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlignDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
