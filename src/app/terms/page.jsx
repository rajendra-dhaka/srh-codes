import { absoluteUrl, site } from "../../lib/site";
import LegalPageContent from "../../components/LegalPageContent";

export const metadata = {
  title: "Terms of Use",
  description: "Terms of use for Seller Label Tools.",
  alternates: {
    canonical: absoluteUrl("/terms"),
  },
};

export default function TermsPage() {
  return <LegalPageContent page="terms" />;
}
