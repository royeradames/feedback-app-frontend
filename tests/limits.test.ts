import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCommand,
  limitMessage,
  MAX_COMMENTS,
  MAX_FEEDBACK,
  snapshotSchema,
} from '../lib/domain.ts';
import { board } from './fixtures/library.ts';

const input = {
  title: 'One more',
  description: 'Another request',
  category: 'UI' as const,
  status: 'suggestion' as const,
};
const newId = 'local-22222222-0000-4000-8000-000000000001';

for (const count of [1, 6, 30, 100]) {
  test(`${count} feedback requests: adding one either works or is refused in plain words`, () => {
    const snapshot = snapshotSchema.parse(board(count));
    const create = () =>
      applyCommand(snapshot, { kind: 'create', id: newId, input });
    if (count < MAX_FEEDBACK) {
      assert.equal(limitMessage(snapshot, 'feedback'), null);
      assert.equal(create().feedback.length, count + 1);
      return;
    }
    const message =
      'This demo holds 100 feedback requests, the most it can. Delete one before adding another.';
    assert.equal(limitMessage(snapshot, 'feedback'), message);
    assert.throws(create, { message });
  });
}

test('at 500 comments, a comment or reply is refused in plain words', () => {
  const snapshot = snapshotSchema.parse(board(100, MAX_COMMENTS));
  const message =
    'This demo holds 500 comments, the most it can. Delete a feedback request that has comments, then try again.';
  assert.equal(limitMessage(snapshot, 'comment'), message);
  assert.throws(
    () =>
      applyCommand(snapshot, {
        kind: 'comment',
        id: newId,
        feedbackId: snapshot.feedback[1]!.id,
        content: 'Hello',
        parentId: null,
        replyLabel: '',
      }),
    { message },
  );
  // A reply to an existing comment is refused the same way.
  assert.throws(
    () =>
      applyCommand(snapshot, {
        kind: 'comment',
        id: newId,
        feedbackId: snapshot.feedback[0]!.id,
        content: 'A reply',
        parentId: snapshot.comments[0]!.id,
        replyLabel: 'demo',
      }),
    { message },
  );
  const roomy = snapshotSchema.parse(board(100, MAX_COMMENTS - 1));
  assert.equal(limitMessage(roomy, 'comment'), null);
});
