import { LyraSheetToolbar } from './components/Toolbar';
import React, { ReactNode, useLayoutEffect, useMemo, useRef } from 'react';
import {
  cloneDeep,
  ConfigService,
  Data,
  DataService,
  DatasheetConfig,
  ElementRefService,
  HistoryService,
  ViewRangeService,
} from '@lyra-sheet/core';
import {
  createLyraSheetContainer,
  LyraSheetContainerProvider,
  useLyraSheetCore,
} from './container-context';
import { LyraSheetEditor } from './components/Editor';
import { LyraSheetFormulaBar } from './components/FormulaBar';

export interface LyraSheetReactProps {
  data: Data;
  config: DatasheetConfig;
  onDataChange?: (data: Data) => void;
  children?: ReactNode;
}

function LyraSheetContent({
  data,
  config,
  onDataChange,
  children,
}: LyraSheetReactProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const elementRefService = useLyraSheetCore(ElementRefService);
  const configService = useLyraSheetCore(ConfigService);
  const dataService = useLyraSheetCore(DataService);
  const historyService = useLyraSheetCore(HistoryService);
  const viewRangeService = useLyraSheetCore(ViewRangeService);

  useLayoutEffect(() => {
    configService.setConfig(config);
    const initialData = cloneDeep(data);
    dataService.loadData(initialData);
    historyService.init(initialData);
  }, [config, configService, data, dataService, historyService]);

  useLayoutEffect(() => {
    if (rootRef.current) {
      elementRefService.initRoot(rootRef.current);
    }
    viewRangeService.init();
  }, [elementRefService, viewRangeService]);

  useLayoutEffect(() => {
    const subscription = dataService.dataChanged$.subscribe((nextData) => {
      onDataChange?.(nextData);
    });
    return () => subscription.unsubscribe();
  }, [dataService, onDataChange]);

  return (
    <div className={'lyra-sheet'} ref={rootRef}>
      <LyraSheetToolbar></LyraSheetToolbar>
      <LyraSheetFormulaBar></LyraSheetFormulaBar>
      <LyraSheetEditor></LyraSheetEditor>
      {children}
    </div>
  );
}

export function LyraSheet(props: LyraSheetReactProps) {
  const scopedContainer = useMemo(() => createLyraSheetContainer(), []);

  return (
    <LyraSheetContainerProvider value={scopedContainer}>
      <LyraSheetContent {...props} />
    </LyraSheetContainerProvider>
  );
}

export default LyraSheet;
