import {
  AfterViewInit,
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { TextInputService } from '../../service/text-input.service';
import { setStyle } from '../../utils';
import { ConfigService } from '../../core/config.service';
import { GRID_LINE_WIDTH } from '../../constants';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DataService } from '../../core/data.service';
import { fromEvent } from 'rxjs';
import { delay, filter } from 'rxjs/operators';

@Component({
  selector: 'nd-rich-text-input',
  templateUrl: './rich-text-input.component.html',
  styleUrls: ['./rich-text-input.component.less'],
  host: {
    class: 'nd-rich-text-input',
  },
})
export class RichTextInputComponent implements AfterViewInit {
  @ViewChild('editableZone') editableZone!: ElementRef<HTMLDivElement>;
  html: SafeHtml = '';

  private shown = false;

  constructor(
    private textInputService: TextInputService,
    private hostEl: ElementRef<HTMLElement>,
    private configService: ConfigService,
    private dataService: DataService,
    private domSanitizer: DomSanitizer,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    // sync with formula bar
    fromEvent<InputEvent>(this.editableZone.nativeElement, 'input')
      .pipe(filter(() => this.shown))
      .subscribe((evt) => {
        this.textInputService.transferFromRichInput(
          this.editableZone.nativeElement.innerHTML,
        );
        console.log(evt, (evt.target as HTMLElement).textContent);
      });

    // option/alt + enter: add line breaker
    fromEvent<KeyboardEvent>(this.editableZone.nativeElement, 'keydown')
      .pipe(filter((evt) => evt.altKey && evt.keyCode === 13 && this.shown))
      .subscribe(() => {
        document.execCommand('insertText', false, '\n');
      });

    // auto edit
    fromEvent<KeyboardEvent>(this.editableZone.nativeElement, 'keydown')
      .pipe(
        filter(() => !this.shown),
        inputKeydown,
      )
      .subscribe((evt) => {
        this.textInputService.show(true);
      });

    this.textInputService.locatedRect$.subscribe((res) => {
      if (res) {
        // show
        this.shown = true;
        this.html = this.domSanitizer.bypassSecurityTrustHtml(res.html);
        setStyle(this.hostEl.nativeElement, {
          left: `${res.left + this.configService.ciw - GRID_LINE_WIDTH * 2}px`,
          top: `${res.top + this.configService.rih - GRID_LINE_WIDTH * 2}px`,
          minWidth: `${res.width}px`,
          height: `${res.height}px`,
        });
        this.renderer.removeClass(this.hostEl.nativeElement, 'silencer');
      } else {
        // hide
        this.shown = false;
        this.html = '';
        this.renderer.addClass(this.hostEl.nativeElement, 'silencer');
      }
    });
    this.textInputService.focus$.pipe(delay(50)).subscribe(() => {
      this.editableZone.nativeElement.focus();
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
