export function inRanges(item: number, ranges: [number, number][]): boolean {
  for (const [s, e] of ranges) {
    if (s <= item && item <= e) {
      return true;
    }
  }
  return false;
}
