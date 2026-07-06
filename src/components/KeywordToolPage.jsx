import SellerToolClient from "./SellerToolClient";
import { absoluteUrl } from "../lib/site";

export function KeywordToolPage({ page, faq, cta = "Open label tool", faqTitle = "Label crop FAQ" }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="seo-hero compact">
        <div className="seo-hero-inner">
          <span className="seo-kicker">{page.primaryKeyword}</span>
          <h1>{page.h1}</h1>
          <p>{page.description}</p>
          <div className="seo-actions">
            <a href="#tool">{cta}</a>
            <a href={absoluteUrl("/")}>All seller tools</a>
          </div>
        </div>
      </section>

      <main className="seo-section">
        <div className="seo-feature-grid">
          {page.sections.map((section) => (
            <article key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </article>
          ))}
        </div>
        <section className="faq-block">
          <h2>{faqTitle}</h2>
          {faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      </main>

      <div id="tool" className="tool-shell">
        <SellerToolClient />
      </div>
    </>
  );
}

export function keywordMetadata(page) {
  return {
    title: page.title,
    description: page.description,
    keywords: [page.primaryKeyword, ...page.related],
    alternates: {
      canonical: absoluteUrl(`/${page.slug}`),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: absoluteUrl(`/${page.slug}`),
      type: "website",
    },
  };
}
