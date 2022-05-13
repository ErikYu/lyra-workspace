import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { LyraSheetComponent } from './lyra-sheet.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { EditorComponent } from './components/editor/editor.component';
import { ToolbarItemComponent } from './components/toolbar-item/toolbar-item.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { ScrollbarVComponent } from './components/scrollbar-v/scrollbar-v.component';
import { ScrollbarHComponent } from './components/scrollbar-h/scrollbar-h.component';
import { MaskerComponent } from './components/masker/masker.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { MergeDropdownComponent } from './components/toolbar/actions/merge-dropdown/merge-dropdown.component';
import { BgColorDropdownComponent } from './components/toolbar/actions/bg-color-dropdown/bg-color-dropdown.component';
import { ColorPaletteComponent } from './components/color-palette/color-palette.component';
import { AlignDropdownComponent } from './components/toolbar/actions/align-dropdown/align-dropdown.component';
import { ValignDropdownComponent } from './components/toolbar/actions/valign-dropdown/valign-dropdown.component';
import { BorderDropdownComponent } from './components/toolbar/actions/border-dropdown/border-dropdown.component';
import { TextWrapDropdownComponent } from './components/toolbar/actions/text-wrap-dropdown/text-wrap-dropdown.component';
import { DividerComponent } from './components/divider/divider.component';
import { FormatDropdownComponent } from './components/toolbar/actions/format-dropdown/format-dropdown.component';
import { DropdownBarComponent } from './components/dropdown/dropdown-bar/dropdown-bar.component';
import { ResizerColComponent } from './components/resizer-col/resizer-col.component';
import { ResizerRowComponent } from './components/resizer-row/resizer-row.component';
import { RedoActionComponent } from './components/toolbar/actions/redo-action/redo-action.component';
import { UndoActionComponent } from './components/toolbar/actions/undo-action/undo-action.component';
import { RichTextInputComponent } from './components/rich-text-input/rich-text-input.component';
import { BoldActionComponent } from './components/toolbar/actions/bold-action/bold-action.component';
import { ItalicActionComponent } from './components/toolbar/actions/italic-action/italic-action.component';
import { StrikeActionComponent } from './components/toolbar/actions/strike-action/strike-action.component';
import { UnderlineActionComponent } from './components/toolbar/actions/underline-action/underline-action.component';
import { FontSizeDropdownComponent } from './components/toolbar/actions/font-size-dropdown/font-size-dropdown.component';
import { FontFamilyDropdownComponent } from './components/toolbar/actions/font-family-dropdown/font-family-dropdown.component';
import { FontColorDropdownComponent } from './components/toolbar/actions/font-color-dropdown/font-color-dropdown.component';
import { DecimalActionComponent } from './components/toolbar/actions/decimal-action/decimal-action.component';
import { PercentActionComponent } from './components/toolbar/actions/percent-action/percent-action.component';
import { CurrencyActionComponent } from './components/toolbar/actions/currency-action/currency-action.component';
import { FormulaBarComponent } from './components/formula-bar/formula-bar.component';
import { ContextmenuComponent } from './components/contextmenu/contextmenu.component';
import { SelectorContainerComponent } from './components/selector-container/selector-container.component';
import { FormulaDropdownComponent } from './components/toolbar/actions/formula-dropdown/formula-dropdown.component';

@NgModule({
  declarations: [
    LyraSheetComponent,
    ToolbarComponent,
    EditorComponent,
    ToolbarItemComponent,
    TabsComponent,
    ScrollbarVComponent,
    ScrollbarHComponent,
    MaskerComponent,
    DropdownComponent,
    MergeDropdownComponent,
    BgColorDropdownComponent,
    ColorPaletteComponent,
    AlignDropdownComponent,
    ValignDropdownComponent,
    BorderDropdownComponent,
    TextWrapDropdownComponent,
    DividerComponent,
    FormatDropdownComponent,
    DropdownBarComponent,
    ResizerColComponent,
    ResizerRowComponent,
    RedoActionComponent,
    UndoActionComponent,
    RichTextInputComponent,
    BoldActionComponent,
    ItalicActionComponent,
    StrikeActionComponent,
    UnderlineActionComponent,
    FontSizeDropdownComponent,
    FontFamilyDropdownComponent,
    FontColorDropdownComponent,
    DecimalActionComponent,
    PercentActionComponent,
    CurrencyActionComponent,
    FormulaBarComponent,
    ContextmenuComponent,
    SelectorContainerComponent,
    FormulaDropdownComponent,
  ],
  imports: [CommonModule, OverlayModule],
  exports: [LyraSheetComponent],
})
export class LyraSheetModule {}
