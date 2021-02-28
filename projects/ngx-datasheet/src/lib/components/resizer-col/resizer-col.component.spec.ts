import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResizerColComponent } from './resizer-col.component';

describe('ResizerColComponent', () => {
  let component: ResizerColComponent;
  let fixture: ComponentFixture<ResizerColComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResizerColComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResizerColComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
