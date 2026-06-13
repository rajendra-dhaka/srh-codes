import { absoluteUrl, site } from "../../lib/site";
import LegalPageContent from "../../components/LegalPageContent";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Seller Label Tools.",
  alternates: {
    canonical: absoluteUrl("/privacy"),
  },
};

export default function PrivacyPage() {
  return <LegalPageContent page="privacy" />;
}
