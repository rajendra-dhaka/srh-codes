import { KeywordToolPage, keywordMetadata } from "../../components/KeywordToolPage";
import { keywordPages } from "../../lib/site";

const page = keywordPages.find((item) => item.slug === "meesho-label-crop");

export const metadata = keywordMetadata(page);

export default function MeeshoLabelCropPage() {
  const faq = [
    {
      question: "What is a Meesho label crop tool?",
      answer: "A Meesho label crop tool formats Meesho shipping label PDFs into print-ready pages such as 4-up, 6-up, or 9-up A4 outputs.",
    },
    {
      question: "Can I create 4-up, 6-up, and 9-up Meesho label PDFs?",
      answer: "Yes. Upload the Meesho label PDF and choose the output format supported by the Labels workspace.",
    },
    {
      question: "Can I sort Meesho labels courier-wise?",
      answer: "Yes. Supported Meesho PDFs can be grouped by courier partner, quantity, SKU, and seller account before download or printing.",
    },
    {
      question: "Are Meesho PDFs uploaded to a server?",
      answer: "No. The label PDF workflow runs in your browser.",
    },
  ];

  return <KeywordToolPage page={page} faq={faq} cta="Open Meesho label crop tool" faqTitle="Meesho label crop FAQ" />;
}
