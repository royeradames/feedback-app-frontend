"use client";
import { useRef, useState } from "react";
import { useDemo } from "./demo-provider";
import { commentTextSchema } from "@/lib/domain";
import { pluralize } from "@/lib/plural";

const limit = 250;

export function CommentForm({
  feedbackId,
  parentId = null,
  replyLabel = "",
  onDone,
}: {
  feedbackId: string;
  parentId?: string | null;
  replyLabel?: string;
  onDone?: () => void;
}) {
  const demo = useDemo();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);
  const id = parentId ? "reply-" + parentId : "new-comment";
  async function submit() {
    if (demo.busy) return;
    const parsed = commentTextSchema.safeParse(content);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your comment.");
      field.current?.focus();
      return;
    }
    setError("");
    setPending(true);
    const accepted = await demo.run({
      kind: "comment",
      id: "local-" + crypto.randomUUID(),
      feedbackId,
      parentId,
      replyLabel,
      content: parsed.data,
    });
    setPending(false);
    if (accepted) {
      setContent("");
      onDone?.();
    }
  }
  const left = limit - content.length;
  return (
    <form
      className={parentId ? "comment-form reply-form" : "comment-form"}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      noValidate
    >
      <fieldset disabled={!demo.canMutate}>
        {parentId ? (
          <label className="sr-only" htmlFor={id}>
            Reply to @{replyLabel}
          </label>
        ) : (
          <>
            <h2>
              <label id="new-comment-label" htmlFor={id}>
                Add Comment
              </label>
            </h2>
            <p className="field-note">
              Posts as Demo participant, saved only in this browser.
            </p>
          </>
        )}
        <textarea
          ref={field}
          id={id}
          rows={parentId ? 2 : 3}
          maxLength={limit}
          placeholder="Type your comment here"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={id + "-count" + (error ? " " + id + "-error" : "")}
        />
        {error && (
          <p className="error" id={id + "-error"}>
            {error}
          </p>
        )}
        <div className="comment-actions">
          <span id={id + "-count"} className="char-count">
            {pluralize(left, "Character", "Characters")} left
          </span>
          <div className="button-row">
            {onDone && (
              <button className="btn btn-dark" type="button" onClick={onDone}>
                Cancel reply
              </button>
            )}
            <button
              className="btn btn-purple"
              type="submit"
              aria-busy={demo.busy || undefined}
            >
              {pending ? "Posting…" : parentId ? "Post Reply" : "Post Comment"}
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
