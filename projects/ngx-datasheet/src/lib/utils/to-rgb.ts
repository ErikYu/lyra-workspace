// #000 -> rgb(0,0,0)
export function toRGB(color: string): string {
  const regex = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;
  const match = color.match(regex);
  return match
    ? 'rgb(' +
        parseInt(match[1], 16) +
        ',' +
        parseInt(match[2], 16) +
        ',' +
        parseInt(match[3], 16) +
        ')'
    : color;
}

export const toHEX = (s: string) =>
  s
    .match(/[0-9]+/g)!
    // @ts-ignore
    // tslint:disable-next-line:no-bitwise
    .reduce((a, b) => a + (b | 256).toString(16).slice(1), '#');
