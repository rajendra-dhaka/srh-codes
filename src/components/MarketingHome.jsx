"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  FileText,
  Layers3,
  Lightbulb,
  Mail,
  MessageSquareText,
  PackageCheck,
  Printer,
  ReceiptText,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useLanguage } from "./LanguageProvider";

const feedbackEmail = "shree.anjaneya.1304@gmail.com";

const copy = {
  en: {
    badge: "Browser-first seller tools",
    titleA: "Essential tools for",
    titleB: "Indian marketplace sellers",
    intro:
      "Crop labels, split invoices, sort courier-wise PDFs, generate picklists, and check Amazon pricing from one clean workspace built for daily packing desks.",
    primary: "Open label workspace",
    secondary: "Explore guides",
    products: "Products",
    productsTitle: "One workspace for the jobs sellers repeat every day",
    workflows: "Workflows",
    workflowsTitle: "From upload to print-ready output without messy steps",
    feedback: "Feedback",
    feedbackTitle: "Tell us what sellers need next",
    feedbackText:
      "Share improvements, missing marketplace workflows, printer formats, GST report needs, or packing desk issues. Useful requests will be considered for SRH Codes.",
    feedbackName: "Your name",
    feedbackContact: "Email or WhatsApp",
    feedbackMessage: "What should we improve or build?",
    feedbackButton: "Send feedback",
    feedbackMailHint: "Opens your mail app with a ready email.",
  },
  hi: {
    badge: "Browser-first seller tools",
    titleA: "Indian sellers ke liye",
    titleB: "clean daily tools",
    intro:
      "Labels crop karo, invoices split karo, courier-wise PDFs sort karo, picklists banao, aur Amazon pricing check karo ek simple packing-desk workspace me.",
    primary: "Label workspace kholo",
    secondary: "Guides dekho",
    products: "Products",
    productsTitle: "Daily seller kaam ke liye one clean workspace",
    workflows: "Workflows",
    workflowsTitle: "Upload se print-ready output tak clean flow",
    feedback: "Feedback",
    feedbackTitle: "Sellers ko next kya chahiye?",
    feedbackText:
      "Improvement, missing marketplace workflow, printer format, GST report need, ya packing desk issue bhejo. Useful requests ko SRH Codes par laane ki koshish karenge.",
    feedbackName: "Aapka naam",
    feedbackContact: "Email ya WhatsApp",
    feedbackMessage: "Kya improve/build karna chahiye?",
    feedbackButton: "Feedback bhejo",
    feedbackMailHint: "Aapke mail app me ready email open hoga.",
  },
};

const products = [
  {
    icon: PackageCheck,
    title: "Shipping Label Processor",
    eyebrow: "Meesho, Flipkart, Amazon",
    text: "Crop, split, sort, print, and download label PDFs with courier, SKU, seller account, quantity, and invoice-aware output choices.",
  },
  {
    icon: ReceiptText,
    title: "GST Filing Helper",
    eyebrow: "GSTR-1 and 3B",
    text: "Prepare marketplace summaries, reconcile key values, and keep GST portal work less confusing for small ecommerce teams.",
  },
  {
    icon: Boxes,
    title: "Amazon Pricing Calculator",
    eyebrow: "Fees and margin",
    text: "Estimate Easy Ship fees, chargeable weight, GST impact, referral fees, closing fees, profit, and break-even selling price.",
  },
];

const marketplaces = [
  { name: "Meesho", src: "/marketplaces/meesho.png" },
  { name: "Flipkart", src: "/marketplaces/flipkart.png" },
  { name: "Amazon", src: "/marketplaces/amazon.png" },
];

const workflows = [
  ["Upload PDF", "Drop one or many marketplace label files. Everything runs in the browser.", UploadCloud],
  ["Choose output", "Pick shipping, billing, split, layout, quantity group, picklist, or thermal formats.", Layers3],
  ["Print or download", "Generate final PDFs with minimal buttons after processing, ready for packing desks.", Printer],
];

export default function MarketingHome() {
  const { lang } = useLanguage();
  const t = copy[lang] || copy.en;
  const [feedback, setFeedback] = useState({
    name: "",
    contact: "",
    message: "",
  });

  const updateFeedback = (field) => (event) => {
    setFeedback((current) => ({ ...current, [field]: event.target.value }));
  };

  const feedbackHref = (() => {
    const subject = `SRH Codes feedback${feedback.name ? ` from ${feedback.name}` : ""}`;
    const body = [
      "Hi SRH Codes team,",
      "",
      feedback.message || "I want to share this improvement/request:",
      "",
      `Name: ${feedback.name || "-"}`,
      `Contact: ${feedback.contact || "-"}`,
      "",
      "Sent from SRH Codes website feedback form.",
    ].join("\n");
    return `mailto:${feedbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  })();

  return (
    <div className="marketing-site">
      <header className="marketing-nav">
        <a className="marketing-brand" href="#top" aria-label="SRH Codes home">
          <img src="/brand/srh-logo.svg" alt="" width="42" height="42" />
          <span>SRH Codes</span>
        </a>
        <nav aria-label="Primary">
          <a href="#products">Products</a>
          <a href="#tool">Workspace</a>
          <a href="/guides">Guides</a>
          <a href="#feedback">{t.feedback}</a>
          <a href="/contact">Contact</a>
        </nav>
        <a className="nav-cta" href="#tool">Start free <ArrowRight size={17} /></a>
      </header>

      <section id="top" className="marketing-hero">
        <div className="hero-copy">
          <span className="hero-badge"><Sparkles size={16} />{t.badge}</span>
          <h1>{t.titleA} <strong>{t.titleB}</strong></h1>
          <p>{t.intro}</p>
          <div className="hero-actions">
            <a className="primary-link" href="#tool">{t.primary}<ArrowRight size={18} /></a>
            <a className="secondary-link" href="/guides">{t.secondary}</a>
          </div>
          <div className="hero-stats" aria-label="Tool highlights">
            <span><strong>3</strong> marketplaces</span>
            <span><strong>100%</strong> browser processing</span>
            <span><strong>PDF</strong> print workflows</span>
          </div>
          <div className="marketplace-strip" aria-label="Supported marketplaces">
            {marketplaces.map((marketplace) => (
              <span key={marketplace.name}>
                <img src={marketplace.src} alt="" />
                {marketplace.name}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="preview-window">
            <div className="preview-bar"><span /><span /><span /><em>labels_ready.pdf</em></div>
            <div className="preview-body">
              <div className="label-card mock-a">
                <b>MEESHO</b>
                <i>AWB 4129 68XX</i>
                <small>SKU: BLUE-KURTI-M</small>
              </div>
              <div className="label-card mock-b">
                <b>AMAZON</b>
                <i>Ship To</i>
                <small>2 items, invoice attached</small>
              </div>
              <div className="floating-chip"><ShieldCheck size={16} /> Private in browser</div>
              <div className="floating-chip second"><BadgeCheck size={16} /> Courier-wise sorted</div>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="marketing-section">
        <div className="section-kicker">{t.products}</div>
        <h2>{t.productsTitle}</h2>
        <div className="marketplace-card-row">
          {marketplaces.map((marketplace) => (
            <article key={marketplace.name}>
              <img src={marketplace.src} alt={`${marketplace.name} marketplace`} />
              <span>{marketplace.name}</span>
            </article>
          ))}
        </div>
        <div className="product-grid">
          {products.map(({ icon: Icon, title, eyebrow, text }) => (
            <article className="product-card" key={title}>
              <span className="product-icon"><Icon size={28} /></span>
              <small>{eyebrow}</small>
              <h3>{title}</h3>
              <p>{text}</p>
              <a href="#tool">Get started <ArrowRight size={16} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section">
        <div className="section-kicker">{t.workflows}</div>
        <h2>{t.workflowsTitle}</h2>
        <div className="workflow-grid">
          {workflows.map(([title, text, Icon], index) => (
            <article key={title} className="workflow-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Icon size={24} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace-intro">
        <div>
          <span className="section-kicker">Workspace</span>
          <h2>Operational controls stay high on the page</h2>
          <p>Upload first, choose output options before processing, then keep final download and print actions minimal.</p>
        </div>
        <FileText size={44} aria-hidden="true" />
      </section>

      <section id="feedback" className="feedback-section">
        <div className="feedback-copy">
          <span className="section-kicker">{t.feedback}</span>
          <h2>{t.feedbackTitle}</h2>
          <p>{t.feedbackText}</p>
          <div className="feedback-contact-card">
            <Mail size={18} />
            <span>{feedbackEmail}</span>
          </div>
        </div>
        <form className="feedback-form">
          <label>
            <span>{t.feedbackName}</span>
            <input value={feedback.name} onChange={updateFeedback("name")} placeholder="Raj / Store name" />
          </label>
          <label>
            <span>{t.feedbackContact}</span>
            <input value={feedback.contact} onChange={updateFeedback("contact")} placeholder="seller@example.com" />
          </label>
          <label className="full">
            <span>{t.feedbackMessage}</span>
            <textarea
              value={feedback.message}
              onChange={updateFeedback("message")}
              placeholder="Example: Need Myntra label crop, thermal 2-up layout, GST report import..."
              rows={5}
            />
          </label>
          <div className="feedback-actions">
            <p><Lightbulb size={16} />{t.feedbackMailHint}</p>
            <a className="primary-link" href={feedbackHref}>
              <Send size={18} />{t.feedbackButton}
            </a>
          </div>
        </form>
        <MessageSquareText className="feedback-watermark" size={180} aria-hidden="true" />
      </section>
    </div>
  );
}
