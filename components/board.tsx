"use client";
import { useState } from "react";
import Link from "next/link";
import { categories, sortSchema, suggestions, type Sort } from "@/lib/domain";
import { useDemo } from "./demo-provider";
import { FeedbackCard } from "./feedback-card";
export function Board() {
  const demo = useDemo();
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<Sort>("votes-desc");
  const items = suggestions(demo.snapshot, category, sort);
  return (
    <div className="board-layout">
      <aside className="board-sidebar">
        <section className="panel">
          <h2>Categories</h2>
          <div className="chips" role="group" aria-label="Filter by category">
            {["all", ...categories].map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={category === value}
                onClick={() => setCategory(value)}
              >
                {value === "all" ? "All" : value}
              </button>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Roadmap</h2>
          <ul className="roadmap-counts">
            {["planned", "in-progress", "live"].map((status) => (
              <li key={status}>
                <span>{status.replace("-", " ")}</span>
                <strong>
                  {
                    demo.snapshot.feedback.filter(
                      (item) => item.status === status,
                    ).length
                  }
                </strong>
              </li>
            ))}
          </ul>
          <Link href="/roadmap">View roadmap</Link>
        </section>
      </aside>
      <section aria-labelledby="suggestion-heading">
        <div className="list-toolbar">
          <div className="list-heading">
            <h1 id="suggestion-heading">Suggestions</h1>
            <p aria-live="polite">Showing {items.length}</p>
          </div>
          <label>
            Sort by{" "}
            <select
              value={sort}
              onChange={(event) =>
                setSort(sortSchema.parse(event.target.value))
              }
            >
              <option value="votes-desc">Most upvotes</option>
              <option value="votes-asc">Least upvotes</option>
              <option value="comments-desc">Most comments</option>
              <option value="comments-asc">Least comments</option>
            </select>
          </label>
        </div>
        <div className="feedback-list">
          {items.map((item) => (
            <FeedbackCard key={item.id} item={item} />
          ))}
        </div>
        {items.length === 0 && (
          <section className="panel empty">
            <h2>No suggestions in this category</h2>
            <p>Choose another category or add a local idea.</p>
            <button type="button" onClick={() => setCategory("all")}>
              Show all categories
            </button>
          </section>
        )}
      </section>
    </div>
  );
}
