import Link from "next/link";
export default function NotFound() {
  return (
    <section className="panel">
      <h1>Feedback page not found</h1>
      <p>This address does not identify a supported demo page.</p>
      <Link href="/">Return to suggestions</Link>
    </section>
  );
}
