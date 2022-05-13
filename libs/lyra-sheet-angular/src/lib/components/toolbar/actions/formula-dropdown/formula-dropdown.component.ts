import { Component, ElementRef } from '@angular/core';
import { labelFromCell } from '@lyra-sheet/core';
import { BaseContainer } from '../../../../services/_base_container';
import { FormulaNames, formulaNames } from '@lyra-sheet/core';

function moveCursor(offset: number): void {
  const selection = getSelection();
  if (selection) {
    selection.setPosition(
      selection.anchorNode,
      selection.anchorOffset + offset,
    );
  }
}

@Component({
  selector: 'lyra-sheet-formula-dropdown',
  templateUrl: './formula-dropdown.component.html',
  styleUrls: ['./formula-dropdown.component.scss'],
})
export class FormulaDropdownComponent {
  formulaNames = formulaNames;
  isOpen = false;
  constructor(
    private c: BaseContainer,
    // private t: TextInputService,
    // private h: HistoryService,
    // private s: SelectorsService,
    // private e: ExecCommandService,
    private el: ElementRef,
  ) {
    el.nativeElement.onmousedown = (evt: MouseEvent) => evt.preventDefault();
  }

  applyFormula(formula: FormulaNames): void {
    this.isOpen = false;
    this.rangerFirst(formula);
  }

  private rangerFirst(f: FormulaNames): void {
    const justAddEqual = `=${f}()`;
    if (this.c.textInputService.isEditing) {
      const success = this.c.execCommandService.insertText(justAddEqual);
      if (success) {
        moveCursor(-1);
      }
    } else if (this.c.dataService.selectedSheet.last.range.isSingleCell) {
      this.c.textInputService.show(true);
      setTimeout(() => {
        if (this.c.execCommandService.insertText(justAddEqual)) {
          moveCursor(-1);
        }
      });
    } else {
      const { sri, sci, eri, eci } =
        this.c.dataService.selectedSheet.last.range;
      const startLabel = labelFromCell(sri, sci);
      const endLabel = labelFromCell(eri, eci);
      if (sri === eri) {
        this.c.dataService.selectedSheet.selectCell(eri, eci + 1);
      } else {
        this.c.dataService.selectedSheet.selectCell(eri + 1, sci);
      }
      this.c.textInputService.show(true);
      setTimeout(() => {
        this.c.execCommandService.insertText(
          `=${f}(${startLabel}:${endLabel})`,
        );
      });
    }
  }
}
