import { EditFeedback } from "@/components/feedback-form";
import { routeId } from "@/lib/route-id";
export const metadata = { title: "Edit feedback" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditFeedback id={routeId(id)} />;
}
