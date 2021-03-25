import { Injectable } from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { HistoryService } from './history.service';
import { SelectorsService } from '../core/selectors.service';
import { TextInputService } from './text-input.service';

@Injectable()
export class KeyboardEventService {
  constructor(
    private historyService: HistoryService,
    private selectorsService: SelectorsService,
    private textInputService: TextInputService,
  ) {}
  init(): void {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter((evt) => evt.ctrlKey || evt.metaKey),
        tap((evt) => {
          switch (evt.keyCode) {
            case 90:
              if (evt.shiftKey) {
                // redo: ctrl/cmd - shift - z
                this.historyService.redo();
                evt.preventDefault();
              } else {
                // undo: ctrl/cmd - z
                this.historyService.undo();
                evt.preventDefault();
              }
              break;
            case 89:
              // redo: ctrl/cmd - y
              this.historyService.redo();
              evt.preventDefault();
              break;
          }
        }),
      )
      .subscribe();

    this.tabEnterPipeLine();
    this.autoEdit();
  }

  private tabEnterPipeLine(): void {
    let startRI: number;
    let startCI: number;
    let lastRI: number;
    let lastCI: number;
    fromEvent<KeyboardEvent>(document.querySelector('nd-masker')!, 'mouseup')
      .pipe(
        switchMap(() => {
          const { startCord } = this.selectorsService.selectors[0];
          startRI = lastRI = startCord[0];
          startCI = lastCI = startCord[1];
          return fromEvent<KeyboardEvent>(document, 'keydown');
        }),
        tap((evt) => {
          switch (evt.keyCode) {
            case 9:
              // tab
              evt.preventDefault();
              lastCI += 1;
              this.selectorsService.selectCell(lastRI, lastCI);
              break;
            case 13:
              // enter
              evt.preventDefault();
              if (this.textInputService.isEditing) {
                this.textInputService.hide();
              }
              lastRI += 1;
              lastCI = startCI;
              this.selectorsService.selectCell(lastRI, lastCI);
              break;
          }
        }),
      )
      .subscribe();
  }

  private autoEdit(): void {
    fromEvent(document, 'compositionend').subscribe((res) => console.log(res));
  }
}
