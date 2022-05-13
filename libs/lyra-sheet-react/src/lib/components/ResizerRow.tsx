import { useLayoutEffect, useRef, useState } from 'react';
import { useLyraSheetCore } from '../container-context';
import {
  ConfigService,
  ElementRefService,
  MouseEventService,
  ResizerService,
  ResizerThickness,
} from '@lyra-sheet/core';

export function LyraSheetResizerRow() {
  const resizerRef = useRef<HTMLDivElement>(null);
  const resizerService = useLyraSheetCore(ResizerService);
  const configService = useLyraSheetCore(ConfigService);
  const elementRefService = useLyraSheetCore(ElementRefService);
  const mouseEventService = useLyraSheetCore(MouseEventService);

  const [isRowResizing, setIsRowResizing] = useState(false);

  const staticStyle = {
    height: `${ResizerThickness}px`,
    width: `${configService.ciw}px`,
  };

  const lineStyle = {
    width: `calc(100% - ${configService.ciw}px)`,
    transform: `translateY(-${Math.ceil(ResizerThickness / 2)}px)`,
  };

  useLayoutEffect(() => {
    mouseEventService.isRowResizing$.subscribe((res) => setIsRowResizing(res));
    elementRefService.initRowResizer(resizerRef.current!);
    resizerService.rowResizer$.subscribe((top) => {
      if (top === null) {
        resizerRef.current!.style.display = 'none';
      } else {
        resizerRef.current!.style.display = 'block';
        resizerRef.current!.style.top = `${top}px`;
      }
    });
  }, []);
  return (
    <div
      className={'lyra-sheet-resizer lyra-sheet-resizer-row'}
      ref={resizerRef}
    >
      <div className={'lyra-sheet-resizer-header'} style={staticStyle}></div>
      {isRowResizing ? (
        <div className={'lyra-sheet-resizer-row-line'} style={lineStyle}></div>
      ) : null}
    </div>
  );
}
