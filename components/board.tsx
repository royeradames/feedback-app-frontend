"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { categories, suggestions, type Sort } from "@/lib/domain";
import { pluralize } from "@/lib/plural";
import { siteName } from "@/lib/site";
import { useDemo } from "./demo-provider";
import { Dropdown } from "./dropdown";
import { FeedbackCard } from "./feedback-card";
import { categoryLabel, statusLanes } from "./labels";

const sorts = [
  { value: "votes-desc", label: "Most Upvotes" },
  { value: "votes-asc", label: "Least Upvotes" },
  { value: "comments-desc", label: "Most Comments" },
  { value: "comments-asc", label: "Least Comments" },
] as const satisfies readonly { value: Sort; label: string }[];

export function Board() {
  const demo = useDemo();
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<Sort>("votes-desc");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const items = suggestions(demo.snapshot, category, sort);
  useEffect(() => {
    // The menu exists only on phones; close it if the window widens.
    const wide = matchMedia("(min-width: 40rem)");
    const close = () => wide.matches && setMenuOpen(false);
    wide.addEventListener("change", close);
    return () => wide.removeEventListener("change", close);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    menu.current?.querySelector<HTMLElement>("button, a")?.focus();
    function key(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButton.current?.focus();
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [menuOpen]);
  function choose(value: string) {
    setCategory(value);
    if (menuOpen) {
      setMenuOpen(false);
      menuButton.current?.focus();
    }
  }
  return (
    <div className={"board" + (menuOpen ? " menu-open" : "")}>
      <h1 className="sr-only">Suggestions</h1>
      <div className="board-side">
        <header className="brand-card">
          <Link className="brand" href="/">
            <span className="brand-name">{siteName}</span>
            <span className="brand-tag">Feedback Board</span>
          </Link>
          <button
            ref={menuButton}
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="board-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Image
              src={
                menuOpen
                  ? "/assets/shared/mobile/icon-close.svg"
                  : "/assets/shared/mobile/icon-hamburger.svg"
              }
              width={20}
              height={17}
              alt=""
            />
            <span className="sr-only">Menu</span>
          </button>
        </header>
        <div
          className="menu-backdrop"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
        <div id="board-menu" className="board-menu" ref={menu}>
          <section className="side-card" aria-labelledby="filter-heading">
            <h2 id="filter-heading" className="sr-only">
              Filter by category
            </h2>
            <div className="chips">
              {["all", ...categories].map((value) => (
                <button
                  type="button"
                  className="chip"
                  key={value}
                  aria-pressed={category === value}
                  onClick={() => choose(value)}
                >
                  {value === "all" ? "All" : categoryLabel(value)}
                </button>
              ))}
            </div>
          </section>
          <section className="side-card roadmap-summary" aria-labelledby="roadmap-heading">
            <div className="roadmap-summary-head">
              <h2 id="roadmap-heading">Roadmap</h2>
              <Link href="/roadmap" aria-describedby="roadmap-heading">
                View
              </Link>
            </div>
            <ul>
              {statusLanes.map((lane) => (
                <li key={lane.status} className={lane.status}>
                  <span>{lane.title}</span>
                  <strong>
                    {
                      demo.snapshot.feedback.filter(
                        (item) => item.status === lane.status,
                      ).length
                    }
                  </strong>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <section className="board-main" aria-label="Suggestions" inert={menuOpen}>
        <div className="suggestions-bar">
          <p className="suggestions-count" aria-live="polite">
            <Image
              src="/assets/suggestions/icon-suggestions.svg"
              width={23}
              height={24}
              alt=""
            />
            <span>{pluralize(items.length, "Suggestion", "Suggestions")}</span>
          </p>
          <Dropdown
            id="sort"
            className="sort"
            value={sort}
            options={sorts}
            onChange={setSort}
            labelledBy="sort-label"
            labelInside
          >
            <span id="sort-label" className="sort-label">
              Sort by :
            </span>
          </Dropdown>
          <Link className="btn btn-purple" href="/feedback/new">
            + Add Feedback
          </Link>
        </div>
        {items.length > 0 ? (
          <div className="feedback-list">
            {items.map((item) => (
              <FeedbackCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <section className="empty-state" aria-labelledby="empty-heading">
            <Image
              src="/assets/suggestions/illustration-empty.svg"
              width={130}
              height={137}
              alt=""
            />
            <h2 id="empty-heading">There is no feedback yet.</h2>
            <p>
              Got a suggestion? Found a bug that needs to be squashed? We love
              hearing about new ideas to improve our app.
            </p>
            <Link className="btn btn-purple" href="/feedback/new">
              + Add Feedback
            </Link>
            {category !== "all" && (
              <button
                type="button"
                className="btn-text"
                onClick={() => setCategory("all")}
              >
                Show all categories
              </button>
            )}
          </section>
        )}
      </section>
    </div>
  );
}
