const alphabets = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

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

export function colIndexFromLabel(label: string): number {
  let ret = 0;
  for (let i = 0; i < label.length - 1; i += 1) {
    const cindex = label.charCodeAt(i) - 65;
    const exponet = label.length - 1 - i;
    ret += alphabets.length ** exponet + alphabets.length * cindex;
  }
  ret += label.charCodeAt(label.length - 1) - 65;
  return ret;
}

export function labelFromCell(ri: number, ci: number): string {
  const colLabel = colLabelFromIndex(ci);
  return `${colLabel}${ri + 1}`;
}

// [colIndex, rowIndex]
export function xyFromLabel(label: string): [number, number] {
  let x = '';
  let y = '';
  for (let i = 0; i < label.length; i += 1) {
    if (label.charAt(i) >= '0' && label.charAt(i) <= '9') {
      y += label.charAt(i);
    } else {
      x += label.charAt(i);
    }
  }
  return [colIndexFromLabel(x), parseInt(y, 10) - 1];
}
