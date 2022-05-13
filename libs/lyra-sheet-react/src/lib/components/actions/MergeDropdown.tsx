import { ReactComponent as Merge } from '../../icons/merge-cells.svg';
import { ReactComponent as Split } from '../../icons/split-cells.svg';
import { useEffect, useState } from 'react';
import { useLyraSheetCore } from '../../container-context';
import { MergeController } from '@lyra-sheet/core';

export function LyraSheetMergeDropdown() {
  const controller = useLyraSheetCore(MergeController);
  const [hasMerge, setHasMerge] = useState(false);

  useEffect(() => {
    controller.hasMerge$.subscribe((res) => setHasMerge(res));
    controller.onInit();
  });

  function applyMerge() {
    controller.applyMerge();
  }

  return (
    <div
      className={'lyra-sheet-toolbar-item lyra-sheet-dropdown merge'}
      onClick={applyMerge}
    >
      {hasMerge ? <Split></Split> : <Merge></Merge>}
    </div>
  );
}
