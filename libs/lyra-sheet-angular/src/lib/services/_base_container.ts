import { Injectable } from '@angular/core';
import { container, DependencyContainer, InjectionToken } from 'tsyringe';
import {
  AutofillService,
  CanvasService,
  ConfigService,
  ContextmenuService,
  DataService,
  ExecCommandService,
  FormulaEditService,
  FocusedStyleService,
  FormulaRenderService,
  HistoryService,
  LineWrapService,
  KeyboardEventService,
  MouseEventService,
  ResizerService,
  RenderProxyService,
  RichTextToHtmlService,
  ScrollingService,
  TextInputService,
  ViewRangeService,
  ElementRefService,
  EditorService,
  createCore,
  FormatController,
  EditorController,
  ContextMenuController,
  TabsController,
  RichTextInputController,
  FormulaBarController,
  FontFamilyController,
  FontSizeController,
  FontBoldController,
  FontStrikeController,
  FontUnderlineController,
  FontItalicController,
  FontColorController,
  BgColorController,
  BorderController,
  MergeController,
  AlignController,
  ValignController,
  FormulaController,
} from '@lyra-sheet/core';

@Injectable()
export class BaseContainer {
  // controllers
  formatController: FormatController;
  editorController: EditorController;
  contextMenuController: ContextMenuController;
  tabsController: TabsController;
  richTextInputController: RichTextInputController;
  formulaBarController: FormulaBarController;
  fontFamilyController: FontFamilyController;
  fontSizeController: FontSizeController;
  fontBoldController: FontBoldController;
  fontItalicController: FontItalicController;
  fontStrikeController: FontStrikeController;
  fontUnderlineController: FontUnderlineController;
  fontColorController: FontColorController;
  bgColorController: BgColorController;
  borderController: BorderController;
  mergeController: MergeController;
  alignController: AlignController;
  valignController: ValignController;
  formulaController: FormulaController;

  autofillService: AutofillService;
  canvasService: CanvasService;
  configService: ConfigService;
  contextmenuService: ContextmenuService;
  dataService: DataService;
  execCommandService: ExecCommandService;
  elementRefService: ElementRefService;
  formulaEditService: FormulaEditService;
  focusedStyleService: FocusedStyleService;
  formulaRenderService: FormulaRenderService;
  historyService: HistoryService;
  lineWrapService: LineWrapService;
  keyboardEventService: KeyboardEventService;
  mouseEventService: MouseEventService;
  resizerService: ResizerService;
  renderProxyService: RenderProxyService;
  richTextToHtmlService: RichTextToHtmlService;
  scrollingService: ScrollingService;
  textInputService: TextInputService;
  viewRangeService: ViewRangeService;
  editorService: EditorService;

  private dc: DependencyContainer;
  constructor() {
    createCore();
    this.dc = container.createChildContainer();

    this.formatController = this.resolve(FormatController);
    this.editorController = this.resolve(EditorController);
    this.contextMenuController = this.resolve(ContextMenuController);
    this.tabsController = this.resolve(TabsController);
    this.richTextInputController = this.resolve(RichTextInputController);
    this.formulaBarController = this.resolve(FormulaBarController);
    this.fontFamilyController = this.resolve(FontFamilyController);
    this.fontSizeController = this.resolve(FontSizeController);
    this.fontBoldController = this.resolve(FontBoldController);
    this.fontItalicController = this.resolve(FontItalicController);
    this.fontStrikeController = this.resolve(FontStrikeController);
    this.fontUnderlineController = this.resolve(FontUnderlineController);
    this.fontColorController = this.resolve(FontColorController);
    this.bgColorController = this.resolve(BgColorController);
    this.borderController = this.resolve(BorderController);
    this.mergeController = this.resolve(MergeController);
    this.alignController = this.resolve(AlignController);
    this.valignController = this.resolve(ValignController);
    this.formulaController = this.resolve(FormulaController);

    this.autofillService = this.resolve(AutofillService);
    this.canvasService = this.resolve(CanvasService);
    this.configService = this.resolve(ConfigService);
    this.contextmenuService = this.resolve(ContextmenuService);
    this.dataService = this.resolve(DataService);
    this.execCommandService = this.resolve(ExecCommandService);
    this.elementRefService = this.resolve(ElementRefService);
    this.formulaEditService = this.resolve(FormulaEditService);
    this.focusedStyleService = this.resolve(FocusedStyleService);
    this.formulaRenderService = this.resolve(FormulaRenderService);
    this.historyService = this.resolve(HistoryService);
    this.lineWrapService = this.resolve(LineWrapService);
    this.keyboardEventService = this.resolve(KeyboardEventService);
    this.mouseEventService = this.resolve(MouseEventService);
    this.resizerService = this.resolve(ResizerService);
    this.renderProxyService = this.resolve(RenderProxyService);
    this.richTextToHtmlService = this.resolve(RichTextToHtmlService);
    this.scrollingService = this.resolve(ScrollingService);
    this.textInputService = this.resolve(TextInputService);
    this.viewRangeService = this.resolve(ViewRangeService);
    this.editorService = this.resolve(EditorService);
  }

  resolve<T>(token: InjectionToken<T>) {
    return this.dc.resolve(token);
  }
}
