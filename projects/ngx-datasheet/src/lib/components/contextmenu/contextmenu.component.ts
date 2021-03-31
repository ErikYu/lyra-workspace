import {Component, ElementRef, HostBinding, OnInit} from '@angular/core';
import {ContextmenuService} from '../../service/contextmenu.service';
import {setStyle} from '../../utils';

@Component({
  selector: 'nd-contextmenu',
  templateUrl: './contextmenu.component.html',
  styleUrls: ['./contextmenu.component.less'],
})
export class ContextmenuComponent implements OnInit {
  @HostBinding('class.nd-contextmenu') h = true;

  constructor(private contextmenuService: ContextmenuService, private el: ElementRef<HTMLElement>) { }

  ngOnInit(): void {
    this.contextmenuService.options$
      .subscribe((option) => {
        if (option === null) {
          // hide
          setStyle(this.el.nativeElement, {
            display: 'none'
          });
        } else {
          const { left, top } = option;
          setStyle(this.el.nativeElement, {
            display: 'block',
            left: `${left}px`,
            top: `${top}px`,
          });
        }
      });
  }

}
