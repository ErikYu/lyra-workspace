import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResizerRowComponent } from './resizer-row.component';

describe('ResizerRowComponent', () => {
  let component: ResizerRowComponent;
  let fixture: ComponentFixture<ResizerRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResizerRowComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResizerRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
