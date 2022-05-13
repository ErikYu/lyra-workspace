import { useLayoutEffect, useRef, useState } from 'react';
import { useLyraSheetCore } from '../container-context';
import { RichTextInputController } from '@lyra-sheet/core';

export function LyraSheetRichTextInput() {
  const hostRef = useRef(null);
  const editableZoneRef = useRef<HTMLDivElement>(null);
  const controller = useLyraSheetCore(RichTextInputController);
  useLayoutEffect(() => {
    controller.mount(hostRef.current!, editableZoneRef.current!);
    controller.html$.subscribe((res) => {
      editableZoneRef.current!.innerHTML = res;
    });
  }, []);
  return (
    <div className={'lyra-sheet-rich-text-input'} ref={hostRef}>
      <div
        ref={editableZoneRef}
        className={'lyra-sheet-rich-text-input-area'}
        contentEditable={true}
      ></div>
    </div>
  );
}
