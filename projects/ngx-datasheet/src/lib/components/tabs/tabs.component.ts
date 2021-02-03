import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '../../core/data.service';
import { ViewRangeService } from '../../core/view-range.service';
import { SheetService } from '../../core/sheet.service';

@Component({
  selector: 'nd-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.less'],
  host: { class: 'nd-tabs' },
})
export class TabsComponent implements OnInit {
  nameEditing = false;

  @Input() tabs: SheetService[] = [];
  constructor(
    public dataService: DataService,
    private viewRangeService: ViewRangeService,
  ) {}

  ngOnInit(): void {}

  selectSheet(index: number): void {
    this.dataService.selectSheet(index);
    this.viewRangeService.init();
    this.dataService.rerender();
  }

  addSheet(): void {
    this.dataService.addSheet();
    this.viewRangeService.init();
    this.dataService.rerender();
  }
}
