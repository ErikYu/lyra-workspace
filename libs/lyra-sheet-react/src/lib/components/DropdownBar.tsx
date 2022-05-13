import { MouseEventHandler, PropsWithChildren, useRef } from 'react';
import { ReactComponent as Check } from '../icons/check.svg';

interface DropdownBarProps {
  desc?: string;
  checked?: boolean;
  onClick?: MouseEventHandler;
  onMouseEnter?: MouseEventHandler;
}

export function LyraSheetDropdownBar({
  children,
  desc,
  checked,
  onClick,
  onMouseEnter,
}: PropsWithChildren<DropdownBarProps>) {
  const barRef = useRef(null);

  return (
    <div
      className={`lyra-sheet-toolbar-dropdown-bar`}
      ref={barRef}
      onMouseDown={(evt) => evt.preventDefault()}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {checked !== undefined ? (
        <div className={'lyra-sheet-toolbar-dropdown-bar-prefix'}>
          {checked ? <Check></Check> : null}
        </div>
      ) : null}
      <div className={'lyra-sheet-toolbar-dropdown-bar-content'}>
        {children}
        {desc ? (
          <span className={'lyra-sheet-toolbar-dropdown-bar-desc'}>{desc}</span>
        ) : null}
      </div>
    </div>
  );
}
