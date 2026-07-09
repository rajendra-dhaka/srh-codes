import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export const A4 = { width: 595, height: 842 };
export const UNKNOWN = "Unknown";
export const courierMatchers = [
  ["Delhivery", /\bDELHIVERY\b|\bDELHIVER\b/i],
  ["Valmo", /\bVALMO\b/i],
  ["Shadowfax", /\bSHADOW\s*FAX\b|\bSHADOWFAX\b/i],
  ["Xpressbees", /\bXPRESS\s*BEES\b|\bXPRESSBEES\b/i],
  ["Ecom Express", /\bECOM\s*EXPRESS\b/i],
  ["Ekart", /\bEKART\b|\bE[-\s]?KART\b/i],
  ["Blue Dart", /\bBLUE\s*DART\b|\bBLUEDART\b/i],
  ["Amazon Shipping", /\bAMAZON\s*SHIPPING\b/i],
];

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function numberOr(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getTextItemBox(item) {
  const transform = item.transform || [];
  const left = numberOr(transform[4], 0);
  const bottom = numberOr(transform[5], 0);
  const width = numberOr(item.width, 0);
  const height = numberOr(item.height, Math.abs(numberOr(transform[3], transform[0] || 8)));
  return {
    left,
    bottom,
    right: left + width,
    top: bottom + height,
  };
}

export function normalizeCropBox(cropBox, width, height) {
  const left = clamp(Math.min(cropBox.left, cropBox.right), 0, width - 4);
  const right = clamp(Math.max(cropBox.left, cropBox.right), left + 4, width);
  const bottom = clamp(Math.min(cropBox.bottom, cropBox.top), 0, height - 4);
  const top = clamp(Math.max(cropBox.bottom, cropBox.top), bottom + 4, height);
  return { left, bottom, right, top };
}

export function getPdfTextBounds(items, pageSize) {
  let left = Infinity;
  let bottom = Infinity;
  let right = -Infinity;
  let top = -Infinity;

  items.forEach((item) => {
    if (!String(item.str || "").trim()) return;
    const box = getTextItemBox(item);
    left = Math.min(left, box.left);
    bottom = Math.min(bottom, box.bottom);
    right = Math.max(right, box.right);
    top = Math.max(top, box.top);
  });

  if (!Number.isFinite(left)) {
    return meeshoFilledCropBox(pageSize.width, pageSize.height);
  }

  const pad = 8;
  return normalizeCropBox({
    left: left - pad,
    bottom: bottom - pad,
    right: right + pad,
    top: top + pad,
  }, pageSize.width, pageSize.height);
}

export function detectTaxInvoiceBox(items) {
  const boxes = items
    .map((item) => ({
      text: String(item.str || "").replace(/\s+/g, " ").trim(),
      ...getTextItemBox(item),
    }))
    .filter((item) => item.text);

  const direct = boxes.find((item) => /\bTAX\s+INVOICE\b/i.test(item.text));
  if (direct) return direct;

  for (let index = 0; index < boxes.length - 1; index += 1) {
    if (/^TAX$/i.test(boxes[index].text) && /^INVOICE$/i.test(boxes[index + 1].text)) {
      return {
        text: "TAX INVOICE",
        left: Math.min(boxes[index].left, boxes[index + 1].left),
        bottom: Math.min(boxes[index].bottom, boxes[index + 1].bottom),
        right: Math.max(boxes[index].right, boxes[index + 1].right),
        top: Math.max(boxes[index].top, boxes[index + 1].top),
      };
    }
  }

  return null;
}

export async function extractLabelPages(files) {
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
      const sourcePage = source.getPage(pageIndex);
      const pdfPage = await textDoc.getPage(pageIndex + 1);
      const content = await pdfPage.getTextContent();
      const text = content.items.map((item) => item.str || "").join(" ");
      const pageSize = sourcePage.getSize();
      pages.push({
        id: `${fileIndex}-${pageIndex}`,
        fileName: file.name,
        source,
        page: sourcePage,
        pageIndex,
        originalIndex: pages.length,
        text,
        textBounds: getPdfTextBounds(content.items, pageSize),
        taxInvoiceBox: detectTaxInvoiceBox(content.items),
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

export function detectCourierPartner(text) {
  const match = courierMatchers.find(([, pattern]) => pattern.test(text));
  if (match?.[0]) return match[0];

  const compact = text.replace(/\s+/g, " ").trim();
  const fallbackPatterns = [
    /(?:Courier|Courier\s*Partner|Logistics\s*Partner|Delivery\s*Partner)\s*[:\-]?\s*([A-Z][A-Z0-9 &.-]{2,35})/i,
    /(?:COD|Prepaid)\s*[:\-]?\s*(?:Check\s*the\s*payable\s*amount\s*on\s*the\s*app\s*)?([A-Z][A-Z0-9 &.-]{2,35})/i,
  ];
  for (const pattern of fallbackPatterns) {
    const detected = cleanDetectedValue(compact.match(pattern)?.[1]);
    if (detected && detected !== UNKNOWN && !/^(CHECK|PAYABLE|AMOUNT|CUSTOMER|PRODUCT|ORDER)$/i.test(detected)) {
      return detected;
    }
  }
  if (/\bFlipkart\b|\bFKMP\b|\bFMPP\b|\bE-Kart\b/i.test(compact)) return "Ekart";

  return UNKNOWN;
}

export function detectSellerAccount(text, fileName) {
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

export function detectSku(text) {
  const product = parseProductDetails(text);
  if (product.sku) return product.sku;
  const compact = text.replace(/\s+/g, " ").trim();
  const direct = compact.match(/\b(?:SKU|SKU\s*ID|SKU\s*CODE|Product\s*SKU)\s*[:#\-]?\s*([A-Z0-9][A-Z0-9._/-]{2,45})\b/i);
  if (direct?.[1] && !/^SIZE$/i.test(direct[1])) return cleanDetectedValue(direct[1]).toUpperCase();
  const candidates = compact.toUpperCase().match(/\b[A-Z0-9]{2,}(?:[-_/][A-Z0-9]{2,}){1,5}\b/g) || [];
  const filtered = candidates.filter((candidate) => !/^(ORDER|SUB|AWB|GST|HSN|TAX|VL|SF|FM|FWJ|COD|PREPAID)/.test(candidate));
  return filtered[0] || UNKNOWN;
}

export function detectOrderId(text) {
  const product = parseProductDetails(text);
  if (product.orderId) return product.orderId;
  const compact = text.replace(/\s+/g, " ");
  const match = compact.match(/\b(?:Order\s*(?:No|ID|Number)?|Sub\s*Order\s*(?:No|ID)?)\s*[:#\-]?\s*([A-Z0-9-]{6,40})\b/i);
  return match?.[1] || "";
}

export function detectQty(text) {
  const product = parseProductDetails(text);
  return product.qty || 1;
}

export function parseProductDetails(text) {
  const compact = text.replace(/\s+/g, " ").trim();
  const match = compact.match(/Product\s*Details\s+SKU\s+Size\s+Qty\s+Color\s+Order\s*No\.?\s+([A-Z0-9][A-Z0-9._/-]{2,60})\s+(.+?)\s+(\d+)\s+([A-Z0-9 -]+?)\s+([0-9]{8,}(?:[_-]\d+)?)\b/i);
  if (match) {
    return {
      sku: cleanDetectedValue(match[1]).toUpperCase(),
      size: cleanDetectedValue(match[2]),
      qty: Number(match[3]) || 1,
      color: cleanDetectedValue(match[4]),
      orderId: match[5],
    };
  }

  const flipkartSku = compact.match(/SKU\s*ID\s*\|\s*Description\s+QTY\s+\d+\s+([A-Z0-9][A-Z0-9._/-]{2,80})\s*\|/i);
  const flipkartQty = compact.match(/TOTAL\s+QTY\s*:\s*(\d+)/i)
    || compact.match(/SKU\s*ID\s*\|\s*Description\s+QTY\s+\d+\s+[A-Z0-9][A-Z0-9._/-]{2,80}\s*\|.*?\s+(\d+)\s+(?:FMPP|OD|Tax\s+Invoice)\b/i);
  const flipkartOrder = compact.match(/\bOrder\s*Id\s*:\s*([A-Z0-9-]{6,40})\b/i);
  if (flipkartSku?.[1] || flipkartQty?.[1] || flipkartOrder?.[1]) {
    return {
      sku: flipkartSku?.[1] ? cleanDetectedValue(flipkartSku[1]).toUpperCase() : "",
      qty: Number(flipkartQty?.[1]) || 1,
      orderId: flipkartOrder?.[1] || "",
    };
  }

  return {};
}

export function cleanDetectedValue(value) {
  const text = String(value || "")
    .replace(/\s{2,}/g, " ")
    .replace(/\b(?:GSTIN|Invoice|Tax|Order|Product|Details|Pickup|Destination|Return Code)\b.*$/i, "")
    .replace(/\s*,?\s*00\s+Dungarwas.*$/i, "")
    .replace(/\s+1st\s+Floor.*$/i, "")
    .trim();
  if (/SHREE[.\s]*ANJANEYA/i.test(text)) return "SHREE.ANJANEYA";
  return text.slice(0, 64) || UNKNOWN;
}

export function sortKey(value) {
  return value && value !== UNKNOWN ? String(value) : "ZZZ_UNKNOWN";
}

export function sortForPacking(items) {
  return [...items].sort((a, b) => {
    for (const key of ["courier", "sku", "qty", "seller"]) {
      const compared = sortKey(a[key]).localeCompare(sortKey(b[key]), "en", { numeric: true });
      if (compared) return compared;
    }
    return a.originalIndex - b.originalIndex;
  });
}

export function sortLabels(items, mode = "auto") {
  if (mode === "auto") return sortForPacking(items);
  const keysByMode = {
    none: [],
    courier: ["courier", "sku", "qty", "seller"],
    sku: ["sku", "qty", "courier", "seller"],
    courierSku: ["courier", "sku", "qty", "seller"],
    seller: ["seller", "courier", "sku", "qty"],
    sellerCourierSku: ["seller", "courier", "sku", "qty"],
  };
  const keys = keysByMode[mode] || keysByMode.auto || ["courier", "sku", "qty", "seller"];
  return [...items].sort((a, b) => {
    for (const key of keys) {
      const compared = sortKey(a[key]).localeCompare(sortKey(b[key]), "en", { numeric: true });
      if (compared) return compared;
    }
    return a.originalIndex - b.originalIndex;
  });
}

export async function buildOriginalSortedPdf(items) {
  const output = await PDFDocument.create();
  for (const item of items) {
    const { width, height } = item.page.getSize();
    const embedded = await output.embedPage(item.page);
    const page = output.addPage([width, height]);
    page.drawPage(embedded, { x: 0, y: 0, width, height });
  }
  return output.save();
}
