import * as Y from 'yjs';
import { Data } from '../types';
import {
  applyWorkbookDiff,
  getOrCreateWorkbookRoot,
  importWorkbookFromYjs,
  LYRA_LOCAL_HISTORY_ORIGIN,
  LYRA_REMOTE_ORIGIN,
  writeFullWorkbook,
} from '../crdt/yjs-workbook';
import { DataService } from './data.service';
import { Lifecycle, scoped } from 'tsyringe';

export { LYRA_LOCAL_HISTORY_ORIGIN, LYRA_REMOTE_ORIGIN } from '../crdt/yjs-workbook';

interface StackOption {
  si?: number;
  ci?: number;
  ri?: number;
}

function cloneData(d: Data): Data {
  return JSON.parse(JSON.stringify(d));
}

@scoped(Lifecycle.ContainerScoped)
export class HistoryService {
  private doc!: Y.Doc;
  private yRoot!: Y.Map<unknown>;
  private undoManager!: Y.UndoManager;
  private lastExported!: Data;
  private unsubUpdate?: () => void;

  constructor(private dataService: DataService) {}

  get yDoc(): Y.Doc {
    return this.doc;
  }

  get canUndo(): boolean {
    return this.undoManager.canUndo();
  }

  get canRedo(): boolean {
    return this.undoManager.canRedo();
  }

  /** Call once when the workbook instance is created. */
  init(d: Data): void {
    if (this.unsubUpdate) {
      this.unsubUpdate();
      this.unsubUpdate = undefined;
    }
    this.doc = new Y.Doc();
    this.yRoot = getOrCreateWorkbookRoot(this.doc);
    writeFullWorkbook(this.yRoot, d);
    this.lastExported = cloneData(d);
    this.undoManager = new Y.UndoManager([this.yRoot], {
      trackedOrigins: new Set([LYRA_LOCAL_HISTORY_ORIGIN]),
    });

    const onUpdate = (_u: Uint8Array, origin: unknown) => {
      if (origin !== LYRA_REMOTE_ORIGIN) {
        return;
      }
      const next = importWorkbookFromYjs(this.yRoot);
      this.lastExported = cloneData(next);
      this.dataService.loadData(next);
      this.dataService.rerender();
      this.dataService.notifyDataChange();
    };
    this.doc.on('update', onUpdate);
    this.unsubUpdate = () => {
      this.doc.off('update', onUpdate);
    };
  }

  /**
   * Runs a mutating `op` on `DataService`, then records a fine-grained Yjs diff
   * (not a full snapshot) for undo/redo and for merging with peers.
   */
  stacked(op: () => void, _option?: StackOption): void {
    op();
    this.doc.transact(() => {
      const next = this.dataService.snapshot;
      applyWorkbookDiff(this.yRoot, this.lastExported, next);
      this.lastExported = cloneData(next);
    }, LYRA_LOCAL_HISTORY_ORIGIN);
    this.dataService.notifyDataChange();
  }

  undo(): void {
    if (!this.canUndo) {
      return;
    }
    this.undoManager.undo();
    this.applyImportedToData();
  }

  redo(): void {
    if (!this.canRedo) {
      return;
    }
    this.undoManager.redo();
    this.applyImportedToData();
  }

  /** Apply an update produced by another peer (`encodeStateAsUpdateFrom`, etc.). */
  applyRemoteUpdate(update: Uint8Array): void {
    Y.applyUpdate(this.doc, update, LYRA_REMOTE_ORIGIN);
  }

  getStateVector(): Uint8Array {
    return Y.encodeStateVector(this.doc);
  }

  encodeStateAsUpdate(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  encodeStateAsUpdateFrom(stateVector: Uint8Array): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc, stateVector);
  }

  private applyImportedToData(): void {
    const next = importWorkbookFromYjs(this.yRoot);
    this.lastExported = cloneData(next);
    this.dataService.loadData(next);
    this.dataService.rerender();
    this.dataService.notifyDataChange();
  }
}
