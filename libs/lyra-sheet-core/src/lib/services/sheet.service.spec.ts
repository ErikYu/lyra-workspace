import 'reflect-metadata';
import { ConfigService } from './config.service';
import { CellRange, CellRangeFactory } from './cell-range.factory';
import { MergesService, MergesServiceFactory } from './merges.service';
import { RenderProxyService } from './render-proxy.service';
import { ScrollingService } from './scrolling.service';
import { Selector, SelectorFactory } from './selector.factory';
import { SheetService } from './sheet.service';
import { Sheet } from '../types';

describe('SheetService', () => {
  const configService = {
    defaultCW: 100,
    defaultRH: 25,
  } as ConfigService;

  const cellRangeFactory: CellRangeFactory = (sri, eri, sci, eci) =>
    new CellRange(sri, eri, sci, eci, configService);

  const selectorFactory: SelectorFactory = (sri, eri, sci, eci) =>
    new Selector(sri, eri, sci, eci, cellRangeFactory);

  const mergesServiceFactory: MergesServiceFactory = (merges) =>
    new MergesService(merges, cellRangeFactory);

  function createSheetService(sheet?: Partial<Sheet>): SheetService {
    return new SheetService(
      {
        name: 'Sheet1',
        selected: true,
        data: {
          merges: [],
          rows: {},
          rowCount: 100,
          cols: {},
          colCount: 30,
        },
        ...sheet,
      },
      configService,
      new ScrollingService(),
      new RenderProxyService(),
      mergesServiceFactory,
      selectorFactory,
    );
  }

  it('applies rich text to a cell', () => {
    const service = createSheetService();

    service.applyRichTextToCell(1, 1, [[{ text: 'hello' }]]);

    expect(service.getCellPlainText(1, 1)).toBe('hello');
  });

  it('clears selected cell text without removing cell style', () => {
    const service = createSheetService();
    const range = cellRangeFactory(1, 1, 1, 1);

    service.applyRichTextToCell(1, 1, [[{ text: 'hello' }]]);
    service.applyBgColorTo(range, '#fff');
    service.clearText(range);

    expect(service.getCellPlainText(1, 1)).toBe('');
    expect(service.getCell(1, 1)?.style?.background).toBe('#fff');
  });

  it('moves row data down when inserting rows above it', () => {
    const service = createSheetService({
      data: {
        merges: [],
        rows: {
          2: {
            cells: {
              1: { richText: [[{ text: 'move me' }]] },
            },
          },
        },
        rowCount: 10,
        cols: {},
        colCount: 5,
      },
    });

    service.insertRowsAbove(1, 2);

    expect(service.getCellPlainText(4, 1)).toBe('move me');
    expect(service.getRowCount()).toBe(12);
  });
});
