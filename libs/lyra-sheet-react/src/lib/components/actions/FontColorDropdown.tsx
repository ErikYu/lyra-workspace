import { useEffect, useRef, useState } from 'react';
import { LyraSheetDropdown } from '../Dropdown';
import { LyraSheetColorPalette } from '../ColorPalette';
import { DEFAULT_FONT_COLOR, FontColorController } from '@lyra-sheet/core';
import { useLyraSheetCore } from '../../container-context';

export function LyraSheetFontColorDropdown() {
  const controller = useLyraSheetCore(FontColorController);
  const hostRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [curFontColor, setCurFontColor] = useState(DEFAULT_FONT_COLOR);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    controller.curColor$.subscribe((res) => setCurFontColor(res));
    controller.onInit();
    hostRef.current!.onmousedown = (evt) => evt.preventDefault();
  }, []);

  function applyTextColor(color: string) {
    controller.applyTextColor(color);
    handleClose();
  }

  return (
    <div className={'lyra-sheet-toolbar-item'} ref={hostRef}>
      <LyraSheetDropdown
        isOpen={open}
        label={
          <div style={{ width: '18px' }}>
            <div style={{ textAlign: 'center' }}>A</div>
            <div
              style={{
                height: '3px',
                width: '100%',
                backgroundColor: curFontColor,
              }}
            ></div>
          </div>
        }
        onClose={handleClose}
        onOpen={handleOpen}
      >
        <div className={'lyra-sheet-color-palette'}>
          <LyraSheetColorPalette
            chosenColor={applyTextColor}
          ></LyraSheetColorPalette>
        </div>
      </LyraSheetDropdown>
    </div>
  );
}
