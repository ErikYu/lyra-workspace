import { Lifecycle, scoped } from 'tsyringe';

@scoped(Lifecycle.ContainerScoped)
export class ElementRefService {
  rootEl!: HTMLElement;
  maskEl!: HTMLElement;
  colResizer!: HTMLElement;
  rowResizer!: HTMLElement;
  canvasEl!: HTMLCanvasElement;

  constructor() {}

  // use in angular
  init(rootEl: HTMLElement) {
    this.rootEl = rootEl;
    this.maskEl = rootEl.querySelector('.lyra-sheet-editor-mask')!;
    this.colResizer = rootEl.querySelector('.lyra-sheet-resizer-col')!;
    this.rowResizer = rootEl.querySelector('.lyra-sheet-resizer-row')!;
    this.canvasEl = rootEl.querySelector('canvas')!;
  }

  // use in react functional components
  initRoot(rootEl: HTMLElement) {
    this.rootEl = rootEl;
  }

  initMask(el: HTMLElement) {
    this.maskEl = el;
  }

  initCanvas(el: HTMLCanvasElement) {
    this.canvasEl = el;
  }

  initColResizer(el: HTMLElement) {
    this.colResizer = el;
  }

  initRowResizer(el: HTMLElement) {
    this.rowResizer = el;
  }
}
