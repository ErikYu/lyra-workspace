import {
  Component,
  HostListener,
  Input,
  OnInit,
  Output,
  TemplateRef,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'nd-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.less'],
})
export class DropdownComponent implements OnInit {
  @Input() dropdown!: TemplateRef<void>;
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}

  @HostListener('click')
  show(): void {
    this.isOpen = true;
    this.isOpenChange.emit(true);
  }

  backdropClick(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }
}
