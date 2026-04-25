import 'reflect-metadata';
import { ConfigService } from './config.service';
import { CellRange, CellRangeFactory } from './cell-range.factory';
import { MergesService } from './merges.service';

describe('MergesService', () => {
  const configService = {
    defaultCW: 100,
    defaultRH: 25,
  } as ConfigService;

  const cellRangeFactory: CellRangeFactory = (sri, eri, sci, eci) =>
    new CellRange(sri, eri, sci, eci, configService);

  it('moves merges down when rows are inserted above the merge', () => {
    const service = new MergesService([[[2, 1], [3, 2]]], cellRangeFactory);

    service.moveOrExpandByRow(1, 2, jest.fn());

    expect(service.snapshot).toEqual([[[4, 1], [5, 2]]]);
  });

  it('detects a merge hit for a cell inside the range', () => {
    const service = new MergesService([[[2, 1], [3, 2]]], cellRangeFactory);

    const hit = service.getHitMerge(2, 1);

    expect(hit).toMatchObject({ sri: 2, eri: 3, sci: 1, eci: 2 });
  });
});
