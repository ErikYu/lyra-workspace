import { DataService } from './data.service';
import { ViewRangeService } from './view-range.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { LocatedRect } from '../types';
import { HtmlToRichTextService } from './html-to-rich-text.service';
import { RichTextToHtmlService } from './rich-text-to-html.service';
import { HistoryService } from './history.service';
import { FormulaEditService } from './formula-edit.service';
import { plainTextFromLines } from '../utils';
import { Lifecycle, scoped } from 'tsyringe';

interface RichTextInputRect extends LocatedRect {
  html: string;
}

type FocusMode = 'default' | 'last';

@scoped(Lifecycle.ContainerScoped)
export class TextInputService {
  private _locatedRect$ = new BehaviorSubject<RichTextInputRect | null>(null);
  private _htmlForFormulaBar$ = new Subject<string>();
  // private _htmlForRichInput$ = new Subject<string>();
  private _focus$ = new BehaviorSubject<FocusMode>('default');

  private richTextBeforeEdit!: string;

  get locatedRect$(): Observable<RichTextInputRect | null> {
    return this._locatedRect$.asObservable();
  }
  get htmlForFormulaBar$(): Observable<string> {
    return this._htmlForFormulaBar$.asObservable();
  }
  // get htmlForRichInput$(): Observable<string> {
  //   return this._htmlForRichInput$.asObservable();
  // }
  get focus$(): Observable<FocusMode> {
    return this._focus$.asObservable();
  }

  get isEditing(): boolean {
    return this._locatedRect$.value !== null;
  }

  constructor(
    private dataService: DataService,
    private vs: ViewRangeService,
    private htmlToRichTextService: HtmlToRichTextService,
    private richTextToHtmlService: RichTextToHtmlService,
    private historyService: HistoryService,
    private formulaEditService: FormulaEditService,
  ) {}

  // when editing in formula bar, sync into rich-text-input
  transferFromFormulaBar(html: string): void {
    // this._htmlForRichInput$.next(html);
    if (this.dataService.selectedSheet.selectors.length === 0) {
      console.error('Nothing to be edited');
      return;
    }
    const lastSelector = this.dataService.selectedSheet.last;
    const { sri, sci, eri, eci } = lastSelector.range;
    const locatedRect = this.vs.locateRect({ sci, eci, sri, eri });
    this._locatedRect$.next({ ...locatedRect, html });
  }

  // when editing in rich-text-input, sync into formula bar
  transferFromRichInput(html: string): void {
    this._htmlForFormulaBar$.next(html);
  }

  show(clear: boolean): void {
    if (this.dataService.selectedSheet.selectors.length === 0) {
      console.error('Nothing to be edited');
      return;
    }
    const lastSelector = this.dataService.selectedSheet.last;
    const { sri, sci, eri, eci } = lastSelector.range;
    const cell = this.dataService.selectedSheet.getCell(sri, sci);
    this.richTextBeforeEdit = JSON.stringify(cell?.richText || [[]]);
    const locatedRect = this.vs.locateRect({ sci, eci, sri, eri });
    const html = clear ? '' : this.richTextToHtmlService.conv(cell?.richText);
    this._locatedRect$.next({ ...locatedRect, html });
    this.formulaEditService.parsing(plainTextFromLines(cell?.richText || []));
  }

  hide(): void {
    if (this._locatedRect$.value !== null) {
      const { sri, sci } = this._locatedRect$.value;
      const newRichText = JSON.stringify(
        this.htmlToRichTextService.fetchRichText(),
      );
      // TODO: optimize dirty check
      if (newRichText !== this.richTextBeforeEdit) {
        this.historyService.stacked(() => {
          this.dataService.selectedSheet.applyRichTextToCell(
            sri,
            sci,
            this.htmlToRichTextService.fetchRichText(),
          );
        });
      }
      this._locatedRect$.next(null);
      this.dataService.rerender();
    }
  }

  focus(mode: FocusMode = 'default'): void {
    this._focus$.next(mode);
  }
}
