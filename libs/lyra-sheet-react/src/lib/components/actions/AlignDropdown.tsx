import { useEffect, useState } from 'react';
import { AlignController } from '@lyra-sheet/core';
import type { TextAlignDir } from '@lyra-sheet/core';
import { useLyraSheetCore } from '../../container-context';
import { LyraSheetDropdown } from '../Dropdown';
import { ReactComponent as AlignLeft } from '../../icons/文字居左_align-text-left.svg';
import { ReactComponent as AlignCenter } from '../../icons/文字居中_align-text-center.svg';
import { ReactComponent as AlignRight } from '../../icons/文字居右_align-text-right.svg';

export function LyraSheetAlignDropdown() {
  const controller = useLyraSheetCore(AlignController);
  const [currentDir, setCurrentDir] = useState<TextAlignDir>('left');
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    controller.currentDir$.subscribe((res) => setCurrentDir(res));
    controller.onInit();
  });

  function getLabel() {
    switch (currentDir) {
      case 'center':
        return <AlignCenter className={'lyra-sheet-toolbar-icon'} />;
      case 'right':
        return <AlignRight className={'lyra-sheet-toolbar-icon'} />;
      case 'left':
      default:
        return <AlignLeft className={'lyra-sheet-toolbar-icon'} />;
    }
  }

  function applyTextAlign(dir: TextAlignDir): void {
    controller.applyTextAlign(dir);
    handleClose();
  }

  return (
    <div className={'lyra-sheet-toolbar-item'}>
      <LyraSheetDropdown
        isOpen={open}
        label={getLabel()}
        onClose={handleClose}
        onOpen={handleOpen}
      >
        <div
          onClick={() => applyTextAlign('left')}
          className={'lyra-sheet-dropdown-option'}
        >
          <AlignLeft className={'lyra-sheet-toolbar-icon'} />
        </div>
        <div
          onClick={() => applyTextAlign('center')}
          className={'lyra-sheet-dropdown-option'}
        >
          <AlignCenter className={'lyra-sheet-toolbar-icon'} />
        </div>
        <div
          onClick={() => applyTextAlign('right')}
          className={'lyra-sheet-dropdown-option'}
        >
          <AlignRight className={'lyra-sheet-toolbar-icon'} />
        </div>
      </LyraSheetDropdown>
    </div>
  );
}
