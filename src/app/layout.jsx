import "./globals.css";
import AdSense from "../components/AdSense";
import GoogleAnalytics from "../components/GoogleAnalytics";
import { LanguageProvider } from "../components/LanguageProvider";
import { site, absoluteUrl } from "../lib/site";

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} - Flipkart Label Cropper and Meesho 4-in-1 Label Tool`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: site.keywords,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    siteName: site.name,
    title: `${site.name} - Free Seller PDF and GST Tools`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} - Free Seller PDF and GST Tools`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10243a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        <AdSense clientId={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID} />
      </body>
    </html>
  );
}
