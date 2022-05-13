import { ReactComponent as Strike } from '../../icons/strikethrough.svg';
import { useEffect, useRef, useState } from 'react';
import { useLyraSheetCore } from '../../container-context';
import { FontStrikeController } from '@lyra-sheet/core';

export function LyraSheetStrikeAction() {
  const ref = useRef<HTMLDivElement>(null);
  const controller = useLyraSheetCore(FontStrikeController);
  const [isStrike, setIsStrike] = useState(false);

  useEffect(() => {
    controller.value$.subscribe((res) => setIsStrike(res));
    controller.onInit();
    ref.current!.onmousedown = (evt) => evt.preventDefault();
  }, []);

  function applyTextItalic() {
    controller.toggle();
  }

  return (
    <div
      className={`lyra-sheet-toolbar-item ${isStrike ? 'activated' : ''}`}
      ref={ref}
      onClick={() => applyTextItalic()}
    >
      <Strike className={'lyra-sheet-toolbar-icon'}></Strike>
    </div>
  );
}
