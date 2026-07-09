"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Calculator,
  ChevronRight,
  Globe2,
  LayoutGrid,
  Menu,
  Moon,
  ReceiptText,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { trackEvent } from "../lib/analytics";
import { shellCopy } from "../i18n/shell";
import { useThemeMode } from "../hooks/useThemeMode";
import { BrandMark } from "./tool-shell/BrandMark";
import { CommandBar } from "./tool-shell/CommandBar";
import { TrustNotice } from "./tool-shell/TrustNotice";
import { AmazonShippingCalculator } from "../features/amazon-calculator/AmazonShippingCalculator";
import { LabelProcessingTool } from "../features/labels/LabelProcessingTool";
import { PerformanceSection } from "../features/performance/PerformanceSection";
import { GstAnalysis } from "../features/gst/GstAnalysis";

function getInitialSection() {
  if (typeof window === "undefined") return "processing";
  const path = window.location.pathname;
  if (path.includes("label")) return "processing";
  if (path.includes("gst")) return "gst";
  if (path.includes("amazon")) return "shipping";
  return "processing";
}

export default function SellerToolClient() {
  const [section, setSection] = useState(getInitialSection);
  const { theme, toggleTheme } = useThemeMode("light", (nextTheme) => {
    trackEvent("theme_select", { theme: nextTheme });
  });
  const { lang, setLang } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const s = shellCopy[lang];
  const nav = [
    { id: "processing", label: s.processing, icon: LayoutGrid, hint: s.processingHint },
    { id: "performance", label: s.performance, icon: BarChart3, hint: s.performanceHint },
    { id: "gst", label: s.gst, icon: ReceiptText, hint: s.gstHint },
    { id: "shipping", label: s.shipping, icon: Calculator, hint: s.shippingHint },
  ];
  const activeNav = nav.find((item) => item.id === section);
  const selectSection = (id) => {
    trackEvent("main_navigation_select", { section: id });
    setSection(id);
    setDrawerOpen(false);
  };
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);
  return (
    <div className={`super-app theme-${theme}`}>
      <TrustNotice />
      <header className="mobile-shellbar">
        <div className="mobile-brand">
          <BrandMark />
          <div>
            <strong>SRH CODES</strong>
            <span>Seller Tools</span>
          </div>
        </div>
        <button
          className="mobile-menu-button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          aria-controls="primary-navigation"
        >
          <Menu size={22} />
        </button>
      </header>
      <div className={drawerOpen ? "drawer-backdrop open" : "drawer-backdrop"} onClick={() => setDrawerOpen(false)} />
      <aside id="primary-navigation" className={drawerOpen ? "super-sidebar open" : "super-sidebar"}>
        <div className="drawer-head">
          <div className="brand-block">
            <BrandMark />
            <div>
              <strong>SRH CODES</strong>
              <span>Seller Tools</span>
            </div>
          </div>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close navigation menu">
            <X size={20} />
          </button>
        </div>
        <div className="brand-block desktop-brand">
          <BrandMark />
          <div>
            <strong>SRH CODES</strong>
            <span>Seller Tools</span>
          </div>
        </div>
        <nav className="side-nav">
          {nav.map(({ id, label, hint, icon: Icon }) => (
            <button key={id} className={section === id ? "active" : ""} onClick={() => selectSection(id)}>
              <span className="nav-icon"><Icon size={18} /></span>
              <span className="nav-copy">
                <strong>{label}</strong>
                <small>{hint}</small>
              </span>
              <ChevronRight className="nav-arrow" size={16} />
            </button>
          ))}
        </nav>
        <div className="sidebar-card">
          <Sparkles size={18} />
          <strong>{s.smartMode}</strong>
          <span>{s.smartModeHint}</span>
        </div>
        <div className="drawer-controls">
          <div className="drawer-lang" aria-label="Language selector">
            <Globe2 size={16} />
            <button className={lang === "en" ? "active" : ""} onClick={() => {
              trackEvent("language_select", { language: "en", surface: "drawer" });
              setLang("en");
            }}>English</button>
            <button className={lang === "hi" ? "active" : ""} onClick={() => {
              trackEvent("language_select", { language: "hi", surface: "drawer" });
              setLang("hi");
            }}>हिन्दी</button>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            {theme === "light" ? s.dark : s.light}
          </button>
        </div>
      </aside>
      <main className="super-main">
        <CommandBar activeNav={activeNav} lang={lang} setLang={setLang} />
        {section === "performance" && <PerformanceSection lang={lang} />}
        {section === "gst" && <GstAnalysis lang={lang} />}
        {section === "processing" && <LabelProcessingTool />}
        {section === "shipping" && <AmazonShippingCalculator />}
      </main>
    </div>
  );
}

