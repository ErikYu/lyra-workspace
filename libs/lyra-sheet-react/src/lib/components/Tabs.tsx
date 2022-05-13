import { useLayoutEffect, useRef, useState } from 'react';
import { DataService, SheetService, TabsController } from '@lyra-sheet/core';
import { useLyraSheetCore } from '../container-context';

export function LyraSheetTabs() {
  const tabsController = useLyraSheetCore(TabsController);
  const dataService = useLyraSheetCore(DataService);

  const inputRef = useRef<HTMLInputElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tabs, setTabs] = useState<SheetService[]>(dataService.sheets);

  useLayoutEffect(() => {
    tabsController.editingIndex$.subscribe((res) => {
      setEditingIndex(res);
      setTimeout(() => inputRef.current?.select());
    });
    tabsController.tabs$.subscribe((res) => setTabs([...res]));
  }, []);

  const dbClick = (i: number) => {
    tabsController.editSheetName(i);
  };

  return (
    <div className={'lyra-sheet-tabs'}>
      {tabs.map((sheet, i) => (
        <div
          key={i}
          className={`lyra-sheet-tab ${sheet.selected ? 'selected' : ''}`}
          onClick={() => tabsController.selectSheet(i)}
          onDoubleClick={() => dbClick(i)}
        >
          {i === editingIndex ? (
            <input
              ref={inputRef}
              className={'name-input'}
              type="text"
              defaultValue={sheet.name}
              onKeyDown={(evt) =>
                evt.key === 'Enter' && tabsController.triggerBlur(evt as any)
              }
              onBlur={(evt) => tabsController.updateSheetName(evt as any, i)}
            />
          ) : (
            <span>{sheet.name}</span>
          )}
        </div>
      ))}

      <div
        className={'lyra-sheet-tab'}
        onClick={() => tabsController.addSheet()}
      >
        +
      </div>
    </div>
  );
}
