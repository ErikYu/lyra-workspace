import { Component, Output, EventEmitter, ElementRef } from '@angular/core';
import { COLOR_PALETTE } from '@lyra-sheet/core';

@Component({
  selector: 'lyra-sheet-color-palette',
  templateUrl: './color-palette.component.html',
  styleUrls: ['./color-palette.component.scss'],
})
export class ColorPaletteComponent {
  @Output() chosenColor = new EventEmitter<string>();

  colors = COLOR_PALETTE;

  constructor(private el: ElementRef) {
    el.nativeElement.onmousedown = (evt: MouseEvent) => evt.preventDefault();
  }

  chooseColor(color: string): void {
    this.chosenColor.emit(color);
  }
}
