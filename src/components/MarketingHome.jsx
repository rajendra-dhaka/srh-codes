"use client";

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
import { useLanguage } from "../contexts/LanguageContext";
import { MARKETING_MARKETPLACES } from "../constants/marketplaces";
import { MARKETING_PRODUCTS, MARKETING_WORKFLOWS } from "../constants/marketing";
import { useFeedbackMailto } from "../hooks/useFeedbackMailto";
import { FEEDBACK_EMAIL, marketingHomeCopy } from "../i18n/marketingHome";

const marketingIcons = {
  Boxes,
  Layers3,
  PackageCheck,
  Printer,
  ReceiptText,
  UploadCloud,
};

export default function MarketingHome() {
  const { lang } = useLanguage();
  const t = marketingHomeCopy[lang] || marketingHomeCopy.en;
  const { feedback, feedbackHref, updateFeedback } = useFeedbackMailto(FEEDBACK_EMAIL);

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
            {MARKETING_MARKETPLACES.map((marketplace) => (
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
          {MARKETING_MARKETPLACES.map((marketplace) => (
            <article key={marketplace.name}>
              <img src={marketplace.src} alt={`${marketplace.name} marketplace`} />
              <span>{marketplace.name}</span>
            </article>
          ))}
        </div>
        <div className="product-grid">
          {MARKETING_PRODUCTS.map(({ icon, title, eyebrow, text }) => {
            const Icon = marketingIcons[icon];
            return (
            <article className="product-card" key={title}>
              <span className="product-icon"><Icon size={28} /></span>
              <small>{eyebrow}</small>
              <h3>{title}</h3>
              <p>{text}</p>
              <a href="#tool">Get started <ArrowRight size={16} /></a>
            </article>
            );
          })}
        </div>
      </section>

      <section className="workflow-section">
        <div className="section-kicker">{t.workflows}</div>
        <h2>{t.workflowsTitle}</h2>
        <div className="workflow-grid">
          {MARKETING_WORKFLOWS.map(({ icon, title, text }, index) => {
            const Icon = marketingIcons[icon];
            return (
            <article key={title} className="workflow-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Icon size={24} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
            );
          })}
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
            <span>{FEEDBACK_EMAIL}</span>
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
