import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'nd-dropdown-bar',
  templateUrl: './dropdown-bar.component.html',
  styleUrls: ['./dropdown-bar.component.less'],
  host: {
    class: 'nd-toolbar-dropdown-bar',
  },
})
export class DropdownBarComponent implements OnInit {
  @Input() label!: string;
  @Input() desc = '';
  @Input() @HostBinding('class.checked') checked = false;

  constructor(private el: ElementRef) {
    el.nativeElement.onmousedown = (evt: any) => evt.preventDefault();
  }

  ngOnInit(): void {}
}
