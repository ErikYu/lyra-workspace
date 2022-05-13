import { Lifecycle, scoped } from 'tsyringe';
import { IController } from './controller.interface';

@scoped(Lifecycle.ContainerScoped)
export class RootController implements IController {
  el!: HTMLElement;
  constructor() {}

  mount(el: HTMLElement) {
    this.el = el;
  }
}
