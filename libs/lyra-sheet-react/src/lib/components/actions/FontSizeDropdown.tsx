import { useEffect, useRef, useState } from 'react';
import { LyraSheetDropdown } from '../Dropdown';
import { useLyraSheetCore } from '../../container-context';
import { FontSizeController, FontSizeMenu } from '@lyra-sheet/core';
import { LyraSheetDropdownBar } from '../DropdownBar';

export function LyraSheetFontSizeDropdown() {
  const hostRef = useRef<HTMLDivElement>(null);
  const controller = useLyraSheetCore(FontSizeController);
  const [open, setOpen] = useState<boolean>(false);
  const [curFontSize, setCurFontSize] = useState<number>(9);
  const [menus, setMenus] = useState<FontSizeMenu[]>([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    hostRef.current!.onmousedown = (evt) => evt.preventDefault();
    controller.curFontSize$.subscribe((res) => setCurFontSize(res));
    controller.menus$.subscribe((res) => setMenus(res));
    controller.onInit();
  }, []);

  function applyFontSize(arg: FontSizeMenu) {
    controller.applyFontSize(arg);
    handleClose();
  }

  return (
    <div className={'lyra-sheet-toolbar-item'} ref={hostRef}>
      <LyraSheetDropdown
        isOpen={open}
        label={curFontSize.toString()}
        onClose={handleClose}
        onOpen={handleOpen}
      >
        {menus.map((menu) => (
          <LyraSheetDropdownBar
            key={menu.pt}
            checked={menu.checked}
            onClick={() => applyFontSize(menu)}
          >
            {menu.pt}
          </LyraSheetDropdownBar>
        ))}
      </LyraSheetDropdown>
    </div>
  );
}
