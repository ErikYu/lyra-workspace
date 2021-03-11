import { Component, HostListener, OnInit } from '@angular/core';
import { HistoryService } from '../../../../service/history.service';

@Component({
  selector: 'nd-undo-action',
  templateUrl: './undo-action.component.html',
  styleUrls: ['./undo-action.component.less'],
})
export class UndoActionComponent implements OnInit {
  constructor(private historyService: HistoryService) {}

  @HostListener('click')
  onClick(): void {
    this.historyService.undo();
  }

  ngOnInit(): void {}
}
