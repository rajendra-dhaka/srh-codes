import { guides } from "../../lib/guides";
import { absoluteUrl, site } from "../../lib/site";

export const metadata = {
  title: "Practical Guides for Ecommerce Sellers",
  description: "Original guides for label sorting, packing picklists, Amazon India fees and listing prices, and GSTR-1, GSTR-2B, and GSTR-3B workflows.",
  alternates: { canonical: absoluteUrl("/guides") },
};

export default function GuidesPage() {
  return (
    <main className="guides-index">
      <header>
        <a href="/">SRH Codes</a>
        <span>Seller learning center</span>
        <h1>Practical guides for marketplace packing, pricing, and GST</h1>
        <p>These guides document the decisions behind the tools: how to reconcile source data, choose an output, verify the result, and avoid common packing or filing mistakes.</p>
      </header>
      <section className="guide-card-grid">
        {guides.map((guide) => (
          <a key={guide.slug} href={`/guides/${guide.slug}`}>
            <span>Updated {guide.updated}</span>
            <h2>{guide.title}</h2>
            <p>{guide.description}</p>
            <strong>Read guide</strong>
          </a>
        ))}
      </section>
      <footer><p>Published by {site.name}. Marketplace names are used descriptively; SRH Codes is not endorsed by those marketplaces.</p></footer>
    </main>
  );
}
