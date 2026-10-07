"use client";
import Image from "next/image";
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
  const comments = commentCount(demo.snapshot, item.id);
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
        aria-label={`${comments} ${comments === 1 ? "comment" : "comments"} on ${item.title}`}
      >
        <Image
          src="/assets/shared/icon-comments.svg"
          width={18}
          height={16}
          alt=""
        />
        {comments}
      </Link>
    </article>
  );
}
