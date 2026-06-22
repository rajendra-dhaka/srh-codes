"use client";

import { useLanguage } from "./LanguageProvider";

const copy = {
  about: {
    en: {
      title: "About SRH Codes",
      sections: [
        ["", "SRH Codes is an independent collection of browser-based tools and original workflow guides built around everyday problems faced by Indian ecommerce sellers: marketplace labels, invoices, GST reports, order data, returns, ads, fees, and packing operations."],
        ["Why it exists", "The project grew from real seller workflows where repetitive PDF formatting, report reconciliation, and portal preparation consumed time that small sellers could not always delegate to specialist staff."],
        ["What we build", "Current tools include courier and quantity label processing, Flipkart shipping and billing crop, Meesho 4-up and 6-up PDFs, Amazon fee and listing-price estimates, GSTR-1 and GSTR-3B workflow helpers, and marketplace performance analysis."],
        ["How content is prepared", "Guides explain the source records, calculation method, verification checks, and limitations behind each workflow. Marketplace formats, tax rules, and fee tables can change, so dated guidance is reviewed and corrected when source formats change."],
        ["Privacy-first workflow", "Label PDFs and seller reports are processed in the browser where possible. The current workflow does not intentionally store uploaded business documents on our servers."],
        ["Independence", "Marketplace names are used only to describe compatible workflows. SRH Codes is not affiliated with, sponsored by, or endorsed by Amazon, Flipkart, Meesho, GSTN, or their group companies."],
        ["Jurisdiction", "All legal matters are subject to Rajasthan, India."],
      ],
    },
    hi: {
      title: "SRH Codes के बारे में",
      sections: [
        ["", "SRH Codes Indian ecommerce sellers की daily problems के लिए independent browser-based tools और original workflow guides बनाता है: marketplace labels, invoices, GST reports, ऑर्डर data, returns, ads, fees और packing operations."],
        ["यह क्यों बनाया", "यह project real seller workflows से बना जहाँ repetitive PDF formatting, report reconciliation और portal preparation में बहुत समय लगता था."],
        ["हम क्या build करते हैं", "Current tools में courier/quantity label processing, फ्लिपकार्ट shipping-billing crop, मीशो 4-up/6-up PDFs, Amazon fee और listing-price estimates, GSTR-1/GSTR-3B helpers और performance analysis हैं."],
        ["Content कैसे prepare होता है", "Guides source records, calculation method, verification checks और limitations समझाती हैं. Marketplace format, tax rules या fees बदलने पर dated guidance review की जाती है."],
        ["Privacy-first workflow", "Label PDFs और seller reports जहाँ possible हो browser में process होते हैं. Current workflow uploaded business documents को intentionally servers पर store नहीं करता."],
        ["Independence", "Marketplace names सिर्फ compatible workflows describe करने के लिए हैं. SRH Codes Amazon, Flipkart, मीशो या GSTN से affiliated या endorsed नहीं है."],
        ["Jurisdiction", "All legal matters Rajasthan, India के subject हैं."],
      ],
    },
  },
  contact: {
    en: {
      title: "Contact",
      sections: [
        ["", "For support, feedback, bug reports, business queries, or marketplace report format changes, contact SRH Codes by email."],
        ["Email", "shree.anjaneya.1304@gmail.com"],
        ["Support note", "Please do not email sensitive customer documents unless required for support. When sharing examples, remove or mask customer names, phone numbers, addresses, GSTINs, and order identifiers where possible."],
        ["Jurisdiction", "All legal matters are subject to Rajasthan, India."],
      ],
    },
    hi: {
      title: "Contact",
      sections: [
        ["", "Support, feedback, bug reports, business queries या marketplace report format changes के लिए SRH Codes को email करो."],
        ["Email", "shree.anjaneya.1304@gmail.com"],
        ["Support note", "Sensitive customer documents email मत करो जब तक support के लिए जरूरी न हो. Examples share करते time customer names, phone numbers, addresses, GSTINs और ऑर्डर identifiers mask/remove करो."],
        ["Jurisdiction", "All legal matters Rajasthan, India के subject हैं."],
      ],
    },
  },
  privacy: {
    en: {
      title: "Privacy Policy",
      sections: [
        ["", "SRH Codes is designed to process label PDFs and seller reports in your browser. Files selected in the tool are not intentionally uploaded to our server by the current browser-only workflow."],
        ["Data you provide", "You may choose PDF, CSV, ZIP, or spreadsheet files inside the tool. Processing happens locally in the browser unless a future feature clearly states otherwise."],
        ["Analytics and advertising", "We may use Google Analytics to understand aggregate usage such as page views, tool selections, uploads started, processing completed, and downloads clicked. We do not send the contents of your selected PDF, CSV, ZIP, or spreadsheet files to Google Analytics."],
        ["Advertising cookies", "We may use Google AdSense or related Google advertising services to show ads. These services may use cookies or similar technologies to measure ad performance, prevent fraud, and personalize or limit ads depending on your settings and applicable law."],
        ["Jurisdiction", "All legal matters are subject to Rajasthan, India."],
        ["Contact", "For privacy or support questions, email shree.anjaneya.1304@gmail.com."],
      ],
    },
    hi: {
      title: "Privacy Policy",
      sections: [
        ["", "SRH Codes label PDFs और seller reports को browser में process करने के लिए designed है. Current browser-only workflow में selected files intentionally हमारे server पर upload नहीं होती."],
        ["आप जो data provide करते हो", "Tool के अंदर आप PDF, CSV, ZIP या spreadsheet files choose कर सकते हो. Processing browser में locally होती है unless future feature clearly कुछ और बताए."],
        ["Analytics और advertising", "हम Google Analytics use कर सकते हैं aggregate usage समझने के लिए, जैसे page views, tool selections, uploads started, processing completed और downloads clicked. Selected PDF, CSV, ZIP या spreadsheet files का content Google Analytics को नहीं भेजा जाता."],
        ["Advertising cookies", "हम Google AdSense या related Google advertising services use कर सकते हैं ads दिखाने के लिए. ये services ad performance measure, fraud prevent और settings/law के हिसाब से ads personalize या limit करने के लिए cookies use कर सकती हैं."],
        ["Jurisdiction", "All legal matters Rajasthan, India के subject हैं."],
        ["Contact", "Privacy या support questions के लिए email करो: shree.anjaneya.1304@gmail.com."],
      ],
    },
  },
  terms: {
    en: {
      title: "Terms of Use",
      sections: [
        ["", "SRH Codes provides browser-based utilities for ecommerce sellers. Review generated PDFs and report summaries before printing, filing, or submitting any business document."],
        ["No professional advice", "GST and business analysis features are workflow helpers and are not a substitute for professional tax, legal, or accounting advice."],
        ["Marketplace trademarks", "Marketplace names such as Flipkart, Meesho, and Amazon are used descriptively. This site is not affiliated with or endorsed by those marketplaces."],
        ["Availability", "Features may change as marketplace PDF and report formats change."],
        ["Governing law", "All legal matters are subject to Rajasthan, India."],
        ["Contact", "For support or legal queries, email shree.anjaneya.1304@gmail.com."],
      ],
    },
    hi: {
      title: "Terms of Use",
      sections: [
        ["", "SRH Codes ecommerce sellers के लिए browser-based utilities provide करता है. किसी भी business document को print, file या submit करने से पहले generated PDFs और report summaries review करो."],
        ["Professional advice नहीं है", "GST और business analysis features workflow helpers हैं; ये professional tax, legal या accounting advice का substitute नहीं हैं."],
        ["Marketplace trademarks", "फ्लिपकार्ट, मीशो और Amazon जैसे marketplace names descriptive use के लिए हैं. ये site उन marketplaces से affiliated या endorsed नहीं है."],
        ["Availability", "Marketplace PDF और report formats change होने पर features change हो सकते हैं."],
        ["Governing law", "All legal matters Rajasthan, India के subject हैं."],
        ["Contact", "Support या legal queries के लिए email करो: shree.anjaneya.1304@gmail.com."],
      ],
    },
  },
};

export default function LegalPageContent({ page }) {
  const { lang, setLang } = useLanguage();
  const data = copy[page][lang] || copy[page].en;

  return (
    <main className="legal-page">
      <div className="legal-topbar">
        <a href="/">{lang === "hi" ? "टूल्स पर वापस" : "Back to tools"}</a>
        <div className="global-lang" aria-label="Language selector">
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>English</button>
          <button className={lang === "hi" ? "active" : ""} onClick={() => setLang("hi")}>हिन्दी</button>
        </div>
      </div>
      <h1>{data.title}</h1>
      {data.sections.map(([heading, text], index) => (
        <section key={`${heading}-${index}`} className="legal-block">
          {heading && <h2>{heading}</h2>}
          {text.includes("@") ? (
            <p>{text.replace("shree.anjaneya.1304@gmail.com", "")}<a href="mailto:shree.anjaneya.1304@gmail.com">shree.anjaneya.1304@gmail.com</a>{text.endsWith(".") ? "." : ""}</p>
          ) : (
            <p>{text}</p>
          )}
        </section>
      ))}
    </main>
  );
}
