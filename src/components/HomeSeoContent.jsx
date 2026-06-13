"use client";

import { useLanguage } from "./LanguageProvider";
import { absoluteUrl } from "../lib/site";

const homeCopy = {
  en: {
    kicker: "Free ecommerce seller tools",
    h1: "Flipkart label cropper, Meesho 4-in-1 labels, performance insights, and marketplace data analysis",
    intro:
      "Browser-based tools for label PDF formatting, ecommerce performance analytics, GST analysis, recommerce seller workflows, and marketplace report preparation.",
    flipkart: "Flipkart label crop",
    meesho: "Meesho 4-in-1 label",
    analytics: "Seller analytics",
    why: "Why sellers use it",
    whyTitle: "PDF tools and data analysis built for Indian marketplace sellers",
    features: [
      ["Flipkart shipping label cropper", "Upload Flipkart label PDFs and download separate shipping and 4x6 billing PDFs that are easier to print."],
      ["Meesho 4-in-1 label maker", "Convert Meesho labels into a compact 4-per-page A4 layout for faster packing workflows."],
      ["Private browser processing", "PDFs and reports are processed in your browser. Files do not need to be uploaded to a server."],
      ["Seller analytics workspace", "Analyze marketplace orders, payments, ads, returns, GST tables, performance insights, and seller data in one app."],
    ],
    search: "Search-focused tools",
    searchTitle: "Popular seller label workflows",
    searchText:
      "These pages target high-intent seller searches such as Flipkart label crop, Meesho label 4 in 1, seller shipping label PDF, 4x6 label printer PDF, ecommerce seller insights tools, performance analytics, and marketplace data analysis.",
    links: [
      ["Flipkart Label Crop Tool", "Crop Flipkart label PDFs into a clean shipping label and a separate 4x6 portrait billing PDF for label printers."],
      ["Meesho Label 4 in 1 Page Tool", "Convert Meesho shipping label PDFs into a 4-in-1 A4 layout so four labels fit on one printable page."],
    ],
    info: "Site information",
    infoTitle: "Privacy, support, and legal pages",
    infoText:
      "SRH Codes provides browser-based seller tools with a privacy-first workflow. Review the legal and support pages before using the tools for business documents.",
    about: "About",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
  },
  hi: {
    kicker: "फ्री ecommerce seller tools",
    h1: "फ्लिपकार्ट label cropper, मीशो 4-in-1 labels, performance insights और marketplace data analysis",
    intro:
      "Browser-based tools जिससे label PDF formatting, ecommerce performance analytics, GST analysis, recommerce seller workflows और marketplace report preparation easy होता है.",
    flipkart: "फ्लिपकार्ट label crop",
    meesho: "मीशो 4-in-1 label",
    analytics: "Seller analytics",
    why: "Sellers इसे क्यों use करते हैं",
    whyTitle: "Indian marketplace sellers के लिए PDF tools और data analysis",
    features: [
      ["फ्लिपकार्ट shipping label cropper", "फ्लिपकार्ट label PDFs upload करो और separate shipping plus 4x6 billing PDFs download करो जो print करने में easy हैं."],
      ["मीशो 4-in-1 label maker", "मीशो labels को compact 4-per-page A4 layout में convert करो, packing workflow faster होता है."],
      ["Private browser processing", "PDFs और reports browser में process होते हैं. Files server पर upload करने की जरूरत नहीं होती."],
      ["Seller analytics workspace", "Marketplace ऑर्डर, payments, ads, returns, GST tables, performance insights और seller data एक app में analyze करो."],
    ],
    search: "Search-focused tools",
    searchTitle: "Popular seller label workflows",
    searchText:
      "ये pages high-intent seller searches के लिए हैं जैसे फ्लिपकार्ट label crop, मीशो label 4 in 1, seller shipping label PDF, 4x6 label printer PDF, ecommerce seller insights tools, performance analytics और marketplace data analysis.",
    links: [
      ["फ्लिपकार्ट Label Crop Tool", "फ्लिपकार्ट label PDFs को clean shipping label और separate 4x6 portrait billing PDF में crop करो."],
      ["मीशो Label 4 in 1 Page Tool", "मीशो shipping label PDFs को 4-in-1 A4 layout में convert करो, ताकि four labels one printable page पर fit हो सकें."],
    ],
    info: "Site information",
    infoTitle: "Privacy, support और legal pages",
    infoText:
      "SRH Codes privacy-first workflow के साथ browser-based seller tools provide करता है. Business documents use करने से पहले legal और support pages review कर लो.",
    about: "About",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
  },
};

export default function HomeSeoContent() {
  const { lang } = useLanguage();
  const t = homeCopy[lang] || homeCopy.en;

  return (
    <>
      <section className="seo-intent-strip">
        <div>
          <span>{t.kicker}</span>
          <h1>{t.h1}</h1>
          <p>{t.intro}</p>
        </div>
        <nav aria-label="Popular seller tools">
          <a href={absoluteUrl("/flipkart-label-crop")}>{t.flipkart}</a>
          <a href={absoluteUrl("/meesho-label-4-in-1")}>{t.meesho}</a>
          <a href="#seo-details">{t.analytics}</a>
        </nav>
      </section>

      <section id="seo-details" className="seo-section">
        <div className="seo-section-head">
          <span>{t.why}</span>
          <h2>{t.whyTitle}</h2>
        </div>
        <div className="seo-feature-grid">
          {t.features.map(([title, text]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="seo-section two-column">
        <div>
          <span>{t.search}</span>
          <h2>{t.searchTitle}</h2>
          <p>{t.searchText}</p>
        </div>
        <div className="seo-link-list">
          {t.links.map(([title, text], index) => (
            <a key={title} href={absoluteUrl(index === 0 ? "/flipkart-label-crop" : "/meesho-label-4-in-1")}>
              <strong>{title}</strong>
              <span>{text}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="seo-section legal-strip">
        <div>
          <span>{t.info}</span>
          <h2>{t.infoTitle}</h2>
          <p>{t.infoText}</p>
        </div>
        <nav className="seo-actions" aria-label="Legal and support pages">
          <a href={absoluteUrl("/about")}>{t.about}</a>
          <a href={absoluteUrl("/contact")}>{t.contact}</a>
          <a href={absoluteUrl("/privacy")}>{t.privacy}</a>
          <a href={absoluteUrl("/terms")}>{t.terms}</a>
        </nav>
      </section>
    </>
  );
}
