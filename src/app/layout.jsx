import "./globals.css";
import GoogleAnalytics from "../components/GoogleAnalytics";
import { LanguageProvider } from "../components/LanguageProvider";
import { site, absoluteUrl } from "../lib/site";

const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} - Flipkart, Meesho Label, GST and Seller Analytics Tools`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: site.keywords,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/srh-logo.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    shortcut: "/favicon.svg",
    apple: [{ url: "/brand/srh-logo.svg", type: "image/svg+xml", sizes: "512x512" }],
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    siteName: site.name,
    title: `${site.name} - Free Label PDF, GST and Seller Analytics Tools`,
    description: site.description,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: `${site.name} seller tools preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} - Free Label PDF, GST and Seller Analytics Tools`,
    description: site.description,
    images: [absoluteUrl("/twitter-image")],
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
      <head>
        {adsenseClientId ? (
          <script
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          />
        ) : null}
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      </body>
    </html>
  );
}
