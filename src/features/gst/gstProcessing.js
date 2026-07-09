import JSZip from "jszip";
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

export function sortInvoiceSeries(values) {
  return [...values].sort((a, b) => {
    const an = Number(String(a).match(/\d+$/)?.[0] || 0);
    const bn = Number(String(b).match(/\d+$/)?.[0] || 0);
    return an - bn || String(a).localeCompare(String(b));
  });
}
