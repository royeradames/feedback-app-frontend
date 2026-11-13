import type { Feedback } from "@/lib/domain";

// Display labels from the official design; stored values stay lowercase.
const categoryLabels: Record<Feedback["category"], string> = {
  UI: "UI",
  UX: "UX",
  enhancement: "Enhancement",
  bug: "Bug",
  feature: "Feature",
};
export function categoryLabel(value: string): string {
  return categoryLabels[value as Feedback["category"]] ?? value;
}

const statusLabels: Record<Feedback["status"], string> = {
  suggestion: "Suggestion",
  planned: "Planned",
  "in-progress": "In-Progress",
  live: "Live",
};
export function statusLabel(value: Feedback["status"]): string {
  return statusLabels[value];
}

export const statusLanes = [
  {
    status: "planned",
    title: "Planned",
    description: "Ideas prioritized for research",
  },
  {
    status: "in-progress",
    title: "In-Progress",
    description: "Currently being developed",
  },
  {
    status: "live",
    title: "Live",
    description: "Released features",
  },
] as const;
