import { z } from 'zod';

export const categorySchema = z.enum([
  'UI',
  'UX',
  'enhancement',
  'bug',
  'feature',
]);
export const statusSchema = z.enum([
  'suggestion',
  'planned',
  'in-progress',
  'live',
]);
export const categories = categorySchema.options;
export const statuses = statusSchema.options;
export const feedbackIdSchema = z
  .string()
  .regex(
    /^(seed-\d{2}|local-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/,
  );
const commentIdSchema = z
  .string()
  .regex(
    /^(comment-\d{2}|local-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/,
  );
export const actorSchema = z.enum([
  'demo',
  'sample',
  'user-01',
  'user-02',
  'user-03',
  'user-04',
  'user-05',
  'user-06',
  'user-07',
  'user-08',
  'user-09',
  'user-10',
  'user-11',
  'user-12',
]);
export const feedbackInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Enter a title.')
      .max(100, 'Use 100 characters or fewer.'),
    description: z
      .string()
      .trim()
      .min(1, 'Describe your feedback.')
      .max(1000, 'Use 1,000 characters or fewer.'),
    category: categorySchema,
    status: statusSchema,
  })
  .strict();
export const commentTextSchema = z
  .string()
  .trim()
  .min(1, 'Write a comment.')
  .max(250, 'Use 250 characters or fewer.');
const feedbackSchema = feedbackInputSchema
  .extend({
    id: feedbackIdSchema,
    authorId: actorSchema,
    baselineVotes: z.number().int().min(0).max(100000),
    order: z.number().int().min(0).max(100000),
  })
  .strict();
const commentSchema = z
  .object({
    id: commentIdSchema,
    feedbackId: feedbackIdSchema,
    authorId: actorSchema,
    content: z.string().min(1).max(1000),
    parentId: commentIdSchema.nullable(),
    replyLabel: z.string().max(80),
  })
  .strict();
export const snapshotSchema = z
  .object({
    feedback: z.array(feedbackSchema).max(100),
    comments: z.array(commentSchema).max(500),
    votedIds: z.array(feedbackIdSchema).max(100),
  })
  .strict()
  .superRefine((value, context) => {
    const ids = new Set(value.feedback.map((item) => item.id));
    const comments = new Map(value.comments.map((item) => [item.id, item]));
    if (
      ids.size !== value.feedback.length ||
      comments.size !== value.comments.length ||
      new Set(value.votedIds).size !== value.votedIds.length
    )
      context.addIssue({ code: 'custom', message: 'Duplicate record IDs.' });
    if (value.votedIds.some((id) => !ids.has(id)))
      context.addIssue({
        code: 'custom',
        message: 'A vote refers to missing feedback.',
      });
    for (const comment of value.comments) {
      const parent =
        comment.parentId === null ? null : comments.get(comment.parentId);
      if (
        !ids.has(comment.feedbackId) ||
        (comment.parentId !== null &&
          (!parent ||
            parent.parentId !== null ||
            parent.feedbackId !== comment.feedbackId ||
            parent.id === comment.id))
      )
        context.addIssue({
          code: 'custom',
          message: 'A comment relationship is invalid.',
        });
    }
  });
export type Snapshot = z.infer<typeof snapshotSchema>;
export type Feedback = Snapshot['feedback'][number];
export type Comment = Snapshot['comments'][number];
export type FeedbackInput = z.infer<typeof feedbackInputSchema>;
export const documentSchema = z
  .object({
    version: z.literal(1),
    revision: z.string().uuid(),
    snapshot: snapshotSchema,
  })
  .strict();
export const STORAGE_KEY = 'royer-feedback-demo:v1';
export const MAX_STORAGE_CHARS = 500000;
export type Document = z.infer<typeof documentSchema>;
export function parseDocument(raw: string): Document {
  if (raw.length > MAX_STORAGE_CHARS)
    throw new Error('Saved demo is too large.');
  return documentSchema.parse(JSON.parse(raw));
}
export const sortSchema = z.enum([
  'votes-desc',
  'votes-asc',
  'comments-desc',
  'comments-asc',
]);
export type Sort = z.infer<typeof sortSchema>;
export function voteCount(snapshot: Snapshot, item: Feedback) {
  return item.baselineVotes + Number(snapshot.votedIds.includes(item.id));
}
export function commentCount(snapshot: Snapshot, id: string) {
  return snapshot.comments.filter((comment) => comment.feedbackId === id)
    .length;
}
export function suggestions(
  snapshot: Snapshot,
  category: string,
  sort: Sort,
): Feedback[] {
  const metric = (item: Feedback) =>
    sort.startsWith('votes')
      ? voteCount(snapshot, item)
      : commentCount(snapshot, item.id);
  const direction = sort.endsWith('desc') ? -1 : 1;
  return snapshot.feedback
    .filter(
      (item) =>
        item.status === 'suggestion' &&
        (category === 'all' || item.category === category),
    )
    .toSorted(
      (a, b) =>
        direction * (metric(a) - metric(b)) ||
        a.order - b.order ||
        a.id.localeCompare(b.id),
    );
}
export type Command =
  | { kind: 'create'; id: string; input: FeedbackInput }
  | { kind: 'edit'; id: string; input: FeedbackInput }
  | { kind: 'delete'; id: string }
  | { kind: 'vote'; id: string }
  | {
      kind: 'comment';
      id: string;
      feedbackId: string;
      content: string;
      parentId: string | null;
      replyLabel: string;
    };
// These commands exercise fictional sample data locally. They are not an account permission model.
export function applyCommand(snapshot: Snapshot, command: Command): Snapshot {
  if (command.kind === 'create') {
    const input = feedbackInputSchema.parse(command.input);
    return snapshotSchema.parse({
      ...snapshot,
      feedback: [
        ...snapshot.feedback,
        {
          ...input,
          id: feedbackIdSchema.parse(command.id),
          authorId: 'demo',
          baselineVotes: 0,
          order:
            Math.max(0, ...snapshot.feedback.map((item) => item.order)) + 1,
        },
      ],
    });
  }
  const targetId = command.kind === 'comment' ? command.feedbackId : command.id;
  if (!snapshot.feedback.some((item) => item.id === targetId))
    throw new Error('This feedback is no longer available.');
  if (command.kind === 'comment') {
    const parent =
      command.parentId === null
        ? null
        : snapshot.comments.find(
            (item) =>
              item.id === command.parentId &&
              item.feedbackId === command.feedbackId,
          );
    if (command.parentId !== null && !parent)
      throw new Error('This comment is no longer available.');
    return snapshotSchema.parse({
      ...snapshot,
      comments: [
        ...snapshot.comments,
        {
          id: commentIdSchema.parse(command.id),
          feedbackId: command.feedbackId,
          content: commentTextSchema.parse(command.content),
          authorId: 'demo',
          parentId: parent ? (parent.parentId ?? parent.id) : null,
          replyLabel: command.replyLabel,
        },
      ],
    });
  }
  if (command.kind === 'edit')
    return snapshotSchema.parse({
      ...snapshot,
      feedback: snapshot.feedback.map((item) =>
        item.id === command.id
          ? { ...item, ...feedbackInputSchema.parse(command.input) }
          : item,
      ),
    });
  if (command.kind === 'delete')
    return {
      ...snapshot,
      feedback: snapshot.feedback.filter((item) => item.id !== command.id),
      comments: snapshot.comments.filter(
        (item) => item.feedbackId !== command.id,
      ),
      votedIds: snapshot.votedIds.filter((id) => id !== command.id),
    };
  if (command.kind === 'vote')
    return {
      ...snapshot,
      votedIds: snapshot.votedIds.includes(command.id)
        ? snapshot.votedIds.filter((id) => id !== command.id)
        : [...snapshot.votedIds, command.id],
    };
  const exhaustive: never = command;
  return exhaustive;
}
