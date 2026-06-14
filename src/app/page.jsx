import SellerToolClient from "../components/SellerToolClient";
import HomeSeoContent from "../components/HomeSeoContent";
import { absoluteUrl, site } from "../lib/site";

export const metadata = {
  title: "Free Flipkart Label Cropper, Meesho Sorted Labels, Picklist and GST Tools",
  description:
    "Crop Flipkart shipping labels, create Meesho 4-up, 6-up and thermal 4x6 label PDFs, download courier-SKU sorted label PDFs, generate picklists, and analyze ecommerce seller GST and performance data.",
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
      "Meesho thermal 4x6 label PDF",
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
