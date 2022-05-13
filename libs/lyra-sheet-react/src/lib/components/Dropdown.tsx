import { FC, MouseEvent, ReactElement, useRef } from 'react';
import { createPortal } from 'react-dom';

interface IDropdownProp {
  isOpen: boolean;
  label: ReactElement | string;
  onClose: () => void;
  onOpen: () => void;
}

export const LyraSheetDropdown: FC<IDropdownProp> = ({
  isOpen,
  label,
  onClose,
  onOpen,
  children,
}) => {
  const dropdownControlRef = useRef<HTMLDivElement>(null);

  function onHostClick() {
    onOpen();
  }

  function onBackdropClick(evt: MouseEvent) {
    evt.stopPropagation();
    onClose();
  }

  return (
    <div className={'lyra-sheet-dropdown'}>
      <div
        className={`lyra-sheet-dropdown-control ${isOpen ? 'is-open' : ''}`}
        ref={dropdownControlRef}
        onClick={onHostClick}
      >
        {label}
        <span className={'triangle'}></span>
      </div>
      {isOpen ? (
        <DropdownDialog
          backdropClick={onBackdropClick}
          origin={dropdownControlRef.current!}
        >
          {children}
        </DropdownDialog>
      ) : null}
    </div>
  );
};

interface IDropdownDialogProp {
  backdropClick?: (evt: MouseEvent<HTMLDivElement>) => void;
  origin?: HTMLElement;
}

const DropdownDialog: FC<IDropdownDialogProp> = ({
  children,
  backdropClick,
  origin,
}) => {
  const { left, top, height } = origin!.getBoundingClientRect();
  return createPortal(
    <div className={'lyra-sheet-overlay-container'}>
      <div
        className={'lyra-sheet-overlay-backdrop'}
        onClick={(evt) => backdropClick && backdropClick(evt)}
      ></div>
      <div className={'lyra-sheet-overlay-positioned-bounding-box'}>
        <div
          className={'lyra-sheet-overlay-pane'}
          style={{ left, top: top + height }}
        >
          <div className={'lyra-sheet-dropdown-content'}>{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
