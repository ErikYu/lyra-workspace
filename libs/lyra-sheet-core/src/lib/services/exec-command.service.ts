import { singleton } from 'tsyringe';

@singleton()
export class ExecCommandService {
  insertText(text: string): boolean {
    return document.execCommand('insertText', false, text);
  }
}
