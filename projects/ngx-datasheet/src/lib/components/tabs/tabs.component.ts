import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataService } from '../../core/data.service';
import { ViewRangeService } from '../../core/view-range.service';
import { SheetService } from '../../core/sheet.service';
import { HistoryService } from '../../service/history.service';

@Component({
  selector: 'nd-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.less'],
  host: { class: 'nd-tabs' },
})
export class TabsComponent implements OnInit {
  editingIndex: number | null = null;

  @Input() tabs: SheetService[] = [];
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  constructor(
    public dataService: DataService,
    private viewRangeService: ViewRangeService,
    private historyService: HistoryService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {}

  selectSheet(index: number): void {
    this.dataService.selectSheet(index);
    this.viewRangeService.init();
    this.dataService.rerender();
  }

  editSheetName(index: number): void {
    this.editingIndex = index;
    this.cd.detectChanges();
    this.nameInput.nativeElement.select();
  }

  triggerBlur(evt: Event): void {
    evt.stopPropagation();
    const inputEl = evt.target as HTMLInputElement;
    inputEl.blur();
  }

  updateSheetName(evt: Event, index: number): void {
    const inputEl = evt.target as HTMLInputElement;
    const newName = inputEl.value;
    this.dataService.updateSheetName(index, newName, () => {
      this.editingIndex = null;
    });
  }

  addSheet(): void {
    this.historyService.stacked(() => {
      this.dataService.addSheet();
    });
    this.viewRangeService.init();
    this.dataService.rerender();
  }
}
