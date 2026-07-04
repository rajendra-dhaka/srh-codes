import SellerToolClient from "../components/SellerToolClient";
import HomeSeoContent from "../components/HomeSeoContent";
import { absoluteUrl, site } from "../lib/site";

export const metadata = {
  title: "Free Label Processing Tools for Meesho, Flipkart and Amazon Sellers",
  description:
    "Separate Amazon shipping and billing PDFs, add SKU notes on Amazon labels, crop Flipkart labels, create Meesho 4-up, 6-up, and 9-up label sheets, sort courier-wise labels, generate picklists, and use GST and seller analytics tools.",
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
      "Flipkart label crop",
      "Meesho 4-up label PDF",
      "Meesho 6-up label PDF",
      "Meesho 9-up label PDF",
      "Amazon shipping label separator",
      "Amazon SKU on shipping label",
      "Amazon invoice remove or keep",
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
      <div id="tool" className="tool-shell first-tool">
        <SellerToolClient />
      </div>

      <HomeSeoContent />

    </>
  );
}
