import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RichTextInputController } from '@lyra-sheet/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseContainer } from '../../services/_base_container';

@Component({
  selector: 'lyra-sheet-rich-text-input',
  templateUrl: './rich-text-input.component.html',
  styleUrls: ['./rich-text-input.component.scss'],
  host: {
    class: 'lyra-sheet-rich-text-input',
  },
})
export class RichTextInputComponent implements AfterViewInit {
  richTextInputController: RichTextInputController;
  @ViewChild('editableZone') editableZone!: ElementRef<HTMLDivElement>;
  html: SafeHtml = '';

  constructor(
    private c: BaseContainer,
    private hostEl: ElementRef<HTMLElement>,
    private domSanitizer: DomSanitizer,
  ) {
    this.richTextInputController = this.c.richTextInputController;
  }

  ngAfterViewInit(): void {
    this.richTextInputController.mount(
      this.hostEl.nativeElement,
      this.editableZone.nativeElement,
    );
    this.richTextInputController.html$
      .asObservable()
      .subscribe(
        (res) => (this.html = this.domSanitizer.bypassSecurityTrustHtml(res)),
      );
  }
}
