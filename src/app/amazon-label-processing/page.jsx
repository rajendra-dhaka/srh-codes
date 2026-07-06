import SellerToolClient from "../../components/SellerToolClient";
import { absoluteUrl, keywordPages, site } from "../../lib/site";

const page = keywordPages.find((item) => item.slug === "amazon-label-processing");

export const metadata = {
  title: page.title,
  description: page.description,
  keywords: [page.primaryKeyword, ...page.related],
  alternates: {
    canonical: absoluteUrl("/amazon-label-processing"),
  },
  openGraph: {
    title: page.title,
    description: page.description,
    url: absoluteUrl("/amazon-label-processing"),
    siteName: site.name,
    type: "website",
  },
};

export default function AmazonLabelProcessingPage() {
  const faq = [
    {
      question: "Can I separate Amazon shipping labels and invoice pages?",
      answer: "Yes. Upload Amazon Print Documents PDFs and generate separate shipping-label and billing-invoice PDF downloads.",
    },
    {
      question: "Can I download shipping labels without Amazon invoice pages?",
      answer: "Yes. After processing, use the shipping-label download for clean labels, the billing-pages download for invoices, or the combined PDF when both are needed.",
    },
    {
      question: "Can the tool print SKU and product title on Amazon shipping labels?",
      answer: "Yes. Choose clean labels, SKU plus quantity, or title plus SKU plus quantity before generating the shipping PDF.",
    },
    {
      question: "Does it handle multi-page invoices?",
      answer: "Yes. Billing pages after a shipping label stay attached until the next shipping label, so multi-page invoices remain grouped with the correct order.",
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
            <a href="#tool">Open Amazon label tool</a>
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
          <h2>Amazon label processing FAQ</h2>
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
