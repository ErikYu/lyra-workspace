import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { EditorController, DataService } from '@lyra-sheet/core';
import { BaseContainer } from '../../services/_base_container';

@Component({
  selector: 'lyra-sheet-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  host: { class: 'lyra-sheet-editor' },
})
export class EditorComponent implements OnInit, AfterViewInit {
  public dataService: DataService;
  private editorController: EditorController;

  constructor(
    private el: ElementRef<HTMLElement>,
    private container: BaseContainer,
  ) {
    this.dataService = this.container.dataService;
    this.editorController = container.editorController;
    this.editorController.mountDom(el.nativeElement);
  }

  ngOnInit(): void {
    this.editorController.onInit();
  }

  ngAfterViewInit(): void {
    this.editorController.afterViewInit();
  }
}
