import Link from "next/link";
export default function NotFound() {
  return (
    <section className="panel page-narrow missing">
      <h1>Feedback page not found</h1>
      <p>This address does not identify a page in this demo.</p>
      <Link className="btn btn-purple" href="/">
        Return to suggestions
      </Link>
    </section>
  );
}
