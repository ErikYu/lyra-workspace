import { useLayoutEffect, useRef, useState } from 'react';
import { useLyraSheetCore } from '../container-context';
import { ContextMenuController, ContextMenus } from '@lyra-sheet/core';
import { LyraSheetDivider } from './Divider';
import { LyraSheetDropdownBar } from './DropdownBar';

export function LyraSheetContextMenu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const contextMenuController = useLyraSheetCore(ContextMenuController);

  const [menus, setMenus] = useState<ContextMenus>([]);
  const [activatedSubMenus, setActivatedSubMenus] = useState<ContextMenus>([]);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [offsetTop, setOffsetTop] = useState(0);

  useLayoutEffect(() => {
    contextMenuController.mount(menuRef.current!);
    contextMenuController.onInit();
    contextMenuController.menus$.subscribe((res) => setMenus(res));
    contextMenuController.activatedSubMenus$.subscribe((res) =>
      setActivatedSubMenus(res),
    );
    contextMenuController.offsetTop$.subscribe((res) => setOffsetTop(res));
    contextMenuController.offsetLeft$.subscribe((res) => setOffsetLeft(res));
  }, []);

  return (
    <div className={'lyra-sheet-contextmenu'} ref={menuRef}>
      <div className={'lyra-sheet-contextmenu-tree'}>
        {menus.map((m) => {
          if (m === 'DIVIDER') {
            return (
              <LyraSheetDivider direction={'horizontal'}></LyraSheetDivider>
            );
          } else if (m.action) {
            return (
              <LyraSheetDropdownBar
                desc={m.desc || ' '}
                onMouseEnter={(evt) =>
                  contextMenuController.showSubMenus(evt as any)
                }
                onClick={m.action}
              >
                {m.label}
              </LyraSheetDropdownBar>
            );
          } else {
            return (
              <LyraSheetDropdownBar
                desc={'>'}
                onMouseEnter={(evt) =>
                  contextMenuController.showSubMenus(evt as any, m.children!)
                }
              >
                {m.label}
              </LyraSheetDropdownBar>
            );
          }
        })}
      </div>
      <div
        className={'lyra-sheet-contextmenu-tree'}
        style={{
          transform: 'translate(' + offsetLeft + 'px,' + offsetTop + 'px)',
        }}
      >
        {activatedSubMenus.map((subMenu) =>
          subMenu !== 'DIVIDER' && subMenu.action ? (
            <LyraSheetDropdownBar
              onClick={subMenu.action}
              desc={subMenu.desc || ' '}
            >
              {subMenu.label}
            </LyraSheetDropdownBar>
          ) : null,
        )}
      </div>
    </div>
  );
}
