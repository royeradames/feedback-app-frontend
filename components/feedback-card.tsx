"use client";
import Link from "next/link";
import { commentCount, voteCount, type Feedback } from "@/lib/domain";
import { useDemo } from "./demo-provider";
export function FeedbackCard({
  item,
  heading = "h2",
}: {
  item: Feedback;
  heading?: "h2" | "h3";
}) {
  const demo = useDemo();
  const Heading = heading;
  const votes = voteCount(demo.snapshot, item);
  return (
    <article className="feedback-card" data-feedback-id={item.id}>
      <button
        className="vote"
        type="button"
        disabled={!demo.canMutate}
        aria-pressed={demo.snapshot.votedIds.includes(item.id)}
        aria-label={`Upvote ${item.title} (${votes} votes)`}
        onClick={() => void demo.run({ kind: "vote", id: item.id })}
      >
        <span aria-hidden="true">⌃</span>
        <span>{votes}</span>
      </button>
      <div className="feedback-copy">
        <Heading>
          <Link href={"/feedback/" + item.id}>{item.title}</Link>
        </Heading>
        <p>{item.description}</p>
        <span className="tag">{item.category}</span>
      </div>
      <Link
        className="comment-count"
        href={"/feedback/" + item.id + "#comments"}
        aria-label={
          commentCount(demo.snapshot, item.id) + " comments on " + item.title
        }
      >
        <span aria-hidden="true">◌</span> {commentCount(demo.snapshot, item.id)}
      </Link>
    </article>
  );
}
