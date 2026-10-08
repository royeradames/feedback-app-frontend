// Design icons drawn inline so they take the surrounding colour token; each is
// decorative and hidden from assistive technology.
type Props = { className?: string };

export function ChevronUp({ className }: Props) {
  return (
    <svg className={className} width="10" height="7" viewBox="0 0 10 7" aria-hidden="true" focusable="false">
      <path d="M1 6l4-4 4 4" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function ChevronDown({ className }: Props) {
  return (
    <svg className={className} width="10" height="7" viewBox="0 0 10 7" aria-hidden="true" focusable="false">
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function ChevronLeft({ className }: Props) {
  return (
    <svg className={className} width="7" height="10" viewBox="0 0 7 10" aria-hidden="true" focusable="false">
      <path d="M6 9L2 5l4-4" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function Check({ className }: Props) {
  return (
    <svg className={className} width="13" height="11" viewBox="0 0 13 11" aria-hidden="true" focusable="false">
      <path d="M1 5.233L4.522 9 12 1" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}
