import { useLyraSheetCore } from '../container-context';
import {
  DecimalController,
  HistoryService,
  ToolbarController,
} from '@lyra-sheet/core';
import { ReactComponent as AddDecimal } from '../icons/add-decimal.svg';
import { ReactComponent as ReduceDecimal } from '../icons/reduce-decimal.svg';
import { ReactComponent as Undo } from '../icons/undo.svg';
import { ReactComponent as Redo } from '../icons/redo.svg';
import { LyraSheetDivider } from './Divider';
import { LyraSheetFormatDropdown } from './actions/FormatDropdown';
import { LyraSheetFontFamilyDropdown } from './actions/FontFamilyDropdown';
import { LyraSheetFontSizeDropdown } from './actions/FontSizeDropdown';
import { LyraSheetBoldAction } from './actions/BoldAction';
import { LyraSheetItalicAction } from './actions/ItalicAction';
import { LyraSheetUnderlineAction } from './actions/UnderlineAction';
import { LyraSheetStrikeAction } from './actions/StrikeAction';
import { LyraSheetFontColorDropdown } from './actions/FontColorDropdown';
import { LyraSheetBgColorDropdown } from './actions/BgColorDropdown';
import { LyraSheetBorderDropdown } from './actions/BorderDropdown';
import { LyraSheetMergeDropdown } from './actions/MergeDropdown';
import { LyraSheetAlignDropdown } from './actions/AlignDropdown';
import { LyraSheetValignDropdown } from './actions/ValignDropdown';
import { LyraSheetFormulaDropdown } from './actions/FormulaDropdown';

export function LyraSheetToolbar() {
  const decimalController = useLyraSheetCore(DecimalController);
  const toolbarController = useLyraSheetCore(ToolbarController);
  const historyService = useLyraSheetCore(HistoryService);

  return (
    <div className={'lyra-sheet-toolbar'}>
      <div
        className={'lyra-sheet-toolbar-item'}
        onClick={() => historyService.undo()}
      >
        <Undo className={'lyra-sheet-toolbar-icon'} />
      </div>
      <div
        className={'lyra-sheet-toolbar-item'}
        onClick={() => historyService.redo()}
      >
        <Redo className={'lyra-sheet-toolbar-icon'} />
      </div>
      <LyraSheetDivider direction={'vertical'}></LyraSheetDivider>
      <div
        className={'lyra-sheet-toolbar-item'}
        onClick={() => toolbarController.applyPercentage()}
      >
        <div style={{ textAlign: 'center' }}>%</div>
      </div>
      <div
        className={'lyra-sheet-toolbar-item'}
        onClick={() => toolbarController.applyCurrency()}
      >
        <div style={{ textAlign: 'center' }}>$</div>
      </div>
      <div
        className={'lyra-sheet-toolbar-item'}
        onClick={() => decimalController.execute('reduce')}
      >
        <ReduceDecimal className={'lyra-sheet-toolbar-icon'} />
      </div>
      <div
        className={'lyra-sheet-toolbar-item'}
        onClick={() => decimalController.execute('add')}
      >
        <AddDecimal className={'lyra-sheet-toolbar-icon'} />
      </div>

      <LyraSheetFormatDropdown></LyraSheetFormatDropdown>
      <LyraSheetDivider direction={'vertical'}></LyraSheetDivider>
      <LyraSheetFontFamilyDropdown></LyraSheetFontFamilyDropdown>
      <LyraSheetDivider direction={'vertical'}></LyraSheetDivider>
      <LyraSheetFontSizeDropdown></LyraSheetFontSizeDropdown>
      <LyraSheetDivider direction={'vertical'}></LyraSheetDivider>
      <LyraSheetBoldAction></LyraSheetBoldAction>
      <LyraSheetItalicAction></LyraSheetItalicAction>
      <LyraSheetStrikeAction></LyraSheetStrikeAction>
      <LyraSheetUnderlineAction></LyraSheetUnderlineAction>
      <LyraSheetFontColorDropdown></LyraSheetFontColorDropdown>
      <LyraSheetDivider direction={'vertical'}></LyraSheetDivider>
      <LyraSheetBgColorDropdown></LyraSheetBgColorDropdown>
      <LyraSheetBorderDropdown></LyraSheetBorderDropdown>
      <LyraSheetMergeDropdown></LyraSheetMergeDropdown>
      <LyraSheetDivider direction={'vertical'}></LyraSheetDivider>
      <LyraSheetAlignDropdown></LyraSheetAlignDropdown>
      <LyraSheetValignDropdown></LyraSheetValignDropdown>
      <LyraSheetDivider direction={'vertical'}></LyraSheetDivider>
      <LyraSheetFormulaDropdown></LyraSheetFormulaDropdown>
    </div>
  );
}
