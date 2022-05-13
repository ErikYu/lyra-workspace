import { container, FactoryProvider, InjectionToken, registry } from 'tsyringe';
import { Merge, Sheet } from './lib/types';
import {
  ConfigService,
  SheetService,
  SheetServiceFactory,
  MergesService,
  MergesServiceFactory,
  CellRange,
  CellRangeFactory,
  Selector,
  SelectorFactory,
  ScrollingService,
  RenderProxyService,
} from './lib/services';

// @registry()
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// class __Registry__ {}

export * from './lib/constants';
export * from './lib/utils';
export * from './lib/types';
export * from './lib/services';
export * from './lib/controllers';

export function createCore() {
  const factoryProviders: Array<
    FactoryProvider<unknown> & { token: InjectionToken }
  > = [
    {
      token: SheetService,
      useFactory:
        (dependencyContainer): SheetServiceFactory =>
        (d: Sheet) =>
          new SheetService(
            d,
            dependencyContainer.resolve(ConfigService),
            dependencyContainer.resolve(ScrollingService),
            dependencyContainer.resolve(RenderProxyService),
            dependencyContainer.resolve(MergesService) as never,
            dependencyContainer.resolve(Selector) as never,
          ),
    },
    {
      token: CellRange,
      useFactory:
        (dependencyContainer): CellRangeFactory =>
        (sri: number, eri: number, sci: number, eci: number) =>
          new CellRange(
            sri,
            eri,
            sci,
            eci,
            dependencyContainer.resolve(ConfigService),
          ),
    },
    {
      token: Selector,
      useFactory:
        (dependencyContainer): SelectorFactory =>
        (sri: number, eri: number, sci: number, eci: number) =>
          new Selector(
            sri,
            eri,
            sci,
            eci,
            dependencyContainer.resolve(CellRange) as never,
          ),
    },
    {
      token: MergesService,
      useFactory:
        (dependencyContainer): MergesServiceFactory =>
        (merges: Merge[]) =>
          new MergesService(
            merges,
            dependencyContainer.resolve(CellRange) as never,
          ),
    },
  ];
  for (const p of factoryProviders) {
    container.register(p.token, p);
  }
}
