import { Component, HostListener, OnInit } from '@angular/core';
import { HistoryService } from '../../../../service/history.service';

@Component({
  selector: 'nd-redo-action',
  templateUrl: './redo-action.component.html',
  styleUrls: ['./redo-action.component.less'],
})
export class RedoActionComponent implements OnInit {
  constructor(private historyService: HistoryService) {}
  @HostListener('click')
  onClick(): void {
    this.historyService.redo();
  }
  ngOnInit(): void {}
}
