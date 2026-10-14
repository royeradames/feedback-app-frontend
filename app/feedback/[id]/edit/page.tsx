import { EditFeedback } from "@/components/feedback-form";
import { routeId } from "@/lib/route-id";
export const metadata = {
  title: "Edit feedback",
  // This route shows the visitor's own browser-saved data, so it stays out of search.
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditFeedback id={routeId(id)} />;
}
