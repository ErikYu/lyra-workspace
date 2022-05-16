import { LyraSheetDropdown } from '../Dropdown';
import { useLyraSheetCore } from '../../container-context';
import { TextValignDir, TextWrapController } from '@lyra-sheet/core';
import type { TextWrapType } from '@lyra-sheet/core';
import { useEffect, useState } from 'react';
import { ReactComponent as TextClip } from '../../icons/text-truncation.svg';
import { ReactComponent as TextWrap } from '../../icons/text-wrap.svg';
import { ReactComponent as TextOverflow } from '../../icons/text-overflow.svg';

export function LyraSheetTextWrapDropdown() {
  const controller = useLyraSheetCore(TextWrapController);
  const [currentWrap, setCurrentWrap] = useState<TextWrapType>('overflow');
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    controller.currentWrap$.subscribe((val) => setCurrentWrap(val));
    controller.onInit();
  });

  function getLabel() {
    switch (currentWrap) {
      case 'clip':
        return <TextClip className={'lyra-sheet-toolbar-icon'} />;
      case 'wrap':
        return <TextWrap className={'lyra-sheet-toolbar-icon'} />;
      case 'overflow':
      default:
        return <TextOverflow className={'lyra-sheet-toolbar-icon'} />;
    }
  }

  function applyTextWrap(type: TextWrapType) {
    controller.applyTextWrap(type);
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
          className={'lyra-sheet-dropdown-option'}
          onClick={() => applyTextWrap('overflow')}
        >
          <TextOverflow className={'lyra-sheet-toolbar-icon'} />
        </div>
        <div
          className={'lyra-sheet-dropdown-option'}
          onClick={() => applyTextWrap('wrap')}
        >
          <TextWrap className={'lyra-sheet-toolbar-icon'} />
        </div>
        <div
          className={'lyra-sheet-dropdown-option'}
          onClick={() => applyTextWrap('clip')}
        >
          <TextClip className={'lyra-sheet-toolbar-icon'} />
        </div>
      </LyraSheetDropdown>
    </div>
  );
}
