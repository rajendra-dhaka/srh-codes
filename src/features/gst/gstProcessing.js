import JSZip from "jszip";
import Papa from "papaparse";
import { DEFAULT_HOME_STATE, GST_STATE_BY_CODE } from "../../constants/gst";
import { getZipFileBuffer, parseXlsxWorkbook, rowsToObjects, xlsxXmlRows } from "../../utils/xlsx";

export function parseNumberish(value) {
  if (value == null) return 0;
  const clean = String(value).replace(/,/g, "").trim();
  if (!clean || clean === "null") return 0;
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeStateName(value) {
  return String(value || "").trim().toUpperCase();
}

export function stateFromPlaceOfSupply(value) {
  const text = String(value || "").trim();
  const withoutCode = text.replace(/^\d+\s*[- ]\s*/, "");
  return normalizeStateName(withoutCode || text || "UNKNOWN");
}

export function normalizeRate(value) {
  const rate = parseNumberish(value);
  return rate > 0 && rate <= 1 ? rate * 100 : rate;
}

export function stateFromGstin(value) {
  const gstin = String(value || "").trim().toUpperCase();
  if (!/^[0-9]{2}[A-Z0-9]{13}$/.test(gstin)) return "";
  return GST_STATE_BY_CODE[gstin.slice(0, 2)] || "";
}

export function inferHomeStateFromRows(rows) {
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

export async function parseMeeshoGstReport(file) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const salesBuffer = await getZipFileBuffer(zip, /tcs_sales\.xlsx$/i);
  const returnsBuffer = await getZipFileBuffer(zip, /tcs_sales_return\.xlsx$/i);
  if (!salesBuffer || !returnsBuffer) throw new Error("The GST Report ZIP must contain both tcs_sales.xlsx and tcs_sales_return.xlsx.");
  return {
    sales: rowsToObjects(await xlsxXmlRows(salesBuffer)),
    returns: rowsToObjects(await xlsxXmlRows(returnsBuffer)),
  };
}

export async function parseMeeshoTaxInvoice(file) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const detailsBuffer = await getZipFileBuffer(zip, /Tax_invoice_details\.xlsx$/i);
  if (!detailsBuffer) throw new Error("Tax_invoice_details.xlsx was not found in the Tax Invoice ZIP.");
  const workbook = await parseXlsxWorkbook(detailsBuffer);
  return rowsToObjects(workbook.Invoice_Info || Object.values(workbook)[0] || []);
}

export async function parseAmazonGstReport(file) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entry = Object.values(zip.files).find((item) => /\.xlsx$/i.test(item.name) && !item.dir);
  if (!entry) throw new Error("Amazon GST Report ZIP must contain the GSTR1 .xlsx file.");
  return parseXlsxWorkbook(await entry.async("arraybuffer"));
}

export async function parseAmazonMonthlyMtr(file) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entry = Object.values(zip.files).find((item) => /\.csv$/i.test(item.name) && !item.dir);
  if (!entry) throw new Error("Amazon Monthly MTR ZIP must contain the MTR .csv file.");
  const parsed = Papa.parse(await entry.async("text"), { header: true, skipEmptyLines: true });
  return parsed.data || [];
}

export async function parseFlipkartGstReport(file) {
  return parseXlsxWorkbook(await file.arrayBuffer());
}

export async function parseFlipkartSalesReport(file) {
  const workbook = await parseXlsxWorkbook(await file.arrayBuffer());
  return {
    sales: rowsToObjects(workbook["Sales Report"] || []),
    cashback: rowsToObjects(workbook["Cash Back Report"] || []),
  };
}

export const emptyTaxVector = () => ({ igst: 0, cgst: 0, sgst: 0, cess: 0 });

export function addTaxVectors(...vectors) {
  return vectors.reduce((sum, item) => ({
    igst: sum.igst + parseNumberish(item?.igst),
    cgst: sum.cgst + parseNumberish(item?.cgst),
    sgst: sum.sgst + parseNumberish(item?.sgst),
    cess: sum.cess + parseNumberish(item?.cess),
  }), emptyTaxVector());
}

export function findGstr2bTaxColumns(rows) {
  for (const row of rows || []) {
    const labels = row.map((cell) => String(cell || "").trim().toLowerCase());
    const igst = labels.findIndex((cell) => cell.includes("integrated tax"));
    const cgst = labels.findIndex((cell) => cell.includes("central tax"));
    const sgst = labels.findIndex((cell) => cell.includes("state/ut tax"));
    const cess = labels.findIndex((cell) => cell.includes("cess"));
    if ([igst, cgst, sgst, cess].every((index) => index >= 0)) return { igst, cgst, sgst, cess };
  }
  return null;
}

export function taxVectorFromRow(row, columns) {
  if (!row || !columns) return emptyTaxVector();
  return {
    igst: parseNumberish(row[columns.igst]),
    cgst: parseNumberish(row[columns.cgst]),
    sgst: parseNumberish(row[columns.sgst]),
    cess: parseNumberish(row[columns.cess]),
  };
}

export function findGstr2bSummaryRow(rows, includes) {
  const terms = includes.map((term) => term.toLowerCase());
  return (rows || []).find((row) => {
    const text = row.map((cell) => String(cell || "")).join(" | ").toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

export function sumGstr2bRowsByCode(rows, code) {
  const columns = findGstr2bTaxColumns(rows);
  return (rows || []).reduce((sum, row) => {
    const text = row.map((cell) => String(cell || "")).join(" | ").toLowerCase();
    return text.includes(code.toLowerCase()) ? addTaxVectors(sum, taxVectorFromRow(row, columns)) : sum;
  }, emptyTaxVector());
}

export async function parseGstr2bSummary(file) {
  const workbook = await parseXlsxWorkbook(await file.arrayBuffer());
  const availableRows = workbook["ITC Available"];
  if (!availableRows?.length) throw new Error("ITC Available sheet was not found. Upload the official GSTR-2B Summary Excel.");

  const availableColumns = findGstr2bTaxColumns(availableRows);
  const category = (terms) => taxVectorFromRow(findGstr2bSummaryRow(availableRows, terms), availableColumns);
  const available = {
    importGoods: category(["Import of Goods", "4(A)(1)"]),
    reverseCharge: category(["Inward Supplies liable for reverse charge", "4(A)(3)"]),
    isd: category(["Inward Supplies from ISD", "4(A)(4)"]),
    allOther: category(["All other ITC", "4(A)(5)"]),
  };
  available.total = addTaxVectors(available.importGoods, available.reverseCharge, available.isd, available.allOther);

  const notAvailableRows = workbook["ITC not available"] || [];
  const reversalRows = workbook["ITC Reversal"] || [];
  const rejectedRows = workbook["ITC Rejected"] || [];
  const rejectedColumns = findGstr2bTaxColumns(rejectedRows);
  const rejectedSummary = findGstr2bSummaryRow(rejectedRows, ["All other ITC - Supplies from registered persons"]);

  return {
    available,
    notAvailable: sumGstr2bRowsByCode(notAvailableRows, "4(D)(2)"),
    reversal: sumGstr2bRowsByCode(reversalRows, "4(B)(2)"),
    rejected: taxVectorFromRow(rejectedSummary, rejectedColumns),
  };
}

export function totalTaxVector(vector) {
  return parseNumberish(vector?.igst) + parseNumberish(vector?.cgst) + parseNumberish(vector?.sgst) + parseNumberish(vector?.cess);
}

export function estimateGstr3bSetoff(liability, credit) {
  const due = { ...emptyTaxVector(), ...liability };
  const available = { ...emptyTaxVector(), ...credit };
  const used = { igst: emptyTaxVector(), cgst: emptyTaxVector(), sgst: emptyTaxVector(), cess: emptyTaxVector() };
  const consume = (creditHead, liabilityHead) => {
    const amount = Math.min(available[creditHead], due[liabilityHead]);
    available[creditHead] -= amount;
    due[liabilityHead] -= amount;
    used[liabilityHead][creditHead] += amount;
  };

  consume("igst", "igst");
  consume("igst", "cgst");
  consume("igst", "sgst");
  consume("cgst", "cgst");
  consume("sgst", "sgst");
  consume("cgst", "igst");
  consume("sgst", "igst");
  consume("cess", "cess");

  return {
    used,
    cash: due,
    remaining: available,
    totalCash: totalTaxVector(due),
    totalUsed: totalTaxVector(credit) - totalTaxVector(available),
  };
}

export function buildGstr3bSummary(gstr1Result, gstr2b) {
  const liability = {
    igst: gstr1Result.totals.igst,
    cgst: gstr1Result.totals.cgst,
    sgst: gstr1Result.totals.sgst,
    cess: 0,
  };
  const interstateStates = gstr1Result.states.filter((row) => row.state !== gstr1Result.homeState);
  const interstate = interstateStates.reduce((sum, row) => ({ taxable: sum.taxable + row.net, igst: sum.igst + row.tax }), { taxable: 0, igst: 0 });
  return {
    taxable: gstr1Result.totals.taxable,
    liability,
    interstate,
    interstateStates,
    gstr2b,
    setoff: estimateGstr3bSetoff(liability, gstr2b.available.total),
  };
}

function detectHeaderObjects(rows, requiredLabels = []) {
  const normalizedRequired = requiredLabels.map((label) => label.toLowerCase());
  const headerIndex = (rows || []).findIndex((row) => {
    const labels = row.map((cell) => String(cell || "").trim().toLowerCase());
    return normalizedRequired.every((label) => labels.includes(label));
  });
  if (headerIndex < 0) return [];
  const headers = rows[headerIndex].map((cell, index) => String(cell || `Column ${index + 1}`).trim());
  return rows.slice(headerIndex + 1)
    .filter((row) => row.some((cell) => String(cell || "").trim()))
    .map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""])));
}

function firstValue(row, keys) {
  for (const key of keys) {
    if (row?.[key] != null && String(row[key]).trim() !== "") return row[key];
  }
  return "";
}

function summarizeRowsByState(rows, options) {
  const stateMap = new Map();
  rows.forEach((row) => {
    const state = options.state(row);
    const taxable = parseNumberish(options.taxable(row));
    if (!state || Math.round(taxable * 100) === 0) return;
    const rate = normalizeRate(options.rate(row) || 18);
    const tax = options.tax ? parseNumberish(options.tax(row)) : taxable * (rate / 100);
    const current = stateMap.get(state) || { state, gross: 0, returns: 0, net: 0, tax: 0, invoice: 0, qty: 0 };
    current.gross += Math.max(taxable, 0);
    current.returns += Math.max(-taxable, 0);
    current.net += taxable;
    current.tax += tax;
    stateMap.set(state, current);
  });
  return Array.from(stateMap.values()).sort((a, b) => a.state.localeCompare(b.state));
}

function totalsFromStates(states, homeState) {
  return states.reduce((sum, row) => {
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
}

function documentSummaryFromNumbers(rows, key, type, marketplace) {
  const invoices = rows.map((row) => String(row[key] || "").trim()).filter(Boolean);
  if (!invoices.length) return [];
  const sorted = sortInvoiceSeries(invoices);
  return [{ marketplace, type, count: invoices.length, from: sorted[0] || "", to: sorted.at(-1) || "" }];
}

export function summarizeAmazonGst(gstWorkbook, mtrRows = [], selectedHomeState = "") {
  const sellerState = stateFromGstin(mtrRows.find((row) => row["Seller Gstin"])?.["Seller Gstin"]);
  const homeState = normalizeStateName(selectedHomeState || sellerState || DEFAULT_HOME_STATE);
  const b2csRows = detectHeaderObjects(gstWorkbook["B2C Small"], ["Type", "Place Of Supply", "Taxable Value"]);
  const b2clRows = detectHeaderObjects(gstWorkbook["B2C Large"], ["Invoice Number", "Place Of Supply", "Taxable Value"]);
  const states = summarizeRowsByState([...b2csRows, ...b2clRows], {
    state: (row) => stateFromPlaceOfSupply(firstValue(row, ["Place Of Supply"])),
    taxable: (row) => firstValue(row, ["Taxable Value"]),
    rate: (row) => firstValue(row, ["Rate"]),
  });
  const totals = totalsFromStates(states, homeState);
  const hsnRows = detectHeaderObjects(gstWorkbook["HSN Summary"], ["HSN", "Taxable Value"]);
  const hsn = hsnRows.map((row) => ({
    hsn: String(row.HSN || "UNKNOWN").trim(),
    qty: parseNumberish(row["Total Quantity"]),
    totalValue: parseNumberish(row["Total Value"]),
    taxable: parseNumberish(row["Taxable Value"]),
    igst: parseNumberish(row["Integrated Tax Amount"]),
    cgst: parseNumberish(row["Central Tax Amount"]),
    sgst: parseNumberish(row["State/UT Tax Amount"]),
    cess: parseNumberish(row["Cess Amount"]),
  })).filter((row) => Math.round(row.taxable * 100) !== 0);
  const invoiceDocs = documentSummaryFromNumbers(mtrRows, "Invoice Number", "Invoices", "Amazon");
  const creditDocs = documentSummaryFromNumbers(mtrRows, "Credit Note No", "Credit Notes", "Amazon");
  const ecoGstin = firstValue(b2csRows[0] || b2clRows[0] || {}, ["E-Commerce GSTIN"]) || "08AAICA3918J1CT";
  return {
    marketplace: "Amazon",
    states,
    hsn,
    totals,
    gross: totals.taxable,
    returns: 0,
    homeState,
    homeStateSource: selectedHomeState ? "manual selection" : sellerState ? "Amazon MTR GSTIN" : "default setting",
    rows: { sales: b2csRows.length + b2clRows.length, returns: 0, matchedReturns: 0, returnIds: 0 },
    docSummary: [...invoiceDocs, ...creditDocs],
    eco: [{ gstin: ecoGstin, name: "AMAZON SELLER SERVICES PRIVATE LIMITED", net: totals.taxable, igst: totals.igst, cgst: totals.cgst, sgst: totals.sgst }],
  };
}

export function summarizeFlipkartGst(gstWorkbook, salesReport = {}, selectedHomeState = "") {
  const localRows = rowsToObjects(gstWorkbook["Section 7(A)(2) in GSTR-1"] || []);
  const interstateRows = rowsToObjects(gstWorkbook["Section 7(B)(2) in GSTR-1"] || []);
  const allTable7Rows = [...localRows, ...interstateRows];
  const transactionRows = salesReport?.sales || [];
  const saleTransactions = transactionRows.filter((row) => String(row["Event Type"] || row["Event Sub Type"] || "").trim().toLowerCase() === "sale").length;
  const returnTransactions = transactionRows.filter((row) => String(row["Event Type"] || row["Event Sub Type"] || "").trim().toLowerCase() === "return").length;
  const sellerState = stateFromGstin(firstValue(localRows[0] || interstateRows[0] || {}, ["GSTIN"]));
  const homeState = normalizeStateName(selectedHomeState || sellerState || DEFAULT_HOME_STATE);
  const localStates = summarizeRowsByState(localRows, {
    state: () => homeState,
    taxable: (row) => firstValue(row, ["Aggregate Taxable Value Rs."]),
    rate: (row) => firstValue(row, ["CGST %"]),
    tax: (row) => parseNumberish(row["CGST Amount Rs."]) + parseNumberish(row["SGST /UT Amount Rs."]),
  });
  const interstateStates = summarizeRowsByState(interstateRows, {
    state: (row) => stateFromPlaceOfSupply(row["Delivered State (PoS)"]),
    taxable: (row) => firstValue(row, ["Aggregate Taxable Value Rs."]),
    rate: (row) => firstValue(row, ["IGST %"]),
    tax: (row) => row["IGST Amount Rs."],
  });
  const states = combineStateRows([...localStates, ...interstateStates], homeState);
  const totals = totalsFromStates(states, homeState);
  const gross = allTable7Rows.reduce((sum, row) => sum + parseNumberish(row["Gross Taxable Value Rs."]), 0);
  const returns = allTable7Rows.reduce((sum, row) => sum + parseNumberish(row["Taxable Sales Return Value Rs."]), 0);
  const hsn = rowsToObjects(gstWorkbook["Section 12 in GSTR-1"] || []).map((row) => ({
    hsn: String(row["HSN Number"] || "UNKNOWN").trim(),
    qty: parseNumberish(row["Total Quantity in Nos."]),
    totalValue: parseNumberish(row["Total\n Value Rs."]),
    taxable: parseNumberish(row["Total Taxable Value Rs."]),
    igst: parseNumberish(row["IGST Amount Rs."]),
    cgst: parseNumberish(row["CGST Amount Rs."]),
    sgst: parseNumberish(row["SGST Amount Rs."]),
    cess: parseNumberish(row["Cess Rs."]),
  })).filter((row) => Math.round(row.taxable * 100) !== 0);
  const docSummary = rowsToObjects(gstWorkbook["Section 13 in GSTR-1"] || []).map((row) => ({
    marketplace: "Flipkart",
    type: "Invoices",
    from: row["Invoice Series From"] || "",
    to: row["Invoice Series \nTo"] || "",
    count: parseNumberish(row["Net invoices Issued"] || row["Total Number of Invoices"]),
  })).filter((row) => row.count || row.from || row.to);
  return {
    marketplace: "Flipkart",
    states,
    hsn,
    totals,
    gross,
    returns,
    homeState,
    homeStateSource: selectedHomeState ? "manual selection" : sellerState ? "Flipkart report GSTIN" : "default setting",
    rows: {
      sales: saleTransactions || transactionRows.length,
      returns: returnTransactions,
      matchedReturns: 0,
      returnIds: 0,
      portalRows: allTable7Rows.length,
      sourceLabel: transactionRows.length
        ? `${saleTransactions} sale tx / ${returnTransactions} return tx / ${allTable7Rows.length} portal rows`
        : `${allTable7Rows.length} portal rows`,
    },
    docSummary,
    eco: [{ gstin: "29AACCF0683K1ZD", name: "FLIPKART INTERNET PRIVATE LIMITED", net: totals.taxable, igst: totals.igst, cgst: totals.cgst, sgst: totals.sgst }],
  };
}

function combineStateRows(rows, homeState) {
  const map = new Map();
  rows.forEach((row) => {
    const current = map.get(row.state) || { state: row.state, gross: 0, returns: 0, net: 0, tax: 0, invoice: 0, qty: 0 };
    current.gross += row.gross || Math.max(row.net, 0);
    current.returns += row.returns || 0;
    current.net += row.net || 0;
    current.tax += row.tax || 0;
    map.set(row.state, current);
  });
  return Array.from(map.values()).filter((row) => Math.round(row.net * 100) !== 0).sort((a, b) => {
    if (a.state === homeState) return -1;
    if (b.state === homeState) return 1;
    return a.state.localeCompare(b.state);
  });
}

function combineHsnRows(rows) {
  const map = new Map();
  rows.forEach((row) => {
    const key = row.hsn || "UNKNOWN";
    const current = map.get(key) || { hsn: key, qty: 0, totalValue: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 };
    current.qty += parseNumberish(row.qty);
    current.totalValue += parseNumberish(row.totalValue);
    current.taxable += parseNumberish(row.taxable);
    current.igst += parseNumberish(row.igst);
    current.cgst += parseNumberish(row.cgst);
    current.sgst += parseNumberish(row.sgst);
    current.cess += parseNumberish(row.cess);
    map.set(key, current);
  });
  return Array.from(map.values()).filter((row) => Math.round(row.taxable * 100) !== 0).sort((a, b) => a.hsn.localeCompare(b.hsn));
}

export function combineGstr1Summaries(summaries, selectedHomeState = "") {
  const valid = summaries.filter(Boolean);
  if (!valid.length) return null;
  const homeState = normalizeStateName(selectedHomeState || valid.find((item) => item.homeState)?.homeState || DEFAULT_HOME_STATE);
  const states = combineStateRows(valid.flatMap((item) => item.states || []), homeState);
  const hsn = combineHsnRows(valid.flatMap((item) => item.hsn || []));
  const totals = totalsFromStates(states, homeState);
  return {
    marketplaces: valid,
    states,
    hsn,
    totals,
    gross: valid.reduce((sum, item) => sum + parseNumberish(item.gross), 0),
    returns: valid.reduce((sum, item) => sum + parseNumberish(item.returns), 0),
    homeState,
    homeStateSource: selectedHomeState ? "manual selection" : valid.map((item) => `${item.marketplace}: ${item.homeStateSource}`).join("; "),
    rows: {
      sales: valid.reduce((sum, item) => sum + parseNumberish(item.rows?.sales), 0),
      returns: valid.reduce((sum, item) => sum + parseNumberish(item.rows?.returns), 0),
      matchedReturns: valid.reduce((sum, item) => sum + parseNumberish(item.rows?.matchedReturns), 0),
      returnIds: valid.reduce((sum, item) => sum + parseNumberish(item.rows?.returnIds), 0),
    },
    docSummary: valid.flatMap((item) => item.docSummary || []),
    eco: valid.flatMap((item) => item.eco || []),
  };
}

export function summarizeMeeshoGst(gstReport, docsRows = [], selectedHomeState = "") {
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
  const normalizeMeeshoDocType = (type) => {
    const normalized = String(type || "UNKNOWN").trim().toUpperCase().replace(/[\s-]+/g, "_");
    if (normalized === "INVOICE") return "Invoices";
    if (normalized.startsWith("CREDIT")) return "Credit Notes";
    return normalized.replace(/_/g, " ");
  };
  const docTypes = docsRows.reduce((map, row) => {
    const type = normalizeMeeshoDocType(row.Type);
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
  return {
    marketplace: "Meesho",
    states,
    hsn,
    totals,
    gross,
    returns,
    homeState,
    homeStateSource,
    rows: {
      sales: gstReport.sales.length,
      returns: gstReport.returns.length,
      matchedReturns,
      returnIds: returnIds.size,
      sourceLabel: `${gstReport.sales.length} sales / ${gstReport.returns.length} returns / ${matchedReturns} same-month traces`,
    },
    docSummary: docSummary.map((row) => ({ marketplace: "Meesho", ...row })),
    eco: [{ gstin: "08AARCM9332R1CO", name: "MEESHO TECHNOLOGIES PRIVATE LIMITED", net: totals.taxable, igst: totals.igst, cgst: totals.cgst, sgst: totals.sgst }],
  };
}

export function sortInvoiceSeries(values) {
  return [...values].sort((a, b) => {
    const an = Number(String(a).match(/\d+$/)?.[0] || 0);
    const bn = Number(String(b).match(/\d+$/)?.[0] || 0);
    return an - bn || String(a).localeCompare(String(b));
  });
}
