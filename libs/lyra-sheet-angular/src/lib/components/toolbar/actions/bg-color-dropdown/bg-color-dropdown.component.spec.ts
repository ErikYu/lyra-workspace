import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BgColorDropdownComponent } from './bg-color-dropdown.component';

describe('BgColorDropdownComponent', () => {
  let component: BgColorDropdownComponent;
  let fixture: ComponentFixture<BgColorDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BgColorDropdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BgColorDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
