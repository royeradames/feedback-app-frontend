import { notFound } from 'next/navigation';
import { feedbackIdSchema } from './domain';
import { sample } from './fixtures';
export function routeId(id: string): string {
  if (
    !feedbackIdSchema.safeParse(id).success ||
    (id.startsWith('seed-') && !sample.feedback.some((item) => item.id === id))
  )
    notFound();
  return id;
}
