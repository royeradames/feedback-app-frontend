"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";
import {
  categories,
  statuses,
  feedbackInputSchema,
  type Feedback,
  type FeedbackInput,
} from "@/lib/domain";
import { ConfirmDialog } from "./confirm-dialog";
import { useDemo } from "./demo-provider";
import { Dropdown } from "./dropdown";
import { GoBack } from "./go-back";
import { categoryLabel, statusLabel } from "./labels";

// Field order on screen, mapped to each control's id, for focusing the first error.
const fieldIds = [
  ["title", "title"],
  ["category", "category"],
  ["status", "feedback-status"],
  ["description", "description"],
] as const;
const categoryOptions = categories.map((value) => ({
  value,
  label: categoryLabel(value),
}));
const statusOptions = statuses.map((value) => ({
  value,
  label: statusLabel(value),
}));

export function FeedbackForm({ item }: { item?: Feedback }) {
  const demo = useDemo();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<"save" | "delete" | null>(null);
  const [confirming, setConfirming] = useState(false);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const back = item ? "/feedback/" + item.id : "/";
  const defaults: FeedbackInput = item
    ? {
        title: item.title,
        description: item.description,
        category: item.category,
        status: item.status,
      }
    : { title: "", description: "", category: "feature", status: "suggestion" };
  const form = useForm({
    defaultValues: defaults,
    onSubmit: async ({ value }) => {
      if (demo.busy) return;
      const parsed = feedbackInputSchema.safeParse(value);
      if (!parsed.success) {
        const next: Record<string, string> = Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        );
        setErrors(next);
        const first = fieldIds.find(([name]) => next[name]);
        if (first) document.getElementById(first[1])?.focus();
        return;
      }
      setErrors({});
      const id = item?.id ?? "local-" + crypto.randomUUID();
      setPending("save");
      const accepted = await demo.run(
        item
          ? { kind: "edit", id, input: parsed.data }
          : { kind: "create", id, input: parsed.data },
      );
      setPending(null);
      if (accepted) router.push("/feedback/" + id);
    },
  });
  async function remove() {
    if (!item || demo.busy) return;
    setPending("delete");
    const accepted = await demo.run({ kind: "delete", id: item.id });
    setPending(null);
    if (accepted) router.push("/");
    else setConfirming(false);
  }
  return (
    <div className="page-form">
      <GoBack href={back} />
      <section className="panel form-panel" aria-labelledby="form-heading">
        <Image
          className="form-icon"
          src={
            item
              ? "/assets/shared/icon-edit-feedback.svg"
              : "/assets/shared/icon-new-feedback.svg"
          }
          width={56}
          height={56}
          alt=""
        />
        <h1 id="form-heading">
          {item ? `Editing ‘${item.title}’` : "Create New Feedback"}
        </h1>
        <p className="field-note">
          Saved only in this browser’s demo. Nothing is sent.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
          noValidate
        >
          <fieldset disabled={!demo.canMutate}>
            <legend className="sr-only">Feedback details</legend>
            <form.Field name="title">
              {(field) => (
                <div className="field">
                  <label htmlFor="title">Feedback Title</label>
                  <p id="title-help">Add a short, descriptive headline</p>
                  <input
                    id="title"
                    type="text"
                    value={field.state.value}
                    maxLength={100}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={!!errors.title}
                    aria-describedby={
                      "title-help" + (errors.title ? " title-error" : "")
                    }
                  />
                  {errors.title && (
                    <p id="title-error" className="error">
                      {errors.title}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
            <form.Field name="category">
              {(field) => (
                <div className="field">
                  <span className="label" id="category-label">
                    Category
                  </span>
                  <p id="category-help">Choose a category for your feedback</p>
                  <Dropdown
                    id="category"
                    className="field-dropdown"
                    value={field.state.value}
                    options={categoryOptions}
                    onChange={(value) => field.handleChange(value)}
                    labelledBy="category-label"
                    describedBy="category-help"
                  />
                </div>
              )}
            </form.Field>
            {item && (
              <form.Field name="status">
                {(field) => (
                  <div className="field">
                    <span className="label" id="status-label">
                      Update Status
                    </span>
                    <p id="status-help">Change feature state</p>
                    <Dropdown
                      id="feedback-status"
                      className="field-dropdown"
                      value={field.state.value}
                      options={statusOptions}
                      onChange={(value) => field.handleChange(value)}
                      labelledBy="status-label"
                      describedBy="status-help"
                    />
                  </div>
                )}
              </form.Field>
            )}
            <form.Field name="description">
              {(field) => (
                <div className="field">
                  <label htmlFor="description">Feedback Detail</label>
                  <p id="description-help">
                    Include any specific comments on what should be improved,
                    added, etc.
                  </p>
                  <textarea
                    id="description"
                    rows={4}
                    maxLength={1000}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={!!errors.description}
                    aria-describedby={
                      "description-help" +
                      (errors.description ? " description-error" : "")
                    }
                  />
                  {errors.description && (
                    <p id="description-error" className="error">
                      {errors.description}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
            <div className="form-actions">
              {item && (
                <button
                  ref={deleteButton}
                  className="btn btn-red delete"
                  type="button"
                  onClick={() => setConfirming(true)}
                >
                  Delete
                </button>
              )}
              <button
                className="btn btn-dark"
                type="button"
                onClick={() => router.push(back)}
              >
                Cancel
              </button>
              <button
                className="btn btn-purple"
                type="submit"
                aria-busy={demo.busy || undefined}
              >
                {pending === "save"
                  ? "Saving…"
                  : item
                    ? "Save Changes"
                    : "Add Feedback"}
              </button>
            </div>
          </fieldset>
        </form>
      </section>
      {item && (
        <ConfirmDialog
          open={confirming}
          title="Delete this feedback?"
          confirmLabel="Delete feedback"
          busy={pending === "delete"}
          onConfirm={() => void remove()}
          onClose={() => {
            if (pending === "delete") return;
            setConfirming(false);
            deleteButton.current?.focus();
          }}
        >
          <p>
            “{item.title}”, its comments and your vote will be removed from this
            browser’s demo. This cannot be undone.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}

export function NewFeedback() {
  const demo = useDemo();
  return <FeedbackForm key={"new-" + demo.loadVersion} />;
}

export function EditFeedback({ id }: { id: string }) {
  const demo = useDemo();
  const item = demo.snapshot.feedback.find((item) => item.id === id);
  if (!item) return <LocalMissing loading={demo.storage.kind === "loading"} />;
  return <FeedbackForm key={id + "-" + demo.loadVersion} item={item} />;
}

export function LocalMissing({ loading = false }: { loading?: boolean }) {
  return (
    <section className="panel page-narrow missing" aria-busy={loading || undefined}>
      <h1>
        {loading
          ? "Loading feedback…"
          : "Feedback is unavailable in this browser"}
      </h1>
      <p>
        {loading
          ? "Checking your saved demo."
          : "This local item may have been deleted or created in a different browser. Local records are not public profiles or shared URLs."}
      </p>
      <Link className="btn btn-purple" href="/">
        Return to suggestions
      </Link>
    </section>
  );
}
