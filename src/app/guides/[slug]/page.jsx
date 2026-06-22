import { notFound } from "next/navigation";
import GuideArticle from "../../../components/GuideArticle";
import { getGuide, guides } from "../../../lib/guides";
import { absoluteUrl, site } from "../../../lib/site";

export function generateStaticParams() {
  return guides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: absoluteUrl(`/guides/${guide.slug}`) },
    openGraph: { title: guide.title, description: guide.description, url: absoluteUrl(`/guides/${guide.slug}`), siteName: site.name, type: "article" },
  };
}

export default async function GuideRoute({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    dateModified: "2026-06-22",
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: absoluteUrl(`/guides/${guide.slug}`),
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><GuideArticle guide={guide} /></>;
}
