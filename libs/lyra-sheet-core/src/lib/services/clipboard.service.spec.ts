import 'reflect-metadata';
import { DataService } from './data.service';
import { ConfigService } from './config.service';
import { CellRange, CellRangeFactory } from './cell-range.factory';
import { ClipboardService } from './clipboard.service';
import { HistoryService } from './history.service';
import { MergesService, MergesServiceFactory } from './merges.service';
import { RenderProxyService } from './render-proxy.service';
import { ScrollingService } from './scrolling.service';
import { Selector, SelectorFactory } from './selector.factory';
import { SheetService } from './sheet.service';
import { Data } from '../types';

describe('ClipboardService', () => {
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
      service: new ClipboardService(dataService, history),
    };
  }

  it('parses TSV into a rectangular matrix', () => {
    const { service } = createHarness();

    expect(service.parseTsv('a\tb\nc\td')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('pastes a TSV matrix starting at the active cell', () => {
    const { service, sheet, dataService } = createHarness();
    sheet.addOne(1, 1);

    service.pasteTsv('a\tb\nc\td');

    expect(sheet.getCellPlainText(1, 1)).toBe('a');
    expect(sheet.getCellPlainText(1, 2)).toBe('b');
    expect(sheet.getCellPlainText(2, 1)).toBe('c');
    expect(sheet.getCellPlainText(2, 2)).toBe('d');
    expect(dataService.notifyDataChange).toHaveBeenCalledTimes(1);
  });
});
