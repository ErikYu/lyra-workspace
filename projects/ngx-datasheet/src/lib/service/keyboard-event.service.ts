import { Injectable } from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { HistoryService } from './history.service';
import { SelectorsService } from '../core/selectors.service';
import { TextInputService } from './text-input.service';
import { DataService } from '../core/data.service';

@Injectable()
export class KeyboardEventService {
  constructor(
    private historyService: HistoryService,
    private selectorsService: SelectorsService,
    private textInputService: TextInputService,
    private dataService: DataService,
  ) {}
  init(): void {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        // ctrl or cmd
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

    this.tabEnterDirPipeLine();
  }

  private tabEnterDirPipeLine(): void {
    let startRI: number;
    let startCI: number;
    let lastRI: number;
    let lastCI: number;
    fromEvent<KeyboardEvent>(document.querySelector('nd-masker')!, 'mouseup')
      .pipe(
        switchMap(() => {
          const { startCord } = this.selectorsService.selectors[0];
          startCI = lastCI = startCord[0];
          startRI = lastRI = startCord[1];
          return fromEvent<KeyboardEvent>(document, 'keydown');
        }),
        filter((evt) => !evt.altKey),
        tap((evt) => {
          switch (evt.keyCode) {
            case 8:
              // backspace
              if (this.textInputService.isEditing) {
                return;
              }
              evt.preventDefault();
              this.historyService.stacked(() => {
                for (const { range } of this.selectorsService.selectors) {
                  this.dataService.selectedSheet.clearText(range);
                }
              });
              this.dataService.rerender();
              break;
            case 9:
              // tab
              evt.preventDefault();
              if (this.textInputService.isEditing) {
                this.textInputService.hide();
              }
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
            case 37:
              // left
              if (this.textInputService.isEditing) {
                return;
              }
              evt.preventDefault();
              if (lastCI > 0) {
                lastCI -= 1;
                startCI = lastCI;
                this.selectorsService.selectCell(lastRI, lastCI);
              }
              break;
            case 38:
              // up
              if (this.textInputService.isEditing) {
                return;
              }
              evt.preventDefault();
              if (lastRI > 0) {
                lastRI -= 1;
                startRI = lastRI;
                this.selectorsService.selectCell(lastRI, lastCI);
              }
              break;
            case 39:
              // right
              if (this.textInputService.isEditing) {
                return;
              }
              evt.preventDefault();
              lastCI += 1;
              startCI = lastCI;
              this.selectorsService.selectCell(lastRI, lastCI);
              break;
            case 40:
              // down
              if (this.textInputService.isEditing) {
                return;
              }
              evt.preventDefault();
              lastRI += 1;
              startRI = lastRI;
              this.selectorsService.selectCell(lastRI, lastCI);
              break;
          }
        }),
      )
      .subscribe();
  }
}
