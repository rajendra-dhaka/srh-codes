import { absoluteUrl, site } from "../../lib/site";
import LegalPageContent from "../../components/LegalPageContent";

export const metadata = {
  title: "Contact",
  description: "Contact SRH Codes for support, feedback, and business queries.",
  alternates: {
    canonical: absoluteUrl("/contact"),
  },
};

export default function ContactPage() {
  return <LegalPageContent page="contact" />;
}
