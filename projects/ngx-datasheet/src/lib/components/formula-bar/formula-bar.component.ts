import {
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SelectorsService } from '../../core/selectors.service';
import { labelFromCell } from '../../utils';
import { DataService } from '../../core/data.service';
import { TextInputService } from '../../service/text-input.service';
import { fromEvent, merge } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { RichTextToHtmlService } from '../../service/rich-text-to-html.service';

@Component({
  selector: 'nd-formula-bar',
  templateUrl: './formula-bar.component.html',
  styleUrls: ['./formula-bar.component.less'],
})
export class FormulaBarComponent implements OnInit {
  label!: string;
  hitCellText = '';
  @ViewChild('textarea', { static: true })
  textareaEl!: ElementRef<HTMLDivElement>;

  @HostBinding('class.nd-formula-bar') h = true;

  constructor(
    private selectorsService: SelectorsService,
    private dataService: DataService,
    private textInputService: TextInputService,
    private richTextToHtmlService: RichTextToHtmlService,
  ) {}

  ngOnInit(): void {
    const causedBySelector = this.selectorsService.selectorChanged.pipe(
      filter((selectors) => Array.isArray(selectors) && selectors.length > 0),
      map((selectors) => {
        const last = selectors[selectors.length - 1];
        const { sri, sci, eri, eci } = last.range;
        if (last.range.isSingleCell) {
          this.label = labelFromCell(sri, sci);
        } else {
          this.label = `${labelFromCell(sri, sci)}:${labelFromCell(eri, eci)}`;
        }
        return last;
      }),
      map((lastSelector) => {
        const [hitRi, hitCi] = lastSelector.startCord;
        const richText = this.dataService.selectedSheet.getCell(hitRi, hitCi)
          ?.richText;
        return this.richTextToHtmlService.conv(richText);
      }),
    );
    const htmlShouldChange = merge(
      causedBySelector,
      this.textInputService.htmlForFormulaBar$,
    );
    htmlShouldChange.subscribe((html) => {
      this.textareaEl.nativeElement.innerHTML = html;
      this.textInputService.focus();
    });

    const textarea = this.textareaEl.nativeElement;
    fromEvent(textarea, 'focusin')
      .pipe(
        tap(() => this.textInputService.show(false)),
        switchMap(() => fromEvent(textarea, 'input')),
      )
      .subscribe((evt) => {
        this.textInputService.transferFromFormulaBar(textarea.innerHTML);
      });
  }
}
