import { useState } from "react";
import { AlertTriangle, BarChart3, CalendarDays, CheckCircle2, ClipboardList, IndianRupee, Layers, LineChart, PackageX, RotateCcw, ShieldAlert, Target, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_PALETTE } from "../../constants/chart";
import { MARKETPLACES } from "../../constants/marketplaces";
import { money, num, percent } from "../../utils/formatters";
import { MiniMetric } from "../../components/common/MiniMetric";
import { asMoney, businessSummaryRows } from "./processing";
import { DataTable } from "./DataTable";
import { actionTips, businessText, insightParagraphs, returnExplain, translateAction } from "./copyHelpers";
import { trackEvent } from "../../lib/analytics";

export function SmartStatusStrip({ activeMarket, activeData, marketData }) {
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

export function MarketplaceTabs({ active, onChange }) {
  return (
    <nav className="market-tabs">
      {MARKETPLACES.map((market) => (
        <button key={market.id} className={active === market.id ? "active" : ""} onClick={() => onChange(market.id)}>
          {market.label}
        </button>
      ))}
    </nav>
  );
}

function marketLabel(id) {
  return MARKETPLACES.find((market) => market.id === id)?.label || id;
}

export function UploadBox({ icon, title, label, status, onFile, accept, t, multiple = false }) {
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

export function EmptyState({ text }) {
  return <section className="empty"><BarChart3 size={36} /><p>{text}</p></section>;
}

export function Dashboard({ analytics, t, lang }) {
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
            {analytics.orderSource.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
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

function ChartPanel({ title, children }) {
  return <section className="chart-panel"><h2>{title}</h2>{children}</section>;
}
