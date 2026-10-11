// Synthetic boards for the limit checks: `count` feedback requests and `comments` comments on the first one.
const uuid = (prefix: string, n: number) =>
  `local-${prefix}-0000-4000-8000-${String(n).padStart(12, '0')}`;
export function board(count: number, comments = 0) {
  const feedback = Array.from({ length: count }, (_, index) => ({
    id: uuid('00000000', index + 1),
    title: `Request ${index + 1}`,
    description: 'Synthetic request',
    category: 'feature' as const,
    status: 'suggestion' as const,
    authorId: 'demo' as const,
    baselineVotes: 0,
    order: index + 1,
  }));
  return {
    feedback,
    comments: Array.from({ length: comments }, (_, index) => ({
      id: uuid('11111111', index + 1),
      feedbackId: feedback[0]!.id,
      authorId: 'demo' as const,
      content: `Comment ${index + 1}`,
      parentId: null,
      replyLabel: '',
    })),
    votedIds: [],
  };
}
