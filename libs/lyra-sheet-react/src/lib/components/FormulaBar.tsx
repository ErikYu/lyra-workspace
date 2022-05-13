import { LyraSheetDivider } from './Divider';
import { useLayoutEffect, useRef, useState } from 'react';
import { useLyraSheetCore } from '../container-context';
import { FormulaBarController } from '@lyra-sheet/core';

export function LyraSheetFormulaBar() {
  const textAreaRef = useRef<HTMLDivElement>(null);
  const controller = useLyraSheetCore(FormulaBarController);
  const [label, setLabel] = useState('');

  useLayoutEffect(() => {
    controller.mount(textAreaRef.current!);
    controller.label$.subscribe((res) => setLabel(res));
  }, []);

  return (
    <div className={'lyra-sheet-formula-bar'}>
      <div className={'lyra-sheet-formula-bar-label'}>{label}</div>
      <LyraSheetDivider direction="vertical"></LyraSheetDivider>
      <div className={'lyra-sheet-formula-bar-fx'}>fx</div>
      <LyraSheetDivider direction="vertical"></LyraSheetDivider>
      <div
        ref={textAreaRef}
        className={'lyra-sheet-formula-bar-input'}
        contentEditable={true}
      ></div>
    </div>
  );
}
