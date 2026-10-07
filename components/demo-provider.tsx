"use client";
import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  applyCommand,
  type Command,
  type Snapshot,
  STORAGE_KEY,
} from "@/lib/domain";
import { sample } from "@/lib/fixtures";
import { readSaved, saveSnapshot } from "@/lib/storage";
type StorageState =
  | { kind: "loading" }
  | { kind: "ready"; raw: string | null }
  | { kind: "memory"; raw: string | null }
  | { kind: "conflict"; raw: string | null }
  | { kind: "corrupt" }
  | { kind: "ephemeral" };
type State = {
  loadVersion: number;
  snapshot: Snapshot;
  storage: StorageState;
  busy: boolean;
  unsaved: boolean;
  message: string;
};
function createDemoStore() {
  const initial: State = {
    loadVersion: 0,
    snapshot: sample,
    storage: { kind: "loading" },
    busy: false,
    unsaved: false,
    message: "Loading this browser’s demo…",
  };
  let state = initial;
  const listeners = new Set<() => void>();
  function publish(next: State) {
    state = next;
    listeners.forEach((listener) => listener());
  }
  function load() {
    const result = readSaved();
    if (result.kind === "ready")
      publish({
        loadVersion: state.loadVersion + 1,
        snapshot: result.document?.snapshot ?? sample,
        storage: { kind: "ready", raw: result.raw },
        busy: false,
        unsaved: false,
        message: result.raw
          ? "Loaded saved browser demo."
          : "Sample data loaded. Changes save only in this browser.",
      });
    else if (result.kind === "corrupt")
      publish({
        ...state,
        storage: { kind: "corrupt" },
        busy: false,
        message: result.message,
      });
    else
      publish({
        ...state,
        storage: { kind: "memory", raw: null },
        busy: false,
        message: result.message,
      });
  }
  function storageChanged(event: StorageEvent) {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    if (
      state.storage.kind === "loading" ||
      state.storage.kind === "corrupt" ||
      state.storage.kind === "ephemeral"
    )
      return;
    // Keep current data and open form values intact. Loading is an explicit user action.
    publish({
      ...state,
      storage: { kind: "conflict", raw: state.storage.raw },
      message:
        "Saved data changed in another tab. Load saved data before making further changes.",
    });
  }
  async function persist(snapshot: Snapshot): Promise<boolean> {
    if (
      state.busy ||
      state.storage.kind === "loading" ||
      state.storage.kind === "corrupt" ||
      state.storage.kind === "conflict"
    )
      return false;
    if (state.storage.kind === "ephemeral") {
      publish({
        ...state,
        snapshot,
        unsaved: true,
        message:
          "Changes are in memory only. Existing saved data has not been touched.",
      });
      return true;
    }
    const expectedRaw = state.storage.raw;
    publish({ ...state, busy: true });
    const result = await saveSnapshot(snapshot, expectedRaw);
    if (result.kind === "saved")
      publish({
        loadVersion: state.loadVersion,
        snapshot,
        storage: { kind: "ready", raw: result.raw },
        busy: false,
        unsaved: false,
        message: "Saved in this browser.",
      });
    else
      publish({
        loadVersion: state.loadVersion,
        snapshot,
        storage: {
          kind: result.kind === "conflict" ? "conflict" : "memory",
          raw: expectedRaw,
        },
        busy: false,
        unsaved: true,
        message: result.message,
      });
    return result.kind !== "conflict";
  }
  return {
    getSnapshot: () => state,
    getServerSnapshot: () => initial,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) {
        if (state.storage.kind === "loading") load();
        window.addEventListener("storage", storageChanged);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0)
          window.removeEventListener("storage", storageChanged);
      };
    },
    async run(command: Command) {
      if (
        state.busy ||
        state.storage.kind === "loading" ||
        state.storage.kind === "corrupt" ||
        state.storage.kind === "conflict"
      )
        return false;
      try {
        return await persist(applyCommand(state.snapshot, command));
      } catch (error) {
        publish({
          ...state,
          message:
            error instanceof Error
              ? error.message
              : "This change could not be applied.",
        });
        return false;
      }
    },
    retry: () => persist(state.snapshot),
    reload() {
      if (state.busy) return;
      if (
        !window.confirm(
          "Replace this tab’s in-memory changes and open form drafts with the saved demo?",
        )
      )
        return;
      load();
    },
    useMemorySample() {
      if (
        state.busy ||
        !window.confirm(
          "Explore the original sample without saving? Existing stored data will not be changed.",
        )
      )
        return;
      // Explicit in-memory exploration never attempts to replace unreadable stored data.
      publish({
        loadVersion: state.loadVersion + 1,
        snapshot: sample,
        storage: { kind: "ephemeral" },
        busy: false,
        unsaved: true,
        message: "Sample is in memory only. Existing stored data is unchanged.",
      });
    },
  };
}
type DemoStore = ReturnType<typeof createDemoStore>;
const Context = createContext<DemoStore | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createDemoStore);
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useDemo() {
  const store = useContext(Context);
  if (!store) throw new Error("DemoProvider is required.");
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return {
    ...state,
    run: store.run,
    retry: store.retry,
    reload: store.reload,
    useMemorySample: store.useMemorySample,
    // Only storage that cannot take changes disables controls. A pending save
    // keeps them focusable with aria-busy; the store itself blocks re-entry.
    canMutate:
      state.storage.kind === "ready" ||
      state.storage.kind === "memory" ||
      state.storage.kind === "ephemeral",
  };
}
