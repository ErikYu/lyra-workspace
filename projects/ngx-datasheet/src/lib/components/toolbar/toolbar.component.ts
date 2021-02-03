import { Component, HostBinding, OnInit } from '@angular/core';
import { SelectorsService } from '../../core/selectors.service';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'nd-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.less'],
})
export class ToolbarComponent implements OnInit {
  @HostBinding('class.nd-toolbar') h = true;
  constructor(
    private selectorsService: SelectorsService,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {}

  applyBold(): void {}
  applyItalic(): void {}
  applyStrike(): void {}
  applyMerge(): void {
    this.selectorsService.selectors.forEach(({ range }) => {
      this.dataService.selectedSheet.applyMergeTo(range);
    });
    this.dataService.rerender();
  }
}
