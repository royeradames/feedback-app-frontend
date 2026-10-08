"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { actor } from "@/lib/fixtures";
import { type Comment } from "@/lib/domain";
import { pluralize } from "@/lib/plural";
import { useDemo } from "./demo-provider";
import { FeedbackCard } from "./feedback-card";
import { CommentForm } from "./comment-form";
import { LocalMissing } from "./feedback-form";
import { GoBack } from "./go-back";

function CommentRow({ comment }: { comment: Comment }) {
  const demo = useDemo();
  const user = actor(comment.authorId);
  const [replying, setReplying] = useState(false);
  const replyToggle = useRef<HTMLButtonElement>(null);
  return (
    <article className="comment" id={comment.id}>
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
      <div className="comment-heading">
        <h3>{user.name}</h3>
        <p>@{user.username}</p>
      </div>
      <button
        ref={replyToggle}
        className="reply-toggle"
        type="button"
        aria-disabled={!demo.canMutate || undefined}
        aria-busy={demo.storage.kind === "loading" || undefined}
        aria-expanded={replying}
        onClick={() => {
          if (demo.canMutate) setReplying(!replying);
        }}
      >
        Reply<span className="sr-only"> to {user.name}</span>
      </button>
      <p className="comment-content">
        {comment.replyLabel && (
          <strong className="mention">@{comment.replyLabel} </strong>
        )}
        {comment.content}
      </p>
      {replying && (
        <CommentForm
          key={comment.id + "-" + demo.loadVersion}
          feedbackId={comment.feedbackId}
          parentId={comment.id}
          replyLabel={user.username}
          onDone={() => {
            // The reply form unmounts; return focus to the button that opened it.
            setReplying(false);
            replyToggle.current?.focus();
          }}
        />
      )}
    </article>
  );
}

export function Detail({ id }: { id: string }) {
  const demo = useDemo();
  const item = demo.snapshot.feedback.find((item) => item.id === id);
  if (!item) return <LocalMissing loading={demo.storage.kind === "loading"} />;
  const comments = demo.snapshot.comments.filter(
    (comment) => comment.feedbackId === id,
  );
  const threads = comments.filter((comment) => comment.parentId === null);
  return (
    <div className="page-narrow detail-page">
      <div className="page-toolbar">
        <GoBack href="/" />
        <Link className="btn btn-blue" href={"/feedback/" + id + "/edit"}>
          Edit Feedback
        </Link>
      </div>
      <h1 className="sr-only">Feedback: {item.title}</h1>
      <FeedbackCard item={item} />
      <section className="panel comments-panel" id="comments" aria-labelledby="comments-heading">
        <h2 id="comments-heading">
          {pluralize(comments.length, "Comment", "Comments")}
        </h2>
        {threads.map((comment) => {
          const replies = comments.filter(
            (reply) => reply.parentId === comment.id,
          );
          return (
            <div className="thread" key={comment.id}>
              <CommentRow comment={comment} />
              {replies.length > 0 && (
                <div className="replies">
                  {replies.map((reply) => (
                    <CommentRow comment={reply} key={reply.id} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {comments.length === 0 && (
          <p className="no-comments">No comments yet. Add the first one below.</p>
        )}
      </section>
      <section className="panel add-comment">
        <CommentForm key={id + "-" + demo.loadVersion} feedbackId={id} />
      </section>
    </div>
  );
}
