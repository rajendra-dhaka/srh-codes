"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

export function TrustNotice() {
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="trust-ticker" role="status" aria-live="polite">
      <span>{lang === "hi" ? "प्राइवेसी नोटिस" : "Privacy notice"}</span>
      <p>{lang === "hi"
        ? "आपकी PDFs और reports ब्राउज़र में process होती हैं. SRH Codes uploaded files को intentionally servers पर store नहीं करता."
        : "Your PDFs and reports are processed in your browser. SRH Codes does not intentionally store uploaded files on its servers."}</p>
    </div>
  );
}
