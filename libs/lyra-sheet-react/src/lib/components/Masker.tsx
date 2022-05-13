import { useLayoutEffect, useRef } from 'react';
import { useLyraSheetCore } from '../container-context';
import {
  ConfigService,
  EditorService,
  ElementRefService,
  ScrollingService,
} from '@lyra-sheet/core';
import { LyraSheetSelectorContainer } from './SelectorContainer';
import { fromEvent } from 'rxjs';
import { map, tap, throttleTime } from 'rxjs/operators';

export function LyraSheetMasker() {
  const maskRef = useRef(null);
  const elementRefService = useLyraSheetCore(ElementRefService);
  const scrollingService = useLyraSheetCore(ScrollingService);
  const editorService = useLyraSheetCore(EditorService);

  useLayoutEffect(() => {
    elementRefService.initMask(maskRef.current!);

    fromEvent<WheelEvent>(maskRef.current!, 'wheel')
      .pipe(
        tap((evt) => evt.preventDefault()),
        throttleTime(20),
        map((evt) => editorService.calcNextStepDelta(evt)),
      )
      .subscribe(({ hDelta, vDelta }) => {
        if (vDelta !== undefined) {
          scrollingService.vScrollbarShouldGoto.next(vDelta);
        }
        if (hDelta !== undefined) {
          scrollingService.hScrollbarShouldGoto.next(hDelta);
        }
      });
  }, []);

  return (
    <div className={'lyra-sheet-editor-mask'} ref={maskRef}>
      <LyraSheetSelectorContainer></LyraSheetSelectorContainer>
    </div>
  );
}
