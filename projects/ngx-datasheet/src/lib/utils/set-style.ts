export function setStyle(
  el: HTMLElement,
  styles: Partial<CSSStyleDeclaration>,
): void {
  Object.entries(styles).forEach(([style, value]) => {
    // @ts-ignore
    el.style[style] = value;
  });
}
