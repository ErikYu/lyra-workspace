export interface IController {
  el: HTMLElement;
  mount<E extends HTMLElement>(el: E): void;
}
