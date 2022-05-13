import { Lifecycle, scoped } from 'tsyringe';

const calcOperator = '+-*/()='.split('');

@scoped(Lifecycle.ContainerScoped)
export class FormulaEditService {
  get activated(): boolean {
    return this.expression.startsWith('=');
  }
  expression!: string;

  shouldInsert = false;

  parsing(plainText: string, evt?: InputEvent): void {
    this.expression = plainText;

    if (evt) {
      switch (evt.inputType) {
        case 'insertText':
          this.shouldInsert = calcOperator.indexOf(evt.data!) !== -1;
          break;
        case 'deleteContentBackward':
          const select = getSelection()!;
          const letterBeforeCursor =
            select.focusNode!.textContent![select.focusOffset - 1];
          this.shouldInsert = calcOperator.indexOf(letterBeforeCursor) !== -1;
          break;
      }
    }
  }

  // replacing(text: string, index: number): void {}
}
