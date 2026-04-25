import React, { useLayoutEffect, useRef } from 'react';
import { Data, DatasheetConfig } from '@lyra-sheet/core';
import { LyraSheetVanilla } from '@lyra-sheet/vanilla';

export interface LyraSheetReactProps {
  data: Data;
  config: DatasheetConfig;
  onDataChange?: (data: Data) => void;
}

export function LyraSheet({
  data,
  config,
  onDataChange,
}: LyraSheetReactProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<LyraSheetVanilla | null>(null);
  const initialOptionsRef = useRef({ data, config, onDataChange });

  useLayoutEffect(() => {
    if (!hostRef.current) {
      return undefined;
    }
    sheetRef.current = new LyraSheetVanilla(initialOptionsRef.current);
    sheetRef.current.mount(hostRef.current);

    return () => {
      sheetRef.current?.destroy();
      sheetRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    sheetRef.current?.update({ data, config, onDataChange });
  }, [data, config, onDataChange]);

  return <div ref={hostRef} />;
}

export default LyraSheet;
