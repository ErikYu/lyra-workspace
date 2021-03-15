import { Component, ElementRef, OnInit } from '@angular/core';
import { TextInputService } from '../../service/text-input.service';
import { setStyle } from '../../utils';
import { ConfigService } from '../../core/config.service';
import { GRID_LINE_WIDTH } from '../../constants';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'nd-rich-text-input',
  templateUrl: './rich-text-input.component.html',
  styleUrls: ['./rich-text-input.component.less'],
  host: {
    class: 'nd-rich-text-input',
  },
})
export class RichTextInputComponent implements OnInit {
  html!: SafeHtml;

  constructor(
    private textInputService: TextInputService,
    private hostEl: ElementRef<HTMLElement>,
    private configService: ConfigService,
    private dataService: DataService,
    private domSanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.textInputService.locatedRect$.subscribe((res) => {
      if (res) {
        this.html = this.domSanitizer.bypassSecurityTrustHtml(res.html);
        setStyle(this.hostEl.nativeElement, {
          display: 'block',
          left: `${res.left + this.configService.ciw - GRID_LINE_WIDTH * 2}px`,
          top: `${res.top + this.configService.rih - GRID_LINE_WIDTH * 2}px`,
          minWidth: `${res.width}px`,
          height: `${res.height}px`,
        });
      } else {
        setStyle(this.hostEl.nativeElement, {
          display: 'none',
        });
        this.dataService.rerender();
      }
    });
  }
}
