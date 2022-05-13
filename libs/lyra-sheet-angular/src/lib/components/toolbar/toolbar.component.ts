import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'lyra-sheet-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  @HostBinding('class.lyra-sheet-toolbar') h = true;
}
