import SellerToolClient from "../components/SellerToolClient";
import HomeSeoContent from "../components/HomeSeoContent";
import MarketingHome from "../components/MarketingHome";
import { absoluteUrl, site } from "../lib/site";

export const metadata = {
  title: "Free Shipping Label Crop Tool for Meesho, Flipkart and Amazon Sellers",
  description:
    "Free shipping label crop tool for Meesho label crop, Flipkart label crop, and Amazon label crop workflows. Split invoices, create Meesho 4-up, 6-up, and 9-up label sheets, sort courier-wise labels, generate picklists, and use GST and seller analytics tools.",
  alternates: {
    canonical: absoluteUrl("/"),
  },
};

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: site.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: site.url,
    description: site.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Shipping label crop tool",
      "Label cropper",
      "Flipkart label crop",
      "Flipkart crop label",
      "Flipkart label cropper",
      "Meesho label crop",
      "Meesho crop label",
      "Meesho label cropper",
      "Meesho 4-up label PDF",
      "Meesho 6-up label PDF",
      "Meesho 9-up label PDF",
      "Amazon label crop",
      "Amazon crop label",
      "Amazon shipping label separator",
      "Amazon SKU on shipping label",
      "Amazon billing invoice separator",
      "Courier-wise label sorting",
      "SKU-wise label sorting",
      "Sorted label PDF download",
      "Sorted label print formats",
      "Packing picklist generator",
      "Shipping and billing PDF split",
      "GST report summary",
      "Marketplace performance analysis",
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <MarketingHome />
      <div id="tool" className="tool-shell first-tool">
        <SellerToolClient />
      </div>

      <HomeSeoContent />

    </>
  );
}
