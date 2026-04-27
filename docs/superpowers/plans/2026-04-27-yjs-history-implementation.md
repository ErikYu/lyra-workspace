# Yjs history & collaboration hooks — implementation plan

> **For agentic workers:** Use superpowers:subagent-driven-development or execute inline; track with `- [ ]` checkboxes.

**Goal:** Replace snapshot-based `HistoryService` with Yjs + `Y.UndoManager` and per-cell (fine-grained) sync; expose binary sync helpers for future multiplayer transport.

**Architecture:** `Y.Doc` holds a root `Y.Map` encoding the workbook; local edits use `doc.transact(fn, LYRA_LOCAL_HISTORY_ORIGIN)`; `Y.UndoManager` tracks that origin only; remote peers use `Y.applyUpdate(..., LYRA_REMOTE_ORIGIN)`.

**Tech stack:** `yjs`, existing `tsyringe` / `DataService`.

---

### Task 1: Dependency

**Files:**

- Modify: `libs/lyra-sheet-core/package.json`
- Run: `pnpm install` at repo root

- [ ] Add `"yjs": "^13.6.0"` (or current stable) to `dependencies` of `@lyra-sheet/core`.

- [ ] Commit: `chore(core): add yjs dependency`

---

### Task 2: Workbook bridge module

**Files:**

- Create: `libs/lyra-sheet-core/src/lib/crdt/yjs-workbook.ts`
- Create: `libs/lyra-sheet-core/src/lib/crdt/yjs-workbook.spec.ts`
- Modify: `libs/lyra-sheet-core/src/index.ts` (export crdt helpers + origins if public API desired)

Implement:

- `LYRA_LOCAL_HISTORY_ORIGIN`, `LYRA_REMOTE_ORIGIN` string constants
- `writeFullWorkbook(root, data)` — reset map keys and write full state
- `importWorkbookFromYjs(root): Data`
- `applyWorkbookDiff(root, prev: Data, next: Data)` — minimal key-level diff

- [ ] Unit tests: round-trip `Data` → Yjs → `Data`; diff after a single cell edit preserves rest.

- [ ] Commit: `feat(core): add yjs workbook encode/decode and diff`

---

### Task 3: HistoryService refactor

**Files:**

- Modify: `libs/lyra-sheet-core/src/lib/services/history.service.ts`
- Modify: `libs/lyra-sheet-core/src/lib/services/history.service.spec.ts` (only if mocks need `Y.Doc`; behavior tests should still pass)

Changes:

- Remove JSON snapshot stack / cursor
- `canUndo` / `canRedo` delegate to `UndoManager`
- `init`: new `Y.Doc`, `writeFullWorkbook`, new `UndoManager([root], { trackedOrigins })`
- `stacked`: `transact(LOCAL_ORIGIN)` → run `op()` → `applyWorkbookDiff(lastExported, snapshot)` → update `lastExported`
- `undo` / `redo`: `undoManager.undo/redo` → `loadData(import...)` → `rerender` → `notify` → sync `lastExported`
- `doc.on('update', (_, origin) => { if (origin === REMOTE) syncFromYjs() })`
- Public: `get yDoc()`, `applyRemoteUpdate`, `getStateVector`, `encodeStateAsUpdate`, `encodeStateAsUpdateFrom`

- [ ] Commit: `feat(core): replace snapshot history with Yjs UndoManager`

---

### Task 4: Verify

**Commands:**

```bash
pnpm exec nx test lyra-sheet-core --no-cache
pnpm exec nx lint lyra-sheet-core
```

- [ ] Both succeed before claiming complete.

- [ ] Optional commit: `test(core): extend yjs workbook coverage` if extra tests added.

---

**Stop:** Do not `git push` (user request).
