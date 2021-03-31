import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorContainerComponent } from './selector-container.component';

describe('SelectorContainerComponent', () => {
  let component: SelectorContainerComponent;
  let fixture: ComponentFixture<SelectorContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectorContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectorContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
