import 'reflect-metadata';
import { Data } from '../types';
import { AutofillService } from './autofill.service';
import { CellRange, CellRangeFactory } from './cell-range.factory';
import { ConfigService } from './config.service';
import { DataService } from './data.service';
import { HistoryService } from './history.service';
import { MergesService, MergesServiceFactory } from './merges.service';
import { RenderProxyService } from './render-proxy.service';
import { ScrollingService } from './scrolling.service';
import { Selector, SelectorFactory } from './selector.factory';
import { SheetService } from './sheet.service';

describe('AutofillService', () => {
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

  function createHarness() {
    const sheet = new SheetService(
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
      configService,
      new ScrollingService(),
      new RenderProxyService(),
      mergesServiceFactory,
      selectorFactory,
    );
    const dataService = {
      get selectedIndex() {
        return 0;
      },
      get selectedSheet() {
        return sheet;
      },
      get snapshot(): Data {
        return {
          sheets: [
            {
              name: sheet.name,
              selected: sheet.selected,
              data: {
                ...sheet.data,
                merges: sheet.merges.snapshot,
              },
            },
          ],
        };
      },
      notifyDataChange: jest.fn(),
      rerender: jest.fn(),
    } as unknown as DataService;
    const history = new HistoryService(dataService);
    history.init(dataService.snapshot);

    return {
      sheet,
      dataService,
      service: new AutofillService(dataService, history),
      selectorFactory,
    };
  }

  it('copies a single source cell into the autofill range', () => {
    const { service, sheet, selectorFactory } = createHarness();
    const sourceSelector = selectorFactory(1, 1, 1, 1);
    sheet.applyRichTextToCell(1, 1, [[{ text: 'hello' }]]);

    service.applyAutofill(sourceSelector, { sri: 2, eri: 3, sci: 1, eci: 1 });

    expect(sheet.getCellPlainText(2, 1)).toBe('hello');
    expect(sheet.getCellPlainText(3, 1)).toBe('hello');
  });

  it('extends a two-cell numeric series downward', () => {
    const { service, sheet, selectorFactory } = createHarness();
    const sourceSelector = selectorFactory(1, 2, 1, 1);
    sheet.applyRichTextToCell(1, 1, [[{ text: '1' }]]);
    sheet.applyRichTextToCell(2, 1, [[{ text: '3' }]]);

    service.applyAutofill(sourceSelector, { sri: 3, eri: 5, sci: 1, eci: 1 });

    expect(sheet.getCellPlainText(3, 1)).toBe('5');
    expect(sheet.getCellPlainText(4, 1)).toBe('7');
    expect(sheet.getCellPlainText(5, 1)).toBe('9');
  });
});
