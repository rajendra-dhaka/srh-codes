"use client";

import Script from "next/script";

export default function AdSense({ clientId }) {
  if (!clientId) return null;

  return (
    <Script
      id="google-adsense"
      strategy="afterInteractive"
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
    />
  );
}
