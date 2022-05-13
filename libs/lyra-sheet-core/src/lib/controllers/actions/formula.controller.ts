import { Lifecycle, scoped } from 'tsyringe';
import type { FormulaNames } from '../../services';
import { labelFromCell } from '../../utils';
import {
  DataService,
  ExecCommandService,
  HistoryService,
  TextInputService,
} from '../../services';

function moveCursor(offset: number): void {
  const selection = getSelection();
  if (selection) {
    selection.setPosition(
      selection.anchorNode,
      selection.anchorOffset + offset,
    );
  }
}

@scoped(Lifecycle.ContainerScoped)
export class FormulaController {
  constructor(
    private textInputService: TextInputService,
    private historyService: HistoryService,
    private execCommandService: ExecCommandService,
    private dataService: DataService,
  ) {}

  applyFormula(f: FormulaNames) {
    const justAddEqual = `=${f}()`;
    if (this.textInputService.isEditing) {
      const success = this.execCommandService.insertText(justAddEqual);
      if (success) {
        moveCursor(-1);
      }
    } else if (this.dataService.selectedSheet.last.range.isSingleCell) {
      this.textInputService.show(true);
      setTimeout(() => {
        if (this.execCommandService.insertText(justAddEqual)) {
          moveCursor(-1);
        }
      });
    } else {
      const { sri, sci, eri, eci } = this.dataService.selectedSheet.last.range;
      const startLabel = labelFromCell(sri, sci);
      const endLabel = labelFromCell(eri, eci);
      if (sri === eri) {
        this.dataService.selectedSheet.selectCell(eri, eci + 1);
      } else {
        this.dataService.selectedSheet.selectCell(eri + 1, sci);
      }
      this.textInputService.show(true);
      setTimeout(() => {
        this.execCommandService.insertText(`=${f}(${startLabel}:${endLabel})`);
      });
    }
  }
}
