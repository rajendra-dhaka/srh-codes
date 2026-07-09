"use client";

import { Globe2 } from "lucide-react";
import { trackEvent } from "../../lib/analytics";
import { shellCopy } from "../../i18n/shell";

export function CommandBar({ activeNav, lang, setLang }) {
  const s = shellCopy[lang];

  return (
    <header className="command-bar">
      <div>
        <span className="eyebrow">{s.command}</span>
        <h1>{activeNav?.label || "Dashboard"}</h1>
      </div>
      <div className="command-actions">
        <div className="global-lang" aria-label="Language selector">
          <Globe2 size={16} />
          <button className={lang === "en" ? "active" : ""} onClick={() => {
            trackEvent("language_select", { language: "en", surface: "command_bar" });
            setLang("en");
          }}>English</button>
          <button className={lang === "hi" ? "active" : ""} onClick={() => {
            trackEvent("language_select", { language: "hi", surface: "command_bar" });
            setLang("hi");
          }}>हिन्दी</button>
        </div>
        <nav className="legal-links" aria-label="Site information">
          <a href="/guides">{s.guides}</a>
          <a href="/#feedback">{s.feedback}</a>
          <a href="/about">{s.about}</a>
          <a href="/contact">{s.contact}</a>
          <a href="/privacy">{s.privacy}</a>
          <a href="/terms">{s.terms}</a>
        </nav>
      </div>
    </header>
  );
}
