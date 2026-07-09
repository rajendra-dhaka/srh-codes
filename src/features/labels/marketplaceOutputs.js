import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { A4, UNKNOWN, clamp, normalizeCropBox, sortKey } from "./labelCore";

export async function addCroppedPage(output, sourcePage, cropBox, targetSize) {
  const embedded = await output.embedPage(sourcePage, cropBox);
  const page = output.addPage([targetSize.width, targetSize.height]);
  const margin = 8;
  const cropWidth = cropBox.right - cropBox.left;
  const cropHeight = cropBox.top - cropBox.bottom;
  const availableWidth = targetSize.width - margin * 2;
  const availableHeight = targetSize.height - margin * 2;
  const scale = Math.min(availableWidth / cropWidth, availableHeight / cropHeight);
  const drawWidth = cropWidth * scale;
  const drawHeight = cropHeight * scale;
  page.drawPage(embedded, {
    x: margin + (availableWidth - drawWidth) / 2,
    y: margin + (availableHeight - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  });
}

export async function buildFlipkartCroppedPdf(items, kind) {
  const output = await PDFDocument.create();
  for (const item of items) {
    const { width, height } = item.page.getSize();
    const cropBox = kind === "billing"
      ? { left: width * 0.03, bottom: height * 0.02, right: width * 0.97, top: height * 0.56 }
      : { left: width * 0.28, bottom: height * 0.54, right: width * 0.72, top: height * 0.98 };
    const targetSize = kind === "billing"
      ? { width: 288, height: 432 }
      : A4;
    await addCroppedPage(output, item.page, cropBox, targetSize);
  }
  return output.save();
}

export function getMeeshoLayout(labelsPerPage) {
  if (labelsPerPage === 9) {
    return { columns: 3, rows: 3, margin: 10, gapX: 6, gapY: 6, rotate: false };
  }
  if (labelsPerPage === 6) {
    return { columns: 2, rows: 3, margin: 10, gapX: 8, gapY: 8, rotate: true };
  }
  return { columns: 2, rows: 2, margin: 18, gapX: 12, gapY: 12, rotate: false };
}

export function meeshoSectionCropBox(item, section = "full") {
  const { width, height } = item.page.getSize();
  const full = normalizeCropBox(item.textBounds || meeshoFilledCropBox(width, height), width, height);

  if (section === "shipping" || section === "billing") {
    if (!item.taxInvoiceBox) {
      return section === "billing" ? null : full;
    }
    const splitY = item.taxInvoiceBox
      ? clamp(item.taxInvoiceBox.top + 8, full.bottom + 30, full.top - 30)
      : clamp(height * 0.58, full.bottom + 30, full.top - 30);

    if (section === "shipping") {
      return normalizeCropBox({ ...full, bottom: splitY }, width, height);
    }
    return normalizeCropBox({ ...full, top: splitY }, width, height);
  }

  return full;
}

export function parseMeeshoOutputKind(outputKind) {
  const match = String(outputKind || "").match(/^meesho:(full|shipping|billing):([0-9]+|3x5|4x6)$/);
  if (!match) return null;
  return {
    section: match[1],
    layout: match[2],
    labelsPerPage: Number(match[2]) || 1,
  };
}

export function meeshoOutputKind(section, labelsPerPage) {
  return `meesho:${section}:${labelsPerPage}`;
}

export async function buildMeeshoOutputPdf(items, section = "full", labelsPerPage = 4, layoutKey = String(labelsPerPage || "4")) {
  const output = await PDFDocument.create();
  const printableItems = section === "billing" ? items.filter((item) => item.taxInvoiceBox) : items;
  if (!printableItems.length) {
    throw new Error("No billing section found for the selected labels.");
  }
  const thermalSizes = {
    "3x5": { width: 216, height: 360 },
    "4x6": { width: 288, height: 432 },
  };
  if (thermalSizes[layoutKey]) {
    const target = thermalSizes[layoutKey];
    for (const item of printableItems) {
      const cropBox = meeshoSectionCropBox(item, section);
      if (!cropBox) continue;
      await addCroppedPage(output, item.page, cropBox, target);
    }
    return output.save();
  }
  if (labelsPerPage === 1) {
    for (const item of printableItems) {
      const cropBox = meeshoSectionCropBox(item, section);
      if (!cropBox) continue;
      await addCroppedPage(output, item.page, cropBox, {
        width: cropBox.right - cropBox.left,
        height: cropBox.top - cropBox.bottom,
      });
    }
    return output.save();
  }

  const layout = getMeeshoLayout(labelsPerPage);
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

  for (let i = 0; i < printableItems.length; i += labelsPerPage) {
    const page = output.addPage([A4.width, A4.height]);
    for (let offset = 0; offset < labelsPerPage; offset += 1) {
      const item = printableItems[i + offset];
      if (!item) continue;
      const cropBox = meeshoSectionCropBox(item, section);
      if (!cropBox) continue;
      const embedded = await output.embedPage(item.page, cropBox);
      const croppedWidth = cropBox.right - cropBox.left;
      const croppedHeight = cropBox.top - cropBox.bottom;
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

export async function buildMeeshoLayoutFromPages(pages, labelsPerPage = 4) {
  const items = pages.map((page, index) => ({ page, originalIndex: index }));
  return buildMeeshoOutputPdf(items, "full", labelsPerPage);
}

export function meeshoFilledCropBox(width, height) {
  return {
    left: width * 0.012,
    bottom: height * 0.24,
    right: width * 0.988,
    top: height * 0.992,
  };
}

export async function buildPicklistPdf(items, mode = "none") {
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

export function safeFilename(value) {
  return String(value || UNKNOWN)
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .toLowerCase() || "unknown";
}

export function groupItemsByCourier(items) {
  const groups = new Map();
  for (const item of items) {
    const courier = item.courier || UNKNOWN;
    if (!groups.has(courier)) groups.set(courier, []);
    groups.get(courier).push(item);
  }
  return Array.from(groups, ([courier, rows]) => ({ courier, rows }))
    .sort((a, b) => sortKey(a.courier).localeCompare(sortKey(b.courier), "en", { numeric: true }));
}

export function splitByQuantity(items) {
  return {
    single: items.filter((item) => (Number(item.qty) || 1) === 1),
    multi: items.filter((item) => (Number(item.qty) || 1) > 1),
    all: items,
  };
}

export function saveBlobBytes(bytes, filename, type) {
  const blob = new Blob([bytes], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function saveBytes(bytes, filename) {
  saveBlobBytes(bytes, filename, "application/pdf");
}

export function printPdfBytes(bytes) {
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
