import { ReactComponent as Italic } from '../../icons/text-italic.svg';
import { useEffect, useRef, useState } from 'react';
import { useLyraSheetCore } from '../../container-context';
import { FontItalicController } from '@lyra-sheet/core';

export function LyraSheetItalicAction() {
  const ref = useRef<HTMLDivElement>(null);
  const controller = useLyraSheetCore(FontItalicController);
  const [isItalic, setIsItalic] = useState(false);

  useEffect(() => {
    controller.value$.subscribe((res) => setIsItalic(res));
    controller.onInit();
    ref.current!.onmousedown = (evt) => evt.preventDefault();
  }, []);

  function applyTextItalic() {
    controller.toggle();
  }

  return (
    <div
      className={`lyra-sheet-toolbar-item ${isItalic ? 'activated' : ''}`}
      ref={ref}
      onClick={() => applyTextItalic()}
    >
      <Italic className={'lyra-sheet-toolbar-icon'}></Italic>
    </div>
  );
}
