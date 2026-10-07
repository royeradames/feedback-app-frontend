"use client";
import { useDemo } from "./demo-provider";
import { FeedbackCard } from "./feedback-card";
const lanes = [
  {
    status: "planned",
    title: "Planned",
    description: "Ideas being considered.",
  },
  {
    status: "in-progress",
    title: "In progress",
    description: "Work in the fictional sample pipeline.",
  },
  {
    status: "live",
    title: "Live",
    description: "Sample improvements marked complete.",
  },
];
export function Roadmap() {
  const { snapshot } = useDemo();
  return (
    <>
      <h1>Roadmap</h1>
      <p className="intro">
        Status changes here are part of this browser-local demonstration.
      </p>
      <div className="roadmap-grid">
        {lanes.map((lane) => (
          <section className={"roadmap-lane " + lane.status} key={lane.status}>
            <h2>
              {lane.title} (
              {
                snapshot.feedback.filter((item) => item.status === lane.status)
                  .length
              }
              )
            </h2>
            <p>{lane.description}</p>
            {snapshot.feedback
              .filter((item) => item.status === lane.status)
              .map((item) => (
                <FeedbackCard key={item.id} item={item} heading="h3" />
              ))}
            {!snapshot.feedback.some((item) => item.status === lane.status) && (
              <p>No feedback in this stage.</p>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
