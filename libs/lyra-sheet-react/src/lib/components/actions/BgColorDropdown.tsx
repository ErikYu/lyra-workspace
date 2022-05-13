import { useLyraSheetCore } from '../../container-context';
import { ReactComponent as BgColor } from '../../icons/背景颜色_background-color.svg';
import { BgColorController } from '@lyra-sheet/core';
import { useRef, useState } from 'react';
import { LyraSheetDropdown } from '../Dropdown';
import { LyraSheetColorPalette } from '../ColorPalette';

export function LyraSheetBgColorDropdown() {
  const controller = useLyraSheetCore(BgColorController);
  const hostRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  function onSelectColor(color: string) {
    controller.applyBgColor(color);
    handleClose();
  }

  return (
    <div className={'lyra-sheet-toolbar-item'} ref={hostRef}>
      <LyraSheetDropdown
        isOpen={open}
        label={<BgColor className="lyra-sheet-toolbar-icon"></BgColor>}
        onClose={handleClose}
        onOpen={handleOpen}
      >
        <div className={'lyra-sheet-color-palette'}>
          <LyraSheetColorPalette
            chosenColor={onSelectColor}
          ></LyraSheetColorPalette>
        </div>
      </LyraSheetDropdown>
    </div>
  );
}
