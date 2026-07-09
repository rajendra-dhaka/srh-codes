import { degrees, PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { UNKNOWN, sortKey } from "./labelCore";

export function normalizeAmazonText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s+([|):])/g, "$1")
    .replace(/([(])\s+/g, "$1")
    .trim();
}

export function cleanAmazonTitle(value) {
  let title = normalizeAmazonText(value).replace(/\s*\|\s*$/, "");
  const dateRow = title.match(/Invoice\s+Date\s*:?\s*[\d./-]+\s+(.+)$/i);
  if (dateRow?.[1]) {
    title = dateRow[1];
  } else {
    const markers = [...title.matchAll(/\b(?:Description|Product\s+Details|Product)\b/gi)];
    if (markers.length) {
      const lastMarker = markers[markers.length - 1];
      title = title.slice(lastMarker.index + lastMarker[0].length);
    }
  }
  return normalizeAmazonText(title)
    .replace(/^(?:(?:Sl\.?|Description|Qty|Quantity|No|Price|Amount|Rate|Type|Tax|Total|Unit|Net)\s*)+/i, "")
    .replace(/^\d+\s+/, "")
    .replace(/\b(?:Qty|Quantity|Unit Price|Net Amount|Tax Rate|Tax Type|Total Amount|HSN|Sl\.?\s*No\.?)\b.*$/i, "")
    .replace(/\s*\|\s*$/, "")
    .trim();
}

export function extractAmazonSkuFromParen(value) {
  const reserved = new Set(["CGST", "SGST", "IGST", "GST", "INR", "RS", "HSN", "TOTAL"]);
  const candidates = normalizeAmazonText(value)
    .replace(/[₹,]/g, " ")
    .match(/\b[A-Z0-9][A-Z0-9._/-]{2,60}\b/g) || [];
  const filtered = candidates.filter((candidate) => (
    !reserved.has(candidate.toUpperCase()) && /[A-Z]/i.test(candidate) && !/^\d+(?:\.\d+)?$/.test(candidate)
  ));
  return filtered[filtered.length - 1] || "";
}

export function extractAmazonQty(value) {
  const text = normalizeAmazonText(value);
  const withDiscount = text.match(/(?:₹|INR|Rs\.?)?\s*[\d,.]+\s+-?(?:₹|INR|Rs\.?)?\s*[\d,.]+\s+(\d{1,3})\s+(?:₹|INR|Rs\.?)?\s*[\d,.]+/i);
  if (withDiscount?.[1]) return Number(withDiscount[1]) || 1;
  const direct = text.match(/(?:₹|INR|Rs\.?)?\s*[\d,.]+\s+(\d{1,3})\s+(?:₹|INR|Rs\.?)?\s*[\d,.]+/i)
    || text.match(/\b(?:Qty|Quantity)\b\D{0,24}(\d{1,3})/i);
  return Number(direct?.[1]) || 1;
}

export function parseAmazonInvoiceLineItems(text) {
  const items = [];
  const asinPattern = /\|\s*([A-Z0-9]{10})\b([\s\S]{0,650}?)\(\s*([^)]+?)\s*\)\s*HSN\s*:?\s*\d+/gi;
  const rowStartPattern = /(?:Total\s+Amount|(?:₹|INR|Rs\.?)\s*[\d,.]+)\s+\d+\s+/gi;
  for (const match of text.matchAll(asinPattern)) {
    const before = text.slice(0, match.index);
    const rowStarts = [...before.matchAll(rowStartPattern)];
    const rowStart = rowStarts[rowStarts.length - 1];
    const title = rowStart ? before.slice(rowStart.index + rowStart[0].length) : before.slice(Math.max(0, before.length - 260));
    const sku = extractAmazonSkuFromParen(match[3]);
    if (!sku) continue;
    const after = text.slice(match.index + match[0].length, match.index + match[0].length + 320);
    const rowContext = `${match[2]} ${match[3]} ${after}`;
    items.push({
      title: cleanAmazonTitle(title),
      asin: match[1],
      sku,
      qty: extractAmazonQty(rowContext),
    });
  }
  return items;
}

export function parseAmazonInvoiceText(rawText) {
  const text = normalizeAmazonText(rawText);
  const lineItems = parseAmazonInvoiceLineItems(text);
  const productMatch = text.match(/\|\s*([A-Z0-9]{10})\b([\s\S]{0,650}?)\(\s*([^)]+?)\s*\)\s*HSN\s*:?\s*\d+/i)
    || text.match(/\b([A-Z0-9]{10})\s*\(\s*([^)]+?)\s*\)\s*HSN\s*:?\s*\d+/i);
  const orderId = text.match(/\b(?:Order\s*(?:ID|No\.?|Number)|Order\s*#)\s*[:#-]?\s*([0-9-]{8,})/i)?.[1]
    || text.match(/\b(\d{3}-\d{7}-\d{7})\b/)?.[1]
    || "";
  const parenValue = productMatch?.[3] || productMatch?.[2] || "";
  const hsnTail = productMatch ? text.slice(productMatch.index + productMatch[0].length) : text;
  const rowValue = productMatch?.[3] ? `${productMatch[2]} ${productMatch[3]} ${hsnTail.slice(0, 320)}` : parenValue;
  const titleSource = productMatch ? text.slice(Math.max(0, productMatch.index - 780), productMatch.index) : "";
  const fallbackItem = productMatch ? {
    title: cleanAmazonTitle(titleSource),
    asin: productMatch[1],
    sku: extractAmazonSkuFromParen(parenValue),
    qty: extractAmazonQty(rowValue) || extractAmazonQty(hsnTail),
  } : null;
  const items = lineItems.length ? lineItems : fallbackItem?.sku ? [fallbackItem] : [];
  const firstItem = items[0] || {};

  return {
    title: firstItem.title || "",
    asin: firstItem.asin || "",
    sku: firstItem.sku || "",
    qty: items.reduce((sum, item) => sum + (Number(item.qty) || 1), 0) || 1,
    orderId,
    lineItems: items,
  };
}

export const amazonShippingMarkers = [
  [/\bAWB\b/i, 3],
  [/\bShip\s*To\b/i, 2],
  [/\bOrder\s*Id\b/i, 1],
  [/\bShip\s*Date\b/i, 2],
  [/\bDelivery\s*Station\b/i, 2],
  [/\bBox\s+\d+\s+of\s+\d+\b/i, 2],
  [/\bATSPL\b/i, 2],
  [/\bAmazon\s+Transportation\s+Services\b/i, 2],
];

export const amazonBillingMarkers = [
  [/\bTax\s+Invoice\b/i, 4],
  [/\bInvoice\s+Details\b/i, 3],
  [/\bBilling\s+Address\b/i, 2],
  [/\bShipping\s+Address\b/i, 2],
  [/\bHSN\b/i, 2],
  [/\bTaxable\s+Value\b/i, 2],
  [/\bPage\s+\d+\s+of\s+\d+\b/i, 2],
  [/\bGSTIN\b/i, 1],
  [/\bInvoice\s+(?:No|Number|Date)\b/i, 1],
];

export function markerScore(text, markers) {
  return markers.reduce((sum, [pattern, weight]) => sum + (pattern.test(text) ? weight : 0), 0);
}

export function classifyAmazonPage(page) {
  const text = normalizeAmazonText(page?.text || "");
  const shippingScore = markerScore(text, amazonShippingMarkers);
  const billingScore = markerScore(text, amazonBillingMarkers);
  if (billingScore >= 4 && billingScore >= shippingScore) return "billing";
  if (shippingScore >= 3 && shippingScore > billingScore) return "shipping";
  if (shippingScore > 0 && billingScore === 0) return "shipping";
  if (billingScore > 0) return "billing";
  return "unknown";
}

export function pairAmazonOrders(pages) {
  const orders = [];
  const sortedPages = [...pages].sort((a, b) => a.originalIndex - b.originalIndex);
  let currentOrder = null;

  const finishOrder = () => {
    if (!currentOrder) return;
    const invoiceText = currentOrder.invoicePages.map((page) => page.text || "").join(" ");
    const invoiceInfo = parseAmazonInvoiceText(invoiceText);
    orders.push({
      ...currentOrder.shipping,
      invoice: currentOrder.invoicePages[0] || null,
      invoicePages: currentOrder.invoicePages,
      title: invoiceInfo.title || currentOrder.shipping.title || "",
      asin: invoiceInfo.asin || "",
      sku: invoiceInfo.sku || currentOrder.shipping.sku || UNKNOWN,
      qty: invoiceInfo.qty || currentOrder.shipping.qty || 1,
      orderId: invoiceInfo.orderId || currentOrder.shipping.orderId || "",
      lineItems: invoiceInfo.lineItems?.length ? invoiceInfo.lineItems : [{
        title: invoiceInfo.title || currentOrder.shipping.title || "",
        asin: invoiceInfo.asin || "",
        sku: invoiceInfo.sku || currentOrder.shipping.sku || UNKNOWN,
        qty: invoiceInfo.qty || currentOrder.shipping.qty || 1,
      }],
    });
    currentOrder = null;
  };

  for (const page of sortedPages) {
    const pageKind = classifyAmazonPage(page);
    if (pageKind === "shipping") {
      finishOrder();
      currentOrder = { shipping: page, invoicePages: [] };
    } else if (pageKind === "billing" && currentOrder) {
      currentOrder.invoicePages.push(page);
    } else if (pageKind === "billing") {
      continue;
    } else if (pageKind === "unknown") {
      if (!currentOrder || currentOrder.invoicePages.length) {
        finishOrder();
        currentOrder = { shipping: page, invoicePages: [] };
      } else {
        currentOrder.invoicePages.push(page);
      }
    }
  }
  finishOrder();
  return orders;
}

export function flattenAmazonLineItems(orders) {
  return orders.flatMap((order, orderIndex) => {
    const lineItems = order.lineItems?.length ? order.lineItems : [order];
    return lineItems.map((item, itemIndex) => ({
      ...item,
      orderSeq: orderIndex + 1,
      itemSeq: itemIndex + 1,
      orderId: order.orderId,
      originalIndex: order.originalIndex,
    }));
  });
}

export function amazonSkuSummary(order) {
  const lineItems = order.lineItems?.length ? order.lineItems : [order];
  return lineItems
    .map((item) => `${item.sku || UNKNOWN} x${Number(item.qty) || 1}`)
    .join(" | ");
}

export function amazonPackingNoteLines(order, mode) {
  const lineItems = (order.lineItems?.length ? order.lineItems : [order]).filter(Boolean);
  const visibleItems = lineItems.slice(0, 2);
  const lines = visibleItems.map((item) => {
    const sku = item.sku || UNKNOWN;
    const qty = Number(item.qty) || 1;
    if (mode !== "description") return `${sku} (QTY-${qty})`;
    const title = truncate(item.title || "", 112);
    return title ? `${sku} (QTY-${qty}) -> ${title}` : `${sku} (QTY-${qty})`;
  });
  if (lineItems.length > visibleItems.length) {
    lines.push(`+${lineItems.length - visibleItems.length} more items`);
  }
  return lines.length ? lines : [`${order.sku || UNKNOWN} (QTY-${Number(order.qty) || 1})`];
}

export function wrapPdfText(text, maxChars = 70, maxLines = 2) {
  const words = normalizeAmazonText(text).split(" ").filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (words.length && lines.join(" ").length < normalizeAmazonText(text).length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, Math.max(0, maxChars - 3))}...`;
  }
  return lines.slice(0, maxLines);
}

export function drawThermalBoldText(page, text, options) {
  const offsets = [
    [0, 0],
    [0.24, 0],
    [0, 0.16],
  ];
  offsets.forEach(([dx, dy]) => {
    page.drawText(text, {
      ...options,
      x: options.x + dx,
      y: options.y + dy,
    });
  });
}

export function drawAmazonInfoBox(page, fonts, order, mode) {
  if (mode === "clean") return;
  const { width, height } = page.getSize();
  const x = 44;
  const boxWidth = width - 88;
  const noteLines = amazonPackingNoteLines(order, mode);
  const bodyLineHeight = mode === "description" ? 14.2 : 12.4;
  const boxHeight = 22 + noteLines.length * bodyLineHeight;
  const y = Math.max(152, Math.min(164, height * 0.19));
  page.drawRectangle({
    x,
    y,
    width: boxWidth,
    height: boxHeight,
    color: rgb(1, 1, 1),
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    opacity: 0.96,
  });
  page.drawRectangle({
    x,
    y: y + boxHeight - 13,
    width: boxWidth,
    height: 13,
    color: rgb(0, 0, 0),
  });
  page.drawText("PACKING NOTE", {
    x: x + 10,
    y: y + boxHeight - 9.8,
    size: 7,
    font: fonts.bold,
    color: rgb(1, 1, 1),
  });

  noteLines.forEach((line, index) => {
    drawThermalBoldText(page, line, {
      x: x + 10,
      y: y + boxHeight - 26 - index * bodyLineHeight,
      size: mode === "description" ? (line.length > 132 ? 10.2 : line.length > 112 ? 10.6 : 11.1) : 9.6,
      font: fonts.bold,
      color: rgb(0, 0, 0),
    });
  });
}

export async function buildAmazonPreparedPdf(orders, options) {
  const output = await PDFDocument.create();
  const fonts = {
    regular: await output.embedFont(StandardFonts.Helvetica),
    bold: await output.embedFont(StandardFonts.HelveticaBold),
  };
  const rows = options.sortBySku
    ? [...orders].sort((a, b) => sortKey(a.sku).localeCompare(sortKey(b.sku), "en", { numeric: true }) || a.originalIndex - b.originalIndex)
    : [...orders];

  for (const order of rows) {
    const { width, height } = order.page.getSize();
    const embeddedShipping = await output.embedPage(order.page);
    const shippingPage = output.addPage([width, height]);
    shippingPage.drawPage(embeddedShipping, { x: 0, y: 0, width, height });
    drawAmazonInfoBox(shippingPage, fonts, order, options.mode);

    if (options.keepInvoice) {
      for (const invoice of order.invoicePages || (order.invoice ? [order.invoice] : [])) {
        if (!invoice?.page) continue;
        const invoiceSize = invoice.page.getSize();
        const embeddedInvoice = await output.embedPage(invoice.page);
        const invoicePage = output.addPage([invoiceSize.width, invoiceSize.height]);
        invoicePage.drawPage(embeddedInvoice, {
          x: 0,
          y: 0,
          width: invoiceSize.width,
          height: invoiceSize.height,
        });
      }
    }
  }
  return output.save();
}

export async function buildAmazonBillingPdf(orders, options = {}) {
  const output = await PDFDocument.create();
  const rows = options.sortBySku
    ? [...orders].sort((a, b) => sortKey(a.sku).localeCompare(sortKey(b.sku), "en", { numeric: true }) || a.originalIndex - b.originalIndex)
    : [...orders];

  for (const order of rows) {
    for (const invoice of order.invoicePages || (order.invoice ? [order.invoice] : [])) {
      if (!invoice?.page) continue;
      const { width, height } = invoice.page.getSize();
      const embeddedInvoice = await output.embedPage(invoice.page);
      const page = output.addPage([width, height]);
      page.drawPage(embeddedInvoice, { x: 0, y: 0, width, height });
    }
  }

  if (!output.getPageCount()) {
    throw new Error("No Amazon billing pages were found.");
  }

  return output.save();
}
