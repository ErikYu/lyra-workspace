import {
  Component,
  HostListener,
  Input,
  Output,
  TemplateRef,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'lyra-sheet-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  host: { class: 'lyra-sheet-dropdown' },
})
export class DropdownComponent {
  @Input() dropdown!: TemplateRef<void>;
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter();

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
