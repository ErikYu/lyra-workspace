import {Component, HostBinding, OnInit} from '@angular/core';
import {SelectorsService} from '../../core/selectors.service';

@Component({
  selector: 'nd-selector-container',
  templateUrl: './selector-container.component.html',
  styleUrls: ['./selector-container.component.less']
})
export class SelectorContainerComponent implements OnInit {
  @HostBinding('class.nd-selector-container') h = true;

  constructor(
    public selectorRangeService: SelectorsService,
  ) { }

  ngOnInit(): void {
  }

}
