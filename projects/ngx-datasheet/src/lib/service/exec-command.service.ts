import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class ExecCommandService {
  constructor(@Inject(DOCUMENT) private doc: Document) {}
  insertText(text: string): boolean {
    return this.doc.execCommand('insertText', false, text);
  }
}
