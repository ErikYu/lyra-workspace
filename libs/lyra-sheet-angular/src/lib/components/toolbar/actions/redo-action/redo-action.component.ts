import { Component, HostListener } from '@angular/core';
import { BaseContainer } from '../../../../services/_base_container';

@Component({
  selector: 'lyra-sheet-redo-action',
  templateUrl: './redo-action.component.html',
  styleUrls: ['./redo-action.component.scss'],
})
export class RedoActionComponent {
  constructor(private c: BaseContainer) {}
  @HostListener('click')
  onClick(): void {
    this.c.historyService.redo();
  }
}
