import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  ConfigService,
  DataService,
  RenderProxyService,
  ScrollingService,
  ViewRangeService,
} from '@lyra-sheet/core';
import { useLyraSheetCore } from '../container-context';
import { fromEvent } from 'rxjs';

function setStyle(el: HTMLElement, attr: any, val: string) {
  el.style[attr] = val;
}

export function ScrollbarV() {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const mockerRef = useRef<HTMLDivElement>(null);
  const configService = useLyraSheetCore(ConfigService);
  const dataService = useLyraSheetCore(DataService);
  const scrolling = useLyraSheetCore(ScrollingService);
  const viewRangeService = useLyraSheetCore(ViewRangeService);
  const renderProxyService = useLyraSheetCore(RenderProxyService);

  useLayoutEffect(() => {
    // onInit
    configService.config$.subscribe(({ row }) => {
      setStyle(scrollbarRef.current!, 'top', `${row.indexHeight - 0.5}px`);
      setStyle(
        scrollbarRef.current!,
        'width',
        `${configService.scrollbarThick}px`,
      );
      setStyle(
        scrollbarRef.current!,
        'bottom',
        `${configService.scrollbarThick + configService.tabBarHeight}px`,
      );
    });
    scrolling.vScrollbarShouldGoto.asObservable().subscribe((vDelta) => {
      const vScrollNEl = scrollbarRef.current!;
      const top = vDelta === 0 ? 0 : vScrollNEl.scrollTop + vDelta;
      vScrollNEl.scrollTo({ top });
    });

    // afterViewInit
    renderProxyService.shouldRender$.subscribe(() => {
      mockerRef.current!.style.height = `${dataService.selectedSheet.getTotalHeight()}px`;
    });

    fromEvent<MouseEvent>(scrollbarRef.current!, 'scroll').subscribe((evt) => {
      const { scrollTop } = evt.target as HTMLElement;
      const targetRi = dataService.selectedSheet.getRowIndex(scrollTop);
      // NOTICE:
      // `setRowIndex` should be called after `setRowRange`
      // as scroll will trigger selectors rerender, rerender requires latest viewRange
      // related to /components/selector-container/selector-container.component.ts line 39
      viewRangeService.setRowRange(targetRi, scrollTop);
      scrolling.setRowIndex(targetRi);
      dataService.rerender();
    });
  }, []);
  return (
    <div
      className={'lyra-sheet-scrollbar lyra-sheet-scrollbar-v'}
      ref={scrollbarRef}
    >
      <div
        ref={mockerRef}
        className={'lyra-sheet-scrollbar-v-mock'}
        style={{ width: '1px', height: 0 }}
      ></div>
    </div>
  );
}
