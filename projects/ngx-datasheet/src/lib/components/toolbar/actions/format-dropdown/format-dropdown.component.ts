import { Component, OnInit } from '@angular/core';
import { CellFormat } from '../../../../models';
import { DataService } from '../../../../core/data.service';
import { HistoryService } from '../../../../service/history.service';
import { SelectorsService } from '../../../../core/selectors.service';
import { FocusedStyleService } from '../../../../service/focused-style.service';

@Component({
  selector: 'nd-format-dropdown',
  templateUrl: './format-dropdown.component.html',
  styleUrls: ['./format-dropdown.component.less'],
})
export class FormatDropdownComponent implements OnInit {
  get curFmt(): CellFormat {
    if (this.selectorsService.selectors.length === 0) {
      return undefined;
    }
    const [ri, ci] = this.selectorsService.selectors[0].startCord;
    const cell = this.dataService.selectedSheet.getCell(ri, ci);
    return cell?.style?.format;
  }

  isOpen = false;

  items: Array<
    | {
        fmt: CellFormat;
        label: string;
        desc: string;
        checked: () => boolean;
      }
    | 'DIVIDER'
  > = [
    {
      fmt: undefined,
      label: 'Auto',
      desc: '',
      checked: () => this.curFmt === undefined,
    },
    {
      fmt: 'text',
      label: 'Plain text',
      desc: '',
      checked: () => this.curFmt === 'text',
    },
    'DIVIDER',
    {
      fmt: 'number',
      label: 'Number',
      desc: '1,000.12',
      checked: () => this.curFmt === 'number',
    },
    {
      fmt: 'percent',
      label: 'Percent',
      desc: '10.12%',
      checked: () => this.curFmt === 'percent',
    },
    {
      fmt: 'scientific',
      label: 'Scientific',
      desc: '1.01E+03',
      checked: () => this.curFmt === 'scientific',
    },
    'DIVIDER',
    {
      fmt: 'accounting',
      label: 'Accounting',
      desc: '$ (1,000.12)',
      checked: () => this.curFmt === 'accounting',
    },
    {
      fmt: 'financial',
      label: 'Financial',
      desc: '(1,000.12)',
      checked: () => this.curFmt === 'financial',
    },
    {
      fmt: 'currency',
      label: 'Currency',
      desc: '$1,000.12',
      checked: () => this.curFmt === 'currency',
    },
    {
      fmt: 'currency_rounded',
      label: 'Currency(rounded)',
      desc: '$1,000',
      checked: () => this.curFmt === 'currency_rounded',
    },
  ];

  valLabel = new Map(
    this.items.reduce<[CellFormat, string][]>((prev, item) => {
      if (item === 'DIVIDER') {
        return prev;
      }
      return [...prev, [item.fmt, item.label]];
    }, []),
  );

  constructor(
    private dataService: DataService,
    private historyService: HistoryService,
    private selectorsService: SelectorsService,
    private focusedStyleService: FocusedStyleService,
  ) {}

  ngOnInit(): void {}

  applyFormat(fmt: CellFormat): void {
    this.historyService.stacked(() => {
      for (const selector of this.selectorsService.selectors) {
        this.dataService.selectedSheet.resetPrecisionTo(selector.range);
        this.dataService.selectedSheet.applyCellFormatTo(selector.range, fmt);
      }
    });
    this.isOpen = false;
    this.dataService.rerender();
  }
}
