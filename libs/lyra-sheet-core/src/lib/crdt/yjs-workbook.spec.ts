import * as Y from 'yjs';
import type { Data } from '../types';
import {
  applyWorkbookDiff,
  importWorkbookFromYjs,
  LYRA_LOCAL_HISTORY_ORIGIN,
  LYRA_REMOTE_ORIGIN,
  writeFullWorkbook,
  getOrCreateWorkbookRoot,
} from './yjs-workbook';

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

const sample: Data = {
  sheets: [
    {
      name: 'A',
      selected: true,
      data: {
        merges: [],
        rows: {
          1: {
            cells: {
              2: { richText: [[{ text: 'x' }]] },
            },
          },
        },
        cols: { 3: { width: 64 } },
        rowCount: 20,
        colCount: 10,
      },
    },
  ],
};

describe('yjs-workbook', () => {
  it('round-trips Data through the Yjs map', () => {
    const doc = new Y.Doc();
    const root = getOrCreateWorkbookRoot(doc);
    writeFullWorkbook(root, sample);
    expect(importWorkbookFromYjs(root)).toEqual(sample);
  });

  it('applies only cell deltas and preserves unrelated cells on merge', () => {
    const baseline = new Y.Doc();
    const rootBaseline = getOrCreateWorkbookRoot(baseline);
    writeFullWorkbook(rootBaseline, clone(sample));
    const fork = Y.encodeStateAsUpdate(baseline);

    const docA = new Y.Doc();
    Y.applyUpdate(docA, fork);
    const rootA = getOrCreateWorkbookRoot(docA);

    const docB = new Y.Doc();
    Y.applyUpdate(docB, fork);
    const rootB = getOrCreateWorkbookRoot(docB);

    const nextA = clone(sample);
    nextA.sheets[0].data.rows[1] = {
      cells: {
        2: { richText: [[{ text: 'edited-a' }]] },
      },
    };

    const nextB = clone(sample);
    nextB.sheets[0].data.rows[5] = {
      cells: {
        1: { richText: [[{ text: 'edited-b' }]] },
      },
    };

    docA.transact(() => {
      applyWorkbookDiff(rootA, sample, nextA);
    }, LYRA_LOCAL_HISTORY_ORIGIN);

    docB.transact(() => {
      applyWorkbookDiff(rootB, sample, nextB);
    }, LYRA_LOCAL_HISTORY_ORIGIN);

    const updateFromA = Y.encodeStateAsUpdate(
      docA,
      Y.encodeStateVector(docB),
    );
    Y.applyUpdate(docB, updateFromA, LYRA_REMOTE_ORIGIN);

    const merged = importWorkbookFromYjs(rootB);
    expect(merged.sheets[0].data.rows[1].cells[2].richText?.[0][0].text).toBe(
      'edited-a',
    );
    expect(merged.sheets[0].data.rows[5].cells[1].richText?.[0][0].text).toBe(
      'edited-b',
    );
  });
});
