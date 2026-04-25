export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tagName);
  if (className) {
    el.className = className;
  }
  return el;
}
