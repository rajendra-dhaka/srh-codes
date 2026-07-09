import { money, num, percent } from "../../utils/formatters";
import { translateAction, translatePaymentStatus, translateReturnType } from "./copyHelpers";

export function DataTable({ title, rows, columns, lang = "en" }) {
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
