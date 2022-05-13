import { useEffect, useRef, useState } from 'react';
import { LyraSheetDropdown } from '../Dropdown';
import { ReactComponent as Formula } from '../../icons/formula.svg';
import { FormulaController, formulaNames } from '@lyra-sheet/core';
import type { FormulaNames } from '@lyra-sheet/core';
import { LyraSheetDropdownBar } from '../DropdownBar';
import { useLyraSheetCore } from '../../container-context';

export function LyraSheetFormulaDropdown() {
  const controller = useLyraSheetCore(FormulaController);
  const hostRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    hostRef.current!.onmousedown = (evt) => evt.preventDefault();
  }, []);

  function applyFormula(f: FormulaNames) {
    controller.applyFormula(f);
    handleClose();
  }

  return (
    <div className={'lyra-sheet-toolbar-item'} ref={hostRef}>
      <LyraSheetDropdown
        isOpen={open}
        label={<Formula className={'lyra-sheet-toolbar-icon'} />}
        onClose={handleClose}
        onOpen={handleOpen}
      >
        {formulaNames.map((f) => (
          <LyraSheetDropdownBar onClick={() => applyFormula(f)} key={f}>
            {f}
          </LyraSheetDropdownBar>
        ))}
      </LyraSheetDropdown>
    </div>
  );
}
