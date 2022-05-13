import { ReactComponent as Underline } from '../../icons/text-underline.svg';
import { useEffect, useRef, useState } from 'react';
import { useLyraSheetCore } from '../../container-context';
import { FontUnderlineController } from '@lyra-sheet/core';

export function LyraSheetUnderlineAction() {
  const ref = useRef<HTMLDivElement>(null);
  const controller = useLyraSheetCore(FontUnderlineController);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    controller.value$.subscribe((res) => setIsUnderline(res));
    controller.onInit();
    ref.current!.onmousedown = (evt) => evt.preventDefault();
  }, []);

  function applyTextItalic() {
    controller.toggle();
  }

  return (
    <div
      className={`lyra-sheet-toolbar-item ${isUnderline ? 'activated' : ''}`}
      ref={ref}
      onClick={() => applyTextItalic()}
    >
      <Underline className={'lyra-sheet-toolbar-icon'}></Underline>
    </div>
  );
}
