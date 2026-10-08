"use client";
import Image from "next/image";
import Link from "next/link";
import { commentCount, voteCount, type Feedback } from "@/lib/domain";
import { pluralize } from "@/lib/plural";
import { useDemo } from "./demo-provider";
import { ChevronUp } from "./icons";
import { categoryLabel, statusLabel } from "./labels";

export function FeedbackCard({
  item,
  heading = "h2",
  variant = "list",
}: {
  item: Feedback;
  heading?: "h1" | "h2" | "h3";
  variant?: "list" | "roadmap";
}) {
  const demo = useDemo();
  const Heading = heading;
  const votes = voteCount(demo.snapshot, item);
  const comments = commentCount(demo.snapshot, item.id);
  return (
    <article
      className={`feedback-card ${variant} status-${item.status}`}
      data-feedback-id={item.id}
    >
      {variant === "roadmap" && (
        <p className="card-status">{statusLabel(item.status)}</p>
      )}
      <div className="feedback-copy">
        <Heading>
          <Link href={"/feedback/" + item.id}>{item.title}</Link>
        </Heading>
        <p>{item.description}</p>
        <span className="tag">{categoryLabel(item.category)}</span>
      </div>
      <button
        className="vote"
        type="button"
        // Busy, not disabled: while the saved demo loads (or storage can't take
        // changes, which the banner explains) the button stays focusable.
        aria-disabled={!demo.canMutate || undefined}
        aria-busy={demo.busy || demo.storage.kind === "loading" || undefined}
        aria-pressed={demo.snapshot.votedIds.includes(item.id)}
        aria-label={`Upvote ${item.title} (${pluralize(votes, "vote", "votes")})`}
        onClick={() => {
          if (demo.canMutate) void demo.run({ kind: "vote", id: item.id });
        }}
      >
        <ChevronUp />
        <span>{votes}</span>
      </button>
      <Link
        className={"comment-count" + (comments === 0 ? " none" : "")}
        href={"/feedback/" + item.id + "#comments"}
        aria-label={`${pluralize(comments, "comment", "comments")} on ${item.title}`}
      >
        <Image
          src="/assets/shared/icon-comments.svg"
          width={18}
          height={16}
          alt=""
        />
        <span>{comments}</span>
      </Link>
    </article>
  );
}
