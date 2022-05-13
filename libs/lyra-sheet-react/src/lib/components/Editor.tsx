import { LyraSheetRichTextInput } from './RichTextInput';
import { useEffect, useRef } from 'react';
import { useLyraSheetCore } from '../container-context';
import { EditorController, ElementRefService } from '@lyra-sheet/core';
import { LyraSheetMasker } from './Masker';
import { LyraSheetResizerCol } from './ResizerCol';
import { LyraSheetResizerRow } from './ResizerRow';
import { ScrollbarV } from './ScrollbarV';
import { ScrollbarH } from './ScrollbarH';
import { LyraSheetContextMenu } from './ContextMenu';
import { LyraSheetTabs } from './Tabs';

export function LyraSheetEditor() {
  const elRef = useRef(null);
  const canvasRef = useRef(null);
  const editorController = useLyraSheetCore(EditorController);
  const elementRefService = useLyraSheetCore(ElementRefService);

  useEffect(() => {
    editorController.mountDom(elRef.current!);
    elementRefService.initCanvas(canvasRef.current!);
    editorController.onInit();
    setTimeout(() => editorController.afterViewInit());
  }, []);

  return (
    <div className={'lyra-sheet-editor'} ref={elRef}>
      <LyraSheetRichTextInput></LyraSheetRichTextInput>
      <canvas ref={canvasRef}></canvas>
      <LyraSheetMasker></LyraSheetMasker>

      <LyraSheetResizerRow></LyraSheetResizerRow>
      <LyraSheetResizerCol></LyraSheetResizerCol>

      <ScrollbarV></ScrollbarV>
      <ScrollbarH></ScrollbarH>

      <LyraSheetContextMenu></LyraSheetContextMenu>

      <LyraSheetTabs></LyraSheetTabs>
    </div>
  );
}
