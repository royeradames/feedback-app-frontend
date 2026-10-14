import { Detail } from "@/components/detail";
import { routeId } from "@/lib/route-id";
export const metadata = {
  title: "Feedback detail",
  // This route shows the visitor's own browser-saved data, so it stays out of search.
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Detail id={routeId(id)} />;
}
