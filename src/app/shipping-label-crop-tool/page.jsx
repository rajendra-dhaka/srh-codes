import { KeywordToolPage, keywordMetadata } from "../../components/KeywordToolPage";
import { keywordPages } from "../../lib/site";

const page = keywordPages.find((item) => item.slug === "shipping-label-crop-tool");

export const metadata = keywordMetadata(page);

export default function ShippingLabelCropToolPage() {
  const faq = [
    {
      question: "Which marketplaces does this shipping label crop tool support?",
      answer: "The Labels workspace supports Amazon, Flipkart, and Meesho label PDF workflows.",
    },
    {
      question: "Can I crop labels and split invoice pages?",
      answer: "Yes. Supported workflows include Amazon shipping and billing separation, Flipkart shipping and billing crop, and Meesho A4 label formatting.",
    },
    {
      question: "Can I sort labels courier-wise?",
      answer: "Yes. Supported PDFs can be grouped by courier, SKU, quantity, and seller account for packing desk workflows.",
    },
    {
      question: "Do selected PDFs leave my computer?",
      answer: "The PDF processing workflow runs in your browser and does not require uploading customer label documents to a server.",
    },
  ];

  return <KeywordToolPage page={page} faq={faq} cta="Open shipping label crop tool" faqTitle="Shipping label crop FAQ" />;
}
