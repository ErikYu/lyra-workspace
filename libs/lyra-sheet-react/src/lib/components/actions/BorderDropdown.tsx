import { ReactElement, useRef, useState } from 'react';
import { LyraSheetDropdown } from '../Dropdown';
import { LyraSheetColorPalette } from '../ColorPalette';
import {
  BorderController,
  BorderSelection,
  BorderType,
} from '@lyra-sheet/core';
import { useLyraSheetCore } from '../../container-context';
import { ReactComponent as BorderAll } from '../../icons/border_all.svg';
import { ReactComponent as BorderInner } from '../../icons/border_inner.svg';
import { ReactComponent as BorderHorizontal } from '../../icons/border_horizontal.svg';
import { ReactComponent as BorderVertical } from '../../icons/border_vertical.svg';
import { ReactComponent as BorderOuter } from '../../icons/border_outer.svg';
import { ReactComponent as BorderLeft } from '../../icons/border_left.svg';
import { ReactComponent as BorderTop } from '../../icons/border_top.svg';
import { ReactComponent as BorderRight } from '../../icons/border_right.svg';
import { ReactComponent as BorderBottom } from '../../icons/border_bottom.svg';
import { ReactComponent as BorderClear } from '../../icons/border_clear.svg';
import { ReactComponent as Pencil } from '../../icons/写作_write.svg';
import { ReactComponent as DividingLine } from '../../icons/分割线_dividing-line.svg';
import { LyraSheetDropdownBar } from '../DropdownBar';

export function LyraSheetBorderDropdown() {
  const controller = useLyraSheetCore(BorderController);
  const hostRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [borderColorOpen, setBorderColorOpen] = useState<boolean>(false);
  const handleBorderColorOpen = () => setBorderColorOpen(true);
  const handleBorderColorClose = () => setBorderColorOpen(false);

  const [borderTypeOpen, setBorderTypeOpen] = useState<boolean>(false);
  const handleBorderTypeOpen = () => setBorderTypeOpen(true);
  const handleBorderTypeClose = () => setBorderTypeOpen(false);

  const borders: Array<{ type: BorderSelection; icon: ReactElement }> = [
    { type: 'all', icon: <BorderAll className={'lyra-sheet-toolbar-icon'} /> },
    {
      type: 'inner',
      icon: <BorderInner className={'lyra-sheet-toolbar-icon'} />,
    },
    {
      type: 'horizontal',
      icon: <BorderHorizontal className={'lyra-sheet-toolbar-icon'} />,
    },
    {
      type: 'vertical',
      icon: <BorderVertical className={'lyra-sheet-toolbar-icon'} />,
    },
    {
      type: 'outer',
      icon: <BorderOuter className={'lyra-sheet-toolbar-icon'} />,
    },
    {
      type: 'left',
      icon: <BorderLeft className={'lyra-sheet-toolbar-icon'} />,
    },
    { type: 'top', icon: <BorderTop className={'lyra-sheet-toolbar-icon'} /> },
    {
      type: 'right',
      icon: <BorderRight className={'lyra-sheet-toolbar-icon'} />,
    },
    {
      type: 'bottom',
      icon: <BorderBottom className={'lyra-sheet-toolbar-icon'} />,
    },
    {
      type: 'clear',
      icon: <BorderClear className={'lyra-sheet-toolbar-icon'} />,
    },
  ];

  function applyBorder(type: BorderSelection) {
    controller.applyBorder(type);
    handleClose();
  }

  function onSelectColor(color: string) {
    controller.onSelectColor(color);
    handleBorderColorClose();
  }

  function onSelectType(borderType: BorderType): void {
    controller.onSelectType(borderType);
    handleBorderTypeClose();
  }

  return (
    <div className={'lyra-sheet-toolbar-item'} ref={hostRef}>
      <LyraSheetDropdown
        isOpen={open}
        label={<BorderAll className={'lyra-sheet-toolbar-icon'}></BorderAll>}
        onClose={handleClose}
        onOpen={handleOpen}
      >
        <div className={'border-dropdown'}>
          <div className={'left-section'}>
            {borders.map((bd) => (
              <div
                className={'lyra-sheet-dropdown-option'}
                onClick={() => applyBorder(bd.type)}
                key={bd.type}
              >
                {bd.icon}
              </div>
            ))}
          </div>
          <div className={'right-section'}>
            <LyraSheetDropdown
              isOpen={borderColorOpen}
              label={
                <div
                  className={'lyra-sheet-dropdown-option'}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '21px',
                  }}
                >
                  <Pencil className={'lyra-sheet-toolbar-icon'}></Pencil>
                  <div
                    style={{
                      width: '18px',
                      height: '2px',
                      marginTop: '2px',
                      backgroundColor: controller.defaultBorderColor$.value,
                    }}
                  ></div>
                </div>
              }
              onClose={handleBorderColorClose}
              onOpen={handleBorderColorOpen}
            >
              <LyraSheetColorPalette
                chosenColor={onSelectColor}
              ></LyraSheetColorPalette>
            </LyraSheetDropdown>

            <LyraSheetDropdown
              isOpen={borderTypeOpen}
              label={
                <div
                  className={'lyra-sheet-dropdown-option'}
                  style={{ width: '21px' }}
                >
                  <DividingLine className="lyra-sheet-toolbar-icon"></DividingLine>
                </div>
              }
              onClose={handleBorderTypeClose}
              onOpen={handleBorderTypeOpen}
            >
              <LyraSheetDropdownBar
                checked={controller.defaultBorderType$.value === 'thin'}
                onClick={() => onSelectType('thin')}
              >
                <div
                  style={{ width: '50px', height: '1px', background: '#000' }}
                ></div>
              </LyraSheetDropdownBar>
              <LyraSheetDropdownBar
                checked={controller.defaultBorderType$.value === 'medium'}
                onClick={() => onSelectType('medium')}
              >
                <div
                  style={{ width: '50px', height: '2px', background: '#000' }}
                ></div>
              </LyraSheetDropdownBar>
              <LyraSheetDropdownBar
                checked={controller.defaultBorderType$.value === 'bold'}
                onClick={() => onSelectType('bold')}
              >
                <div
                  style={{ width: '50px', height: '3px', background: '#000' }}
                ></div>
              </LyraSheetDropdownBar>
            </LyraSheetDropdown>
          </div>
        </div>
      </LyraSheetDropdown>
    </div>
  );
}
