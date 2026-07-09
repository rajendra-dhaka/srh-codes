import { money, num, percent } from "../../utils/formatters";

export function returnExplain(t, lang) {
  if (lang === "hi") {
    return `रिटर्न में ${money(t.returnSaleReversal)} की sale reverse हुई और ${money(t.returnShipping)} return shipping charge लगा. RTO में ${money(t.rtoReversal)} की sale reverse हुई.`;
  }
  return `Customer returns reversed ${money(t.returnSaleReversal)} of sale value and charged ${money(t.returnShipping)} return shipping. RTO reversed ${money(t.rtoReversal)} of sale value.`;
}

export function businessText(value, lang) {
  if (lang !== "hi") return value;
  if (value === "High Risk") return "हाई रिस्क";
  if (value === "Watch Closely") return "ध्यान दें";
  return "हेल्दी टेस्ट";
}

export function translateAction(value, lang) {
  if (lang !== "hi") return value;
  if (value === "Pause / Fix") return "रोकें / सुधारें";
  if (value === "Scale") return "Scale";
  if (value === "Reduce risk") return "रिस्क कम करें";
  if (value === "Can test scale") return "टेस्ट स्केल";
  if (value === "Loss risk") return "लॉस रिस्क";
  return value;
}

export function translatePaymentStatus(value, lang) {
  if (lang !== "hi") return value;
  if (value === "Receivable") return "मिलना है";
  if (value === "Adjustable") return "एडजस्ट होगा";
  return value;
}

export function translateReturnType(value, lang) {
  if (lang !== "hi") return value;
  if (value === "Customer Return") return "कस्टमर रिटर्न";
  return value;
}

export function insightParagraphs(a, lang) {
  const t = a.totals;
  const adShare = t.totalOrders ? t.adOrders / t.totalOrders : 0;
  if (lang === "hi") {
    return [
      `कुल ${num(t.totalOrders)} ऑर्डर्स में से ${num(t.adOrders)} ऐड से आए. ऐड डिपेंडेंसी ${percent(adShare)} है, जो काफी हाई है.`,
      `सेटलमेंट ${money(t.settlement)} है और ऐड स्पेंड ${money(t.adsSpend)} है. ऐड के बाद ${money(t.netAfterAds)} बचता है, प्रोडक्ट कॉस्ट से पहले.`,
      `ब्रेक-ईवन के लिए प्रोडक्ट मार्जिन कम से कम ${percent(t.requiredMargin)} चाहिए, वरना ऐड कॉस्ट कवर नहीं होगी.`,
      `कस्टमर रिटर्न हिट ${money(t.returnHit)} है और RTO sale reversal ${money(t.rtoReversal)} है. लॉस सिर्फ ऐड से नहीं, रिटर्न/RTO से भी आ रहा है.`,
    ];
  }
  return [
    `${num(t.adOrders)} of ${num(t.totalOrders)} orders came from ads. Ad dependency is ${percent(adShare)}, which is very high.`,
    `Settlement is ${money(t.settlement)} and ads spend is ${money(t.adsSpend)}. Net after ads is ${money(t.netAfterAds)} before product and packing cost.`,
    `Break-even needs at least ${percent(t.requiredMargin)} gross margin on settlement just to cover ads.`,
    `Customer return hit is ${money(t.returnHit)} and RTO sale reversal is ${money(t.rtoReversal)}. The leak is ads plus return/RTO, not ads alone.`,
  ];
}

export function actionTips(a, lang) {
  const top = a.topCampaigns.slice(0, 4).map((x) => x.name).join(", ");
  if (lang === "hi") {
    return [
      `सबसे पहले हाई स्पेंड campaigns audit करें: ${top || "campaign data missing"}.`,
      "ऐड बजट कैप रखें. जब तक campaign-wise ROI साफ नहीं है, daily spend को settlement के 20-25% के आस-पास रखें.",
      "जिन SKU/state में cancel/RTO हाई है उन पर ads slow करें; बेहतर delivered-rate वाले items पर spend शिफ्ट करें.",
    ];
  }
  return [
    `Audit the highest-spend campaigns first: ${top || "campaign data missing"}.`,
    "Keep an ads budget cap. Until campaign ROI is clear, keep daily spend around 20-25% of expected settlement.",
    "Slow ads on products/states with high cancel/RTO and shift spend toward items with stronger delivered rates.",
  ];
}
