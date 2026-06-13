import SellerToolClient from "../../components/SellerToolClient";
import { absoluteUrl, keywordPages, site } from "../../lib/site";

const page = keywordPages.find((item) => item.slug === "flipkart-label-crop");

export const metadata = {
  title: page.title,
  description: page.description,
  keywords: [page.primaryKeyword, ...page.related],
  alternates: {
    canonical: absoluteUrl("/flipkart-label-crop"),
  },
  openGraph: {
    title: page.title,
    description: page.description,
    url: absoluteUrl("/flipkart-label-crop"),
    siteName: site.name,
    type: "website",
  },
};

export default function FlipkartLabelCropPage() {
  const faq = [
    {
      question: "Can I split Flipkart shipping and billing labels into two PDFs?",
      answer: "Yes. Upload the Flipkart PDF and generate separate shipping and billing downloads.",
    },
    {
      question: "Is the billing PDF suitable for a 4x6 label printer?",
      answer: "The billing output is generated as a portrait 4x6 PDF for label-printer workflows.",
    },
    {
      question: "Are my invoices uploaded to a server?",
      answer: "No. The PDF is processed in your browser.",
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
      <KeywordHero page={page} />
      <KeywordContent page={page} faq={faq} />
      <div id="tool" className="tool-shell">
        <SellerToolClient />
      </div>
    </>
  );
}

function KeywordHero({ page }) {
  return (
    <section className="seo-hero compact">
      <div className="seo-hero-inner">
        <span className="seo-kicker">{page.primaryKeyword}</span>
        <h1>{page.h1}</h1>
        <p>{page.description}</p>
        <div className="seo-actions">
          <a href="#tool">Open Flipkart cropper</a>
          <a href={absoluteUrl("/")}>All seller tools</a>
        </div>
      </div>
    </section>
  );
}

function KeywordContent({ page, faq }) {
  return (
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
        <h2>Flipkart label crop FAQ</h2>
        {faq.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>
    </main>
  );
}

