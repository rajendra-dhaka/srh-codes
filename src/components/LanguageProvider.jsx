"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("srh-language");
    if (stored === "hi" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (value) => {
    setLangState(value);
    window.localStorage.setItem("srh-language", value);
    window.dispatchEvent(new CustomEvent("srh-language-change", { detail: value }));
  };

  const value = useMemo(() => ({ lang, setLang }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
