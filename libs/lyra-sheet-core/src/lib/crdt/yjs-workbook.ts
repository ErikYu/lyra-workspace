import * as Y from 'yjs';
import type { CellData, Data, Sheet, SheetData } from '../types';

/** Passed to `doc.transact` for edits that should participate in local undo/redo. */
export const LYRA_LOCAL_HISTORY_ORIGIN = 'lyra-local-history';

/** Passed to `Y.applyUpdate` for peers / server merges (not undone by local Undo). */
export const LYRA_REMOTE_ORIGIN = 'lyra-remote';

const ROOT_KEY = 'lyra-workbook';

export function getOrCreateWorkbookRoot(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap(ROOT_KEY);
}

function deleteSheetKeys(root: Y.Map<unknown>, si: number): void {
  const prefixSheet = `sheet:${si}:`;
  const prefixCell = `cell:${si}:`;
  const prefixRowh = `rowh:${si}:`;
  const prefixColw = `colw:${si}:`;
  const toDelete: string[] = [];
  root.forEach((_, k) => {
    if (
      k.startsWith(prefixSheet) ||
      k.startsWith(prefixCell) ||
      k.startsWith(prefixRowh) ||
      k.startsWith(prefixColw)
    ) {
      toDelete.push(k);
    }
  });
  for (const k of toDelete) {
    root.delete(k);
  }
}

function sheetIndicesFromRoot(root: Y.Map<unknown>): number[] {
  const found = new Set<number>();
  root.forEach((_, k) => {
    const m = /^sheet:(\d+):name$/.exec(k);
    if (m) {
      found.add(+m[1]);
    }
  });
  return [...found].sort((a, b) => a - b);
}

function writeFullSheet(root: Y.Map<unknown>, si: number, sheet: Sheet): void {
  root.set(`sheet:${si}:name`, sheet.name);
  root.set(`sheet:${si}:rowCount`, sheet.data.rowCount);
  root.set(`sheet:${si}:colCount`, sheet.data.colCount);
  root.set(`sheet:${si}:merges`, JSON.stringify(sheet.data.merges));

  for (const rStr of Object.keys(sheet.data.rows)) {
    const r = +rStr;
    const row = sheet.data.rows[r];
    if (row.height != null) {
      root.set(`rowh:${si}:${r}`, row.height);
    }
    for (const cStr of Object.keys(row.cells || {})) {
      const c = +cStr;
      const cell = row.cells[c];
      if (cell != null && Object.keys(cell as object).length > 0) {
        root.set(`cell:${si}:${r}:${c}`, JSON.stringify(cell));
      }
    }
  }

  for (const cStr of Object.keys(sheet.data.cols || {})) {
    const c = +cStr;
    root.set(`colw:${si}:${c}`, sheet.data.cols[c].width);
  }
}

/** Replace all keys in `root` with `data` (used on init). */
export function writeFullWorkbook(root: Y.Map<unknown>, data: Data): void {
  for (const k of [...root.keys()]) {
    root.delete(k);
  }
  const sel = data.sheets.findIndex((s) => s.selected);
  root.set('meta:selectedSheet', String(sel < 0 ? 0 : sel));
  data.sheets.forEach((sheet, si) => {
    writeFullSheet(root, si, sheet);
  });
}

function importSheetFromYjs(root: Y.Map<unknown>, si: number): Sheet {
  const name = (root.get(`sheet:${si}:name`) as string) ?? `Sheet ${si}`;
  const rowCount = Number(root.get(`sheet:${si}:rowCount`));
  const colCount = Number(root.get(`sheet:${si}:colCount`));
  const mergesRaw = root.get(`sheet:${si}:merges`) as string | undefined;
  const merges = mergesRaw ? (JSON.parse(mergesRaw) as SheetData['merges']) : [];

  const rows: SheetData['rows'] = {};
  const cols: SheetData['cols'] = {};

  root.forEach((val, key) => {
    if (key.startsWith(`cell:${si}:`)) {
      const parts = key.split(':');
      const r = +parts[2];
      const c = +parts[3];
      if (!rows[r]) {
        rows[r] = { cells: {} };
      }
      rows[r].cells[c] = JSON.parse(val as string) as CellData;
    } else if (key.startsWith(`rowh:${si}:`)) {
      const r = +key.split(':')[2];
      if (!rows[r]) {
        rows[r] = { cells: {} };
      }
      rows[r].height = val as number;
    } else if (key.startsWith(`colw:${si}:`)) {
      const c = +key.split(':')[2];
      cols[c] = { width: val as number };
    }
  });

  return {
    name,
    data: {
      merges,
      rows,
      cols,
      rowCount: Number.isFinite(rowCount) ? rowCount : 100,
      colCount: Number.isFinite(colCount) ? colCount : 26,
    },
  };
}

/** Build `Data` from the collaborative map (e.g. after remote merge or undo). */
export function importWorkbookFromYjs(root: Y.Map<unknown>): Data {
  const indices = sheetIndicesFromRoot(root);
  const selectedRaw = Number(root.get('meta:selectedSheet') ?? 0);
  const selectedIdx =
    indices.length === 0
      ? 0
      : Math.max(0, Math.min(indices.length - 1, selectedRaw));

  const sheets = indices.map((si, idx) => {
    const sh = importSheetFromYjs(root, si);
    sh.selected = idx === selectedIdx;
    return sh;
  });

  return { sheets };
}

function cellJson(cell: CellData | undefined): string {
  if (cell == null || Object.keys(cell as object).length === 0) {
    return '';
  }
  return JSON.stringify(cell);
}

function collectCellCoords(sheet: Sheet): Set<string> {
  const s = new Set<string>();
  for (const rStr of Object.keys(sheet.data.rows)) {
    const r = +rStr;
    for (const cStr of Object.keys(sheet.data.rows[r].cells || {})) {
      const c = +cStr;
      s.add(`${r}:${c}`);
    }
  }
  return s;
}

function collectRowIndicesWithHeight(sheet: Sheet): Set<number> {
  const s = new Set<number>();
  for (const rStr of Object.keys(sheet.data.rows)) {
    const r = +rStr;
    if (sheet.data.rows[r].height != null) {
      s.add(r);
    }
  }
  return s;
}

function collectColIndicesWithWidth(sheet: Sheet): Set<number> {
  return new Set(Object.keys(sheet.data.cols || {}).map((c) => +c));
}

function diffSheet(root: Y.Map<unknown>, si: number, p: Sheet, n: Sheet): void {
  if (p.name !== n.name) {
    root.set(`sheet:${si}:name`, n.name);
  }
  if (p.data.rowCount !== n.data.rowCount) {
    root.set(`sheet:${si}:rowCount`, n.data.rowCount);
  }
  if (p.data.colCount !== n.data.colCount) {
    root.set(`sheet:${si}:colCount`, n.data.colCount);
  }
  if (JSON.stringify(p.data.merges) !== JSON.stringify(n.data.merges)) {
    root.set(`sheet:${si}:merges`, JSON.stringify(n.data.merges));
  }

  const coords = collectCellCoords(p);
  for (const rc of collectCellCoords(n)) {
    coords.add(rc);
  }

  for (const rc of coords) {
    const [rs, cs] = rc.split(':');
    const r = +rs;
    const c = +cs;
    const pk = cellJson(p.data.rows[r]?.cells?.[c]);
    const nk = cellJson(n.data.rows[r]?.cells?.[c]);
    if (pk === nk) {
      continue;
    }
    const yKey = `cell:${si}:${r}:${c}`;
    if (nk === '') {
      root.delete(yKey);
    } else {
      root.set(yKey, nk);
    }
  }

  const rowH = collectRowIndicesWithHeight(p);
  for (const r of collectRowIndicesWithHeight(n)) {
    rowH.add(r);
  }
  for (const r of rowH) {
    const ph = p.data.rows[r]?.height;
    const nh = n.data.rows[r]?.height;
    const yKey = `rowh:${si}:${r}`;
    if (ph === nh) {
      continue;
    }
    if (nh == null) {
      root.delete(yKey);
    } else {
      root.set(yKey, nh);
    }
  }

  const colW = collectColIndicesWithWidth(p);
  for (const c of collectColIndicesWithWidth(n)) {
    colW.add(c);
  }
  for (const c of colW) {
    const pw = p.data.cols[c]?.width;
    const nw = n.data.cols[c]?.width;
    const yKey = `colw:${si}:${c}`;
    if (pw === nw) {
      continue;
    }
    if (nw == null) {
      root.delete(yKey);
    } else {
      root.set(yKey, nw);
    }
  }
}

/**
 * Apply only the delta from `prev` → `next` onto the Yjs map (inside a transaction).
 * Enables per-key CRDT merge with concurrent peers.
 */
export function applyWorkbookDiff(
  root: Y.Map<unknown>,
  prev: Data,
  next: Data,
): void {
  const maxLen = Math.max(prev.sheets.length, next.sheets.length);
  for (let i = 0; i < maxLen; i++) {
    const pSheet = prev.sheets[i];
    const nSheet = next.sheets[i];
    if (pSheet && !nSheet) {
      deleteSheetKeys(root, i);
    } else if (!pSheet && nSheet) {
      writeFullSheet(root, i, nSheet);
    } else if (pSheet && nSheet) {
      diffSheet(root, i, pSheet, nSheet);
    }
  }
  const sel = next.sheets.findIndex((s) => s.selected);
  root.set('meta:selectedSheet', String(sel < 0 ? 0 : sel));
}
