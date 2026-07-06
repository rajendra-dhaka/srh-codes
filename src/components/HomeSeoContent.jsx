"use client";

import { useLanguage } from "./LanguageProvider";
import { absoluteUrl } from "../lib/site";

const seoLinks = [
  "/shipping-label-crop-tool",
  "/meesho-label-crop",
  "/flipkart-label-crop",
  "/amazon-label-crop",
  "/meesho-label-4-in-1",
  "/guides/courier-sku-label-sorting",
  "/guides/amazon-fees-and-listing-price",
  "/guides/gstr1-gstr2b-gstr3b-ecommerce",
];

const homeCopy = {
  en: {
    kicker: "Free ecommerce seller tools",
    h1: "Label processing tools for Meesho, Flipkart, and Amazon sellers",
    intro:
      "Sort, crop, split, print, and download marketplace label PDFs from one browser workspace. Use a shipping label crop tool for Meesho label crop, Flipkart label crop, and Amazon label crop workflows, separate Amazon billing pages, create Meesho 4-up, 6-up, and 9-up A4 label PDFs, generate courier-wise picklists, then use Amazon calculators, GST helpers, and seller analytics when needed.",
    cropTool: "Shipping label crop tool",
    flipkart: "Flipkart label crop",
    meesho: "Meesho label crop",
    amazon: "Amazon label crop",
    analytics: "Label sorting",
    why: "Why sellers use it",
    whyTitle: "Label PDF workflows first, with GST and seller analytics built in",
    features: [
      ["Flipkart shipping label cropper", "Upload Flipkart label PDFs and download separate shipping and 4x6 portrait billing PDFs for cleaner packing and printing."],
      ["Meesho label cropper", "Crop and format Meesho labels into 4-per-page, 6-per-page, or 9-per-page A4 PDFs for normal page printers."],
      ["Amazon label crop and separator", "Separate Amazon Print Documents PDFs into shipping labels, billing pages, and combined PDFs, then add SKU, quantity, or title notes on shipping labels."],
      ["Courier and SKU label sorting", "Sort multiple label PDFs by courier partner, SKU, seller account, or courier plus SKU, then download one combined sorted PDF, courier-wise separate label PDFs, print-ready PDFs, and packing picklists."],
      ["Amazon listing price calculator with GST", "Estimate Easy Ship fee, volumetric weight, referral fee, closing fee, GST-inclusive cost price, GST already paid on costs, balance GST to pay, break-even price, profit, and margin before listing Amazon India products."],
      ["Private browser processing", "PDFs and reports are processed in your browser. Files do not need to be uploaded to a server."],
      ["GSTR-1 and GSTR-3B filing helper", "Prepare Meesho GSTR-1 tables, reconcile GSTR-2B eligible ITC, estimate GSTR-3B set-off, and follow a beginner-friendly portal filing guide."],
    ],
    search: "Seller learning center",
    searchTitle: "Practical marketplace workflows",
    searchText:
      "Read the method behind each tool before using it on a packing desk or GST return. The guides explain source documents, calculations, output choices, verification checks, limitations, and common mistakes in plain language.",
    links: [
      ["Shipping Label Crop Tool", "Crop, split, format, sort, print, and download Amazon, Flipkart, and Meesho shipping label PDFs from one browser workspace."],
      ["Meesho Label Crop Tool", "Crop and format Meesho label PDFs into 4-up, 6-up, or 9-up A4 outputs with courier-wise sorting and picklists."],
      ["Flipkart Label Crop Tool", "Crop Flipkart label PDFs into a clean shipping label and a separate 4x6 portrait billing PDF for label printers."],
      ["Amazon Label Crop Tool", "Separate Amazon shipping and billing PDFs, add SKU, quantity, or product title notes, and download shipping, billing, or combined PDFs."],
      ["Meesho Label Maker", "Convert Meesho shipping label PDFs into 4-up, 6-up, or 9-up A4 PDFs for normal printer workflows."],
      ["Label Sorting and Picklist Tool", "Upload multiple label PDFs, group courier-wise and SKU-wise labels, download combined or courier-wise sorted label PDFs, print courier-wise labels, and create packing picklists with courier pickup counts."],
      ["Amazon Listing Price Calculator with GST", "Calculate actual vs volumetric chargeable weight, GST-inclusive Easy Ship fee, referral fee, closing fee, GST paid on cost price, balance GST, profit margin, and break-even selling price for Amazon India sellers."],
      ["GSTR-1, GSTR-2B and GSTR-3B Helper", "Use marketplace reports for GSTR-1 tables, reconcile eligible ITC from GSTR-2B, estimate GSTR-3B tax set-off, and follow guided portal steps."],
    ],
    info: "Site information",
    infoTitle: "Privacy, support, and legal pages",
    infoText:
      "SRH Codes provides browser-based seller tools with a privacy-first workflow. Review the legal and support pages before using the tools for business documents.",
    about: "About",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    guides: "Guides",
  },
  hi: {
    kicker: "फ्री ecommerce seller tools",
    h1: "मीशो, फ्लिपकार्ट और Amazon sellers के लिए label processing tools",
    intro:
      "Ek browser workspace me marketplace label PDFs sort, crop, split, print aur download karo. Meesho label crop, Flipkart label crop aur Amazon label crop workflows use karo, Amazon billing pages separate karo, मीशो 4-up, 6-up और 9-up A4 label PDFs banao, courier-wise picklists generate karo, aur जरूरत पड़े तो Amazon calculators, GST helpers और seller analytics use karo.",
    cropTool: "Shipping label crop tool",
    flipkart: "फ्लिपकार्ट label crop",
    meesho: "मीशो label crop",
    amazon: "Amazon label crop",
    analytics: "Label sorting",
    why: "Sellers इसे क्यों use करते हैं",
    whyTitle: "Pehle label PDF workflows, saath me GST और seller analytics",
    features: [
      ["फ्लिपकार्ट shipping label cropper", "फ्लिपकार्ट label PDFs upload करो और clean shipping plus separate 4x6 portrait billing PDFs download करो."],
      ["मीशो label cropper", "मीशो labels को 4-per-page, 6-per-page या 9-per-page A4 PDFs में crop और format करो."],
      ["Amazon label crop और separator", "Amazon Print Documents PDFs को shipping labels, billing pages और combined PDFs में separate करो, फिर SKU, quantity या title note add करो."],
      ["Courier और SKU label sorting", "Multiple label PDFs को courier partner, SKU, seller account, या courier plus SKU से sort करो, फिर combined sorted PDF, courier-wise separate label PDFs, print-ready PDFs और packing picklists download करो."],
      ["Amazon listing price calculator with GST", "Amazon India products list करने से पहले Easy Ship fee, volumetric weight, referral fee, closing fee, GST-inclusive cost price, costs पर already paid GST, balance GST, break-even price, profit और margin estimate करो."],
      ["Private browser processing", "PDFs और reports browser में process होते हैं. Files server पर upload करने की जरूरत नहीं होती."],
      ["GSTR-1 और GSTR-3B filing helper", "मीशो GSTR-1 tables prepare करो, GSTR-2B eligible ITC reconcile करो, GSTR-3B set-off estimate करो और beginner-friendly portal guide follow करो."],
    ],
    search: "Seller learning center",
    searchTitle: "Practical marketplace workflows",
    searchText:
      "Packing desk या GST return में tool use करने से पहले उसका method पढ़ो. Guides source documents, calculations, output choices, verification checks, limitations और common mistakes आसान भाषा में समझाती हैं.",
    links: [
      ["Shipping Label Crop Tool", "Amazon, Flipkart और Meesho shipping label PDFs को एक browser workspace में crop, split, format, sort, print और download करो."],
      ["मीशो Label Crop Tool", "मीशो label PDFs को 4-up, 6-up या 9-up A4 outputs में crop/format करो और courier-wise sorting plus picklists बनाओ."],
      ["फ्लिपकार्ट Label Crop Tool", "फ्लिपकार्ट label PDFs को clean shipping label और separate 4x6 portrait billing PDF में crop करो."],
      ["Amazon Label Crop Tool", "Amazon shipping और billing PDFs separate करो, SKU, quantity या product title note add करो, और shipping, billing या combined PDFs download करो."],
      ["मीशो Label Maker", "मीशो shipping label PDFs को 4-up, 6-up या 9-up A4 PDFs में convert करो."],
      ["Label Sorting और Picklist Tool", "Multiple label PDFs upload करो, courier-wise और SKU-wise labels group करो, combined या courier-wise sorted label PDFs download करो, courier-wise labels print करो, और pickup counts के साथ packing picklists बनाओ."],
      ["Amazon Listing Price Calculator with GST", "Amazon India sellers के लिए actual vs volumetric chargeable weight, GST-inclusive Easy Ship fee, referral fee, closing fee, cost price पर paid GST, balance GST, profit margin और break-even selling price calculate करो."],
      ["GSTR-1, GSTR-2B और GSTR-3B Helper", "Marketplace reports से GSTR-1 tables बनाओ, GSTR-2B eligible ITC reconcile करो, GSTR-3B tax set-off estimate करो और guided portal steps follow करो."],
    ],
    info: "Site information",
    infoTitle: "Privacy, support और legal pages",
    infoText:
      "SRH Codes privacy-first workflow के साथ browser-based seller tools provide करता है. Business documents use करने से पहले legal और support pages review कर लो.",
    about: "About",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    guides: "गाइड्स",
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
          <a href={absoluteUrl("/shipping-label-crop-tool")}>{t.cropTool}</a>
          <a href={absoluteUrl("/flipkart-label-crop")}>{t.flipkart}</a>
          <a href={absoluteUrl("/meesho-label-crop")}>{t.meesho}</a>
          <a href={absoluteUrl("/amazon-label-crop")}>{t.amazon}</a>
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
          <a href={absoluteUrl("/guides")}>{t.guides}</a>
          <a href={absoluteUrl("/about")}>{t.about}</a>
          <a href={absoluteUrl("/contact")}>{t.contact}</a>
          <a href={absoluteUrl("/privacy")}>{t.privacy}</a>
          <a href={absoluteUrl("/terms")}>{t.terms}</a>
        </nav>
      </section>
    </>
  );
}
