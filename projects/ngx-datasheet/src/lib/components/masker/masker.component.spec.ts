import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaskerComponent } from './masker.component';

describe('MaskerComponent', () => {
  let component: MaskerComponent;
  let fixture: ComponentFixture<MaskerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MaskerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaskerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
