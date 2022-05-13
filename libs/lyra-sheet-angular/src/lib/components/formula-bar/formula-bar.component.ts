import {
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  ViewChild,
} from '@angular/core';
import { labelFromCell } from '@lyra-sheet/core';
import { fromEvent, merge, Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { BaseContainer } from '../../services/_base_container';

@Component({
  selector: 'lyra-sheet-formula-bar',
  templateUrl: './formula-bar.component.html',
  styleUrls: ['./formula-bar.component.scss'],
})
export class FormulaBarComponent implements OnInit {
  label$!: Observable<string>;
  @ViewChild('textarea', { static: true })
  textareaEl!: ElementRef<HTMLDivElement>;

  @HostBinding('class.lyra-sheet-formula-bar') h = true;

  constructor(private c: BaseContainer) {}

  ngOnInit(): void {
    this.c.formulaBarController.mount(this.textareaEl.nativeElement);
    this.label$ = this.c.formulaBarController.label$;
  }
}
