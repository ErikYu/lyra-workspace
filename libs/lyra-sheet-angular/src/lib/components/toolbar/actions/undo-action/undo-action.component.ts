import { Component, HostListener } from '@angular/core';
import { BaseContainer } from '../../../../services/_base_container';

@Component({
  selector: 'lyra-sheet-undo-action',
  templateUrl: './undo-action.component.html',
  styleUrls: ['./undo-action.component.scss'],
})
export class UndoActionComponent {
  constructor(private c: BaseContainer) {}

  @HostListener('click')
  onClick(): void {
    this.c.historyService.undo();
  }
}
