import { Board } from "@/components/board";
import { siteName, siteUrl } from "@/lib/site";
const webSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
};
export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSite) }}
      />
      <Board />
    </>
  );
}
