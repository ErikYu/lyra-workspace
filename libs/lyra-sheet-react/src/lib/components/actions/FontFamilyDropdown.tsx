import { LyraSheetDropdown } from '../Dropdown';
import { useEffect, useRef, useState } from 'react';
import { useLyraSheetCore } from '../../container-context';
import { FontFamilyController } from '@lyra-sheet/core';
import { LyraSheetDropdownBar } from '../DropdownBar';

interface FFMenu {
  label: string;
  checked: boolean;
}

export function LyraSheetFontFamilyDropdown() {
  const hostRef = useRef<HTMLDivElement>(null);
  const controller = useLyraSheetCore(FontFamilyController);
  const [open, setOpen] = useState<boolean>(false);
  const [curFontFamily, setCurFontFamily] = useState<string>('');
  const [menus, setMenus] = useState<FFMenu[]>([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    hostRef.current!.onmousedown = (evt) => evt.preventDefault();
    controller.fontFamily$.subscribe((res) => setCurFontFamily(res));
    controller.allFontFamilies$.subscribe((res) => setMenus(res));
    controller.onInit();
  }, []);

  function applyFontFamily(ff: string) {
    controller.applyFontFamily(ff);
    handleClose();
  }

  return (
    <div className={'lyra-sheet-toolbar-item'} ref={hostRef}>
      <LyraSheetDropdown
        isOpen={open}
        label={curFontFamily}
        onClose={handleClose}
        onOpen={handleOpen}
      >
        {menus.map((menu) => (
          <LyraSheetDropdownBar
            key={menu.label}
            checked={menu.checked}
            onClick={() => applyFontFamily(menu.label)}
          >
            {menu.label}
          </LyraSheetDropdownBar>
        ))}
      </LyraSheetDropdown>
    </div>
  );
}
