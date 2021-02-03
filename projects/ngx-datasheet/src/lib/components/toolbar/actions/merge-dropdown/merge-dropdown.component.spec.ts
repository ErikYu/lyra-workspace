import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeDropdownComponent } from './merge-dropdown.component';

describe('MergeDropdownComponent', () => {
  let component: MergeDropdownComponent;
  let fixture: ComponentFixture<MergeDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MergeDropdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
