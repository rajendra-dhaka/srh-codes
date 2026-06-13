import SellerToolClient from "../../components/SellerToolClient";
import { absoluteUrl, keywordPages, site } from "../../lib/site";

const page = keywordPages.find((item) => item.slug === "meesho-label-4-in-1");

export const metadata = {
  title: page.title,
  description: page.description,
  keywords: [page.primaryKeyword, ...page.related],
  alternates: {
    canonical: absoluteUrl("/meesho-label-4-in-1"),
  },
  openGraph: {
    title: page.title,
    description: page.description,
    url: absoluteUrl("/meesho-label-4-in-1"),
    siteName: site.name,
    type: "website",
  },
};

export default function MeeshoLabelPage() {
  const faq = [
    {
      question: "Can I print four Meesho labels on one A4 page?",
      answer: "Yes. Upload the Meesho label PDF and generate a 4-in-1 A4 PDF.",
    },
    {
      question: "Does the tool change the barcode or label data?",
      answer: "No. The tool embeds the original label pages and scales them into a 2x2 A4 layout.",
    },
    {
      question: "Do I need to upload the PDF to a server?",
      answer: "No. Processing happens locally in your browser.",
    },
  ];
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
            <a href="#tool">Open Meesho 4-in-1 tool</a>
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
          <h2>Meesho label 4-in-1 FAQ</h2>
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

