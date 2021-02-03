import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[ndPopup]',
})
export class PopupDirective {
  @Input() ndPopup!: TemplateRef<void>;
  constructor(
    private el: ElementRef<HTMLDivElement>,
    private renderer: Renderer2,
    private viewContainer: ViewContainerRef,
  ) {}

  @HostListener('click')
  onClick(): void {
    console.log(this.el);
    this.viewContainer.createEmbeddedView(this.ndPopup);
  }
}
