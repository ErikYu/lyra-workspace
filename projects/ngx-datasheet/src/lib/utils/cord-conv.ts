/**
 * 0 -> A, 1 -> B .......
 * @param colIndex: 0, 1, 2, 3...
 */
export function colLabelFromIndex(colIndex: number): string {
  let temp;
  let letter = '';
  while (colIndex >= 0) {
    temp = colIndex % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    colIndex = (colIndex - temp - 1) / 26;
  }
  return letter;
}
