import { absoluteUrl, site } from "../../lib/site";
import LegalPageContent from "../../components/LegalPageContent";

export const metadata = {
  title: "About",
  description: "About SRH Codes ecommerce seller tools.",
  alternates: {
    canonical: absoluteUrl("/about"),
  },
};

export default function AboutPage() {
  return <LegalPageContent page="about" />;
}
