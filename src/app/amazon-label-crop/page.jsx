import { KeywordToolPage, keywordMetadata } from "../../components/KeywordToolPage";
import { keywordPages } from "../../lib/site";

const page = keywordPages.find((item) => item.slug === "amazon-label-crop");

export const metadata = keywordMetadata(page);

export default function AmazonLabelCropPage() {
  const faq = [
    {
      question: "What does the Amazon label crop tool do?",
      answer: "It separates Amazon Print Documents PDFs into shipping label pages, billing invoice pages, and combined PDFs for printing.",
    },
    {
      question: "Can it add SKU and quantity to Amazon shipping labels?",
      answer: "Yes. You can create clean labels, SKU plus quantity labels, or title plus SKU plus quantity labels.",
    },
    {
      question: "Does it handle multi-page Amazon invoices?",
      answer: "Yes. Billing pages stay attached to the shipping label until the next shipping label is detected.",
    },
    {
      question: "Can I upload multiple Amazon PDFs together?",
      answer: "Yes. Multiple Amazon Print Documents PDFs can be processed in one browser session.",
    },
  ];

  return <KeywordToolPage page={page} faq={faq} cta="Open Amazon label crop tool" faqTitle="Amazon label crop FAQ" />;
}
