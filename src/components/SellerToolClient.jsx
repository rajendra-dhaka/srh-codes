"use client";

import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import JSZip from "jszip";
import { degrees, PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  AlertTriangle,
  BarChart3,
  Calculator,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  ClipboardList,
  Download,
  FileSpreadsheet,
  Globe2,
  IndianRupee,
  LayoutGrid,
  Layers,
  LineChart,
  Menu,
  Moon,
  PackageX,
  Printer,
  ReceiptText,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "./LanguageProvider";
import { trackEvent } from "../lib/analytics";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

const palette = ["#2563eb", "#00a6a6", "#f59e0b", "#ef4444", "#7c3aed", "#16a34a", "#475569"];
const DEFAULT_HOME_STATE = "RAJASTHAN";
const GST_STATE_BY_CODE = {
  "01": "JAMMU AND KASHMIR",
  "02": "HIMACHAL PRADESH",
  "03": "PUNJAB",
  "04": "CHANDIGARH",
  "05": "UTTARAKHAND",
  "06": "HARYANA",
  "07": "DELHI",
  "08": "RAJASTHAN",
  "09": "UTTAR PRADESH",
  "10": "BIHAR",
  "11": "SIKKIM",
  "12": "ARUNACHAL PRADESH",
  "13": "NAGALAND",
  "14": "MANIPUR",
  "15": "MIZORAM",
  "16": "TRIPURA",
  "17": "MEGHALAYA",
  "18": "ASSAM",
  "19": "WEST BENGAL",
  "20": "JHARKHAND",
  "21": "ODISHA",
  "22": "CHHATTISGARH",
  "23": "MADHYA PRADESH",
  "24": "GUJARAT",
  "25": "DAMAN AND DIU",
  "26": "DADRA AND NAGAR HAVELI",
  "27": "MAHARASHTRA",
  "29": "KARNATAKA",
  "30": "GOA",
  "31": "LAKSHADWEEP",
  "32": "KERALA",
  "33": "TAMIL NADU",
  "34": "PUDUCHERRY",
  "35": "ANDAMAN AND NICOBAR ISLANDS",
  "36": "TELANGANA",
  "37": "ANDHRA PRADESH",
  "38": "LADAKH",
};
const GST_STATE_OPTIONS = Array.from(new Set(Object.values(GST_STATE_BY_CODE))).sort();
const marketplaces = [
  { id: "overall", label: "Overall" },
  { id: "meesho", label: "Meesho" },
  { id: "flipkart", label: "Flipkart" },
  { id: "amazon", label: "Amazon" },
];

const shellCopy = {
  en: {
    command: "Command Center",
    search: "Search reports, SKUs, states...",
    performance: "Performance",
    performanceHint: "Sales, ads, returns",
    gst: "GST Analysis",
    gstHint: "GSTR-1 helper",
    processing: "Labels",
    processingHint: "Sort, picklist, print",
    smartMode: "Smart filing mode",
    smartModeHint: "Upload reports once, reuse portal-ready values.",
    dark: "Dark mode",
    light: "Light mode",
    about: "About",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
  },
  hi: {
    command: "कमांड सेंटर",
    search: "रिपोर्ट्स, SKU, स्टेट्स सर्च करो...",
    performance: "परफॉर्मेंस",
    performanceHint: "सेल्स, ऐड्स, रिटर्न",
    gst: "जीएसटी एनालिसिस",
    gstHint: "GSTR-1 helper",
    processing: "लेबल्स",
    processingHint: "Sort, picklist, print",
    smartMode: "स्मार्ट फाइलिंग मोड",
    smartModeHint: "रिपोर्ट्स एक बार अपलोड करो, पोर्टल-ready वैल्यूज़ reuse करो.",
    dark: "डार्क मोड",
    light: "लाइट मोड",
    about: "अबाउट",
    contact: "कॉन्टैक्ट",
    privacy: "प्राइवेसी",
    terms: "टर्म्स",
  },
};

const emptyPerformanceData = () => ({
  orders: [],
  payment: { orderPayments: [], ads: [] },
  status: { orders: [], payment: [] },
});

const copy = {
  en: {
    appTitle: "Meesho Insight Tool",
    subtitle: "Upload Orders CSV and Outstanding Payment report to see sales, ad spend, returns, payout, and action insights.",
    orders: "Orders CSV",
    payment: "Outstanding Payment ZIP/XLSX",
    uploadOrders: "Upload Orders Report",
    uploadPayment: "Upload Payment Report",
    sampleReady: "Loaded",
    waiting: "Waiting",
    language: "Language",
    english: "English",
    hindi: "Hindi",
    overview: "Overview",
    graphs: "Graphs",
    tables: "Tables",
    paragraphs: "Insights",
    tips: "Tips",
    totalOrders: "Total Orders",
    dataRange: "Data From",
    adOrders: "Ad Orders",
    organicOrders: "Organic Orders",
    ads: "Ads",
    organic: "Organic",
    orderValue: "Order Value",
    settlement: "Settlement",
    adsSpend: "Ads Spend",
    netAfterAds: "Net After Ads",
    adsSettlement: "Ads / Settlement",
    delivered: "Delivered",
    shipped: "Shipped",
    cancelled: "Cancelled",
    rto: "RTO",
    rtoValue: "RTO Value",
    returns: "Customer Return",
    customerReturnValue: "Customer Return Value",
    businessSummary: "Business Summary",
    orderLifecycle: "Orders Report Lifecycle",
    postDeliveryEvents: "Post-Delivery Payment Events",
    pointToNote: "Point to note",
    summaryNote: "Lifecycle cards below are from the Orders report and add up to Total Orders. Customer Return is separate because it happens after delivery and appears in the Payment report.",
    adsInsight: "Ads Insight",
    pendingOther: "Pending / Other",
    returnCostTitle: "Customer Return & RTO Cost",
    returnRows: "Return Rows",
    returnSaleReversal: "Return Sale Reversal",
    returnShipping: "Return Shipping Charged",
    returnSettlementHit: "Return Settlement Hit",
    rtoRows: "RTO Rows",
    rtoSaleReversal: "RTO Sale Reversal",
    returnBySource: "Return Cost by Source",
    returnBySku: "Return Cost by SKU",
    paymentSchedule: "Payment Schedule",
    skuActions: "SKU Actions",
    cancellations: "Cancellations",
    receivable: "Receivable",
    adjustable: "Adjustable",
    orderSettlement: "Order Settlement",
    adsDeduction: "Ads Deduction",
    netPayable: "Net Payable",
    topCancelledSkus: "Top 5 Cancelled SKUs",
    topRtoSkus: "Top 5 RTO SKUs",
    topCustomerReturnSkus: "Top 5 Customer Return SKUs",
    returnDetail: "Return Detail",
    cancellationDetail: "Cancellation Detail",
    chargeToMe: "Charge to Me",
    saleLost: "Sale Lost",
    ready: "Ready",
    paymentRows: "Payment Rows",
    sourceSplit: "Orders by Source",
    statusBySource: "Status by Source",
    dailyAds: "Daily Ads Spend",
    topCampaigns: "Top Campaign Spend",
    topProducts: "Top Product Risk",
    topStates: "Top State Risk",
    businessHealth: "Business Health",
    cashRoom: "Cash Room After Ads",
    sourceEfficiency: "Source Efficiency",
    profitScenarios: "Profit Scenarios",
    action: "Action",
    sku: "SKU",
    productHint: "Product Hint",
    noData: "Upload both reports to generate analysis.",
    verdictTitle: "What this means",
    tipTitle: "What to do next",
  },
  hi: {
    appTitle: "मीशो इनसाइट टूल",
    subtitle: "ऑर्डर्स CSV और आउटस्टैंडिंग पेमेंट रिपोर्ट अपलोड करके सेल्स, ऐड खर्च, रिटर्न, पेआउट और एक्शन इनसाइट देखें।",
    orders: "ऑर्डर्स CSV",
    payment: "आउटस्टैंडिंग पेमेंट ZIP/XLSX",
    uploadOrders: "ऑर्डर्स रिपोर्ट अपलोड करें",
    uploadPayment: "पेमेंट रिपोर्ट अपलोड करें",
    sampleReady: "लोड हो गया",
    waiting: "इंतजार है",
    language: "भाषा",
    english: "English",
    hindi: "हिंदी",
    overview: "ओवरव्यू",
    graphs: "ग्राफ",
    tables: "टेबल्स",
    paragraphs: "इनसाइट्स",
    tips: "टिप्स",
    totalOrders: "कुल ऑर्डर्स",
    dataRange: "डेटा अवधि",
    adOrders: "ऐड ऑर्डर्स",
    organicOrders: "ऑर्गेनिक ऑर्डर्स",
    ads: "ऐड",
    organic: "ऑर्गेनिक",
    orderValue: "ऑर्डर वैल्यू",
    settlement: "सेटलमेंट",
    adsSpend: "ऐड खर्च",
    netAfterAds: "ऐड के बाद नेट",
    adsSettlement: "Ads / Settlement",
    delivered: "Delivered",
    shipped: "Shipped",
    cancelled: "कैंसल्ड",
    rto: "RTO",
    rtoValue: "RTO वैल्यू",
    returns: "कस्टमर रिटर्न",
    customerReturnValue: "कस्टमर रिटर्न वैल्यू",
    businessSummary: "बिजनेस समरी",
    orderLifecycle: "ऑर्डर लाइफसाइकल",
    postDeliveryEvents: "डिलीवरी के बाद पेमेंट इवेंट",
    pointToNote: "ध्यान दें",
    summaryNote: "नीचे वाले lifecycle cards ऑर्डर्स रिपोर्ट से हैं और इनका sum Total Orders के बराबर होता है. Customer Return अलग है क्योंकि यह delivery के बाद पेमेंट रिपोर्ट में आता है.",
    adsInsight: "ऐड इनसाइट",
    pendingOther: "Pending / Other",
    returnCostTitle: "कस्टमर रिटर्न और RTO कॉस्ट",
    returnRows: "रिटर्न रो",
    returnSaleReversal: "रिटर्न सेल रिवर्सल",
    returnShipping: "रिटर्न शिपिंग चार्ज",
    returnSettlementHit: "रिटर्न सेटलमेंट हिट",
    rtoRows: "RTO Rows",
    rtoSaleReversal: "RTO सेल रिवर्सल",
    returnBySource: "सोर्स के हिसाब से रिटर्न कॉस्ट",
    returnBySku: "SKU के हिसाब से Return Cost",
    paymentSchedule: "पेमेंट शेड्यूल",
    skuActions: "SKU एक्शन",
    cancellations: "कैंसलेशन",
    receivable: "मिलना है",
    adjustable: "एडजस्ट होगा",
    orderSettlement: "ऑर्डर सेटलमेंट",
    adsDeduction: "ऐड कटौती",
    netPayable: "नेट पेयेबल",
    topCancelledSkus: "टॉप 5 कैंसल्ड SKU",
    topRtoSkus: "टॉप 5 RTO SKU",
    topCustomerReturnSkus: "टॉप 5 कस्टमर रिटर्न SKU",
    returnDetail: "रिटर्न डिटेल",
    cancellationDetail: "कैंसलेशन डिटेल",
    chargeToMe: "मेरे ऊपर चार्ज",
    saleLost: "सेल लॉस्ट",
    ready: "रेडी",
    paymentRows: "पेमेंट रो",
    sourceSplit: "सोर्स के हिसाब से ऑर्डर्स",
    statusBySource: "सोर्स के हिसाब से स्टेटस",
    dailyAds: "डेली ऐड खर्च",
    topCampaigns: "टॉप कैंपेन खर्च",
    topProducts: "टॉप प्रोडक्ट रिस्क",
    topStates: "टॉप स्टेट रिस्क",
    businessHealth: "बिजनेस हेल्थ",
    cashRoom: "ऐड के बाद बचा कैश",
    sourceEfficiency: "सोर्स एफिशिएंसी",
    profitScenarios: "प्रॉफिट सिनेरियो",
    action: "एक्शन",
    sku: "SKU",
    productHint: "Product Hint",
    noData: "एनालिसिस बनाने के लिए दोनों रिपोर्ट अपलोड करें।",
    verdictTitle: "इसका मतलब",
    tipTitle: "अब क्या करना है",
  },
};

const processingCopy = {
  en: {
    kicker: "Label Processing",
    title: "Process labels by courier and quantity",
    intro: "Upload one or more marketplace label PDFs, then download or print courier-wise labels for single-quantity, multi-quantity, or all orders with matching picklists.",
    titleHelp: "Use this when multiple seller accounts or courier partners are packed together. The tool reads PDF text in your browser, groups labels by courier and quantity, and prepares label PDFs plus packing picklists.",
    uploadTitle: "Upload label PDFs",
    uploadHint: "Select multiple Meesho, Flipkart, or marketplace label PDFs",
    uploadHelp: "PDFs stay in your browser. Text extraction works when courier, SKU, and seller details are embedded as selectable text in the PDF.",
    sortBy: "Sort labels by",
    none: "Auto packing order",
    courier: "Courier partner",
    sku: "SKU",
    courierSku: "Courier partner, then SKU",
    sellerCourierSku: "Seller account, courier partner, then SKU",
    seller: "Seller account",
    analyze: "Process labels",
    analyzing: "Analyzing PDFs...",
    downloadLabels: "Labels PDF",
    printLabels: "Print labels",
    downloadPicklist: "Picklist PDF",
    courierGroups: "Courier-wise label actions",
    allCouriers: "All couriers",
    singleQty: "Qty 1",
    multiQty: "Multi qty",
    allLabels: "All labels",
    noSubset: "No labels in this group",
    formattedDownloads: "A4 formatted downloads",
    a4FourHint: "4 labels per A4 page",
    a4SixHint: "6 labels per A4 page",
    original: "Original sorted pages",
    a4Four: "A4 - 4 labels per page",
    a4Six: "A4 - 6 labels per page",
    summary: "Packing summary",
    marketplacePending: (marketplace) => `${marketplace} label processing workflow is coming next. Use the Meesho tab for courier-wise labels, quantity groups, print PDFs, and picklist generation today.`,
    courierCounts: "Courier pickup counts",
    sellerCounts: "Seller account counts",
    qtyCounts: "SKU and quantity picklist",
    skuCounts: "Top SKU counts",
    tableTitle: "Sorted label preview",
    unknown: "Unknown",
    noData: "Upload label PDFs and click Process to create courier-wise labels, print PDFs, and picklists.",
    extractionNote: "If any page appears as Unknown, review the PDF source. Scanned/image-only labels may not expose text for automatic sorting.",
  },
  hi: {
    kicker: "लेबल प्रोसेसिंग",
    title: "Courier और quantity के हिसाब से labels process करो",
    intro: "एक या multiple marketplace label PDFs upload करो, फिर courier-wise Qty 1, Multi qty या All orders के labels download/print करो और matching picklists बनाओ.",
    titleHelp: "जब multiple seller accounts या courier partners साथ में pack होते हैं, तब use करो. Tool browser में PDF text read करके labels को courier और quantity groups में organize करता है.",
    uploadTitle: "लेबल PDFs upload करो",
    uploadHint: "Multiple मीशो, फ्लिपकार्ट या marketplace label PDFs select करो",
    uploadHelp: "PDFs browser में रहती हैं. Courier, SKU और seller details PDF में selectable text हों तो extraction work करता है.",
    sortBy: "Labels sort by",
    none: "Auto packing order",
    courier: "Courier partner",
    sku: "SKU",
    courierSku: "Courier partner, फिर SKU",
    sellerCourierSku: "Seller account, courier partner, फिर SKU",
    seller: "Seller account",
    analyze: "Labels process करो",
    analyzing: "PDFs analyze हो रही हैं...",
    downloadLabels: "Labels PDF",
    printLabels: "Labels print",
    downloadPicklist: "Picklist PDF",
    courierGroups: "Courier-wise label actions",
    allCouriers: "All couriers",
    singleQty: "Qty 1",
    multiQty: "Multi qty",
    allLabels: "All labels",
    noSubset: "इस group में labels नहीं हैं",
    formattedDownloads: "A4 formatted downloads",
    a4FourHint: "A4 page पर 4 labels",
    a4SixHint: "A4 page पर 6 labels",
    original: "Original sorted pages",
    a4Four: "A4 - 4 labels per page",
    a4Six: "A4 - 6 labels per page",
    summary: "Packing summary",
    marketplacePending: (marketplace) => `${marketplace} label processing workflow next आएगा. अभी courier-wise labels, quantity groups, print PDFs और picklist generation के लिए Meesho tab use करो.`,
    courierCounts: "Courier pickup counts",
    sellerCounts: "Seller account counts",
    qtyCounts: "SKU और quantity picklist",
    skuCounts: "Top SKU counts",
    tableTitle: "Sorted label preview",
    unknown: "Unknown",
    noData: "Label PDFs upload करके Process click करो, फिर courier-wise labels, print PDFs और picklists बन जाएंगी.",
    extractionNote: "अगर कोई page Unknown आए, PDF source review करो. Scanned/image-only labels automatic sorting के लिए text expose नहीं कर सकते.",
  },
};

const gstCopy = {
  en: {
    kicker: "GST Analysis",
    title: "Portal-ready return helper",
    intro: "Upload Meesho reports to calculate B2C sales, HSN summary, document counts, and ECO values for GSTR-1.",
    docsTitle: "Meesho required documents",
    docsHelp: "Download these reports from Meesho Supplier Panel. GST Report ZIP is mandatory; Tax Invoice ZIP is needed for Table 13 document series.",
    homeStateLabel: "Seller home GST state",
    homeStateHelp: "Used to split local B2C supplies into CGST/SGST and interstate supplies into IGST. If you leave it blank, the tool tries to infer it from seller GSTIN in the uploaded report.",
    homeStateAuto: "Auto from report",
    gstReport: "GST Report ZIP",
    gstReportHint: "gst_...zip with tcs_sales.xlsx and tcs_sales_return.xlsx",
    gstReportHelp: "Mandatory Meesho GST report. It contains sales and sales-return sheets used for Table 7 and HSN values.",
    taxInvoice: "Tax Invoice ZIP",
    taxInvoiceHint: "Contains Tax_invoice_details.xlsx and invoice PDFs",
    taxInvoiceHelp: "Used to calculate Table 13 document counts. Upload this if you want complete GSTR-1 document summary.",
    supplierInvoice: "Supplier Tax Invoice ZIP",
    supplierInvoiceHint: "Meesho to Supplier invoice, for GSTR-3B ITC reference",
    supplierInvoiceHelp: "Optional backup for fees and ITC reconciliation. It is not required for core GSTR-1 Table 7 values.",
    commission: "Commission Backup ZIP",
    commissionHint: "forward/reverse/other_charges, optional reconciliation backup",
    commissionHelp: "Optional reconciliation file for platform charges and commission review.",
    moduleTitle: "What this module does",
    moduleHelp: "These calculations are helpers. Please review numbers before filing on the GST portal.",
    checks: [
      "Calculates net taxable value after deducting returns from sales.",
      "Splits local supplies into CGST/SGST and interstate supplies into IGST using the seller home state.",
      "Builds row-wise values for the B2C HSN Summary.",
      "Uses tax invoice details to calculate Table 13 document counts.",
      "Prepares the Meesho net value for Table 14 ECO u/s 52.",
    ],
    generate: "Generate GST Summary",
    analyzing: "Analyzing...",
    required: "required",
    comingTitle: (platform) => `${marketLabel(platform)} GST workspace`,
    comingBody: (platform) => platform === "overall"
      ? "Overall GST will combine marketplace-wise summaries once each marketplace workflow is configured."
      : `${marketLabel(platform)} GST uploads will be added here. Use the Meesho tab for portal-ready GSTR-1 values today.`,
  },
  hi: {
    kicker: "जीएसटी एनालिसिस",
    title: "पोर्टल-ready रिटर्न हेल्पर",
    intro: "मीशो रिपोर्ट्स अपलोड करो और GSTR-1 पोर्टल के लिए B2C सेल्स, HSN summary, document counts और ECO values निकालो.",
    docsTitle: "मीशो required documents",
    docsHelp: "ये रिपोर्ट्स मीशो Supplier Panel से डाउनलोड करो. जीएसटी Report ZIP mandatory है; Tax Invoice ZIP Table 13 document series के लिए चाहिए.",
    homeStateLabel: "Seller home GST state",
    homeStateHelp: "Local B2C supplies को CGST/SGST और interstate supplies को IGST में split करने के लिए use होता है. Blank छोड़ने पर tool uploaded report में seller GSTIN से state infer करने की कोशिश करता है.",
    homeStateAuto: "Report से auto",
    gstReport: "जीएसटी Report ZIP",
    gstReportHint: "gst_...zip जिसमें tcs_sales.xlsx और tcs_sales_return.xlsx होती हैं",
    gstReportHelp: "Mandatory मीशो जीएसटी report. इसमें सेल्स और सेल्स-रिटर्न sheets होती हैं जो Table 7 और HSN values के लिए use होती हैं.",
    taxInvoice: "Tax Invoice ZIP",
    taxInvoiceHint: "Tax_invoice_details.xlsx और invoice PDFs",
    taxInvoiceHelp: "Table 13 document counts calculate करने के लिए use होती है. Complete GSTR-1 document summary के लिए upload करो.",
    supplierInvoice: "Supplier Tax Invoice ZIP",
    supplierInvoiceHint: "मीशो to Supplier invoice, GSTR-3B ITC reference के लिए",
    supplierInvoiceHelp: "Fees और ITC reconciliation के लिए optional backup. Core GSTR-1 Table 7 values के लिए required नहीं है.",
    commission: "Commission Backup ZIP",
    commissionHint: "forward/reverse/other_charges, optional reconciliation backup",
    commissionHelp: "Platform charges और commission review के लिए optional reconciliation file.",
    moduleTitle: "ये module क्या करता है",
    moduleHelp: "ये calculations helpers हैं. GST portal पर file करने से पहले numbers review करो.",
    checks: [
      "सेल्स से रिटर्न deduct करके net taxable value calculate करता है.",
      "Seller home state के हिसाब से local supplies को CGST/SGST और interstate supplies को IGST में split करता है.",
      "B2C HSN Summary के लिए row-wise values बनाता है.",
      "Tax invoice details से Table 13 document counts calculate करता है.",
      "Table 14 ECO u/s 52 के लिए मीशो net value prepare करता है.",
    ],
    generate: "GST Summary generate करो",
    analyzing: "Analyze हो रहा है...",
    required: "जरूरी",
    comingTitle: (platform) => `${marketLabel(platform)} जीएसटी workspace`,
    comingBody: (platform) => platform === "overall"
      ? "Overall GST हर marketplace की summary को combine करेगा जब workflows configured होंगे."
      : `${marketLabel(platform)} GST uploads यहां add होंगे. अभी portal-ready GSTR-1 values के लिए मीशो tab use करो.`,
  },
};

const money = (value) =>
  `Rs ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const num = (value) => Number(value || 0).toLocaleString("en-IN");
const percent = (value) => `${(Number(value || 0) * 100).toFixed(1)}%`;
const n = (value) => Number(value || 0);

function normalizeSource(value) {
  return value && String(value).trim() ? String(value).trim() : "Organic";
}

function isRto(status) {
  return String(status || "").toUpperCase().startsWith("RTO");
}

function statusBucket(status) {
  const s = String(status || "").toUpperCase();
  if (s === "DELIVERED") return "Delivered";
  if (s === "SHIPPED") return "Shipped";
  if (s === "CANCELLED") return "Cancelled";
  if (s === "READY_TO_SHIP") return "Ready";
  if (s === "RETURN") return "Customer Return";
  if (s.startsWith("RTO")) return "RTO";
  return s ? s.replaceAll("_", " ") : "Other";
}

async function parseOrders(file) {
  const text = await file.text();
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data.map((row) => ({
        ...row,
        "Order source": normalizeSource(row["Order source"]),
        qty: n(row.Quantity),
        orderValue: n(row.Quantity) * n(row["Supplier Discounted Price (Incl GST and Commision)"]),
        orderDate: row["Order Date"],
        bucket: statusBucket(row["Reason for Credit Entry"]),
        rto: isRto(row["Reason for Credit Entry"]),
        sku: String(row.SKU || "Unknown SKU"),
        productHint: String(row["Product Name"] || "").replace("SHREE ANJANEYA ", "").slice(0, 54),
      }))),
      error: reject,
    });
  });
}

async function parseOrdersFiles(files) {
  const parsed = await Promise.all(files.map((file) => parseOrders(file)));
  return parsed.flat();
}

async function workbookFromUpload(file) {
  let buffer;
  if (file.name.toLowerCase().endsWith(".zip")) {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const entry = Object.values(zip.files).find((item) => /\.xlsx$/i.test(item.name));
    if (!entry) throw new Error("ZIP file does not contain an XLSX report.");
    buffer = await entry.async("arraybuffer");
  } else {
    buffer = await file.arrayBuffer();
  }
  return parseXlsxWorkbook(buffer);
}

function sheetRows(workbook, sheetName) {
  const raw = workbook[sheetName] || [];
  const headerIndex = raw.findIndex((row) => row.includes("Sub Order No") || row.includes("Deduction Duration"));
  if (headerIndex < 0) return [];
  const headers = raw[headerIndex].map((x) => String(x || "").trim());
  return raw.slice(headerIndex + 1)
    .filter((row) => row.some((cell) => String(cell || "").trim()) && !String(row[0] || "").includes("No data"))
    .map((row) => Object.fromEntries(headers.map((h, i) => [h || `Column ${i + 1}`, row[i]])));
}

async function parsePayment(file) {
  const workbook = await workbookFromUpload(file);
  const orderPayments = sheetRows(workbook, "Order Payments").map((row) => ({
    ...row,
    "Order source": normalizeSource(row["Order source"]),
    status: statusBucket(row["Live Order Status"]),
    paymentDate: excelDateLabel(row["Payment Date"]),
    orderDate: excelDateLabel(row["Order Date"]),
    sku: String(row["Supplier SKU"] || "Unknown SKU"),
    settlement: n(row["Final Settlement Amount"]),
    grossSale: n(row["Total Sale Amount (Incl. Shipping & GST)"]),
    saleReturn: n(row["Total Sale Return Amount (Incl. Shipping & GST)"]),
    returnShipping: n(row["Return Shipping Charge (Incl. GST)"]),
  }));
  const ads = sheetRows(workbook, "Ads Cost").map((row) => ({
    ...row,
    campaignId: String(row["Campaign ID"] || "Unknown"),
    date: excelDateLabel(row["Deduction Duration"]),
    deductionDate: excelDateLabel(row["Deduction Date"]),
    adCost: n(row["Ad Cost"]),
    gst: n(row.GST),
    signedTotalAdsCost: n(row["Total Ads Cost"]),
    spend: Math.abs(n(row["Total Ads Cost"])),
  }));
  return { orderPayments, ads };
}

async function parsePaymentFiles(files) {
  const parsed = await Promise.all(files.map((file) => parsePayment(file)));
  return parsed.reduce((merged, item) => ({
    orderPayments: [...merged.orderPayments, ...item.orderPayments],
    ads: [...merged.ads, ...item.ads],
  }), { orderPayments: [], ads: [] });
}

function excelDateLabel(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  return String(value || "");
}

function summarizeBy(rows, key, mapper) {
  const map = new Map();
  rows.forEach((row) => {
    const k = key(row);
    if (!map.has(k)) map.set(k, mapper());
    const item = map.get(k);
    item.rows += 1;
    item.orderValue += n(row.orderValue);
    item.settlement += n(row.settlement);
    item.spend += n(row.spend);
    item.grossSale += n(row.grossSale);
    item.saleReturn += n(row.saleReturn);
    item.returnShipping += n(row.returnShipping);
    const b = row.bucket || row.status || "Other";
    if (b === "Delivered") item.delivered += 1;
    if (b === "Shipped") item.shipped += 1;
    if (b === "Cancelled") item.cancelled += 1;
    if (b === "RTO") item.rto += 1;
    if (b === "Customer Return") item.returns += 1;
    if (b === "Ready") item.ready += 1;
  });
  return Array.from(map, ([name, item]) => ({ name, ...item }));
}

function emptyAgg() {
  return { rows: 0, orderValue: 0, settlement: 0, spend: 0, grossSale: 0, saleReturn: 0, returnShipping: 0, delivered: 0, shipped: 0, cancelled: 0, rto: 0, returns: 0, ready: 0, returnRows: 0, rtoRows: 0, returnSaleReversal: 0, rtoSaleReversal: 0, returnSettlementHit: 0 };
}

function summarizeSku(rows) {
  const map = new Map();
  rows.forEach((row) => {
    const key = row.sku || "Unknown SKU";
    if (!map.has(key)) {
      map.set(key, { name: key, productHint: row.productHint || "", ...emptyAgg() });
    }
    const item = map.get(key);
    item.rows += 1;
    item.orderValue += n(row.orderValue);
    if (row.bucket === "Delivered") item.delivered += 1;
    if (row.bucket === "Cancelled") item.cancelled += 1;
    if (row.bucket === "RTO") item.rto += 1;
    if (row.bucket === "Shipped") item.shipped += 1;
    if (row.bucket === "Ready") item.ready += 1;
  });
  return Array.from(map.values())
    .map((row) => ({
      ...row,
      problemRate: row.rows ? (row.cancelled + row.rto) / row.rows : 0,
      deliveredRate: row.rows ? row.delivered / row.rows : 0,
      action: skuAction(row),
    }))
    .sort((a, b) => b.orderValue - a.orderValue);
}

function skuAction(row) {
  const problemRate = row.rows ? (row.cancelled + row.rto) / row.rows : 0;
  const deliveredRate = row.rows ? row.delivered / row.rows : 0;
  if (row.rows >= 5 && problemRate >= 0.3) return "Pause / Fix";
  if (row.rows >= 5 && deliveredRate >= 0.35 && problemRate <= 0.18) return "Scale";
  return "Watch";
}

function sourceEfficiencyRows(orderSource, paymentSource) {
  return orderSource
    .filter((row) => row.name !== "Overall")
    .map((row) => {
      const payment = paymentSource.find((x) => x.name === row.name) || emptyAgg();
      const problemRate = row.rows ? (row.cancelled + row.rto) / row.rows : 0;
      const deliveredRate = row.rows ? row.delivered / row.rows : 0;
      return {
        name: row.name,
        orders: row.rows,
        orderValue: row.orderValue,
        settlement: payment.settlement,
        settlementPerOrder: row.rows ? payment.settlement / row.rows : 0,
        deliveredRate,
        problemRate,
        action: problemRate > 0.2 ? "Reduce risk" : "Can test scale",
      };
    });
}

function scenarioRows(settlement, adsSpend) {
  return [0.2, 0.3, 0.4, 0.5, 0.6].map((margin) => ({
    name: `${Math.round(margin * 100)}%`,
    grossProfitBeforeAds: settlement * margin,
    estimatedProfitAfterAds: settlement * margin - adsSpend,
    action: settlement * margin - adsSpend >= 0 ? "OK" : "Loss risk",
  }));
}

function returnCostRows(paymentRows, key) {
  const map = new Map();
  paymentRows.forEach((row) => {
    if (row.status !== "Customer Return" && row.status !== "RTO") return;
    const group = key(row);
    if (!map.has(group)) map.set(group, { name: group, ...emptyAgg() });
    const item = map.get(group);
    item.rows += 1;
    item.grossSale += row.grossSale;
    item.saleReturn += row.saleReturn;
    item.returnShipping += row.returnShipping;
    item.settlement += row.settlement;
    if (row.status === "Customer Return") {
      item.returnRows += 1;
      item.returnSaleReversal += Math.abs(row.saleReturn);
      item.returnSettlementHit += Math.abs(row.settlement);
    }
    if (row.status === "RTO") {
      item.rtoRows += 1;
      item.rtoSaleReversal += Math.abs(row.saleReturn);
    }
  });
  return Array.from(map.values()).sort((a, b) => (b.returnSettlementHit + b.rtoSaleReversal) - (a.returnSettlementHit + a.rtoSaleReversal));
}

function paymentScheduleRows(paymentRows, adsRows) {
  const map = new Map();
  const ensure = (date) => {
    const key = date || "Unknown";
    if (!map.has(key)) {
      map.set(key, { name: key, orderSettlement: 0, adsDeduction: 0, netPayable: 0, status: "Receivable" });
    }
    return map.get(key);
  };
  paymentRows.forEach((row) => {
    const item = ensure(row.paymentDate);
    item.orderSettlement += row.settlement;
  });
  adsRows.forEach((row) => {
    const item = ensure(row.deductionDate);
    item.adsDeduction += row.signedTotalAdsCost || -row.spend;
  });
  return Array.from(map.values())
    .map((row) => ({
      ...row,
      netPayable: row.orderSettlement + row.adsDeduction,
      status: row.orderSettlement + row.adsDeduction >= 0 ? "Receivable" : "Adjustable",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function returnDetailRows(paymentRows) {
  return paymentRows
    .filter((row) => row.status === "RTO" || row.status === "Customer Return")
    .map((row) => ({
      name: row["Sub Order No"] || "",
      date: row.paymentDate || row.orderDate || "",
      sku: row.sku,
      type: row.status,
      saleLost: Math.abs(row.saleReturn),
      chargeToMe: row.status === "Customer Return" ? Math.abs(row.settlement || row.returnShipping) : 0,
      returnShipping: Math.abs(row.returnShipping),
      source: row["Order source"],
    }))
    .sort((a, b) => b.chargeToMe - a.chargeToMe || b.saleLost - a.saleLost);
}

function cancellationDetailRows(orders) {
  return orders
    .filter((row) => row.bucket === "Cancelled")
    .map((row) => ({
      name: row["Sub Order No"] || "",
      date: row.orderDate || "",
      sku: row.sku,
      source: row["Order source"],
      orderValue: row.orderValue,
      productHint: row.productHint,
    }))
    .sort((a, b) => b.orderValue - a.orderValue);
}

function topSkuBy(rows, filterFn, valueFn) {
  const map = new Map();
  rows.filter(filterFn).forEach((row) => {
    const sku = row.sku || "Unknown SKU";
    if (!map.has(sku)) map.set(sku, { name: sku, rows: 0, orderValue: 0, saleLost: 0, chargeToMe: 0 });
    const item = map.get(sku);
    item.rows += 1;
    const value = valueFn(row);
    item.orderValue += value.orderValue || 0;
    item.saleLost += value.saleLost || 0;
    item.chargeToMe += value.chargeToMe || 0;
  });
  return Array.from(map.values())
    .sort((a, b) => (b.chargeToMe + b.saleLost + b.orderValue) - (a.chargeToMe + a.saleLost + a.orderValue))
    .slice(0, 5);
}

function computeAnalytics(orders, payment) {
  if (!orders.length && !payment.orderPayments.length) return null;
  const orderSource = summarizeBy(orders, (r) => r["Order source"], emptyAgg);
  const statusRows = summarizeBy(orders, (r) => r.bucket, emptyAgg);
  const paymentSource = summarizeBy(payment.orderPayments, (r) => r["Order source"], emptyAgg);
  const paymentStatus = summarizeBy(payment.orderPayments, (r) => r.status, emptyAgg);
  const adsDaily = summarizeBy(payment.ads, (r) => r.date, emptyAgg).sort((a, b) => a.name.localeCompare(b.name));
  const topCampaigns = summarizeBy(payment.ads, (r) => r.campaignId, emptyAgg)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10);
  const topProducts = summarizeSku(orders)
    .slice(0, 10);
  const topStates = summarizeBy(orders, (r) => r["Customer State"] || "Unknown", emptyAgg)
    .map((row) => ({
      ...row,
      problemRate: row.rows ? (row.cancelled + row.rto) / row.rows : 0,
      deliveredRate: row.rows ? row.delivered / row.rows : 0,
    }))
    .sort((a, b) => b.orderValue - a.orderValue)
    .slice(0, 10);

  const totalOrders = orders.length;
  const adOrders = orderSource.find((x) => x.name === "Ad order")?.rows || 0;
  const organicOrders = orderSource.find((x) => x.name === "Organic")?.rows || 0;
  const orderValue = orders.reduce((sum, x) => sum + x.orderValue, 0);
  const settlement = payment.orderPayments.reduce((sum, x) => sum + x.settlement, 0);
  const adsSpend = payment.ads.reduce((sum, x) => sum + x.spend, 0);
  const netAfterAds = settlement - adsSpend;
  const returnHit = Math.abs(payment.orderPayments.filter((x) => x.status === "Customer Return").reduce((sum, x) => sum + x.settlement, 0));
  const rtoReversal = Math.abs(payment.orderPayments.filter((x) => x.status === "RTO").reduce((sum, x) => sum + x.saleReturn, 0));
  const adsToSettlement = settlement ? adsSpend / settlement : 0;
  const requiredMargin = settlement ? adsSpend / settlement : 0;
  const sourceEfficiency = sourceEfficiencyRows(orderSource, paymentSource);
  const scenarios = scenarioRows(settlement, adsSpend);
  const businessHealth = healthLabel(adsToSettlement, netAfterAds, orderSource);
  const returnBySource = returnCostRows(payment.orderPayments, (r) => r["Order source"]);
  const skuLookup = new Map(orders.map((row) => [String(row["Sub Order No"] || ""), row.sku || "Unknown SKU"]));
  const returnBySku = returnCostRows(payment.orderPayments, (r) => skuLookup.get(String(r["Sub Order No"] || "")) || String(r["Supplier SKU"] || "Unknown SKU")).slice(0, 12);
  const paymentSchedule = paymentScheduleRows(payment.orderPayments, payment.ads);
  const returnDetails = returnDetailRows(payment.orderPayments);
  const cancellationDetails = cancellationDetailRows(orders);
  const topCancelledSkus = topSkuBy(orders, (row) => row.bucket === "Cancelled", (row) => ({ orderValue: row.orderValue }));
  const topRtoSkus = topSkuBy(payment.orderPayments, (row) => row.status === "RTO", (row) => ({ saleLost: Math.abs(row.saleReturn), chargeToMe: 0 }));
  const topCustomerReturnSkus = topSkuBy(payment.orderPayments, (row) => row.status === "Customer Return", (row) => ({ saleLost: Math.abs(row.saleReturn), chargeToMe: Math.abs(row.settlement || row.returnShipping) }));
  const returnRows = payment.orderPayments.filter((x) => x.status === "Customer Return").length;
  const rtoRows = payment.orderPayments.filter((x) => x.status === "RTO").length;
  const returnSaleReversal = Math.abs(payment.orderPayments.filter((x) => x.status === "Customer Return").reduce((sum, x) => sum + x.saleReturn, 0));
  const returnShipping = Math.abs(payment.orderPayments.filter((x) => x.status === "Customer Return").reduce((sum, x) => sum + x.returnShipping, 0));
  const orderDates = orders.map((row) => row.orderDate).filter(Boolean).sort();
  const dataRange = {
    from: orderDates[0] || "",
    to: orderDates[orderDates.length - 1] || "",
  };
  const businessSummary = businessSummaryRows(orders, payment.orderPayments);

  return { orderSource, statusRows, paymentSource, paymentStatus, adsDaily, topCampaigns, topProducts, topStates, sourceEfficiency, scenarios, businessHealth, returnBySource, returnBySku, paymentSchedule, returnDetails, cancellationDetails, topCancelledSkus, topRtoSkus, topCustomerReturnSkus, businessSummary, dataRange, totals: { totalOrders, adOrders, organicOrders, orderValue, settlement, adsSpend, netAfterAds, returnHit, rtoReversal, paymentRows: payment.orderPayments.length, adsToSettlement, requiredMargin, returnRows, rtoRows, returnSaleReversal, returnShipping } };
}

function splitSource(rows, predicate, valueKey = "orderValue") {
  const filtered = rows.filter(predicate);
  const ads = filtered.filter((row) => row["Order source"] === "Ad order");
  const organic = filtered.filter((row) => row["Order source"] !== "Ad order");
  return {
    totalCount: filtered.length,
    totalValue: filtered.reduce((sum, row) => sum + n(row[valueKey]), 0),
    adsCount: ads.length,
    adsValue: ads.reduce((sum, row) => sum + n(row[valueKey]), 0),
    organicCount: organic.length,
    organicValue: organic.reduce((sum, row) => sum + n(row[valueKey]), 0),
  };
}

function businessSummaryRows(orders, paymentRows) {
  const total = splitSource(orders, () => true);
  const delivered = splitSource(orders, (row) => row.bucket === "Delivered");
  const shipped = splitSource(orders, (row) => row.bucket === "Shipped");
  const ready = splitSource(orders, (row) => row.bucket === "Ready");
  const cancelled = splitSource(orders, (row) => row.bucket === "Cancelled");
  const rto = splitSource(orders, (row) => row.bucket === "RTO");
  const pendingOther = splitSource(orders, (row) => !["Delivered", "Shipped", "Ready", "Cancelled", "RTO"].includes(row.bucket));
  const customerReturnRows = paymentRows
    .filter((row) => row.status === "Customer Return")
    .map((row) => ({
      ...row,
      orderValue: Math.abs(row.saleReturn),
    }));
  const customerReturn = splitSource(customerReturnRows, () => true);
  customerReturn.totalCharge = customerReturnRows.reduce((sum, row) => sum + Math.abs(row.settlement || row.returnShipping), 0);
  customerReturn.adsCharge = customerReturnRows.filter((row) => row["Order source"] === "Ad order").reduce((sum, row) => sum + Math.abs(row.settlement || row.returnShipping), 0);
  customerReturn.organicCharge = customerReturnRows.filter((row) => row["Order source"] !== "Ad order").reduce((sum, row) => sum + Math.abs(row.settlement || row.returnShipping), 0);
  return {
    total,
    lifecycle: [
      { key: "delivered", data: delivered, tone: "green" },
      { key: "shipped", data: shipped, tone: "blue" },
      { key: "ready", data: ready, tone: "teal" },
      { key: "cancelled", data: cancelled, tone: "red" },
      { key: "rto", data: rto, tone: "orange" },
      { key: "pendingOther", data: pendingOther, tone: "slate" },
    ],
    customerReturn,
  };
}

function healthLabel(adsToSettlement, netAfterAds, orderSource) {
  const ad = orderSource.find((x) => x.name === "Ad order");
  const adProblemRate = ad?.rows ? (ad.cancelled + ad.rto) / ad.rows : 0;
  if (netAfterAds < 0 || adsToSettlement > 0.7 || adProblemRate > 0.25) return { label: "High Risk", tone: "red" };
  if (adsToSettlement > 0.4 || adProblemRate > 0.18) return { label: "Watch Closely", tone: "orange" };
  return { label: "Healthy Test", tone: "green" };
}

function asMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseNumberish(value) {
  if (value == null) return 0;
  const clean = String(value).replace(/,/g, "").trim();
  if (!clean || clean === "null") return 0;
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeStateName(value) {
  return String(value || "").trim().toUpperCase();
}

function stateFromGstin(value) {
  const gstin = String(value || "").trim().toUpperCase();
  if (!/^[0-9]{2}[A-Z0-9]{13}$/.test(gstin)) return "";
  return GST_STATE_BY_CODE[gstin.slice(0, 2)] || "";
}

function inferHomeStateFromRows(rows) {
  const preferredKeys = ["seller", "supplier", "gstin", "gst_in", "gst"];
  for (const row of rows) {
    for (const [key, value] of Object.entries(row || {})) {
      const normalizedKey = String(key).toLowerCase();
      if (!preferredKeys.some((part) => normalizedKey.includes(part))) continue;
      const state = stateFromGstin(value);
      if (state) return state;
    }
  }
  return "";
}

async function parseXlsxWorkbook(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const shared = await sharedStrings(zip);
  const workbookXml = await zip.file("xl/workbook.xml")?.async("text");
  const relsXml = await zip.file("xl/_rels/workbook.xml.rels")?.async("text");
  if (!workbookXml || !relsXml) return {};
  const workbook = new DOMParser().parseFromString(workbookXml, "text/xml");
  const rels = new DOMParser().parseFromString(relsXml, "text/xml");
  const relMap = Object.fromEntries(Array.from(rels.querySelectorAll("Relationship")).map((rel) => [rel.getAttribute("Id"), rel.getAttribute("Target")]));
  const sheets = {};
  for (const sheet of Array.from(workbook.querySelectorAll("sheets sheet"))) {
    const name = sheet.getAttribute("name") || "Sheet";
    const relId = sheet.getAttribute("r:id");
    const target = relMap[relId];
    if (!target) continue;
    const normalized = target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^..\//, "")}`;
    const entry = zip.file(normalized);
    if (entry) sheets[name] = await xlsxSheetRows(entry, shared);
  }
  return sheets;
}

async function xlsxXmlRows(buffer) {
  const workbook = await parseXlsxWorkbook(buffer);
  return Object.values(workbook)[0] || [];
}

async function sharedStrings(zip) {
  const sharedEntry = zip.file("xl/sharedStrings.xml");
  const shared = [];
  if (sharedEntry) {
    const sharedXml = new DOMParser().parseFromString(await sharedEntry.async("text"), "text/xml");
    sharedXml.querySelectorAll("si").forEach((node) => {
      shared.push(Array.from(node.querySelectorAll("t")).map((t) => t.textContent || "").join(""));
    });
  }
  return shared;
}

async function xlsxSheetRows(sheetEntry, shared) {
  const xml = new DOMParser().parseFromString(await sheetEntry.async("text"), "text/xml");
  const colIndex = (cellRef) => {
    const letters = String(cellRef || "").replace(/[0-9]/g, "");
    return [...letters].reduce((sum, ch) => sum * 26 + ch.charCodeAt(0) - 64, 0) - 1;
  };
  return Array.from(xml.querySelectorAll("sheetData row")).map((row) => {
    const values = [];
    row.querySelectorAll("c").forEach((cell) => {
      const index = colIndex(cell.getAttribute("r"));
      const type = cell.getAttribute("t");
      let value = "";
      if (type === "inlineStr") value = cell.querySelector("is t")?.textContent || "";
      else if (type === "s") value = shared[Number(cell.querySelector("v")?.textContent || 0)] || "";
      else value = cell.querySelector("v")?.textContent || cell.textContent || "";
      values[index] = value;
    });
    return values.map((v) => v ?? "");
  }).filter((row) => row.some((cell) => String(cell || "").trim()));
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map((cell, index) => String(cell || `Column ${index + 1}`).trim());
  return rows.slice(1).map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""])));
}

async function getZipFileBuffer(zip, pattern) {
  const entry = Object.values(zip.files).find((item) => pattern.test(item.name) && !item.dir);
  if (!entry) return null;
  return entry.async("arraybuffer");
}

async function parseMeeshoGstReport(file) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const salesBuffer = await getZipFileBuffer(zip, /tcs_sales\.xlsx$/i);
  const returnsBuffer = await getZipFileBuffer(zip, /tcs_sales_return\.xlsx$/i);
  if (!salesBuffer || !returnsBuffer) throw new Error("The GST Report ZIP must contain both tcs_sales.xlsx and tcs_sales_return.xlsx.");
  return {
    sales: rowsToObjects(await xlsxXmlRows(salesBuffer)),
    returns: rowsToObjects(await xlsxXmlRows(returnsBuffer)),
  };
}

async function parseMeeshoTaxInvoice(file) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const detailsBuffer = await getZipFileBuffer(zip, /Tax_invoice_details\.xlsx$/i);
  if (!detailsBuffer) throw new Error("Tax_invoice_details.xlsx was not found in the Tax Invoice ZIP.");
  const workbook = await parseXlsxWorkbook(detailsBuffer);
  return rowsToObjects(workbook.Invoice_Info || Object.values(workbook)[0] || []);
}

function summarizeMeeshoGst(gstReport, docsRows = [], selectedHomeState = "") {
  if (!gstReport?.sales?.length) return null;
  const inferredHomeState = inferHomeStateFromRows([...gstReport.sales, ...gstReport.returns]);
  const homeState = normalizeStateName(selectedHomeState || inferredHomeState || DEFAULT_HOME_STATE);
  const homeStateSource = selectedHomeState ? "manual selection" : inferredHomeState ? "report GSTIN" : "default setting";
  const stateMap = new Map();
  const hsnMap = new Map();
  const ensure = (map, key, seed) => {
    if (!map.has(key)) map.set(key, { ...seed });
    return map.get(key);
  };
  const addRows = (rows, sign, bucket) => {
    rows.forEach((row) => {
      const state = normalizeStateName(row.end_customer_state_new || "UNKNOWN");
      const hsn = String(row.hsn_code || "UNKNOWN").trim();
      const taxable = parseNumberish(row.total_taxable_sale_value);
      const tax = parseNumberish(row.tax_amount);
      const invoice = parseNumberish(row.total_invoice_value);
      const qty = parseNumberish(row.quantity);
      const stateItem = ensure(stateMap, state, { state, gross: 0, returns: 0, net: 0, tax: 0, invoice: 0, qty: 0 });
      stateItem[bucket] += taxable;
      stateItem.net += sign * taxable;
      stateItem.tax += sign * tax;
      stateItem.invoice += sign * invoice;
      stateItem.qty += sign * qty;
      const hsnItem = ensure(hsnMap, hsn, { hsn, qty: 0, totalValue: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 });
      hsnItem.qty += sign * qty;
      hsnItem.totalValue += sign * invoice;
      hsnItem.taxable += sign * taxable;
      if (state === homeState) {
        hsnItem.cgst += sign * tax / 2;
        hsnItem.sgst += sign * tax / 2;
      } else {
        hsnItem.igst += sign * tax;
      }
    });
  };
  addRows(gstReport.sales, 1, "gross");
  addRows(gstReport.returns, -1, "returns");
  const states = Array.from(stateMap.values()).filter((row) => Math.round(row.net * 100) !== 0).sort((a, b) => a.state.localeCompare(b.state));
  const hsn = Array.from(hsnMap.values()).filter((row) => Math.round(row.taxable * 100) !== 0).sort((a, b) => a.hsn.localeCompare(b.hsn));
  const totals = states.reduce((sum, row) => {
    sum.taxable += row.net;
    sum.tax += row.tax;
    if (row.state === homeState) {
      sum.cgst += row.tax / 2;
      sum.sgst += row.tax / 2;
    } else {
      sum.igst += row.tax;
    }
    return sum;
  }, { taxable: 0, tax: 0, igst: 0, cgst: 0, sgst: 0 });
  const gross = gstReport.sales.reduce((sum, row) => sum + parseNumberish(row.total_taxable_sale_value), 0);
  const returns = gstReport.returns.reduce((sum, row) => sum + parseNumberish(row.total_taxable_sale_value), 0);
  const saleIds = new Set(gstReport.sales.map((row) => String(row.sub_order_num || "")));
  const returnIds = new Set(gstReport.returns.map((row) => String(row.sub_order_num || "")));
  const matchedReturns = Array.from(returnIds).filter((id) => saleIds.has(id)).length;
  const docTypes = docsRows.reduce((map, row) => {
    const type = String(row.Type || "UNKNOWN").trim();
    const invoice = String(row["Invoice No."] || "").trim();
    if (!map[type]) map[type] = [];
    if (invoice) map[type].push(invoice);
    return map;
  }, {});
  const docSummary = Object.entries(docTypes).map(([type, invoices]) => ({
    type,
    count: invoices.length,
    from: sortInvoiceSeries(invoices)[0] || "",
    to: sortInvoiceSeries(invoices).at(-1) || "",
  }));
  return { states, hsn, totals, gross, returns, homeState, homeStateSource, rows: { sales: gstReport.sales.length, returns: gstReport.returns.length, matchedReturns, returnIds: returnIds.size }, docSummary };
}

function sortInvoiceSeries(values) {
  return [...values].sort((a, b) => {
    const an = Number(String(a).match(/\d+$/)?.[0] || 0);
    const bn = Number(String(b).match(/\d+$/)?.[0] || 0);
    return an - bn || String(a).localeCompare(String(b));
  });
}

function PerformanceSection({ lang }) {
  const [activeMarket, setActiveMarket] = useState("meesho");
  const [marketData, setMarketData] = useState({
    meesho: emptyPerformanceData(),
    flipkart: emptyPerformanceData(),
    amazon: emptyPerformanceData(),
  });
  const [error, setError] = useState("");
  const t = copy[lang];
  const activeData = useMemo(() => {
    if (activeMarket !== "overall") return marketData[activeMarket];
    return Object.values(marketData).reduce((merged, data) => ({
      orders: [...merged.orders, ...data.orders],
      payment: {
        orderPayments: [...merged.payment.orderPayments, ...data.payment.orderPayments],
        ads: [...merged.payment.ads, ...data.payment.ads],
      },
      status: { orders: [], payment: [] },
    }), emptyPerformanceData());
  }, [activeMarket, marketData]);
  const analytics = useMemo(() => computeAnalytics(activeData.orders, activeData.payment), [activeData]);

  const updateMarket = (market, patch) => {
    setMarketData((state) => ({
      ...state,
      [market]: { ...state[market], ...patch },
    }));
  };

  const onOrders = async (files) => {
    setError("");
    try {
      const list = Array.from(files);
      trackEvent("performance_report_upload", {
        marketplace: activeMarket,
        report_type: "orders",
        file_count: list.length,
      });
      updateMarket(activeMarket, {
        orders: await parseOrdersFiles(list),
        status: { ...marketData[activeMarket].status, orders: list.map((file) => file.name) },
      });
    } catch (err) {
      setError(err.message || "Orders file parse failed.");
    }
  };

  const onPayment = async (files) => {
    setError("");
    try {
      const list = Array.from(files);
      trackEvent("performance_report_upload", {
        marketplace: activeMarket,
        report_type: "payment",
        file_count: list.length,
      });
      updateMarket(activeMarket, {
        payment: await parsePaymentFiles(list),
        status: { ...marketData[activeMarket].status, payment: list.map((file) => file.name) },
      });
    } catch (err) {
      setError(err.message || "Payment file parse failed.");
    }
  };

  return (
    <section className="performance-page">
      <header className="topbar">
        <div>
          <h1>{t.appTitle}</h1>
          <p>{activeMarket === "overall" ? "All marketplace performance combined in one operating view." : t.subtitle}</p>
        </div>
      </header>

      <MarketplaceTabs active={activeMarket} onChange={(market) => {
        trackEvent("marketplace_tab_select", {
          module: "performance",
          marketplace: market,
        });
        setActiveMarket(market);
      }} />
      <SmartStatusStrip activeMarket={activeMarket} activeData={activeData} marketData={marketData} />

      {activeMarket !== "overall" && (
        <section className="upload-grid">
          <UploadBox icon={<FileSpreadsheet />} title={`${marketLabel(activeMarket)} ${t.orders}`} label="Upload one or more monthly Orders CSV files" status={activeData.status.orders} onFile={onOrders} accept=".csv" t={t} multiple />
          <UploadBox icon={<Upload />} title={`${marketLabel(activeMarket)} ${t.payment}`} label="Upload one or more monthly payment ZIP/XLSX files" status={activeData.status.payment} onFile={onPayment} accept=".zip,.xlsx,.xls" t={t} multiple />
        </section>
      )}

      {activeMarket !== "meesho" && activeMarket !== "overall" && (
        <div className="soft-warning market-note">
          The {marketLabel(activeMarket)} performance workspace is ready. The parser is currently optimized for Meesho-format reports; platform-specific columns will be added in the next pass.
        </div>
      )}

      {activeMarket === "overall" && (
        <section className="overall-strip">
          {["meesho", "flipkart", "amazon"].map((id) => (
            <div key={id}>
              <strong>{marketLabel(id)}</strong>
              <span>{num(marketData[id].orders.length)} orders</span>
            </div>
          ))}
        </section>
      )}

      {error && <div className="error"><AlertTriangle size={18} />{error}</div>}
      {!analytics ? <EmptyState text={t.noData} /> : <Dashboard analytics={analytics} t={t} lang={lang} />}
    </section>
  );
}

function SmartStatusStrip({ activeMarket, activeData, marketData }) {
  const loadedMarkets = Object.entries(marketData).filter(([, data]) => data.orders.length || data.payment.orderPayments.length).length;
  const cards = [
    {
      label: "Workspace",
      value: marketLabel(activeMarket),
      hint: activeMarket === "overall" ? `${loadedMarkets}/3 marketplaces loaded` : "Focused marketplace view",
      icon: Layers,
    },
    {
      label: "Orders",
      value: num(activeData.orders.length),
      hint: "Rows ready for analysis",
      icon: ClipboardList,
    },
    {
      label: "Payments",
      value: num(activeData.payment.orderPayments.length),
      hint: "Settlement rows mapped",
      icon: IndianRupee,
    },
    {
      label: "Ads",
      value: num(activeData.payment.ads.length),
      hint: "Campaign cost rows",
      icon: Target,
    },
  ];
  return (
    <section className="workspace-strip">
      {cards.map(({ label, value, hint, icon: Icon }) => (
        <div className="workspace-card" key={label}>
          <span className="workspace-icon"><Icon size={18} /></span>
          <div>
            <small>{label}</small>
            <strong>{value}</strong>
            <em>{hint}</em>
          </div>
        </div>
      ))}
    </section>
  );
}

function MarketplaceTabs({ active, onChange }) {
  return (
    <nav className="market-tabs">
      {marketplaces.map((market) => (
        <button key={market.id} className={active === market.id ? "active" : ""} onClick={() => onChange(market.id)}>
          {market.label}
        </button>
      ))}
    </nav>
  );
}

function marketLabel(id) {
  return marketplaces.find((market) => market.id === id)?.label || id;
}

function UploadBox({ icon, title, label, status, onFile, accept, t, multiple = false }) {
  const names = Array.isArray(status) ? status : status ? [status] : [];
  return (
    <label className="upload-box">
      <div className="upload-icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{label}</p>
        <span className={names.length ? "file-state ready" : "file-state"}>{names.length ? `${t.sampleReady}: ${names.length} file${names.length > 1 ? "s" : ""}` : t.waiting}</span>
        {names.length > 0 && <small className="file-list">{names.slice(0, 3).join(", ")}{names.length > 3 ? ` +${names.length - 3}` : ""}</small>}
      </div>
      <input type="file" accept={accept} multiple={multiple} onChange={(e) => e.target.files?.length && onFile(Array.from(e.target.files))} />
    </label>
  );
}

function EmptyState({ text }) {
  return <section className="empty"><BarChart3 size={36} /><p>{text}</p></section>;
}

function Dashboard({ analytics, t, lang }) {
  const { totals } = analytics;
  const paras = insightParagraphs(analytics, lang);
  const tips = actionTips(analytics, lang);
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = [
    ["overview", t.overview, BarChart3],
    ["payments", t.paymentSchedule, CalendarDays],
    ["returns", t.returnCostTitle, RotateCcw],
    ["cancellations", t.cancellations, PackageX],
    ["sku", t.skuActions, Layers],
  ];
  return (
    <>
      <BusinessHeader analytics={analytics} t={t} lang={lang} />

      <nav className="tabs">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} className={activeTab === id ? "active" : ""} onClick={() => {
            trackEvent("performance_dashboard_tab_select", { tab: id });
            setActiveTab(id);
          }}>
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" && <OverviewTab analytics={analytics} paras={paras} tips={tips} t={t} lang={lang} />}
      {activeTab === "payments" && <PaymentsTab analytics={analytics} t={t} lang={lang} />}
      {activeTab === "returns" && <ReturnsTab analytics={analytics} t={t} lang={lang} />}
      {activeTab === "cancellations" && <CancellationsTab analytics={analytics} t={t} lang={lang} />}
      {activeTab === "sku" && <SkuTab analytics={analytics} t={t} lang={lang} />}
    </>
  );
}

function OverviewTab({ analytics, paras, tips, t, lang }) {
  return (
    <>
      <section className="ads-strip">
        <Kpi label={t.businessHealth} value={businessText(analytics.businessHealth.label, lang)} tone={analytics.businessHealth.tone} icon={<ShieldAlert />} />
        <Kpi label={t.settlement} value={money(analytics.totals.settlement)} tone="green" icon={<IndianRupee />} />
        <Kpi label={t.adsSpend} value={money(analytics.totals.adsSpend)} tone="red" icon={<LineChart />} />
        <Kpi label={t.netAfterAds} value={money(analytics.totals.netAfterAds)} tone={analytics.totals.netAfterAds >= 0 ? "green" : "red"} icon={<IndianRupee />} />
        <Kpi label={t.adsSettlement} value={percent(analytics.totals.adsToSettlement)} tone="orange" icon={<AlertTriangle />} />
      </section>
      <section className="insight-band">
        <Accordion title={t.verdictTitle} defaultOpen>
          {paras.map((p) => <p key={p}>{p}</p>)}
        </Accordion>
        <Accordion title={t.tipTitle} defaultOpen>
          {tips.map((p) => <p key={p}>{p}</p>)}
        </Accordion>
      </section>
      <section className="decision-grid">
        <DecisionCard title={t.sourceEfficiency} rows={analytics.sourceEfficiency} lang={lang} />
        <ScenarioCard title={t.profitScenarios} rows={analytics.scenarios} lang={lang} />
      </section>
      <section className="chart-grid">
        <SourcePie analytics={analytics} t={t} />
        <StatusBar analytics={analytics} t={t} />
        <AdsDailyChart analytics={analytics} t={t} />
        <CampaignChart analytics={analytics} t={t} />
      </section>
      <section className="tables">
        <DataTable title={t.tables + " - " + t.statusBySource} rows={analytics.orderSource} columns={["name", "rows", "orderValue", "delivered", "cancelled", "rto", "shipped"]} lang={lang} />
        <DataTable title={t.topStates} rows={analytics.topStates} columns={["name", "rows", "orderValue", "delivered", "cancelled", "rto", "problemRate"]} lang={lang} />
      </section>
    </>
  );
}

function BusinessHeader({ analytics, t, lang }) {
  const range = analytics.dataRange;
  const summary = analytics.businessSummary;
  const lifecycleTotal = summary.lifecycle.reduce((sum, row) => sum + row.data.totalCount, 0);
  return (
    <section className="business-hero">
      <div className="business-title">
        <span>{t.dataRange}: {formatDate(range.from)} to {formatDate(range.to)}</span>
        <h2>{t.businessSummary}</h2>
      </div>
      <div className="business-layout">
        <SummaryBox title={t.totalOrders} data={summary.total} tone="blue" t={t} showValue featured />
        <div className="lifecycle-panel">
          <div className="section-head">
            <h3>{t.orderLifecycle}</h3>
            <span>{num(lifecycleTotal)} / {num(summary.total.totalCount)}</span>
          </div>
          <div className="lifecycle-grid">
            {summary.lifecycle.map((item) => (
              <LifecycleBox key={item.key} title={t[item.key]} data={item.data} tone={item.tone} t={t} valueLabel={item.key === "rto" ? t.rtoValue : t.orderValue} />
            ))}
          </div>
        </div>
        <div className="post-panel">
          <div className="section-head">
            <h3>{t.postDeliveryEvents}</h3>
          </div>
          <SummaryBox title={t.returns} data={summary.customerReturn} tone="purple" t={t} showValue valueLabel={t.customerReturnValue} chargeLabel={t.chargeToMe} compact />
        </div>
      </div>
      <div className="note-box">
        <strong>{t.pointToNote}:</strong>
        <span>{t.summaryNote}</span>
      </div>
    </section>
  );
}

function SummaryBox({ title, data, tone, t, showValue, valueLabel, chargeLabel, featured, compact }) {
  return (
    <div className={`summary-box ${tone} ${featured ? "featured" : ""} ${compact ? "compact" : ""}`}>
      <div className="summary-main">
        <span>{title}</span>
        <strong>{num(data.totalCount)}</strong>
        {showValue && <em>{valueLabel || t.orderValue}: {money(data.totalValue)}</em>}
        {chargeLabel && <em>{chargeLabel}: {money(data.totalCharge || 0)}</em>}
      </div>
      <div className="summary-split">
        <div>
          <span>{t.ads}</span>
          <strong>{num(data.adsCount)}</strong>
          <em>{money(data.adsValue)}</em>
          {chargeLabel && <em>{chargeLabel}: {money(data.adsCharge || 0)}</em>}
        </div>
        <div>
          <span>{t.organic}</span>
          <strong>{num(data.organicCount)}</strong>
          <em>{money(data.organicValue)}</em>
          {chargeLabel && <em>{chargeLabel}: {money(data.organicCharge || 0)}</em>}
        </div>
      </div>
    </div>
  );
}

function LifecycleBox({ title, data, tone, t, valueLabel }) {
  return (
    <div className={`lifecycle-box ${tone}`}>
      <div>
        <span>{title}</span>
        <strong>{num(data.totalCount)}</strong>
        <em>{valueLabel}: {money(data.totalValue)}</em>
      </div>
      <div className="mini-source">
        <span>{t.ads}: <b>{num(data.adsCount)}</b> <em>{money(data.adsValue)}</em></span>
        <span>{t.organic}: <b>{num(data.organicCount)}</b> <em>{money(data.organicValue)}</em></span>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = months[Number(month) - 1];
  if (!year || !monthName || !day) return String(value);
  return `${Number(day)} ${monthName} ${year}`;
}

function PaymentsTab({ analytics, t, lang }) {
  return (
    <>
      <section className="chart-grid">
        <ChartPanel title={t.paymentSchedule}>
          <ResponsiveContainer width="100%" height={310}>
            <BarChart data={analytics.paymentSchedule}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => money(v)} />
              <Legend />
              <Bar dataKey="orderSettlement" name={t.orderSettlement} fill="#16a34a" />
              <Bar dataKey="adsDeduction" name={t.adsDeduction} fill="#ef4444" />
              <Bar dataKey="netPayable" name={t.netPayable} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <AdsDailyChart analytics={analytics} t={t} />
      </section>
      <section className="tables">
        <DataTable title={t.paymentSchedule} rows={analytics.paymentSchedule} columns={["name", "orderSettlement", "adsDeduction", "netPayable", "status"]} lang={lang} />
        <DataTable title={t.topCampaigns} rows={analytics.topCampaigns} columns={["name", "rows", "spend"]} />
      </section>
    </>
  );
}

function ReturnsTab({ analytics, t, lang }) {
  const { totals } = analytics;
  return (
    <>
      <section className="return-cost">
        <div className="return-title">
          <RotateCcw size={20} />
          <div>
            <h2>{t.returnCostTitle}</h2>
            <p>{returnExplain(totals, lang)}</p>
          </div>
        </div>
        <div className="return-metrics">
          <MiniMetric label={t.returnRows} value={num(totals.returnRows)} tone="red" />
          <MiniMetric label={t.returnSaleReversal} value={money(totals.returnSaleReversal)} tone="red" />
          <MiniMetric label={t.returnShipping} value={money(totals.returnShipping)} tone="orange" />
          <MiniMetric label={t.returnSettlementHit} value={money(totals.returnHit)} tone="red" />
          <MiniMetric label={t.rtoRows} value={num(totals.rtoRows)} tone="orange" />
          <MiniMetric label={t.rtoSaleReversal} value={money(totals.rtoReversal)} tone="orange" />
        </div>
      </section>
      <section className="tables">
        <DataTable title={t.topRtoSkus} rows={analytics.topRtoSkus} columns={["name", "rows", "saleLost", "chargeToMe"]} lang={lang} />
        <DataTable title={t.topCustomerReturnSkus} rows={analytics.topCustomerReturnSkus} columns={["name", "rows", "saleLost", "chargeToMe"]} lang={lang} />
        <DataTable title={t.returnBySource} rows={analytics.returnBySource} columns={["name", "returnRows", "returnSaleReversal", "returnShipping", "returnSettlementHit", "rtoRows", "rtoSaleReversal"]} lang={lang} />
        <DataTable title={t.returnDetail} rows={analytics.returnDetails} columns={["date", "sku", "type", "source", "saleLost", "chargeToMe", "returnShipping"]} lang={lang} />
      </section>
    </>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="accordion-card">
      <button className="accordion-head" onClick={() => setOpen((value) => !value)}>
        <span>{title}</span>
        <strong>{open ? "-" : "+"}</strong>
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </section>
  );
}

function SourcePie({ analytics, t }) {
  return (
    <ChartPanel title={t.sourceSplit}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={analytics.orderSource.filter((d) => d.name !== "Overall")} dataKey="rows" nameKey="name" outerRadius={95} label>
            {analytics.orderSource.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

function StatusBar({ analytics, t }) {
  return (
    <ChartPanel title={t.statusBySource}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={analytics.orderSource.filter((d) => d.name !== "Overall")}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="delivered" name={t.delivered} fill="#16a34a" />
          <Bar dataKey="cancelled" name={t.cancelled} fill="#ef4444" />
          <Bar dataKey="rto" name={t.rto} fill="#f59e0b" />
          <Bar dataKey="shipped" name={t.shipped} fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

function AdsDailyChart({ analytics, t }) {
  return (
    <ChartPanel title={t.dailyAds}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={analytics.adsDaily}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" minTickGap={24} />
          <YAxis />
          <Tooltip formatter={(v) => money(v)} />
          <Area dataKey="spend" name={t.adsSpend} stroke="#ef4444" fill="#fecaca" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

function CampaignChart({ analytics, t }) {
  return (
    <ChartPanel title={t.topCampaigns}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={analytics.topCampaigns} layout="vertical" margin={{ left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={95} />
          <Tooltip formatter={(v) => money(v)} />
          <Bar dataKey="spend" fill="#7c3aed" />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

function CancellationsTab({ analytics, t, lang }) {
  return (
    <section className="tables">
      <DataTable title={t.topCancelledSkus} rows={analytics.topCancelledSkus} columns={["name", "rows", "orderValue"]} lang={lang} />
      <DataTable title={t.cancellationDetail} rows={analytics.cancellationDetails} columns={["date", "sku", "source", "orderValue", "productHint"]} lang={lang} />
    </section>
  );
}

function SkuTab({ analytics, t, lang }) {
  return (
    <section className="tables">
      <DataTable title={t.topProducts + " (" + t.sku + ")"} rows={analytics.topProducts} columns={["name", "productHint", "rows", "orderValue", "delivered", "cancelled", "rto", "problemRate", "action"]} lang={lang} />
      <DataTable title={t.returnBySku} rows={analytics.returnBySku} columns={["name", "returnRows", "returnSaleReversal", "returnShipping", "returnSettlementHit", "rtoRows", "rtoSaleReversal"]} lang={lang} />
    </section>
  );
}

function DecisionCard({ title, rows, lang }) {
  return (
    <section className="decision-card">
      <h2><TrendingUp size={18} />{title}</h2>
      <div className="mini-table">
        {rows.map((row) => (
          <div className="mini-row" key={row.name}>
            <strong>{row.name}</strong>
            <span>{lang === "hi" ? "सेटलमेंट/order" : "Settlement/order"}: {money(row.settlementPerOrder)}</span>
            <span>{lang === "hi" ? "Delivered" : "Delivered"}: {percent(row.deliveredRate)}</span>
            <span className={row.problemRate > 0.2 ? "bad" : "good"}>{lang === "hi" ? "प्रॉब्लम" : "Problem"}: {percent(row.problemRate)}</span>
            <em>{translateAction(row.action, lang)}</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScenarioCard({ title, rows, lang }) {
  return (
    <section className="decision-card">
      <h2><Target size={18} />{title}</h2>
      <div className="mini-table scenario">
        {rows.map((row) => (
          <div className="mini-row" key={row.name}>
            <strong>{row.name} {lang === "hi" ? "मार्जिन" : "margin"}</strong>
            <span>{lang === "hi" ? "ऐड से पहले GP" : "GP before ads"}: {money(row.grossProfitBeforeAds)}</span>
            <span className={row.estimatedProfitAfterAds >= 0 ? "good" : "bad"}>{lang === "hi" ? "ऐड के बाद" : "After ads"}: {money(row.estimatedProfitAfterAds)}</span>
            <em>{translateAction(row.action, lang)}</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function Kpi({ label, value, tone, icon }) {
  return <div className={`kpi ${tone}`}><div>{icon}</div><span>{label}</span><strong>{value}</strong></div>;
}

function MiniMetric({ label, value, tone }) {
  return <div className={`mini-metric ${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

function ChartPanel({ title, children }) {
  return <section className="chart-panel"><h2>{title}</h2>{children}</section>;
}

function DataTable({ title, rows, columns, lang = "en" }) {
  return (
    <section className="table-panel">
      <h2>{title}</h2>
      <div className="table-wrap">
        <table>
          <thead><tr>{columns.map((c) => <th key={c}>{label(c)}</th>)}</tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                {columns.map((c) => <td key={c}>{formatCell(c, row[c], lang)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function label(value) {
  const custom = {
    name: "Name",
    rows: "Orders",
    orderValue: "Order Value",
    productHint: "Product Hint",
    problemRate: "Problem Rate",
    deliveredRate: "Delivered Rate",
    returnRows: "Return Rows",
    rtoRows: "RTO Rows",
    returnSaleReversal: "Return Sale Reversal",
    rtoSaleReversal: "RTO Sale Reversal",
    returnShipping: "Return Shipping",
    returnSettlementHit: "Settlement Hit",
    orderSettlement: "Order Settlement",
    adsDeduction: "Ads Deduction",
    netPayable: "Net Payable",
    status: "Status",
    date: "Date",
    sku: "SKU",
    source: "Source",
    sequence: "Seq",
    seller: "Seller",
    courier: "Courier",
    orderId: "Order ID",
    qty: "Qty",
    page: "Page",
    type: "Type",
    saleLost: "Sale Lost",
    chargeToMe: "Charge to Me",
    action: "Action",
  };
  return custom[value] || value.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function formatCell(key, value, lang = "en") {
  if (["orderValue", "settlement", "spend", "returnSaleReversal", "rtoSaleReversal", "returnShipping", "returnSettlementHit", "orderSettlement", "adsDeduction", "netPayable", "saleLost", "chargeToMe"].includes(key)) return money(value);
  if (["problemRate", "deliveredRate"].includes(key)) return percent(value);
  if (key === "action") return translateAction(value, lang);
  if (key === "status") return translatePaymentStatus(value, lang);
  if (key === "type") return translateReturnType(value, lang);
  if (typeof value === "number") return num(value);
  return value;
}

function returnExplain(t, lang) {
  if (lang === "hi") {
    return `रिटर्न में ${money(t.returnSaleReversal)} की sale reverse हुई और ${money(t.returnShipping)} return shipping charge लगा. RTO में ${money(t.rtoReversal)} की sale reverse हुई.`;
  }
  return `Customer returns reversed ${money(t.returnSaleReversal)} of sale value and charged ${money(t.returnShipping)} return shipping. RTO reversed ${money(t.rtoReversal)} of sale value.`;
}

function businessText(value, lang) {
  if (lang !== "hi") return value;
  if (value === "High Risk") return "हाई रिस्क";
  if (value === "Watch Closely") return "ध्यान दें";
  return "हेल्दी टेस्ट";
}

function translateAction(value, lang) {
  if (lang !== "hi") return value;
  if (value === "Pause / Fix") return "रोकें / सुधारें";
  if (value === "Scale") return "Scale";
  if (value === "Reduce risk") return "रिस्क कम करें";
  if (value === "Can test scale") return "टेस्ट स्केल";
  if (value === "Loss risk") return "लॉस रिस्क";
  return value;
}

function translatePaymentStatus(value, lang) {
  if (lang !== "hi") return value;
  if (value === "Receivable") return "मिलना है";
  if (value === "Adjustable") return "एडजस्ट होगा";
  return value;
}

function translateReturnType(value, lang) {
  if (lang !== "hi") return value;
  if (value === "Customer Return") return "कस्टमर रिटर्न";
  return value;
}

function insightParagraphs(a, lang) {
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

function actionTips(a, lang) {
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

const A4 = { width: 595, height: 842 };
const UNKNOWN = "Unknown";
const courierMatchers = [
  ["Delhivery", /\bDELHIVERY\b|\bDELHIVER\b/i],
  ["Valmo", /\bVALMO\b/i],
  ["Shadowfax", /\bSHADOW\s*FAX\b|\bSHADOWFAX\b/i],
  ["Xpressbees", /\bXPRESS\s*BEES\b|\bXPRESSBEES\b/i],
  ["Ecom Express", /\bECOM\s*EXPRESS\b/i],
  ["Ekart", /\bEKART\b|\bE[-\s]?KART\b/i],
  ["Blue Dart", /\bBLUE\s*DART\b|\bBLUEDART\b/i],
  ["Amazon Shipping", /\bAMAZON\s*SHIPPING\b/i],
];

async function extractLabelPages(files) {
  const pages = [];
  for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
    const file = files[fileIndex];
    const buffer = await file.arrayBuffer();
    const source = await PDFDocument.load(buffer.slice(0), { ignoreEncryption: true });
    const textDoc = await pdfjsLib.getDocument({
      data: new Uint8Array(buffer.slice(0)),
      disableWorker: true,
      useSystemFonts: true,
      isEvalSupported: false,
    }).promise;
    for (let pageIndex = 0; pageIndex < source.getPageCount(); pageIndex += 1) {
      const pdfPage = await textDoc.getPage(pageIndex + 1);
      const content = await pdfPage.getTextContent();
      const text = content.items.map((item) => item.str || "").join(" ");
      pages.push({
        id: `${fileIndex}-${pageIndex}`,
        fileName: file.name,
        source,
        page: source.getPage(pageIndex),
        pageIndex,
        originalIndex: pages.length,
        text,
        seller: detectSellerAccount(text, file.name),
        courier: detectCourierPartner(text),
        sku: detectSku(text),
        orderId: detectOrderId(text),
        qty: detectQty(text),
      });
    }
    if (typeof textDoc.destroy === "function") {
      await textDoc.destroy();
    } else if (typeof textDoc.cleanup === "function") {
      await textDoc.cleanup();
    }
  }
  return pages;
}

function detectCourierPartner(text) {
  const match = courierMatchers.find(([, pattern]) => pattern.test(text));
  return match?.[0] || UNKNOWN;
}

function detectSellerAccount(text, fileName) {
  const compact = text.replace(/\s+/g, " ").trim();
  const patterns = [
    /Sold\s*by\s*:\s*(.+?)(?:GSTIN|Purchase\s*Order|Invoice\s*No|Order\s*Date|Description|$)/i,
    /If\s*undelivered,\s*return\s*to\s*:\s*(.+?)(?:COD:|Prepaid|Check\s*the\s*payable|Exchange|Delhivery|Valmo|Shadowfax|Xpressbees|Product\s*Details|$)/i,
    /(?:Seller|Supplier|Pickup\s*Address)\s*[:\-]?\s*([A-Z0-9 &.,'-]{4,70})/i,
    /(SHREE[.\s]+[A-Z0-9 &.,'-]{4,55})/i,
  ];
  for (const pattern of patterns) {
    const match = compact.match(pattern);
    if (match?.[1]) return cleanDetectedValue(match[1]);
  }
  return UNKNOWN;
}

function detectSku(text) {
  const product = parseProductDetails(text);
  if (product.sku) return product.sku;
  const compact = text.replace(/\s+/g, " ").trim();
  const direct = compact.match(/\b(?:SKU|SKU\s*ID|SKU\s*CODE|Product\s*SKU)\s*[:#\-]?\s*([A-Z0-9][A-Z0-9._/-]{2,45})\b/i);
  if (direct?.[1] && !/^SIZE$/i.test(direct[1])) return cleanDetectedValue(direct[1]).toUpperCase();
  const candidates = compact.toUpperCase().match(/\b[A-Z0-9]{2,}(?:[-_/][A-Z0-9]{2,}){1,5}\b/g) || [];
  const filtered = candidates.filter((candidate) => !/^(ORDER|SUB|AWB|GST|HSN|TAX|VL|SF|FM|FWJ|COD|PREPAID)/.test(candidate));
  return filtered[0] || UNKNOWN;
}

function detectOrderId(text) {
  const product = parseProductDetails(text);
  if (product.orderId) return product.orderId;
  const compact = text.replace(/\s+/g, " ");
  const match = compact.match(/\b(?:Order\s*(?:No|ID|Number)?|Sub\s*Order\s*(?:No|ID)?)\s*[:#\-]?\s*([A-Z0-9-]{6,40})\b/i);
  return match?.[1] || "";
}

function detectQty(text) {
  const product = parseProductDetails(text);
  return product.qty || 1;
}

function parseProductDetails(text) {
  const compact = text.replace(/\s+/g, " ").trim();
  const match = compact.match(/Product\s*Details\s+SKU\s+Size\s+Qty\s+Color\s+Order\s*No\.?\s+([A-Z0-9][A-Z0-9._/-]{2,60})\s+(.+?)\s+(\d+)\s+([A-Z0-9 -]+?)\s+([0-9]{8,}(?:[_-]\d+)?)\b/i);
  if (!match) return {};
  return {
    sku: cleanDetectedValue(match[1]).toUpperCase(),
    size: cleanDetectedValue(match[2]),
    qty: Number(match[3]) || 1,
    color: cleanDetectedValue(match[4]),
    orderId: match[5],
  };
}

function cleanDetectedValue(value) {
  const text = String(value || "")
    .replace(/\s{2,}/g, " ")
    .replace(/\b(?:GSTIN|Invoice|Tax|Order|Product|Details|Pickup|Destination|Return Code)\b.*$/i, "")
    .replace(/\s*,?\s*00\s+Dungarwas.*$/i, "")
    .replace(/\s+1st\s+Floor.*$/i, "")
    .trim();
  if (/SHREE[.\s]*ANJANEYA/i.test(text)) return "SHREE.ANJANEYA";
  return text.slice(0, 64) || UNKNOWN;
}

function sortKey(value) {
  return value && value !== UNKNOWN ? value : "ZZZ_UNKNOWN";
}

function sortForPacking(items) {
  return [...items].sort((a, b) => {
    for (const key of ["courier", "sku", "qty", "seller"]) {
      const compared = sortKey(a[key]).localeCompare(sortKey(b[key]), "en", { numeric: true });
      if (compared) return compared;
    }
    return a.originalIndex - b.originalIndex;
  });
}

async function buildOriginalSortedPdf(items) {
  const output = await PDFDocument.create();
  for (const item of items) {
    const { width, height } = item.page.getSize();
    const embedded = await output.embedPage(item.page);
    const page = output.addPage([width, height]);
    page.drawPage(embedded, { x: 0, y: 0, width, height });
  }
  return output.save();
}

async function buildMeeshoLayoutFromPages(pages, labelsPerPage = 4) {
  const output = await PDFDocument.create();
  const layout = labelsPerPage === 6
    ? { columns: 2, rows: 3, margin: 10, gapX: 8, gapY: 8, rotate: true, cropBottomWhitespace: true }
    : { columns: 2, rows: 2, margin: 18, gapX: 12, gapY: 12 };
  const slotWidth = (A4.width - layout.margin * 2 - layout.gapX * (layout.columns - 1)) / layout.columns;
  const slotHeight = (A4.height - layout.margin * 2 - layout.gapY * (layout.rows - 1)) / layout.rows;
  const slots = Array.from({ length: labelsPerPage }, (_, index) => {
    const column = index % layout.columns;
    const rowFromTop = Math.floor(index / layout.columns);
    const rowFromBottom = layout.rows - rowFromTop - 1;
    return {
      x: layout.margin + column * (slotWidth + layout.gapX),
      y: layout.margin + rowFromBottom * (slotHeight + layout.gapY),
    };
  });

  for (let i = 0; i < pages.length; i += labelsPerPage) {
    const page = output.addPage([A4.width, A4.height]);
    for (let offset = 0; offset < labelsPerPage; offset += 1) {
      const sourcePage = pages[i + offset];
      if (!sourcePage) continue;
      const { width, height } = sourcePage.getSize();
      const cropBox = layout.cropBottomWhitespace
        ? meeshoFilledCropBox(width, height)
        : null;
      const embedded = cropBox ? await output.embedPage(sourcePage, cropBox) : await output.embedPage(sourcePage);
      const croppedWidth = cropBox ? cropBox.right - cropBox.left : width;
      const croppedHeight = cropBox ? cropBox.top - cropBox.bottom : height;
      const sourceWidth = layout.rotate ? croppedHeight : croppedWidth;
      const sourceHeight = layout.rotate ? croppedWidth : croppedHeight;
      const scale = Math.min(slotWidth / sourceWidth, slotHeight / sourceHeight);
      const drawWidth = croppedWidth * scale;
      const drawHeight = croppedHeight * scale;
      const slot = slots[offset];
      if (layout.rotate) {
        const rotatedWidth = drawHeight;
        const rotatedHeight = drawWidth;
        page.drawPage(embedded, {
          x: slot.x + (slotWidth - rotatedWidth) / 2 + rotatedWidth,
          y: slot.y + (slotHeight - rotatedHeight) / 2,
          width: drawWidth,
          height: drawHeight,
          rotate: degrees(90),
        });
      } else {
        page.drawPage(embedded, {
          x: slot.x + (slotWidth - drawWidth) / 2,
          y: slot.y + (slotHeight - drawHeight) / 2,
          width: drawWidth,
          height: drawHeight,
        });
      }
    }
  }
  return output.save();
}

function meeshoFilledCropBox(width, height) {
  return {
    left: width * 0.012,
    bottom: height * 0.24,
    right: width * 0.988,
    top: height * 0.992,
  };
}

async function buildPicklistPdf(items, mode = "none") {
  const output = await PDFDocument.create();
  const regular = await output.embedFont(StandardFonts.Helvetica);
  const bold = await output.embedFont(StandardFonts.HelveticaBold);
  const margin = 32;
  const line = 14;
  let page = output.addPage([A4.width, A4.height]);
  let y = A4.height - margin;

  const draw = (text, x, size = 9, font = regular, color = rgb(0.12, 0.2, 0.31)) => {
    page.drawText(String(text ?? ""), { x, y, size, font, color });
  };
  const next = (amount = line) => {
    y -= amount;
    if (y < margin + 30) {
      page = output.addPage([A4.width, A4.height]);
      y = A4.height - margin;
    }
  };
  const section = (title) => {
    next(18);
    draw(title, margin, 12, bold);
    next(16);
  };
  const drawTwoCol = (rows) => {
    rows.forEach((row) => {
      draw(truncate(row.name, 52), margin, 8, regular);
      draw(String(row.count), A4.width - margin - 35, 8, bold);
      next(12);
    });
  };

  draw("SRH Codes Packing Picklist", margin, 16, bold);
  next(18);
  draw(`Generated: ${new Date().toLocaleString("en-IN")} | Sort: ${mode}`, margin, 8);
  next(12);
  draw(`Total labels: ${items.length} | Total pieces: ${items.reduce((sum, item) => sum + (Number(item.qty) || 1), 0)}`, margin, 8);

  section("Courier pickup counts");
  drawTwoCol(countBy(items, "courier"));

  section("Seller account counts");
  drawTwoCol(countBy(items, "seller"));

  section("SKU and quantity grouping");
  drawTwoCol(countBySkuQty(items));

  section("Sorted label sequence");
  const headers = ["#", "Courier", "SKU", "Qty", "Order ID", "Seller"];
  const xs = [margin, 60, 145, 270, 300, 410];
  headers.forEach((header, index) => draw(header, xs[index], 8, bold));
  next(12);
  items.forEach((item, index) => {
    draw(index + 1, xs[0], 7);
    draw(truncate(item.courier, 15), xs[1], 7);
    draw(truncate(item.sku, 24), xs[2], 7);
    draw(item.qty || 1, xs[3], 7, bold);
    draw(truncate(item.orderId || "-", 20), xs[4], 7);
    draw(truncate(item.seller, 26), xs[5], 7);
    next(10);
  });

  return output.save();
}

function safeFilename(value) {
  return String(value || UNKNOWN)
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .toLowerCase() || "unknown";
}

function groupItemsByCourier(items) {
  const groups = new Map();
  for (const item of items) {
    const courier = item.courier || UNKNOWN;
    if (!groups.has(courier)) groups.set(courier, []);
    groups.get(courier).push(item);
  }
  return Array.from(groups, ([courier, rows]) => ({ courier, rows }))
    .sort((a, b) => sortKey(a.courier).localeCompare(sortKey(b.courier), "en", { numeric: true }));
}

function splitByQuantity(items) {
  return {
    single: items.filter((item) => (Number(item.qty) || 1) === 1),
    multi: items.filter((item) => (Number(item.qty) || 1) > 1),
    all: items,
  };
}

function saveBlobBytes(bytes, filename, type) {
  const blob = new Blob([bytes], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function saveBytes(bytes, filename) {
  saveBlobBytes(bytes, filename, "application/pdf");
}

function printPdfBytes(bytes) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    URL.revokeObjectURL(url);
    throw new Error("Popup blocked. Allow popups or download the PDF instead.");
  }
  setTimeout(() => {
    try {
      win.print();
    } catch {
      // The PDF is still open for manual printing if browser blocks scripted print.
    }
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }, 700);
}

function getInitialSection() {
  if (typeof window === "undefined") return "performance";
  const path = window.location.pathname;
  if (path.includes("label")) return "processing";
  return "performance";
}

export default function SellerToolClient() {
  const [section, setSection] = useState(getInitialSection);
  const [theme, setTheme] = useState("light");
  const { lang, setLang } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const s = shellCopy[lang];
  const nav = [
    { id: "performance", label: s.performance, icon: BarChart3, hint: s.performanceHint },
    { id: "gst", label: s.gst, icon: ReceiptText, hint: s.gstHint },
    { id: "processing", label: s.processing, icon: LayoutGrid, hint: s.processingHint },
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
          <button className="theme-toggle" onClick={() => setTheme((value) => {
            const nextTheme = value === "light" ? "dark" : "light";
            trackEvent("theme_select", { theme: nextTheme });
            return nextTheme;
          })}>
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
      </main>
    </div>
  );
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <img src="/brand/srh-logo.svg" alt="" width="44" height="44" />
    </span>
  );
}

function TrustNotice() {
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

function CommandBar({ activeNav, lang, setLang }) {
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
          <a href="/about">{s.about}</a>
          <a href="/contact">{s.contact}</a>
          <a href="/privacy">{s.privacy}</a>
          <a href="/terms">{s.terms}</a>
        </nav>
      </div>
    </header>
  );
}

function LabelProcessingTool() {
  const { lang } = useLanguage();
  const t = processingCopy[lang] || processingCopy.en;
  const [platform, setPlatform] = useState("meesho");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [outputs, setOutputs] = useState(null);
  const [toast, setToast] = useState("");

  const sortedItems = useMemo(() => sortForPacking(items), [items]);
  const courierGroups = useMemo(() => groupItemsByCourier(sortedItems), [sortedItems]);
  const counts = useMemo(() => ({
    courier: countBy(sortedItems, "courier"),
    seller: countBy(sortedItems, "seller"),
    skuQty: countBySkuQty(sortedItems),
    sku: countBy(sortedItems, "sku").slice(0, 8),
  }), [sortedItems]);

  const onFiles = (selectedFiles) => {
    const pdfFiles = Array.from(selectedFiles || []).filter((file) => /\.pdf$/i.test(file.name) || file.type === "application/pdf");
    setFiles(pdfFiles);
    setItems([]);
    setOutputs(null);
    setToast("");
    setError("");
    trackEvent("label_processing_upload", { file_count: pdfFiles.length });
  };

  const analyze = async () => {
    if (!files.length) {
      setError("Upload at least one label PDF.");
      return;
    }
    setBusy(true);
    setError("");
    setToast("");
    try {
      trackEvent("label_processing_start", { file_count: files.length, sort_mode: "auto_packing" });
      const extracted = await extractLabelPages(files);
      setItems(extracted);
      setOutputs({ ready: true });
      setToast("Courier-wise labels and picklists are ready.");
      trackEvent("label_processing_complete", { label_count: extracted.length, sort_mode: "auto_packing" });
    } catch (err) {
      setError(err.message || "Label processing failed.");
      trackEvent("label_processing_error", { sort_mode: "auto_packing" });
    } finally {
      setBusy(false);
    }
  };

  const runOutputAction = async (rows, action, scopeName, subsetName) => {
    if (!rows.length) return;
    setBusy(true);
    setError("");
    try {
      const sorted = sortForPacking(rows);
      const scope = safeFilename(scopeName);
      const subset = safeFilename(subsetName);
      if (action === "picklist") {
        const bytes = await buildPicklistPdf(sorted, `${scopeName} - ${subsetName}`);
        const filename = `${scope}-${subset}-picklist.pdf`;
        saveBytes(bytes, filename);
        setToast(`${filename} downloaded.`);
      } else {
        const bytes = await buildOriginalSortedPdf(sorted);
        const filename = `${scope}-${subset}-labels.pdf`;
        if (action === "print") {
          printPdfBytes(bytes);
          setToast(`${scopeName} ${subsetName} labels opened for printing.`);
        } else {
          saveBytes(bytes, filename);
          setToast(`${filename} downloaded.`);
        }
      }
      trackEvent("label_processing_output", {
        action,
        scope: scopeName,
        subset: subsetName,
        label_count: rows.length,
      });
    } catch (err) {
      setError(err.message || "Output generation failed.");
    } finally {
      setBusy(false);
    }
  };

  const downloadA4Layout = async (labelsPerPage) => {
    if (!sortedItems.length) {
      setError("Process labels before generating A4 output.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const pages = sortedItems.map((item) => item.page);
      const bytes = await buildMeeshoLayoutFromPages(pages, labelsPerPage);
      const filename = `all-couriers-${labelsPerPage}-up-labels.pdf`;
      saveBytes(bytes, filename);
      setToast(`${filename} downloaded.`);
      trackEvent("label_processing_a4_download", { labels_per_page: labelsPerPage });
    } catch (err) {
      setError(err.message || "A4 PDF generation failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="labels-page processing-page">
      <div className="module-header">
        <div>
          <span>{t.kicker}</span>
          <h1>{t.title} <HelpTip text={t.titleHelp} /></h1>
          <p>{t.intro}</p>
        </div>
        <div className="platform-switch">
          {["meesho", "flipkart", "amazon"].map((id) => (
            <button key={id} className={platform === id ? "active" : ""} onClick={() => {
              trackEvent("marketplace_tab_select", {
                module: "label_processing",
                marketplace: id,
              });
              setPlatform(id);
              setError("");
              setToast("");
            }}>{marketLabel(id)}</button>
          ))}
        </div>
      </div>

      {platform !== "meesho" ? (
        <section className="portal-card">
          <h2>{marketLabel(platform)} Label Processing</h2>
          <div className="placeholder compact">
            <ClipboardList size={28} />
            <p>{t.marketplacePending(marketLabel(platform))}</p>
          </div>
        </section>
      ) : (
      <section className="processing-layout">
        <div className="label-workbench">
          <label className="label-dropzone compact">
            <input type="file" accept="application/pdf,.pdf" multiple onChange={(e) => onFiles(e.target.files)} />
            <span className="label-drop-icon"><Upload size={26} /></span>
            <strong>{files.length ? `${files.length} PDF file${files.length > 1 ? "s" : ""} selected` : t.uploadTitle}</strong>
            <em>{files.length ? files.map((file) => file.name).join(", ") : t.uploadHint} <HelpTip text={t.uploadHelp} /></em>
          </label>

          {error && <div className="error"><AlertTriangle size={18} />{error}</div>}
          <button className="primary-action label-process" onClick={analyze} disabled={busy}>
            {busy ? t.analyzing : t.analyze}
          </button>

          {outputs && sortedItems.length ? (
            <div className="download-panel inline">
              <h2>{t.formattedDownloads}</h2>
              <div className="download-grid">
                <button onClick={() => downloadA4Layout(4)} disabled={busy}>
                  <LayoutGrid size={18} />
                  <span><strong>{t.a4Four}</strong><small>{t.a4FourHint}</small></span>
                </button>
                <button onClick={() => downloadA4Layout(6)} disabled={busy}>
                  <LayoutGrid size={18} />
                  <span><strong>{t.a4Six}</strong><small>{t.a4SixHint}</small></span>
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="processing-summary">
          <h2>{t.summary}</h2>
          {sortedItems.length ? (
            <>
              <div className="processing-kpis">
                <MiniMetric label="PDF files" value={files.length} tone="blue" />
                <MiniMetric label="Labels" value={sortedItems.length} tone="green" />
                <MiniMetric label="Couriers" value={counts.courier.length} tone="orange" />
                <MiniMetric label="SKUs" value={counts.sku.length} tone="purple" />
              </div>
              <CountList title={t.courierCounts} rows={counts.courier} />
              <CountList title={t.sellerCounts} rows={counts.seller} />
              <CountList title={t.qtyCounts} rows={counts.skuQty} />
              <CountList title={t.skuCounts} rows={counts.sku} />
            </>
          ) : (
            <div className="placeholder compact"><ClipboardList size={28} /><p>{t.noData}</p></div>
          )}
          <div className="workflow-note">{t.extractionNote}</div>
        </div>
      </section>
      )}

      {platform === "meesho" && sortedItems.length ? (
        <section className="portal-card courier-actions-panel">
          <h2>{t.courierGroups}</h2>
          <CourierActionCard
            title={t.allCouriers}
            rows={sortedItems}
            t={t}
            busy={busy}
            featured
            onAction={runOutputAction}
          />
          <div className="courier-card-grid">
            {courierGroups.map((group) => (
              <CourierActionCard
                key={group.courier}
                title={group.courier}
                rows={group.rows}
                t={t}
                busy={busy}
                onAction={runOutputAction}
              />
            ))}
          </div>
        </section>
      ) : null}

      {platform === "meesho" && sortedItems.length ? (
        <section className="portal-card">
          <h2>{t.tableTitle}</h2>
          <CompactTable
            rows={sortedItems.slice(0, 80).map((item, index) => ({
              sequence: index + 1,
              seller: item.seller,
              courier: item.courier,
              sku: item.sku,
              qty: item.qty || 1,
              orderId: item.orderId || "-",
              source: item.fileName,
              page: item.pageIndex + 1,
            }))}
            columns={["sequence", "seller", "courier", "sku", "qty", "orderId", "source", "page"]}
          />
        </section>
      ) : null}
      {toast && <div className="snackbar">{toast}</div>}
    </section>
  );
}

function CourierActionCard({ title, rows, t, busy, onAction, featured = false }) {
  const groups = splitByQuantity(rows);
  const options = [
    { key: "single", label: t.singleQty, rows: groups.single },
    { key: "multi", label: t.multiQty, rows: groups.multi },
    { key: "all", label: t.allLabels, rows: groups.all },
  ];
  const pieces = rows.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);

  return (
    <article className={featured ? "courier-action-card featured" : "courier-action-card"}>
      <div className="courier-card-head">
        <div>
          <h3>{title}</h3>
          <p>{rows.length} labels · {pieces} pieces</p>
        </div>
        <span>{groups.multi.length} multi qty</span>
      </div>
      <div className="qty-action-grid">
        {options.map((option) => (
          <div className="qty-action-group" key={option.key}>
            <strong>{option.label}</strong>
            <small>{option.rows.length ? `${option.rows.length} labels` : t.noSubset}</small>
            <div className="mini-action-row">
              <button disabled={busy || !option.rows.length} onClick={() => onAction(option.rows, "download", title, option.label)}>
                <Download size={15} /> {t.downloadLabels}
              </button>
              <button disabled={busy || !option.rows.length} onClick={() => onAction(option.rows, "print", title, option.label)}>
                <Printer size={15} /> {t.printLabels}
              </button>
              <button disabled={busy || !option.rows.length} onClick={() => onAction(option.rows, "picklist", title, option.label)}>
                <ClipboardList size={15} /> {t.downloadPicklist}
              </button>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function countBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const value = item[key] || UNKNOWN;
    map.set(value, (map.get(value) || 0) + 1);
  }
  return Array.from(map, ([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || sortKey(a.name).localeCompare(sortKey(b.name)));
}

function countBySkuQty(items) {
  const map = new Map();
  for (const item of items) {
    const sku = item.sku || UNKNOWN;
    const qty = Number(item.qty) || 1;
    const key = `${sku} | Qty ${qty}`;
    const current = map.get(key) || { name: key, count: 0, pieces: 0 };
    current.count += 1;
    current.pieces += qty;
    map.set(key, current);
  }
  return Array.from(map.values())
    .map((row) => ({
      ...row,
      name: `${row.name} - ${row.count} orders / ${row.pieces} pcs`,
    }))
    .sort((a, b) => b.pieces - a.pieces || sortKey(a.name).localeCompare(sortKey(b.name)));
}

function truncate(value, max = 40) {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, Math.max(0, max - 3))}...` : text;
}

function CountList({ title, rows }) {
  return (
    <div className="count-list">
      <h3>{title}</h3>
      {rows.length ? rows.map((row) => (
        <div key={row.name} className="count-row">
          <span>{row.name}</span>
          <strong>{row.count}</strong>
        </div>
      )) : <p>No rows yet.</p>}
    </div>
  );
}

function GstAnalysis({ lang }) {
  const t = gstCopy[lang] || gstCopy.en;
  const [platform, setPlatform] = useState("meesho");
  const [files, setFiles] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [homeState, setHomeState] = useState("");

  const onFile = async (key, file) => {
    setFiles((state) => ({ ...state, [key]: file }));
    setError("");
    setResult(null);
    trackEvent("gst_document_upload", {
      marketplace: platform,
      document_type: key,
      file_extension: file.name.split(".").pop()?.toLowerCase() || "unknown",
    });
  };

  const analyze = async () => {
    setBusy(true);
    setError("");
    try {
      trackEvent("gst_analysis_start", {
        marketplace: platform,
        document_count: Object.keys(files).length,
      });
      if (!files.gstReport) throw new Error("Meesho GST Report ZIP is required.");
      const gstReport = await parseMeeshoGstReport(files.gstReport);
      const docsRows = files.taxInvoice ? await parseMeeshoTaxInvoice(files.taxInvoice) : [];
      setResult(summarizeMeeshoGst(gstReport, docsRows, homeState));
      trackEvent("gst_analysis_complete", {
        marketplace: platform,
        has_tax_invoice: Boolean(files.taxInvoice),
        home_state: homeState || "auto",
      });
    } catch (err) {
      setError(err.message || "GST analysis failed.");
      trackEvent("gst_analysis_error", { marketplace: platform });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="gst-page">
      <div className="module-header">
        <div>
          <span>{t.kicker}</span>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
        <div className="platform-switch">
          {["overall", "meesho", "flipkart", "amazon"].map((id) => (
            <button key={id} className={platform === id ? "active" : ""} onClick={() => {
              setPlatform(id);
              setResult(null);
              setError("");
              trackEvent("marketplace_tab_select", {
                module: "gst",
                marketplace: id,
              });
            }}>{marketLabel(id)}</button>
          ))}
        </div>
      </div>

      {platform === "meesho" ? (
        <>
          <section className="gst-layout">
            <div className="gst-upload-panel">
              <h2>{t.docsTitle} <HelpTip text={t.docsHelp} /></h2>
              <label className="state-field">
                <span className="field-title"><span>{t.homeStateLabel}</span> <HelpTip text={t.homeStateHelp} /></span>
                <select value={homeState} onChange={(event) => setHomeState(event.target.value)}>
                  <option value="">{t.homeStateAuto}</option>
                  {GST_STATE_OPTIONS.map((state) => <option key={state} value={state}>{state}</option>)}
                </select>
              </label>
              <DocUpload title={t.gstReport} hint={t.gstReportHint} help={t.gstReportHelp} requiredLabel={t.required} file={files.gstReport} onFile={(file) => onFile("gstReport", file)} required />
              <DocUpload title={t.taxInvoice} hint={t.taxInvoiceHint} help={t.taxInvoiceHelp} requiredLabel={t.required} file={files.taxInvoice} onFile={(file) => onFile("taxInvoice", file)} required />
              <DocUpload title={t.supplierInvoice} hint={t.supplierInvoiceHint} help={t.supplierInvoiceHelp} requiredLabel={t.required} file={files.supplierInvoice} onFile={(file) => onFile("supplierInvoice", file)} />
              <DocUpload title={t.commission} hint={t.commissionHint} help={t.commissionHelp} requiredLabel={t.required} file={files.commissionBackup} onFile={(file) => onFile("commissionBackup", file)} />
              {error && <div className="error"><AlertTriangle size={18} />{error}</div>}
              <button className="primary-action" onClick={analyze} disabled={busy}>{busy ? t.analyzing : t.generate}</button>
            </div>
            <div className="gst-guidance">
              <h2>{t.moduleTitle} <HelpTip text={t.moduleHelp} /></h2>
              {t.checks.map((text) => <CheckLine key={text} text={text} />)}
            </div>
          </section>
          {result && <GstResult result={result} />}
        </>
      ) : (
        <section className="portal-card gst-coming-soon">
          <h2>{t.comingTitle(platform)}</h2>
          <p>{t.comingBody(platform)}</p>
        </section>
      )}
    </section>
  );
}

function DocUpload({ title, hint, help, file, onFile, required, requiredLabel = "required" }) {
  return (
    <label className="doc-upload">
      <input type="file" accept=".zip,.xlsx,.xls,.pdf" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      <div className="doc-icon"><FileSpreadsheet size={20} /></div>
      <div>
        <strong className="field-title"><span>{title}</span> {help && <HelpTip text={help} />} {required && <em>{requiredLabel}</em>}</strong>
        <span>{file ? file.name : hint}</span>
      </div>
    </label>
  );
}

function CheckLine({ text }) {
  return <div className="check-line"><CheckCircle2 size={17} /> <span>{text}</span></div>;
}

function HelpTip({ text }) {
  return (
    <span className="help-tip-wrap" tabIndex={0} aria-label={text}>
      <span className="help-tip-icon">?</span>
      <span className="help-bubble" role="tooltip">{text}</span>
    </span>
  );
}

function GstResult({ result }) {
  const table7Rows = result.states.map((row) => ({
    state: row.state,
    rate: 18,
    taxable: row.net,
    igst: row.state === result.homeState ? 0 : row.tax,
    cgst: row.state === result.homeState ? row.tax / 2 : 0,
    sgst: row.state === result.homeState ? row.tax / 2 : 0,
    cess: 0,
  }));
  const table14 = {
    gstin: "08AARCM9332R1CO",
    name: "MEESHO TECHNOLOGIES PRIVATE LIMITED",
    net: result.totals.taxable,
    igst: result.totals.igst,
    cgst: result.totals.cgst,
    sgst: result.totals.sgst,
  };
  return (
    <section className="gst-results">
      <div className="gst-kpis">
        <Kpi label="Gross taxable sales" value={`Rs ${asMoney(result.gross)}`} tone="blue" icon={<IndianRupee />} />
        <Kpi label="Returns taxable" value={`Rs ${asMoney(result.returns)}`} tone="orange" icon={<RotateCcw />} />
        <Kpi label="Net taxable" value={`Rs ${asMoney(result.totals.taxable)}`} tone="green" icon={<Calculator />} />
        <Kpi label="Net GST" value={`Rs ${asMoney(result.totals.tax)}`} tone="purple" icon={<ReceiptText />} />
        <Kpi label="Return match" value={`${result.rows.matchedReturns}/${result.rows.returnIds}`} tone={result.rows.matchedReturns === result.rows.returnIds ? "green" : "red"} icon={<CheckCircle2 />} />
      </div>

      <section className="portal-card">
        <h2>Table 7 - B2C Others</h2>
        <p>Add these rows state-wise in the portal. Local supplies for seller home state ({result.homeState}) are reported as CGST/SGST; other states are reported as IGST. Home state source: {result.homeStateSource}.</p>
        <CompactTable rows={table7Rows} columns={["state", "rate", "taxable", "igst", "cgst", "sgst", "cess"]} />
      </section>

      <section className="portal-card">
        <h2>Table 12 - HSN Summary, B2C Supplies tab</h2>
        <CompactTable rows={result.hsn.map((row) => ({ ...row, rate: 18, uqc: "NOS" }))} columns={["hsn", "uqc", "qty", "totalValue", "taxable", "rate", "igst", "cgst", "sgst", "cess"]} />
      </section>

      <section className="portal-grid">
        <div className="portal-card">
          <h2>Table 13 - Documents Issued</h2>
          <CompactTable rows={result.docSummary} columns={["type", "from", "to", "count"]} />
          {!result.docSummary.length && <p className="soft-warning">Upload the Tax Invoice ZIP to populate the document series here.</p>}
        </div>
        <div className="portal-card">
          <h2>Table 14 - Supplies through ECO, u/s 52</h2>
          <CompactTable rows={[table14]} columns={["gstin", "name", "net", "igst", "cgst", "sgst"]} />
        </div>
      </section>
    </section>
  );
}

function CompactTable({ rows, columns }) {
  return (
    <div className="table-wrap compact-table">
      <table>
        <thead><tr>{columns.map((c) => <th key={c}>{label(c)}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.state || row.hsn || row.type || index}>
              {columns.map((c) => <td key={c}>{typeof row[c] === "number" ? asMoney(row[c]) : row[c]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
