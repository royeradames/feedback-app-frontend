import { Detail } from "@/components/detail";
import { routeId } from "@/lib/route-id";
export const metadata = { title: "Feedback detail" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Detail id={routeId(id)} />;
}
