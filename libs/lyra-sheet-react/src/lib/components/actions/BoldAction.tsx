import { ReactComponent as Bold } from '../../icons/text-bold.svg';
import { useEffect, useRef, useState } from 'react';
import { useLyraSheetCore } from '../../container-context';
import { FontBoldController } from '@lyra-sheet/core';

export function LyraSheetBoldAction() {
  const ref = useRef<HTMLDivElement>(null);
  const controller = useLyraSheetCore(FontBoldController);
  const [isBold, setIsBold] = useState(false);

  useEffect(() => {
    controller.value$.subscribe((res) => setIsBold(res));
    controller.onInit();
    ref.current!.onmousedown = (evt) => evt.preventDefault();
  }, []);

  function applyTextBold() {
    controller.toggle();
  }

  return (
    <div
      className={`lyra-sheet-toolbar-item ${isBold ? 'activated' : ''}`}
      ref={ref}
      onClick={() => applyTextBold()}
    >
      <Bold className={'lyra-sheet-toolbar-icon'}></Bold>
    </div>
  );
}
