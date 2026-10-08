import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCommand,
  suggestions,
  voteCount,
  snapshotSchema,
  parseDocument,
  type FeedbackInput,
} from '../lib/domain.ts';
import { sample } from '../lib/fixtures.ts';
test('historical sample keeps 12 requests and 19 comments, with six suggestions and an empty demo vote set', () => {
  assert.equal(sample.feedback.length, 12);
  assert.equal(sample.comments.length, 19);
  assert.deepEqual(
    suggestions(sample, 'all', 'votes-desc').map((item) => item.id),
    ['seed-01', 'seed-02', 'seed-03', 'seed-04', 'seed-05', 'seed-06'],
  );
  assert.equal(sample.votedIds.length, 0);
});
test('one actor vote toggles independently from the fictional aggregate and never duplicates', () => {
  const voted = applyCommand(sample, { kind: 'vote', id: 'seed-01' });
  assert.equal(voteCount(voted, voted.feedback[0]), 113);
  assert.equal(voted.feedback[0].baselineVotes, 112);
  assert.equal(
    voteCount(
      applyCommand(voted, { kind: 'vote', id: 'seed-01' }),
      sample.feedback[0],
    ),
    112,
  );
  assert.equal(sample.votedIds.length, 0);
});
test('four sorts are deterministic and category filtering does not mutate source', () => {
  assert.deepEqual(
    suggestions(sample, 'feature', 'votes-asc').map((item) => item.id),
    ['seed-05', 'seed-03', 'seed-02'],
  );
  assert.deepEqual(
    suggestions(sample, 'all', 'comments-desc').map((item) => item.id),
    ['seed-02', 'seed-05', 'seed-01', 'seed-04', 'seed-03', 'seed-06'],
  );
  assert.deepEqual(
    suggestions(sample, 'all', 'comments-asc').map((item) => item.id),
    ['seed-06', 'seed-03', 'seed-01', 'seed-04', 'seed-05', 'seed-02'],
  );
  assert.equal(sample.feedback[0].id, 'seed-01');
});
test('local CRUD validates fields, preserves votes on edit and removes dependent records', () => {
  const id = 'local-00000000-0000-4000-8000-000000000001';
  const input = {
    title: 'A local idea',
    description: 'A useful explanation',
    category: 'UX',
    status: 'suggestion',
  } satisfies FeedbackInput;
  const created = applyCommand(sample, { kind: 'create', id, input });
  const row = created.feedback.find((item) => item.id === id);
  assert.equal(row?.baselineVotes, 0);
  assert.equal(row?.authorId, 'demo');
  const edited = applyCommand(created, {
    kind: 'edit',
    id: 'seed-01',
    input: { ...input, title: 'Updated sample' },
  });
  assert.equal(edited.feedback[0].baselineVotes, 112);
  const deleted = applyCommand(edited, { kind: 'delete', id: 'seed-01' });
  assert.equal(
    deleted.comments.some((item) => item.feedbackId === 'seed-01'),
    false,
  );
  assert.throws(() =>
    applyCommand(sample, {
      kind: 'create',
      id,
      input: { ...input, title: ' ' },
    }),
  );
  assert.equal(sample.feedback[0].title, 'Add tags for solutions');
});
test('reply targets use stable IDs; replying to a reply stays under the same thread', () => {
  const next = applyCommand(sample, {
    kind: 'comment',
    id: 'local-00000000-0000-4000-8000-000000000002',
    feedbackId: 'seed-02',
    content: 'A new reply',
    parentId: 'comment-05',
    replyLabel: 'annev1990',
  });
  assert.equal(next.comments.at(-1)?.parentId, 'comment-04');
  assert.equal(next.comments.at(-1)?.authorId, 'demo');
  assert.throws(() =>
    applyCommand(sample, {
      kind: 'comment',
      id: 'local-00000000-0000-4000-8000-000000000003',
      feedbackId: 'seed-01',
      content: 'Wrong thread',
      parentId: 'comment-04',
      replyLabel: 'x',
    }),
  );
  assert.equal(sample.comments[4].replyLabel, 'hummingbird1');
});
test('boundary rejects duplicate IDs, missing relationships, malformed and oversized data', () => {
  assert.equal(
    snapshotSchema.safeParse({ ...sample, votedIds: ['seed-99'] }).success,
    false,
  );
  assert.equal(
    snapshotSchema.safeParse({
      ...sample,
      feedback: [...sample.feedback, sample.feedback[0]],
    }).success,
    false,
  );
  assert.throws(() => parseDocument('{broken'));
  assert.throws(() => parseDocument(' '.repeat(500001)));
});
