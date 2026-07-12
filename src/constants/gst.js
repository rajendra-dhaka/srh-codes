export const DEFAULT_HOME_STATE = "RAJASTHAN";

export const GST_STATE_BY_CODE = {
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

export const GST_STATE_OPTIONS = Array.from(new Set(Object.values(GST_STATE_BY_CODE))).sort();

export const GST_FILING_MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

export const GST_FILING_YEARS = ["2026-27", "2025-26", "2024-25"];

export const GSTR1_MARKETPLACE_DOCUMENTS = {
  meesho: {
    label: "Meesho",
    required: [
      {
        id: "gstReport",
        title: "GST Report ZIP",
        hint: "gst_...zip with tcs_sales.xlsx and tcs_sales_return.xlsx",
        help: "Sales and sales-return sheets for Table 7 and Table 12.",
      },
      {
        id: "taxInvoice",
        title: "Tax Invoice ZIP",
        hint: "Contains Tax_invoice_details.xlsx and invoice PDFs",
        help: "Invoice and credit-note series for Table 13.",
      },
    ],
    optional: [
      {
        id: "supplierInvoice",
        title: "Supplier Tax Invoice ZIP",
        hint: "Meesho to Supplier invoice ZIP",
        help: "Keep for GSTR-3B ITC and reconciliation.",
      },
      {
        id: "commissionBackup",
        title: "Commission Backup ZIP",
        hint: "Forward/reverse/other charges backup",
        help: "Optional reconciliation backup, not core GSTR-1 outward sales.",
      },
    ],
    portalTables: ["7 - B2C Others", "12 - HSN Summary", "13 - Documents Issued"],
  },
  flipkart: {
    label: "Flipkart",
    required: [
      {
        id: "gstReturnReport",
        title: "GST Report / GSTR Return Report",
        hint: "Flipkart GST return report for this month",
        help: "Table 7, Table 12 and document summary values.",
      },
      {
        id: "salesReport",
        title: "Sales Report",
        hint: "Order-level sales and returns report",
        help: "Cross-check order-level sales and returns before filing.",
      },
    ],
    optional: [
      {
        id: "commissionInvoice",
        title: "Commission Invoice ZIP",
        hint: "Optional GSTR-3B ITC backup",
        help: "Marketplace fee invoice backup for ITC reconciliation.",
      },
      {
        id: "tdsReport",
        title: "TDS Report ZIP",
        hint: "Optional reconciliation report ZIP",
        help: "Reconciliation only; it is not filled in GSTR-1 outward supplies.",
      },
    ],
    portalTables: ["7 - B2C Others", "12 - HSN Summary", "13 - Documents Issued"],
  },
  amazon: {
    label: "Amazon",
    required: [
      {
        id: "readyToFileReport",
        title: "GST Ready-to-File Report",
        hint: "Amazon portal-ready GSTR-1 report",
        help: "Portal-ready GSTR-1 values for the selected month.",
      },
      {
        id: "monthlyTransactionReport",
        title: "Monthly MTR",
        hint: "Shipment-level monthly transaction report",
        help: "Shipment-level backup and cross-check.",
      },
    ],
    optional: [
      {
        id: "tds194O",
        title: "194-O TDS certificate/report",
        hint: "Optional reconciliation report",
        help: "Reconciliation only; it is not filled in GSTR-1 outward supplies.",
      },
    ],
    portalTables: ["7 - B2C Others", "12 - HSN Summary", "13 - Documents Issued"],
  },
};
