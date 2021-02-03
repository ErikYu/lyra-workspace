import { Component, HostListener, OnInit } from '@angular/core';
import { DataService } from '../../../../core/data.service';
import { SelectorsService } from '../../../../core/selectors.service';

@Component({
  selector: 'nd-merge-dropdown',
  templateUrl: './merge-dropdown.component.html',
  styleUrls: ['./merge-dropdown.component.less'],
  host: {
    class: 'nd-dropdown merge',
  },
})
export class MergeDropdownComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private selectorsService: SelectorsService,
  ) {}

  get hasMergeInSelector(): boolean {
    if (this.selectorsService.selectors.length === 0) {
      return false;
    }
    return this.dataService.selectedSheet.merges.overlappingWith(
      this.selectorsService.selectors[0].range,
    );
  }

  @HostListener('click')
  onClick(): void {
    if (!this.hasMergeInSelector) {
      this.dataService.selectedSheet.applyMergeTo(
        this.selectorsService.selectors[0].range,
      );
    } else {
      this.dataService.selectedSheet.removeMergesInside(
        this.selectorsService.selectors[0].range,
      );
    }
    this.dataService.rerender();
  }

  ngOnInit(): void {
    console.log(this.selectorsService.selectors);
    console.log(this.dataService.selectedSheet.merges);
  }
}
