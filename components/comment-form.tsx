"use client";
import { useRef, useState } from "react";
import { useDemo } from "./demo-provider";
import { commentTextSchema } from "@/lib/domain";
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
  const field = useRef<HTMLTextAreaElement>(null);
  const id = parentId ? "reply-" + parentId : "new-comment";
  async function submit() {
    const parsed = commentTextSchema.safeParse(content);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your comment.");
      field.current?.focus();
      return;
    }
    setError("");
    const accepted = await demo.run({
      kind: "comment",
      id: "local-" + crypto.randomUUID(),
      feedbackId,
      parentId,
      replyLabel,
      content: parsed.data,
    });
    if (accepted) {
      setContent("");
      onDone?.();
    }
  }
  return (
    <form
      className="comment-form"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      noValidate
    >
      <fieldset disabled={!demo.canMutate}>
        <legend>
          {parentId
            ? "Reply to @" + replyLabel
            : "Add a comment as Demo participant"}
        </legend>
        <label className="sr-only" htmlFor={id}>
          {parentId ? "Reply" : "Comment"}
        </label>
        <textarea
          ref={field}
          id={id}
          rows={3}
          maxLength={250}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={id + "-count" + (error ? " " + id + "-error" : "")}
        />
        <div className="form-actions">
          <span id={id + "-count"}>{250 - content.length} characters left</span>
          {onDone && (
            <button className="secondary" type="button" onClick={onDone}>
              Cancel reply
            </button>
          )}
          <button className="button" type="submit">
            {parentId ? "Post reply" : "Post comment"}
          </button>
        </div>
        {error && (
          <p className="error" id={id + "-error"}>
            {error}
          </p>
        )}
      </fieldset>
    </form>
  );
}
