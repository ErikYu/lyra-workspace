import { Injectable } from '@angular/core';
import { labelFromCell, plainTextFromLines, xyFromLabel } from '../utils';
import { RichTextLine } from '../ngx-datasheet.model';
import { DataService } from '../core/data.service';
import Big from 'big.js';

const formulas: {
  key: string;
  title: string;
  executor: (...args: any) => any;
}[] = [
  {
    key: 'SUM',
    title: 'SUM',
    executor: (args: number[]) => args.reduce((prev, item) => prev + item, 0),
  },
  {
    key: 'MAX',
    title: 'MAX',
    executor: (args: number[]) => Math.max(...args.map((v) => Number(v))),
  },
  {
    key: 'IF',
    title: 'IF',
    executor: ([b, t, f]: [boolean, any, any]) => (b ? t : f),
  },
];

export const formulaMap: Record<
  string,
  {
    key: string;
    title: string;
    executor: (...args: any) => any;
  }
> = formulas.reduce((prev, f) => {
  return { ...prev, [f.key]: f };
}, {});

@Injectable()
export class FormulaService {
  constructor(private dataService: DataService) {}

  conv(lines: RichTextLine[]): RichTextLine[] {
    const plainText = plainTextFromLines(lines);
    if (plainText.startsWith('=')) {
      const calculated = this.convPlainText(plainText);
      return [[{ text: calculated, style: lines[0][0].style }]];
    } else {
      return lines;
    }
  }

  convPlainText(plainText: string): string {
    const src = plainText.substring(1);
    const stack = this.infix2suffix(src);
    if (stack.length > 0) {
      console.log('stack: ', stack);
      return this.evalSuffixExpr(stack);
    }
    return plainText;
  }

  infix2suffix(src: string): any[] {
    const operatorStack = [];
    const stack: any[] = [];
    let block = []; // SUM, A1, B2, 50 ...
    let fnArgType = 0; // 1 => , 2 => :
    let fnArgOperator = '';
    let fnArgsLen = 1; // A1,A2,A3...
    let oldc = '';
    for (let i = 0; i < src.length; i += 1) {
      const c = src.charAt(i);
      if (c !== ' ') {
        if (c >= 'a' && c <= 'z') {
          block.push(c.toUpperCase());
        } else if (
          (c >= '0' && c <= '9') ||
          (c >= 'A' && c <= 'Z') ||
          c === '.'
        ) {
          block.push(c);
        } else if (c === '"') {
          i += 1;
          while (src.charAt(i) !== '"') {
            block.push(src.charAt(i));
            i += 1;
          }
          stack.push(`"${block.join('')}`);
          block = [];
        } else if (c === '-' && /[+\-*/,(]/.test(oldc)) {
          block.push(c);
        } else {
          if (c !== '(' && block.length > 0) {
            stack.push(block.join(''));
          }
          if (c === ')') {
            let c1 = operatorStack.pop();
            if (fnArgType === 2) {
              // fn argument range => A1:B5
              try {
                const [ex, ey] = xyFromLabel(stack.pop() as string);
                const [sx, sy] = xyFromLabel(stack.pop() as string);
                let rangelen = 0;
                for (let x = sx; x <= ex; x += 1) {
                  for (let y = sy; y <= ey; y += 1) {
                    stack.push(labelFromCell(y, x));
                    rangelen += 1;
                  }
                }
                stack.push([c1, rangelen]);
              } catch (e) {
                console.log(e);
              }
            } else if (fnArgType === 1 || fnArgType === 3) {
              if (fnArgType === 3) {
                stack.push(fnArgOperator);
              }
              // fn argument => A1,A2,B5
              stack.push([c1, fnArgsLen]);
              fnArgsLen = 1;
            } else {
              // console.log('c1:', c1, fnArgType, stack, operatorStack);
              while (c1 !== '(') {
                stack.push(c1);
                if (operatorStack.length <= 0) {
                  break;
                }
                c1 = operatorStack.pop();
              }
            }
            fnArgType = 0;
          } else if (c === '=' || c === '>' || c === '<') {
            const nc = src.charAt(i + 1);
            fnArgOperator = c;
            if (nc === '=' || nc === '-') {
              fnArgOperator += nc;
              i += 1;
            }
            fnArgType = 3;
          } else if (c === ':') {
            fnArgType = 2;
          } else if (c === ',') {
            if (fnArgType === 3) {
              stack.push(fnArgOperator);
            }
            fnArgType = 1;
            fnArgsLen += 1;
          } else if (c === '(' && block.length > 0) {
            // function
            operatorStack.push(block.join(''));
          } else {
            // priority: */ > +-
            // console.log('xxxx:', operatorStack, c, stack);
            if (operatorStack.length > 0 && (c === '+' || c === '-')) {
              let top = operatorStack[operatorStack.length - 1];
              if (top !== '(') {
                stack.push(operatorStack.pop());
              }
              if (top === '*' || top === '/') {
                while (operatorStack.length > 0) {
                  top = operatorStack[operatorStack.length - 1];
                  if (top !== '(') {
                    stack.push(operatorStack.pop());
                  } else {
                    break;
                  }
                }
              }
            }
            operatorStack.push(c);
          }
          block = [];
        }
        oldc = c;
      }
    }
    if (block.length > 0) {
      stack.push(block.join(''));
    }
    while (operatorStack.length > 0) {
      stack.push(operatorStack.pop());
    }
    return stack;
  }

  evalSuffixExpr(srcStack: any[]): any {
    const stack: any[] = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < srcStack.length; i += 1) {
      const expr = srcStack[i];
      const fc = expr[0];
      if (expr === '+') {
        const top = stack.pop();
        stack.push(Big(stack.pop()).add(top).toString());
      } else if (expr === '-') {
        if (stack.length === 1) {
          const top = stack.pop();
          stack.push(Big(top).mul(-1).toString());
        } else {
          const top = stack.pop();
          stack.push(Big(stack.pop()).minus(top).toString());
        }
      } else if (expr === '*') {
        stack.push(Big(stack.pop()).mul(stack.pop()));
      } else if (expr === '/') {
        const top = stack.pop();
        stack.push(Big(stack.pop()).div(top));
      } else if (fc === '=' || fc === '>' || fc === '<') {
        let top = stack.pop();
        if (!Number.isNaN(top)) {
          top = Number(top);
        }
        let left = stack.pop();
        if (!Number.isNaN(left)) {
          left = Number(left);
        }
        let ret = false;
        if (fc === '=') {
          ret = left === top;
        } else if (expr === '>') {
          ret = left > top;
        } else if (expr === '>=') {
          ret = left >= top;
        } else if (expr === '<') {
          ret = left < top;
        } else if (expr === '<=') {
          ret = left <= top;
        }
        stack.push(ret);
      } else if (Array.isArray(expr)) {
        const [formula, len] = expr;
        const params = [];
        for (let j = 0; j < len; j += 1) {
          params.push(stack.pop());
        }
        stack.push(formulaMap[formula].executor(params.reverse()));
      } else {
        // if (cellList.includes(expr)) {
        //   return 0;
        // }
        // if ((fc >= 'a' && fc <= 'z') || (fc >= 'A' && fc <= 'Z')) {
        //   cellList.push(expr);
        // }
        stack.push(this.evalSubExpr(expr));
        // cellList.pop();
      }
    }
    return stack[0];
  }

  evalSubExpr(subExpr: any): any {
    const [fl] = subExpr;
    let expr = subExpr;
    if (fl === '"') {
      return subExpr.substring(1);
    }
    let ret = 1;
    if (fl === '-') {
      expr = subExpr.substring(1);
      ret = -1;
    }
    if (expr[0] >= '0' && expr[0] <= '9') {
      return ret * Number(expr);
    }
    const [x, y] = xyFromLabel(expr);
    const text = this.dataService.selectedSheet.getCellPlainText(y, x) || '';
    return ret * +this.convPlainText(text);
  }
}
