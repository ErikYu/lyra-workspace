# Yjs-backed history & collaboration (design)

**Date:** 2026-04-27  
**Scope:** Replace JSON snapshot undo/redo in `@lyra-sheet/core` with **Yjs** (`Y.Doc` + `Y.Map`) and **`Y.UndoManager`**, preserving the public `HistoryService` API (`init`, `stacked`, `undo`, `redo`, `canUndo`, `canRedo`).

## Goals

1. **No full-document snapshot stack** for undo/redo.
2. **Multi-user friendly:** concurrent edits target different **fine-grained keys** (per sheet / per cell / row height / column width / sheet metadata) so Yjs can merge independent changes.
3. **Local undo/redo only:** `Y.UndoManager` is configured with `trackedOrigins` so only transactions tagged with a **local history origin** are undone; remote merges use a separate origin and are not reverted by the user’s Undo.

## Non-goals (this iteration)

- Shipping a WebSocket provider, room protocol, or persistence — only **hooks** on `HistoryService` to apply and emit binary updates (`Y.applyUpdate` / `Y.encodeStateAsUpdate`).
- Proving CRDT semantics for every spreadsheet edge case (e.g. concurrent structural ops on the same merge region); the encoding is designed to be **cell-granular** so common “two users, two cells” cases converge.

## Architecture

- **Authoritative collaborative state:** a single root `Y.Map` (e.g. key `lyra-workbook`) holds string/number values keyed by a stable convention:
  - `sheet:{si}:name`, `rowCount`, `colCount`, `merges` (JSON string), …
  - `cell:{si}:{row}:{col}` → JSON string of `CellData` (key absent = empty cell)
  - `rowh:{si}:{row}`, `colw:{si}:{col}` → numbers
  - `meta:selectedSheet` → active sheet index
- **Runtime UI model:** unchanged — `DataService` + `SheetService` remain the rendering path.
- **After each `stacked` operation:** run the user `op()` (still mutates `DataService`), then **diff** the previous exported `Data` vs `dataService.snapshot` and apply only changed keys inside `doc.transact(..., LOCAL_ORIGIN)`.
- **Undo / redo:** `undoManager.undo()` / `redo()`, then **`loadData(importWorkbookFromYjs(...))`** so the in-memory model matches Yjs.
- **Remote updates:** `applyRemoteUpdate(update)` calls `Y.applyUpdate(doc, update, REMOTE_ORIGIN)`. An `update` listener reacts when `origin === REMOTE_ORIGIN`, re-imports the workbook into `Data`, `loadData`, `rerender`, `notifyDataChange`, and refreshes the **last-exported** baseline used for diffs.

## Risks / limitations

- **Sheet index as identity:** keys use numeric sheet indices; adding/removing sheets shifts indices — the diff runs on full `Data` snapshots so Yjs keys stay consistent with the current model, but concurrent **sheet tab** operations remain harder than cell edits.
- **Large paste / format:** one transaction may touch many keys; still one undo step — acceptable.

## Testing

- Unit tests for **import/export round-trip** and **diff** application.
- Existing `HistoryService` tests updated to assert behavior via `loadData` (unchanged expectations).

## Operational note (multi-replica)

New `Y.Doc` replicas that represent the **same** document must share a common baseline (e.g. apply the same `Y.encodeStateAsUpdate` snapshot) before diverging. Independently calling `writeFullWorkbook` on two empty docs creates logically identical plain `Data` but **different** internal CRDT identities; always **fork** with `Y.applyUpdate` from a shared snapshot before concurrent edits.
