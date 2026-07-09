import Papa from "papaparse";
import JSZip from "jszip";
import { money, n, percent } from "../../utils/formatters";
import { parseXlsxWorkbook } from "../../utils/xlsx";

export const emptyPerformanceData = () => ({
  orders: [],
  payment: { orderPayments: [], ads: [] },
  status: { orders: [], payment: [] },
});




















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

export async function parseOrdersFiles(files) {
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

export async function parsePaymentFiles(files) {
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

export function computeAnalytics(orders, payment) {
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

export function businessSummaryRows(orders, paymentRows) {
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

export function asMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
