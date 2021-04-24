import { Injectable } from '@angular/core';

@Injectable()
export class FormulaEditService {
  get activated(): boolean {
    return this.expression.startsWith('=');
  }
  expression!: string;
  parsing(plainText: string): void {
    this.expression = plainText;
  }

  replacing(text: string, index: number): void {}
}
