"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { actor } from "@/lib/fixtures";
import { type Comment } from "@/lib/domain";
import { useDemo } from "./demo-provider";
import { FeedbackCard } from "./feedback-card";
import { CommentForm } from "./comment-form";
import { LocalMissing } from "./feedback-form";
function CommentRow({ comment }: { comment: Comment }) {
  const demo = useDemo();
  const user = actor(comment.authorId);
  const [replying, setReplying] = useState(false);
  return (
    <article className="comment" id={comment.id}>
      <div className="comment-heading">
        {user.avatar ? (
          <Image
            src={user.avatar}
            width={40}
            height={40}
            alt=""
            className="avatar"
          />
        ) : (
          <span className="avatar demo-avatar" aria-hidden="true">
            D
          </span>
        )}
        <div>
          <h3>{user.name}</h3>
          <p>@{user.username}</p>
        </div>
        <button
          className="quiet"
          type="button"
          disabled={!demo.canMutate}
          aria-expanded={replying}
          onClick={() => setReplying(!replying)}
        >
          Reply<span className="sr-only"> to {user.name}</span>
        </button>
      </div>
      <p className="comment-content">
        {comment.replyLabel && <strong>@{comment.replyLabel} </strong>}
        {comment.content}
      </p>
      {replying && (
        <CommentForm
          key={comment.id + "-" + demo.loadVersion}
          feedbackId={comment.feedbackId}
          parentId={comment.id}
          replyLabel={user.username}
          onDone={() => setReplying(false)}
        />
      )}
    </article>
  );
}
export function Detail({ id }: { id: string }) {
  const demo = useDemo();
  const router = useRouter();
  const item = demo.snapshot.feedback.find((item) => item.id === id);
  if (!item) return <LocalMissing loading={demo.storage.kind === "loading"} />;
  const comments = demo.snapshot.comments.filter(
    (comment) => comment.feedbackId === id,
  );
  async function remove() {
    if (
      !window.confirm(
        "Delete this feedback and its comments from this browser’s demo?",
      )
    )
      return;
    if (await demo.run({ kind: "delete", id })) router.push("/");
  }
  return (
    <>
      <div className="detail-toolbar">
        <Link href="/">← Back to suggestions</Link>
        <Link className="secondary" href={"/feedback/" + id + "/edit"}>
          Edit feedback
        </Link>
      </div>
      <h1 className="sr-only">Feedback detail: {item.title}</h1>
      <FeedbackCard item={item} />
      <p className="record-meta">
        {actor(item.authorId).name} · {item.status.replace("-", " ")} · Upvotes
        include a fictional sample baseline of {item.baselineVotes}.
      </p>
      <section className="panel" id="comments">
        <h2>{comments.length} comments and replies</h2>
        {comments
          .filter((comment) => comment.parentId === null)
          .map((comment) => (
            <div className="thread" key={comment.id}>
              <CommentRow comment={comment} />
              <div className="replies">
                {comments
                  .filter((reply) => reply.parentId === comment.id)
                  .map((reply) => (
                    <CommentRow comment={reply} key={reply.id} />
                  ))}
              </div>
            </div>
          ))}
        {comments.length === 0 && (
          <p>No comments yet. Add a local comment below.</p>
        )}
      </section>
      <section className="panel">
        <CommentForm key={id + "-" + demo.loadVersion} feedbackId={id} />
      </section>
      <details className="delete-panel">
        <summary>Delete this demo feedback</summary>
        <p>
          This removes the feedback, comments and your vote from this browser
          only.
        </p>
        <button
          className="danger"
          type="button"
          disabled={!demo.canMutate}
          onClick={() => void remove()}
        >
          Delete feedback
        </button>
      </details>
    </>
  );
}
