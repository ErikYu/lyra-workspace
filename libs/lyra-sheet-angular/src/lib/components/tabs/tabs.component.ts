import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import {
  DataService,
  HistoryService,
  SheetService,
  TabsController,
  ViewRangeService,
} from '@lyra-sheet/core';
import { BaseContainer } from '../../services/_base_container';

@Component({
  selector: 'lyra-sheet-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  host: { class: 'lyra-sheet-tabs' },
})
export class TabsComponent {
  @Input() tabs: SheetService[] = [];
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;
  tabsController: TabsController;
  public dataService: DataService;
  private viewRangeService: ViewRangeService;
  private historyService: HistoryService;
  constructor(private c: BaseContainer, private cd: ChangeDetectorRef) {
    this.dataService = this.c.dataService;
    this.viewRangeService = this.c.viewRangeService;
    this.historyService = this.c.historyService;
    this.tabsController = this.c.tabsController;
  }

  editSheetName(index: number): void {
    this.tabsController.editSheetName(index);
    this.cd.detectChanges();
    this.nameInput.nativeElement.select();
  }
}
