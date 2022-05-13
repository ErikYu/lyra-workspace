import { LyraSheetToolbar } from './components/Toolbar';
import React, { useLayoutEffect, useRef } from 'react';
import './container-context';
import {
  cloneDeep,
  ConfigService,
  Data,
  DataService,
  DatasheetConfig,
  ElementRefService,
  HistoryService,
  KeyboardEventService,
  MouseEventService,
  ViewRangeService,
} from '@lyra-sheet/core';
import { useLyraSheetCore } from './container-context';
import { LyraSheetEditor } from './components/Editor';
import { LyraSheetFormulaBar } from './components/FormulaBar';

export interface LyraSheetReactProps {
  data: Data;
  config: DatasheetConfig;
}

export function LyraSheet({ data, config }: LyraSheetReactProps) {
  const rootRef = useRef(null);
  const elementRefService = useLyraSheetCore(ElementRefService);
  const configService = useLyraSheetCore(ConfigService);
  const dataService = useLyraSheetCore(DataService);
  const historyService = useLyraSheetCore(HistoryService);
  const viewRangeService = useLyraSheetCore(ViewRangeService);

  configService.setConfig(config);
  const initialData = cloneDeep(data);
  dataService.loadData(initialData);
  historyService.init(initialData);

  useLayoutEffect(() => {
    elementRefService.initRoot(rootRef.current!);
    viewRangeService.init();
  }, []);
  return (
    <div className={'lyra-sheet'} ref={rootRef}>
      <LyraSheetToolbar></LyraSheetToolbar>
      <LyraSheetFormulaBar></LyraSheetFormulaBar>
      <LyraSheetEditor></LyraSheetEditor>
    </div>
  );
}

export default LyraSheet;
