"use client";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { voteCount } from "@/lib/domain";
import { useDemo } from "./demo-provider";
import { FeedbackCard } from "./feedback-card";
import { GoBack } from "./go-back";
import { statusLanes } from "./labels";

// Phones show one stage at a time as tabs; tablet and desktop show all three
// columns, so the tab roles apply only on phones. The server renders the
// phone version; the client corrects it after hydration.
const phoneQuery = "(max-width: 39.99rem)";
function subscribePhone(change: () => void) {
  const query = matchMedia(phoneQuery);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
}

// Three columns from tablet up. On a phone the columns become tabs, as in the
// design; the same sections serve as the tab panels.
export function Roadmap() {
  const phone = useSyncExternalStore(
    subscribePhone,
    () => matchMedia(phoneQuery).matches,
    () => true,
  );
  const { snapshot } = useDemo();
  const [selected, setSelected] = useState(1);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const lanes = statusLanes.map((lane) => ({
    ...lane,
    items: snapshot.feedback
      .filter((item) => item.status === lane.status)
      .toSorted(
        (a, b) =>
          voteCount(snapshot, b) - voteCount(snapshot, a) || a.order - b.order,
      ),
  }));
  function select(index: number) {
    setSelected(index);
    tabs.current[index]?.focus();
  }
  return (
    <div className="page-wide roadmap-page">
      <header className="roadmap-bar">
        <div>
          <GoBack href="/" light />
          <h1>Roadmap</h1>
        </div>
        <Link className="btn btn-purple" href="/feedback/new">
          + Add Feedback
        </Link>
      </header>
      <div className="roadmap-tabs" role="tablist" aria-label="Roadmap stages">
        {lanes.map((lane, index) => (
          <button
            key={lane.status}
            ref={(element) => {
              tabs.current[index] = element;
            }}
            id={"tab-" + lane.status}
            role="tab"
            type="button"
            className={lane.status}
            aria-selected={selected === index}
            aria-controls={"lane-" + lane.status}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => {
              const last = lanes.length - 1;
              const moves: Record<string, number> = {
                ArrowRight: index === last ? 0 : index + 1,
                ArrowLeft: index === 0 ? last : index - 1,
                Home: 0,
                End: last,
              };
              if (event.key in moves) {
                event.preventDefault();
                select(moves[event.key]);
              }
            }}
          >
            {lane.title} ({lane.items.length})
          </button>
        ))}
      </div>
      <div className="roadmap-grid">
        {lanes.map((lane, index) => (
          <section
            key={lane.status}
            id={"lane-" + lane.status}
            role={phone ? "tabpanel" : undefined}
            aria-labelledby={"heading-" + lane.status}
            className={
              "roadmap-lane " + lane.status + (selected === index ? " selected" : "")
            }
          >
            <h2 id={"heading-" + lane.status}>
              {lane.title} ({lane.items.length})
            </h2>
            <p className="lane-description">{lane.description}</p>
            <div className="lane-cards">
              {lane.items.map((item) => (
                <FeedbackCard
                  key={item.id}
                  item={item}
                  heading="h3"
                  variant="roadmap"
                />
              ))}
              {lane.items.length === 0 && (
                <p className="lane-empty">No feedback in this stage yet.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
