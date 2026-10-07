import {
  documentSchema,
  MAX_STORAGE_CHARS,
  parseDocument,
  STORAGE_KEY,
  type Document,
  type Snapshot,
} from './domain.ts';
export type ReadResult =
  | { kind: 'ready'; raw: string | null; document: Document | null }
  | { kind: 'unavailable'; message: string }
  | { kind: 'corrupt'; message: string };
export function readSaved(): ReadResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return {
      kind: 'unavailable',
      message:
        'Browser storage cannot be read. This demo can run in memory; changes will be lost when you leave.',
    };
  }
  if (raw === null) return { kind: 'ready', raw, document: null };
  try {
    return { kind: 'ready', raw, document: parseDocument(raw) };
  } catch {
    return {
      kind: 'corrupt',
      message:
        'The saved demo is malformed. It has not been changed. Reload after recovering it, or explore the sample in memory.',
    };
  }
}
export type SaveResult =
  | { kind: 'saved'; raw: string }
  | { kind: 'conflict'; message: string }
  | { kind: 'unavailable'; message: string };
export async function saveSnapshot(
  snapshot: Snapshot,
  expectedRaw: string | null,
): Promise<SaveResult> {
  if (!navigator.locks)
    return {
      kind: 'unavailable',
      message:
        'Safe cross-tab saving is unavailable. Your changes remain in memory only.',
    };
  try {
    return await navigator.locks.request(STORAGE_KEY, () => {
      if (localStorage.getItem(STORAGE_KEY) !== expectedRaw)
        return {
          kind: 'conflict',
          message:
            'Another tab changed the saved demo. Your unsaved changes remain here. Load saved data before making further changes.',
        } satisfies SaveResult;
      const document = documentSchema.parse({
        version: 1,
        revision: crypto.randomUUID(),
        snapshot,
      });
      const raw = JSON.stringify(document);
      if (raw.length > MAX_STORAGE_CHARS)
        return {
          kind: 'unavailable',
          message:
            'The demo is too large to save. Your changes remain in memory.',
        } satisfies SaveResult;
      localStorage.setItem(STORAGE_KEY, raw);
      return { kind: 'saved', raw } satisfies SaveResult;
    });
  } catch {
    return {
      kind: 'unavailable',
      message:
        'Saving failed. Previous saved data is unchanged; current changes remain in memory. Free browser storage and retry.',
    };
  }
}
