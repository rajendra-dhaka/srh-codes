import SellerToolClient from "../components/SellerToolClient";
import HomeSeoContent from "../components/HomeSeoContent";
import { absoluteUrl, site } from "../lib/site";

export const metadata = {
  title: "Free Flipkart Label Cropper and Meesho 4-in-1 Label Tool",
  description:
    "Crop Flipkart shipping labels, create Meesho 4-in-1 label PDFs, and analyze ecommerce seller performance, GST, and marketplace data with free browser-based tools.",
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
      "Meesho 4-in-1 label PDF",
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
