import { useLyraSheetCore } from '../../container-context';
import { ValignController } from '@lyra-sheet/core';
import type { TextValignDir } from '@lyra-sheet/core';
import { useEffect, useState } from 'react';
import { ReactComponent as ValignBottom } from '../../icons/底对齐_align-bottom.svg';
import { ReactComponent as ValignCenter } from '../../icons/垂直对齐_align-vertically.svg';
import { ReactComponent as ValignTop } from '../../icons/顶对齐_align-top.svg';
import { LyraSheetDropdown } from '../Dropdown';

export function LyraSheetValignDropdown() {
  const controller = useLyraSheetCore(ValignController);
  const [currentDir, setCurrentDir] = useState<TextValignDir>('bottom');
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
        return <ValignCenter className={'lyra-sheet-toolbar-icon'} />;
      case 'top':
        return <ValignTop className={'lyra-sheet-toolbar-icon'} />;
      case 'bottom':
      default:
        return <ValignBottom className={'lyra-sheet-toolbar-icon'} />;
    }
  }

  function applyTextValign(dir: TextValignDir): void {
    controller.applyTextValign(dir);
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
          onClick={() => applyTextValign('bottom')}
          className={'lyra-sheet-dropdown-option'}
        >
          <ValignBottom className={'lyra-sheet-toolbar-icon'} />
        </div>
        <div
          onClick={() => applyTextValign('center')}
          className={'lyra-sheet-dropdown-option'}
        >
          <ValignCenter className={'lyra-sheet-toolbar-icon'} />
        </div>
        <div
          onClick={() => applyTextValign('top')}
          className={'lyra-sheet-dropdown-option'}
        >
          <ValignTop className={'lyra-sheet-toolbar-icon'} />
        </div>
      </LyraSheetDropdown>
    </div>
  );
}
