import JSZip from "jszip";

export async function parseXlsxWorkbook(buffer) {
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

export async function xlsxXmlRows(buffer) {
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

export function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map((cell, index) => String(cell || `Column ${index + 1}`).trim());
  return rows.slice(1).map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""])));
}

export async function getZipFileBuffer(zip, pattern) {
  const entry = Object.values(zip.files).find((item) => pattern.test(item.name) && !item.dir);
  if (!entry) return null;
  return entry.async("arraybuffer");
}
