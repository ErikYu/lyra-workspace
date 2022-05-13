export function setStyle(
  el: HTMLElement,
  styles: Partial<CSSStyleDeclaration>,
): void {
  Object.entries(styles).forEach(([style, value]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    el.style[style] = value;
  });
}
