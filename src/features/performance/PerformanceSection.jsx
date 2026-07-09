import { useMemo, useState } from "react";
import { AlertTriangle, FileSpreadsheet, Upload } from "lucide-react";
import { performanceCopy } from "../../i18n/tool";
import { trackEvent } from "../../lib/analytics";
import { computeAnalytics, emptyPerformanceData, parseOrdersFiles, parsePaymentFiles } from "./processing";
import { Dashboard, EmptyState, MarketplaceTabs, SmartStatusStrip, UploadBox } from "./components";

export function PerformanceSection({ lang }) {
  const [activeMarket, setActiveMarket] = useState("meesho");
  const [marketData, setMarketData] = useState({
    meesho: emptyPerformanceData(),
    flipkart: emptyPerformanceData(),
    amazon: emptyPerformanceData(),
  });
  const [error, setError] = useState("");
  const t = performanceCopy[lang] || performanceCopy.en;
  const activeData = useMemo(() => {
    if (activeMarket !== "overall") return marketData[activeMarket];
    return Object.values(marketData).reduce((merged, data) => ({
      orders: [...merged.orders, ...data.orders],
      payment: {
        orderPayments: [...merged.payment.orderPayments, ...data.payment.orderPayments],
        ads: [...merged.payment.ads, ...data.payment.ads],
      },
      status: { orders: [], payment: [] },
    }), emptyPerformanceData());
  }, [activeMarket, marketData]);
  const analytics = useMemo(() => computeAnalytics(activeData.orders, activeData.payment), [activeData]);

  const updateMarket = (market, patch) => {
    setMarketData((state) => ({
      ...state,
      [market]: { ...state[market], ...patch },
    }));
  };

  const onOrders = async (files) => {
    setError("");
    try {
      const list = Array.from(files);
      trackEvent("performance_report_upload", {
        marketplace: activeMarket,
        report_type: "orders",
        file_count: list.length,
      });
      updateMarket(activeMarket, {
        orders: await parseOrdersFiles(list),
        status: { ...marketData[activeMarket].status, orders: list.map((file) => file.name) },
      });
    } catch (err) {
      setError(err.message || "Orders file parse failed.");
    }
  };

  const onPayment = async (files) => {
    setError("");
    try {
      const list = Array.from(files);
      trackEvent("performance_report_upload", {
        marketplace: activeMarket,
        report_type: "payment",
        file_count: list.length,
      });
      updateMarket(activeMarket, {
        payment: await parsePaymentFiles(list),
        status: { ...marketData[activeMarket].status, payment: list.map((file) => file.name) },
      });
    } catch (err) {
      setError(err.message || "Payment file parse failed.");
    }
  };

  return (
    <section className="performance-page">
      <header className="topbar">
        <div>
          <h1>{t.appTitle}</h1>
          <p>{activeMarket === "overall" ? "All marketplace performance combined in one operating view." : t.subtitle}</p>
        </div>
      </header>

      <MarketplaceTabs active={activeMarket} onChange={(market) => {
        trackEvent("marketplace_tab_select", {
          module: "performance",
          marketplace: market,
        });
        setActiveMarket(market);
      }} />
      <SmartStatusStrip activeMarket={activeMarket} activeData={activeData} marketData={marketData} />

      {activeMarket !== "overall" && (
        <section className="upload-grid">
          <UploadBox icon={<FileSpreadsheet />} title={`${marketLabel(activeMarket)} ${t.orders}`} label="Upload one or more monthly Orders CSV files" status={activeData.status.orders} onFile={onOrders} accept=".csv" t={t} multiple />
          <UploadBox icon={<Upload />} title={`${marketLabel(activeMarket)} ${t.payment}`} label="Upload one or more monthly payment ZIP/XLSX files" status={activeData.status.payment} onFile={onPayment} accept=".zip,.xlsx,.xls" t={t} multiple />
        </section>
      )}

      {activeMarket !== "meesho" && activeMarket !== "overall" && (
        <div className="soft-warning market-note">
          The {marketLabel(activeMarket)} performance workspace is ready. The parser is currently optimized for Meesho-format reports; platform-specific columns will be added in the next pass.
        </div>
      )}

      {activeMarket === "overall" && (
        <section className="overall-strip">
          {["meesho", "flipkart", "amazon"].map((id) => (
            <div key={id}>
              <strong>{marketLabel(id)}</strong>
              <span>{num(marketData[id].orders.length)} orders</span>
            </div>
          ))}
        </section>
      )}

      {error && <div className="error"><AlertTriangle size={18} />{error}</div>}
      {!analytics ? <EmptyState text={t.noData} /> : <Dashboard analytics={analytics} t={t} lang={lang} />}
    </section>
  );
}

