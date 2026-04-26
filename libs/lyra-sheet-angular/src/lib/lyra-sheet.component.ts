import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Data, DatasheetConfig } from '@lyra-sheet/core';
import { LyraSheetVanilla } from '@lyra-sheet/vanilla';

const defaultConfig: DatasheetConfig = {
  width: () => document.documentElement.clientWidth,
  height: () => document.documentElement.clientHeight,
  row: {
    height: 25,
    count: 100,
    indexHeight: 25,
  },
  col: {
    width: 100,
    count: 30,
    indexWidth: 60,
  },
};

const defaultData: Data = {
  sheets: [
    {
      name: 'Sheet1',
      data: {
        merges: [],
        rows: {},
        rowCount: 100,
        cols: {},
        colCount: 30,
      },
      selected: true,
    },
  ],
};

@Component({
  selector: 'lyra-sheet',
  templateUrl: './lyra-sheet.component.html',
  styleUrls: ['./lyra-sheet.component.scss'],
  standalone: false,
})
export class LyraSheetComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('host', { static: true })
  hostRef!: ElementRef<HTMLDivElement>;

  @Input() config: DatasheetConfig = defaultConfig;
  @Input() data: Data = defaultData;

  @Output() dataChange = new EventEmitter<Data>();

  private sheet: LyraSheetVanilla | null = null;
  private viewReady = false;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    document.execCommand?.('styleWithCSS', false, true as never);
    this.sheet = new LyraSheetVanilla({
      data: this.data,
      config: this.config,
      onDataChange: (next) =>
        this.ngZone.run(() => this.dataChange.emit(next)),
    });
    this.sheet.mount(this.hostRef.nativeElement);
    this.viewReady = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewReady || !this.sheet) {
      return;
    }
    if (changes['data'] || changes['config']) {
      this.sheet.update({
        data: this.data,
        config: this.config,
        onDataChange: (next) =>
          this.ngZone.run(() => this.dataChange.emit(next)),
      });
    }
  }

  ngOnDestroy(): void {
    this.sheet?.destroy();
    this.sheet = null;
    this.viewReady = false;
  }
}
