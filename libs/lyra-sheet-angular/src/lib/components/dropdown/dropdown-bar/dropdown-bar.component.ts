import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';

@Component({
  selector: 'lyra-sheet-dropdown-bar',
  templateUrl: './dropdown-bar.component.html',
  styleUrls: ['./dropdown-bar.component.scss'],
  host: {
    class: 'lyra-sheet-toolbar-dropdown-bar',
  },
})
export class DropdownBarComponent implements OnInit {
  @Input() label!: string;
  @Input() desc = '';
  @Input() @HostBinding('class.checked') checked: boolean | undefined =
    undefined;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    el.nativeElement.onmousedown = (evt: MouseEvent) => evt.preventDefault();
  }

  ngOnInit(): void {
    if (this.checked !== undefined) {
      this.renderer.addClass(this.el.nativeElement, 'prefixed');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'prefixed');
    }
  }
}
