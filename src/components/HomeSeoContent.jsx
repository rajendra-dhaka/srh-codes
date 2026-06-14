"use client";

import { useLanguage } from "./LanguageProvider";
import { absoluteUrl } from "../lib/site";

const seoLinks = ["/flipkart-label-crop", "/meesho-label-4-in-1", "/#tool", "/#tool"];

const homeCopy = {
  en: {
    kicker: "Free ecommerce seller tools",
    h1: "Flipkart label cropper, Meesho 4-up, 6-up and thermal label tools, GST helper, and seller analytics",
    intro:
      "Browser-based tools for Flipkart label cropping, Meesho A4 and 4x6 thermal label PDFs, courier and SKU label sorting, picklist generation, ecommerce performance analytics, GST analysis, and marketplace report preparation.",
    flipkart: "Flipkart label crop",
    meesho: "Meesho label maker",
    analytics: "Seller analytics",
    why: "Why sellers use it",
    whyTitle: "Label PDF tools, GST helpers, and data analysis for Indian marketplace sellers",
    features: [
      ["Flipkart shipping label cropper", "Upload Flipkart label PDFs and download separate shipping and 4x6 portrait billing PDFs for cleaner packing and printing."],
      ["Meesho 4-up, 6-up and thermal labels", "Convert Meesho labels into 4-per-page or 6-per-page A4 PDFs, or crop each label into a 4x6 thermal printer PDF."],
      ["Courier and SKU label sorting", "Sort multiple label PDFs by courier partner, SKU, seller account, or courier plus SKU, then download a packing picklist."],
      ["Private browser processing", "PDFs and reports are processed in your browser. Files do not need to be uploaded to a server."],
      ["GST and seller analytics workspace", "Prepare Meesho GSTR-1 values, review marketplace orders, payments, ads, returns, performance trends, and seller data in one app."],
    ],
    search: "Search-focused tools",
    searchTitle: "Popular marketplace seller workflows",
    searchText:
      "These pages target high-intent seller searches such as Flipkart label crop, Meesho label 4 in 1, Meesho 6 labels per page, Meesho thermal label PDF, courier wise label sorting, SKU wise label sorting, ecommerce picklist generator, seller shipping label PDF, 4x6 label printer PDF, GSTR-1 helper, ecommerce seller insights tools, performance analytics, and marketplace data analysis.",
    links: [
      ["Flipkart Label Crop Tool", "Crop Flipkart label PDFs into a clean shipping label and a separate 4x6 portrait billing PDF for label printers."],
      ["Meesho Label Maker", "Convert Meesho shipping label PDFs into 4-up, 6-up, or cropped 4x6 thermal label PDFs for different printer workflows."],
      ["Label Sorting and Picklist Tool", "Upload multiple label PDFs, group courier-wise and SKU-wise labels, and create packing picklists with courier pickup counts."],
      ["GST and Performance Tools", "Use marketplace reports to prepare GST helper values and analyze sales, returns, ads, payouts, and performance trends."],
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
    h1: "फ्लिपकार्ट label cropper, मीशो 4-up, 6-up और thermal label tools, GST helper और seller analytics",
    intro:
      "Browser-based tools जिससे फ्लिपकार्ट label crop, मीशो A4 और 4x6 thermal label PDFs, courier और SKU label sorting, picklist generation, ecommerce performance analytics, GST analysis और marketplace report preparation easy होता है.",
    flipkart: "फ्लिपकार्ट label crop",
    meesho: "मीशो label maker",
    analytics: "Seller analytics",
    why: "Sellers इसे क्यों use करते हैं",
    whyTitle: "Indian marketplace sellers के लिए label PDF tools, GST helpers और data analysis",
    features: [
      ["फ्लिपकार्ट shipping label cropper", "फ्लिपकार्ट label PDFs upload करो और clean shipping plus separate 4x6 portrait billing PDFs download करो."],
      ["मीशो 4-up, 6-up और thermal labels", "मीशो labels को 4-per-page या 6-per-page A4 PDFs में convert करो, या हर label को 4x6 thermal printer PDF में crop करो."],
      ["Courier और SKU label sorting", "Multiple label PDFs को courier partner, SKU, seller account, या courier plus SKU से sort करो और packing picklist download करो."],
      ["Private browser processing", "PDFs और reports browser में process होते हैं. Files server पर upload करने की जरूरत नहीं होती."],
      ["GST और seller analytics workspace", "मीशो GSTR-1 values prepare करो और marketplace ऑर्डर, payments, ads, returns, performance trends और seller data analyze करो."],
    ],
    search: "Search-focused tools",
    searchTitle: "Popular marketplace seller workflows",
    searchText:
      "ये pages high-intent seller searches के लिए हैं जैसे फ्लिपकार्ट label crop, मीशो label 4 in 1, मीशो 6 labels per page, मीशो thermal label PDF, courier wise label sorting, SKU wise label sorting, ecommerce picklist generator, seller shipping label PDF, 4x6 label printer PDF, GSTR-1 helper, ecommerce seller insights tools, performance analytics और marketplace data analysis.",
    links: [
      ["फ्लिपकार्ट Label Crop Tool", "फ्लिपकार्ट label PDFs को clean shipping label और separate 4x6 portrait billing PDF में crop करो."],
      ["मीशो Label Maker", "मीशो shipping label PDFs को 4-up, 6-up या cropped 4x6 thermal label PDFs में convert करो."],
      ["Label Sorting और Picklist Tool", "Multiple label PDFs upload करो, courier-wise और SKU-wise labels group करो, और courier pickup counts के साथ packing picklists बनाओ."],
      ["GST और Performance Tools", "Marketplace reports से GST helper values prepare करो और sales, returns, ads, payouts, performance trends analyze करो."],
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
            <a key={title} href={absoluteUrl(seoLinks[index] || "/#tool")}>
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
