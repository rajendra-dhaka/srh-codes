"use client";

import { useLanguage } from "./LanguageProvider";

export default function GuideArticle({ guide }) {
  const { lang, setLang } = useLanguage();
  const copy = guide.copy[lang] || guide.copy.en;

  return (
    <main className="guide-page">
      <div className="guide-topbar">
        <a href="/guides">{lang === "hi" ? "सभी गाइड्स" : "All guides"}</a>
        <div className="global-lang" aria-label="Language selector">
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>English</button>
          <button className={lang === "hi" ? "active" : ""} onClick={() => setLang("hi")}>हिन्दी</button>
        </div>
      </div>
      <header className="guide-header">
        <span>{copy.kicker}</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
        <small>{lang === "hi" ? "अपडेटेड" : "Updated"}: {guide.updated} · SRH Codes editorial guide</small>
      </header>
      <div className="guide-body">
        <article>
          {copy.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </article>
        <aside>
          <h2>{lang === "hi" ? "वर्कफ्लो चेकलिस्ट" : "Workflow checklist"}</h2>
          <ol>{copy.checklist.map((item) => <li key={item}>{item}</li>)}</ol>
          <div className="guide-note">
            <strong>{lang === "hi" ? "महत्वपूर्ण" : "Important"}</strong>
            <p>{lang === "hi" ? "Marketplace और tax rules बदल सकते हैं. Final business, tax या filing decision से पहले current official source और अपने records verify करो." : "Marketplace and tax rules can change. Verify current official sources and your records before a final business, tax, or filing decision."}</p>
          </div>
          <a className="guide-cta" href="/#tool">{lang === "hi" ? "Seller tools खोलो" : "Open seller tools"}</a>
        </aside>
      </div>
    </main>
  );
}
