"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useDemo } from "./demo-provider";
export function Shell({ children }: { children: ReactNode }) {
  const demo = useDemo();
  const router = useRouter();
  const [shortcuts, setShortcuts] = useState(false);
  const help = useRef<HTMLDetailsElement>(null);
  const [theme, setTheme] = useState("system");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
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
        event.target.closest("input,textarea,select,[contenteditable=true]")
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
      if (demo.unsaved) {
        event.preventDefault();
      }
    }
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [demo.unsaved]);
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="brand" href="/">
          Product Feedback <span>Browser-local demo</span>
        </Link>
        <nav aria-label="Main">
          <Link href="/">Suggestions</Link>
          <Link href="/roadmap">Roadmap</Link>
          <Link className="button" href="/feedback/new">
            Add feedback
          </Link>
        </nav>
      </header>
      <section className="demo-notice" aria-label="Demo identity and storage">
        <p>
          <strong>Demo participant</strong> · Fictional sample feedback. Changes
          stay in this browser; no account or shared board.
        </p>
        <p className="storage-message" role="status">
          {demo.message}
        </p>
        <div className="actions">
          <label className="appearance">
            Appearance{" "}
            <select
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <button
            className="quiet"
            type="button"
            onClick={demo.reload}
            disabled={demo.busy}
          >
            Load saved data
          </button>
          {demo.unsaved && demo.storage.kind === "memory" && demo.canMutate && (
            <button
              className="quiet"
              type="button"
              onClick={() => void demo.retry()}
            >
              Retry saving changes
            </button>
          )}
          {demo.storage.kind === "corrupt" && (
            <button
              className="quiet"
              type="button"
              onClick={demo.useMemorySample}
            >
              Explore sample in memory
            </button>
          )}
          <details ref={help}>
            <summary>Keyboard help</summary>
            <p>
              Tab through links and controls; Enter follows links; Space presses
              buttons. Optional shortcuts: B suggestions, R roadmap, N new
              feedback, ? help, Escape closes this help.
            </p>
            <label className="check">
              <input
                type="checkbox"
                checked={shortcuts}
                onChange={(event) => setShortcuts(event.target.checked)}
              />{" "}
              Enable letter shortcuts for this visit
            </label>
          </details>
        </div>
      </section>
      <noscript>
        <p className="panel">
          This is a browser-local demo. JavaScript is required to load or change
          saved feedback. No form data is sent without it.
        </p>
      </noscript>
      <main id="main">{children}</main>
      <footer>
        <p>
          Historical fictional sample data adapted from the Product Feedback
          exercise. Local editing is a demonstration, not a user-permission
          model.
        </p>
        <a href="https://www.frontendmentor.io/challenges/product-feedback-app-wbvUYqjR6">
          Frontend Mentor challenge
        </a>
      </footer>
    </div>
  );
}
