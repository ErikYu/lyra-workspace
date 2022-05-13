import { useLayoutEffect, useRef } from 'react';
import { useLyraSheetCore } from '../container-context';
import {
  ConfigService,
  DataService,
  RenderProxyService,
  ScrollingService,
  ViewRangeService,
} from '@lyra-sheet/core';
import { fromEvent } from 'rxjs';

function setStyle(el: HTMLElement, attr: any, val: string) {
  el.style[attr] = val;
}

export function ScrollbarH() {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const mockerRef = useRef<HTMLDivElement>(null);
  const configService = useLyraSheetCore(ConfigService);
  const dataService = useLyraSheetCore(DataService);
  const scrolling = useLyraSheetCore(ScrollingService);
  const viewRangeService = useLyraSheetCore(ViewRangeService);
  const renderProxyService = useLyraSheetCore(RenderProxyService);

  useLayoutEffect(() => {
    // onInit
    setStyle(scrollbarRef.current!, 'left', `${configService.ciw}px`);
    setStyle(
      scrollbarRef.current!,
      'right',
      `${configService.scrollbarThick}px`,
    );
    setStyle(
      scrollbarRef.current!,
      'bottom',
      `${configService.tabBarHeight}px`,
    );
    setStyle(
      scrollbarRef.current!,
      'height',
      `${configService.scrollbarThick}px`,
    );
    scrolling.hScrollbarShouldGoto.asObservable().subscribe((hDelta) => {
      const hScrollNEl = scrollbarRef.current!;
      const left = hDelta === 0 ? 0 : hScrollNEl.scrollLeft + hDelta;
      hScrollNEl.scrollTo({ left });
    });

    // afterViewInit
    renderProxyService.shouldRender$.subscribe(() => {
      mockerRef.current!.style.width = `${dataService.selectedSheet.getTotalWidth()}px`;
    });

    fromEvent<MouseEvent>(scrollbarRef.current!, 'scroll').subscribe((evt) => {
      const { scrollLeft } = evt.target as HTMLElement;
      const targetCi = dataService.selectedSheet.getColIndex(scrollLeft);
      viewRangeService.setColRange(targetCi, scrollLeft);
      scrolling.setColIndex(targetCi);
      dataService.rerender();
    });
  }, []);

  return (
    <div
      className={'lyra-sheet-scrollbar lyra-sheet-scrollbar-h'}
      ref={scrollbarRef}
    >
      <div
        ref={mockerRef}
        className={'lyra-sheet-scrollbar-h-mock'}
        style={{ width: 0, height: '1px' }}
      ></div>
    </div>
  );
}
