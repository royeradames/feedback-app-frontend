"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  categories,
  statuses,
  feedbackInputSchema,
  type Feedback,
  type FeedbackInput,
} from "@/lib/domain";
import { useDemo } from "./demo-provider";
export function FeedbackForm({ item }: { item?: Feedback }) {
  const demo = useDemo();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
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
      const parsed = feedbackInputSchema.safeParse(value);
      if (!parsed.success) {
        setErrors(
          Object.fromEntries(
            parsed.error.issues.map((issue) => [
              String(issue.path[0]),
              issue.message,
            ]),
          ),
        );
        return;
      }
      setErrors({});
      const id = item?.id ?? "local-" + crypto.randomUUID();
      const accepted = await demo.run(
        item
          ? { kind: "edit", id, input: parsed.data }
          : { kind: "create", id, input: parsed.data },
      );
      if (accepted) router.push("/feedback/" + id);
    },
  });
  return (
    <section className="panel form-panel">
      <Link className="back" href={item ? "/feedback/" + item.id : "/"}>
        ← Back to {item ? "feedback" : "suggestions"}
      </Link>
      <h1>{item ? "Edit feedback" : "Create new feedback"}</h1>
      <p>Changes affect this browser’s fictional sample only.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
        noValidate
      >
        <fieldset disabled={!demo.canMutate}>
          <legend className="sr-only">Feedback details</legend>
          <form.Subscribe selector={(state) => state.values}>
            {(values) => (
              <p className="draft-state" role="status">
                {JSON.stringify(values) === JSON.stringify(defaults)
                  ? "No unsaved form changes"
                  : "Unsaved form changes"}
              </p>
            )}
          </form.Subscribe>
          <form.Field name="title">
            {(field) => (
              <div className="field">
                <label htmlFor="title">Feedback title</label>
                <p id="title-help">
                  Add a short, descriptive headline. Up to 100 characters.
                </p>
                <input
                  id="title"
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
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(
                      feedbackInputSchema.shape.category.parse(
                        event.target.value,
                      ),
                    )
                  }
                  onBlur={field.handleBlur}
                  aria-invalid={!!errors.category}
                  aria-describedby={
                    errors.category ? "category-error" : undefined
                  }
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p id="category-error" className="error">
                    {errors.category}
                  </p>
                )}
              </div>
            )}
          </form.Field>
          <form.Field name="status">
            {(field) => (
              <div className="field">
                <label htmlFor="feedback-status">Status</label>
                <select
                  id="feedback-status"
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(
                      feedbackInputSchema.shape.status.parse(
                        event.target.value,
                      ),
                    )
                  }
                  onBlur={field.handleBlur}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("-", " ")}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <div className="field">
                <label htmlFor="description">Feedback detail</label>
                <p id="description-help">
                  Explain the improvement. Up to 1,000 characters.
                </p>
                <textarea
                  id="description"
                  rows={5}
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
            <button
              className="secondary"
              type="button"
              onClick={() => router.push(item ? "/feedback/" + item.id : "/")}
            >
              Cancel
            </button>
            <button className="button" type="submit">
              {demo.busy ? "Saving…" : item ? "Save changes" : "Add feedback"}
            </button>
          </div>
        </fieldset>
      </form>
    </section>
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
    <section className="panel">
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
      <Link href="/">Return to suggestions</Link>
    </section>
  );
}
