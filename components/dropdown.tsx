"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronUp } from "./icons";

export type Option<T extends string> = { value: T; label: string };

// The design's custom select: a button that opens a listbox of options with a
// check on the chosen one. Keyboard: Enter, Space or the arrow keys open it;
// arrows, Home and End move; Enter or Space chooses; Escape and Tab close.
// Focus returns to the button after a choice or Escape.
export function Dropdown<T extends string>({
  id,
  value,
  options,
  onChange,
  labelledBy,
  labelInside = false,
  describedBy,
  className = "",
  children,
}: {
  id: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  // The visible label's id. With labelInside, the label is the button's own
  // first child, so the button is named by its content.
  labelledBy: string;
  labelInside?: boolean;
  describedBy?: string;
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    list.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);
  function show(index = selected) {
    setActive(index);
    setOpen(true);
  }
  function choose(index: number) {
    onChange(options[index].value);
    setOpen(false);
    button.current?.focus();
  }
  return (
    <div className={"dropdown " + className} ref={root}>
      <button
        ref={button}
        id={id}
        type="button"
        className="dropdown-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelInside ? undefined : labelledBy + " " + id}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            show(selected);
          }
        }}
      >
        {children}
        <span className="dropdown-value">{options[selected].label}</span>
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>
      <ul
        ref={list}
        id={listId}
        role="listbox"
        tabIndex={-1}
        hidden={!open}
        aria-labelledby={labelledBy}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onKeyDown={(event) => {
          const last = options.length - 1;
          const moves: Record<string, number> = {
            ArrowDown: Math.min(last, active + 1),
            ArrowUp: Math.max(0, active - 1),
            Home: 0,
            End: last,
          };
          if (event.key in moves) {
            event.preventDefault();
            setActive(moves[event.key]);
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            choose(active);
          } else if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
            button.current?.focus();
          } else if (event.key === "Tab") {
            setOpen(false);
          }
        }}
      >
        {options.map((option, index) => (
          <li
            key={option.value}
            id={`${listId}-${index}`}
            data-index={index}
            role="option"
            aria-selected={index === selected}
            className={index === active ? "active" : undefined}
            onPointerMove={() => setActive(index)}
            onClick={() => choose(index)}
          >
            <span>{option.label}</span>
            {index === selected && <Check />}
          </li>
        ))}
      </ul>
    </div>
  );
}
