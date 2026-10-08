"use client";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { readTheme, subscribeTheme, writeTheme } from "@/lib/theme";
import { useDemo } from "./demo-provider";

// Recovery actions for the current storage state. They appear in the top
// banner when something needs attention, and in the footer tools otherwise.
function DataActions() {
  const demo = useDemo();
  return (
    <>
      <button
        className="btn btn-soft"
        type="button"
        onClick={demo.reload}
        aria-busy={demo.busy || undefined}
      >
        Load saved data
      </button>
      {demo.unsaved && demo.storage.kind === "memory" && demo.canMutate && (
        <button
          className="btn btn-soft"
          type="button"
          onClick={() => void demo.retry()}
          aria-busy={demo.busy || undefined}
        >
          Retry saving changes
        </button>
      )}
      {demo.storage.kind === "corrupt" && (
        <button
          className="btn btn-soft"
          type="button"
          onClick={demo.useMemorySample}
          aria-busy={demo.busy || undefined}
        >
          Explore sample in memory
        </button>
      )}
    </>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const demo = useDemo();
  const router = useRouter();
  const [shortcuts, setShortcuts] = useState(false);
  const help = useRef<HTMLDetailsElement>(null);
  // The inline head script applies the saved theme before paint; this only
  // mirrors it into the select after hydration.
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "system");
  const attention =
    demo.storage.kind === "conflict" ||
    demo.storage.kind === "corrupt" ||
    demo.storage.kind === "ephemeral" ||
    (demo.storage.kind === "memory" && demo.unsaved);
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (help.current) help.current.open = false;
        return;
      }
      if (
        !shortcuts ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.repeat ||
        !(event.target instanceof HTMLElement) ||
        event.target.closest("input,textarea,select,[contenteditable=true],[role=listbox]")
      )
        return;
      const destination =
        event.key === "b"
          ? "/"
          : event.key === "r"
            ? "/roadmap"
            : event.key === "n"
              ? "/feedback/new"
              : null;
      if (destination) {
        event.preventDefault();
        router.push(destination);
      }
      if (event.key === "?") {
        event.preventDefault();
        if (help.current) help.current.open = true;
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [shortcuts, router]);
  useEffect(() => {
    function before(event: BeforeUnloadEvent) {
      if (demo.unsaved) event.preventDefault();
    }
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [demo.unsaved]);
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {attention && (
        <section className="storage-alert" aria-label="Saved data needs attention">
          <p>{demo.message}</p>
          <div className="tool-row">
            <DataActions />
          </div>
        </section>
      )}
      <noscript>
        <p className="storage-alert">
          This is a browser-local demo. JavaScript is required to load or change
          saved feedback. No form data is sent without it.
        </p>
      </noscript>
      <main id="main">{children}</main>
      <footer className="demo-bar">
        <p>
          <strong>Demo board.</strong> The feedback is fictional sample data.
          Your changes stay in this browser; nothing is sent and there is no
          account.
        </p>
        <p className="storage-message" role="status">
          {demo.message}
        </p>
        <div className="tool-row">
          <label className="appearance">
            <span>Appearance</span>
            <select
              value={theme}
              onChange={(event) => writeTheme(event.target.value)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          {!attention && <DataActions />}
        </div>
        <details ref={help} className="keyboard-help">
          <summary>Keyboard help</summary>
          <p>
            Tab moves through links and controls; Enter follows links; Space
            presses buttons. Optional shortcuts: B suggestions, R roadmap, N new
            feedback, ? help, Escape closes this help.
          </p>
          <label className="check">
            <input
              type="checkbox"
              checked={shortcuts}
              onChange={(event) => setShortcuts(event.target.checked)}
            />
            <span>Enable letter shortcuts for this visit</span>
          </label>
        </details>
        <p className="credit">
          Design and sample data from the{" "}
          <a href="https://www.frontendmentor.io/challenges/product-feedback-app-wbvUYqjR6">
            Frontend Mentor product feedback challenge
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
