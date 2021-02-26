import { NgModule } from '@angular/core';
import { NgxDatasheetComponent } from './ngx-datasheet.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { EditorComponent } from './components/editor/editor.component';
import { ToolbarItemComponent } from './components/toolbar-item/toolbar-item.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { CommonModule } from '@angular/common';
import { ScrollbarVComponent } from './components/scrollbar-v/scrollbar-v.component';
import { ScrollbarHComponent } from './components/scrollbar-h/scrollbar-h.component';
import { MaskerComponent } from './components/masker/masker.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { MergeDropdownComponent } from './components/toolbar/actions/merge-dropdown/merge-dropdown.component';
import { BgColorDropdownComponent } from './components/toolbar/actions/bg-color-dropdown/bg-color-dropdown.component';
import { PopupDirective } from './directives/popup/popup.directive';
import { ColorPaletteComponent } from './components/color-palette/color-palette.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { AlignDropdownComponent } from './components/toolbar/actions/align-dropdown/align-dropdown.component';
import { ValignDropdownComponent } from './components/toolbar/actions/valign-dropdown/valign-dropdown.component';
import { BorderDropdownComponent } from './components/toolbar/actions/border-dropdown/border-dropdown.component';
import { TextWrapDropdownComponent } from './components/toolbar/actions/text-wrap-dropdown/text-wrap-dropdown.component';
import { DividerComponent } from './components/divider/divider.component';

@NgModule({
  declarations: [
    NgxDatasheetComponent,
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
    PopupDirective,
    ColorPaletteComponent,
    AlignDropdownComponent,
    ValignDropdownComponent,
    BorderDropdownComponent,
    TextWrapDropdownComponent,
    DividerComponent,
  ],
  imports: [CommonModule, OverlayModule],
  exports: [NgxDatasheetComponent],
})
export class NgxDatasheetModule {}
