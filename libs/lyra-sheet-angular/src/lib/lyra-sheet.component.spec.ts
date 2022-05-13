import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LyraSheetComponent } from './lyra-sheet.component';

describe('LyraSheetComponent', () => {
  let component: LyraSheetComponent;
  let fixture: ComponentFixture<LyraSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LyraSheetComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LyraSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
