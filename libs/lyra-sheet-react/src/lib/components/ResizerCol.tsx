import {
  Component,
  createRef,
  RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  ConfigService,
  ElementRefService,
  MouseEventService,
  ResizerService,
  ResizerThickness,
} from '@lyra-sheet/core';
import { c, useLyraSheetCore } from '../container-context';

export function LyraSheetResizerCol() {
  const resizerRef = useRef<HTMLDivElement>(null);
  const resizerService = useLyraSheetCore(ResizerService);
  const configService = useLyraSheetCore(ConfigService);
  const elementRefService = useLyraSheetCore(ElementRefService);
  const mouseEventService = useLyraSheetCore(MouseEventService);

  const [isColResizing, setIsColResizing] = useState(false);

  const headerStaticStyle = {
    width: `${ResizerThickness}px`,
    height: `${configService.rih}px`,
  };

  const lineStyle = {
    height: `calc(100% - ${configService.rih}px)`,
    transform: `translateX(${Math.floor(ResizerThickness / 2)}px)`,
  };

  useLayoutEffect(() => {
    mouseEventService.isColResizing$.subscribe((res) => setIsColResizing(res));
    elementRefService.initColResizer(resizerRef.current!);
    resizerService.colResizer$.subscribe((left) => {
      if (left === null) {
        resizerRef.current!.style.display = 'none';
      } else {
        resizerRef.current!.style.display = 'block';
        resizerRef.current!.style.left = `${left}px`;
      }
    });
  }, []);

  return (
    <div
      className={'lyra-sheet-resizer lyra-sheet-resizer-col'}
      ref={resizerRef}
    >
      <div
        className={'lyra-sheet-resizer-header'}
        style={headerStaticStyle}
      ></div>
      {isColResizing ? (
        <div className={'lyra-sheet-resizer-col-line'} style={lineStyle}></div>
      ) : null}
    </div>
  );
}
