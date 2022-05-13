import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderlineActionComponent } from './underline-action.component';

describe('UnderlineActionComponent', () => {
  let component: UnderlineActionComponent;
  let fixture: ComponentFixture<UnderlineActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnderlineActionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnderlineActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
