import { Injectable } from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { HistoryService } from './history.service';

@Injectable()
export class KeyboardEventService {
  constructor(private historyService: HistoryService) {}
  init(): void {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter((evt) => evt.ctrlKey || evt.metaKey),
        tap((evt) => {
          evt.preventDefault();
          switch (evt.keyCode) {
            case 90:
              if (evt.shiftKey) {
                // redo: ctrl/cmd - shift - z
                this.historyService.redo();
              } else {
                // undo: ctrl/cmd - z
                this.historyService.undo();
              }
              break;
            case 89:
              // redo: ctrl/cmd - y
              this.historyService.redo();
              break;
          }
        }),
      )
      .subscribe();
  }
}
