import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItalicActionComponent } from './italic-action.component';

describe('ItalicActionComponent', () => {
  let component: ItalicActionComponent;
  let fixture: ComponentFixture<ItalicActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItalicActionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItalicActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
