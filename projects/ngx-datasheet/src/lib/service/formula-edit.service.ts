import {Injectable} from '@angular/core';

@Injectable()
export class FormulaEditService {
  expression!: string;
  parsing(plainText: string): void {
    this.expression = plainText;
  }


}
