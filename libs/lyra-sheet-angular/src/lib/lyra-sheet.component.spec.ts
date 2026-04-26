import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Data, DatasheetConfig } from '@lyra-sheet/core';
import { LyraSheetVanilla } from '@lyra-sheet/vanilla';

import { LyraSheetModule } from './lyra-sheet.module';

const mockMount = jest.fn();
const mockUpdate = jest.fn();
const mockDestroy = jest.fn();

jest.mock('@lyra-sheet/vanilla', () => ({
  LyraSheetVanilla: jest.fn().mockImplementation(() => ({
    mount: mockMount,
    update: mockUpdate,
    destroy: mockDestroy,
  })),
}));

const data: Data = {
  sheets: [
    {
      name: 'Sheet1',
      selected: true,
      data: {
        merges: [],
        rows: {},
        rowCount: 10,
        cols: {},
        colCount: 5,
      },
    },
  ],
};

const config: DatasheetConfig = {
  width: () => 800,
  height: () => 400,
  row: {
    height: 25,
    count: 10,
    indexHeight: 25,
  },
  col: {
    width: 100,
    count: 5,
    indexWidth: 60,
  },
};

@Component({
  template: `<lyra-sheet [data]="data" [config]="config"></lyra-sheet>`,
})
class TestHostComponent {
  data: Data = data;
  config: DatasheetConfig = config;
}

describe('LyraSheetComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [LyraSheetModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates vanilla sheet and mounts on the host', () => {
    expect(LyraSheetVanilla).toHaveBeenCalledWith({
      data,
      config,
      onDataChange: expect.any(Function),
    });
    expect(mockMount).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('updates vanilla sheet when bound inputs change', () => {
    const nextData: Data = {
      sheets: [{ ...data.sheets[0], name: 'Renamed' }],
    };
    host.data = nextData;
    fixture.detectChanges();

    expect(mockUpdate).toHaveBeenLastCalledWith({
      data: nextData,
      config,
      onDataChange: expect.any(Function),
    });
  });

  it('destroys vanilla sheet on destroy', () => {
    fixture.destroy();

    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });
});
