import { LyraSheetDropdown } from '../Dropdown';
import { LyraSheetDropdownBar } from '../DropdownBar';
import { useEffect, useState } from 'react';
import { useLyraSheetCore } from '../../container-context';
import { CellFormat, FormatController } from '@lyra-sheet/core';
import { LyraSheetDivider } from '../Divider';

export function LyraSheetFormatDropdown() {
  const controller = useLyraSheetCore(FormatController);
  const [open, setOpen] = useState<boolean>(false);
  const [controlDisplayLabel, setControlDisplayLabel] = useState<string>('');
  const [items, setItems] = useState<
    Array<
      | {
          fmt: CellFormat;
          label: string;
          desc: string;
          checked: () => boolean;
        }
      | 'DIVIDER'
    >
  >([]);

  useEffect(() => {
    controller.items$.subscribe((res) => setItems(res));
    controller.controlDisplayLabel$.subscribe((res) =>
      setControlDisplayLabel(res),
    );
    controller.onInit();
  }, []);

  function applyFormat(fmt: CellFormat) {
    controller.applyFormat(fmt);
    handleClose();
  }

  function handleOpen() {
    setOpen(true);
  }
  function handleClose() {
    setOpen(false);
  }

  return (
    <div className={'lyra-sheet-toolbar-item'}>
      <LyraSheetDropdown
        label={controlDisplayLabel}
        isOpen={open}
        onOpen={handleOpen}
        onClose={handleClose}
      >
        {items.map((item, index) =>
          item === 'DIVIDER' ? (
            <div style={{ margin: '8px 0' }} key={index}>
              <LyraSheetDivider direction={'horizontal'}></LyraSheetDivider>
            </div>
          ) : (
            <LyraSheetDropdownBar
              key={index}
              desc={item.desc}
              checked={item.checked()}
              onClick={() => applyFormat(item.fmt)}
            >
              {item.label}
            </LyraSheetDropdownBar>
          ),
        )}
      </LyraSheetDropdown>
    </div>
  );
}
