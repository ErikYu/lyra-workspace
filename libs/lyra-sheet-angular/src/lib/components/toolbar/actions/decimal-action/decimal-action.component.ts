import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { DecimalController } from '@lyra-sheet/core';
import { BaseContainer } from '../../../../services/_base_container';

@Component({
  selector: 'lyra-sheet-decimal-action',
  templateUrl: './decimal-action.component.html',
  styleUrls: ['./decimal-action.component.scss'],
})
export class DecimalActionComponent {
  @Input() tpe!: 'add' | 'reduce';

  constructor(private el: ElementRef, private c: BaseContainer) {
    el.nativeElement.onmousedown = (evt: MouseEvent) => evt.preventDefault();
  }

  @HostListener('click')
  onClick(): void {
    this.c.resolve(DecimalController).execute(this.tpe);
  }
}
