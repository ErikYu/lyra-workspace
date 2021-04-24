import { Component, ElementRef, OnInit } from '@angular/core';
import {
  FormulaNames,
  formulaNames,
} from '../../../../service/formula-render.service';
import { TextInputService } from '../../../../service/text-input.service';
import { HistoryService } from '../../../../service/history.service';
import { SelectorsService } from '../../../../core/selectors.service';
import { labelFromCell } from '../../../../utils';
import { ExecCommandService } from '../../../../service/exec-command.service';

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
  selector: 'nd-formula-dropdown',
  templateUrl: './formula-dropdown.component.html',
  styleUrls: ['./formula-dropdown.component.less'],
})
export class FormulaDropdownComponent implements OnInit {
  formulaNames = formulaNames;
  isOpen = false;
  constructor(
    private t: TextInputService,
    private h: HistoryService,
    private s: SelectorsService,
    private e: ExecCommandService,
    private el: ElementRef,
  ) {
    el.nativeElement.onmousedown = (evt: any) => evt.preventDefault();
  }

  ngOnInit(): void {}

  applyFormula(formula: FormulaNames): void {
    this.isOpen = false;
    this.rangerFirst(formula);
  }

  private rangerFirst(f: FormulaNames): void {
    const justAddEqual = `=${f}()`;
    if (this.t.isEditing) {
      const success = this.e.insertText(justAddEqual);
      if (success) {
        moveCursor(-1);
      }
    } else if (this.s.last.range.isSingleCell) {
      this.t.show(true);
      setTimeout(() => {
        if (this.e.insertText(justAddEqual)) {
          moveCursor(-1);
        }
      });
    } else {
      const { sri, sci, eri, eci } = this.s.last.range;
      const startLabel = labelFromCell(sri, sci);
      const endLabel = labelFromCell(eri, eci);
      if (sri === eri) {
        this.s.selectCell(eri, eci + 1);
      } else {
        this.s.selectCell(eri + 1, sci);
      }
      this.t.show(true);
      setTimeout(() => {
        this.e.insertText(`=${f}(${startLabel}:${endLabel})`);
      });
    }
  }
}
