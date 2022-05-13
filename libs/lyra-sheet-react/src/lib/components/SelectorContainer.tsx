import { useEffect, useRef, useState, Fragment } from 'react';
import {
  AutofillService,
  ConfigService,
  DataService,
  LocatedRect,
  ResizerService,
  ScrollingService,
  ViewRangeService,
} from '@lyra-sheet/core';
import { combineLatest } from 'rxjs';
import { useLyraSheetCore } from '../container-context';

export function LyraSheetSelectorContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rects, setRects] = useState<LocatedRect[]>([]);
  const [autofillRect, setAutofillRect] = useState<LocatedRect | null>(null);
  const dataService = useLyraSheetCore(DataService);
  const resizerService = useLyraSheetCore(ResizerService);
  const scrollingService = useLyraSheetCore(ScrollingService);
  const viewRangeService = useLyraSheetCore(ViewRangeService);
  const configService = useLyraSheetCore(ConfigService);
  const autofillService = useLyraSheetCore(AutofillService);
  useEffect(() => {
    containerRef.current!.style.left = `${configService.ciw}px`;
    containerRef.current!.style.top = `${configService.rih}px`;
    combineLatest([
      dataService.selectorChanged$,
      // todo: can be optimized into resizerFinished$
      resizerService.colResizer$,
      resizerService.rowResizer$,
      scrollingService.scrolled$,
    ]).subscribe(([selectors]) => {
      const newRects = selectors.map((s) =>
        viewRangeService.locateRect(s.range),
      );
      setRects(newRects);
    });

    autofillService.autofillChanged$.subscribe((rect) => {
      if (rect) {
        setAutofillRect(viewRangeService.locateRect(rect));
      } else {
        setAutofillRect(null);
      }
    });
  }, []);

  return (
    <div
      className={'lyra-sheet-selector-container'}
      ref={containerRef}
      style={{ left: '60px', top: '25px' }}
    >
      {rects.map((r, index) => (
        <Fragment key={index}>
          <div
            className={'lyra-sheet-selector'}
            style={{
              top: r.top + 'px',
              left: r.left + 'px',
              width: r.width + 'px',
              height: r.height + 'px',
            }}
          ></div>
          <div
            className={'lyra-sheet-selector-autofill'}
            style={{
              top: r.top + r.height - 4 + 'px',
              left: r.left + r.width - 4 + 'px',
            }}
          ></div>
        </Fragment>
      ))}
      {autofillRect ? (
        <div
          className={'lyra-sheet-autofill'}
          style={{
            top: autofillRect.top + 'px',
            left: autofillRect.left + 'px',
            width: autofillRect.width + 'px',
            height: autofillRect.height + 'px',
          }}
        ></div>
      ) : null}
    </div>
  );
}
