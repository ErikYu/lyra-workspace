import { Component, ElementRef, HostBinding, OnInit } from '@angular/core';
import { ContextMenuController } from '@lyra-sheet/core';
import { BaseContainer } from '../../services/_base_container';

@Component({
  selector: 'lyra-sheet-contextmenu',
  templateUrl: './contextmenu.component.html',
  styleUrls: ['./contextmenu.component.scss'],
})
export class ContextmenuComponent implements OnInit {
  contextMenuController: ContextMenuController;
  @HostBinding('class.lyra-sheet-contextmenu') h = true;

  constructor(private c: BaseContainer, private el: ElementRef<HTMLElement>) {
    this.contextMenuController = c.contextMenuController;
    this.contextMenuController.mount(this.el.nativeElement);
  }

  ngOnInit(): void {
    this.contextMenuController.onInit();
  }
}
