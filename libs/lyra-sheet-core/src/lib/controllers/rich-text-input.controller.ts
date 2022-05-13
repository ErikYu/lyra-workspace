import { Lifecycle, scoped } from 'tsyringe';
import { fromEvent, Subject } from 'rxjs';
import { delay, filter } from 'rxjs/operators';
import { addClass, removeClass, setStyle } from '../utils';
import { GRID_LINE_WIDTH } from '../constants';
import {
  ConfigService,
  FormulaEditService,
  TextInputService,
} from '../services';

@scoped(Lifecycle.ContainerScoped)
export class RichTextInputController {
  html$ = new Subject<string>();

  hostEl!: HTMLElement;
  editableZone!: HTMLDivElement;
  private shown = false;

  constructor(
    private textInputService: TextInputService,
    private formulaEditService: FormulaEditService,
    private configService: ConfigService,
  ) {}

  mount(hostEl: HTMLElement, editableZone: HTMLDivElement) {
    this.hostEl = hostEl;
    this.editableZone = editableZone;

    // sync with formula bar
    fromEvent<InputEvent>(this.editableZone, 'input')
      .pipe(filter(() => this.shown))
      .subscribe((evt) => {
        this.textInputService.transferFromRichInput(
          this.editableZone.innerHTML,
        );
        const { textContent } = evt.target as HTMLElement;
        if (textContent) {
          this.formulaEditService.parsing(textContent, evt);
        }
      });

    // option/alt + enter: add line breaker
    fromEvent<KeyboardEvent>(this.editableZone, 'keydown')
      .pipe(filter((evt) => evt.altKey && evt.keyCode === 13 && this.shown))
      .subscribe(() => {
        document.execCommand('insertText', false, '\n');
      });

    // auto edit
    fromEvent<KeyboardEvent>(this.editableZone, 'keydown')
      .pipe(
        filter(() => !this.shown),
        inputKeydown,
      )
      .subscribe(() => {
        this.textInputService.show(true);
      });

    this.textInputService.locatedRect$.subscribe((res) => {
      if (res) {
        // show
        this.shown = true;
        this.html$.next(res.html);
        setStyle(this.hostEl, {
          left: `${res.left + this.configService.ciw - GRID_LINE_WIDTH * 2}px`,
          top: `${res.top + this.configService.rih - GRID_LINE_WIDTH * 2}px`,
          minWidth: `${res.width}px`,
          height: `${res.height}px`,
        });
        removeClass(this.hostEl, 'silencer');
      } else {
        // hide
        this.shown = false;
        this.html$.next('');
        addClass(this.hostEl, 'silencer');
      }
    });
    this.textInputService.focus$.pipe(delay(50)).subscribe((mode) => {
      this.editableZone.focus();
      if (mode === 'last') {
        const selection = getSelection();
        if (selection) {
          selection.selectAllChildren(this.editableZone);
          selection.collapseToEnd();
        }
      }
    });
  }
}

const inputKeydown = filter((evt: KeyboardEvent) => {
  return (
    evt.keyCode !== 8 && // Backspace/delete
    evt.keyCode !== 9 && // tab
    evt.keyCode !== 13 && // enter
    evt.keyCode !== 37 && // dir
    evt.keyCode !== 38 && // dir
    evt.keyCode !== 39 && // dir
    evt.keyCode !== 40 && // dir
    evt.keyCode !== 16 && // nest shift
    !evt.altKey &&
    !evt.ctrlKey &&
    !evt.metaKey
  );
});
