export function pxStr2Num(pxStr: string): number {
  return +pxStr.replace(/px/, '');
}
