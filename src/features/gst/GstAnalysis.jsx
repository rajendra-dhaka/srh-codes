import { useState } from "react";
import { AlertTriangle, Calculator, CheckCircle2, ChevronRight, FileSpreadsheet, IndianRupee, ReceiptText, RotateCcw, ShieldAlert } from "lucide-react";
import { GST_STATE_OPTIONS } from "../../constants/gst";
import { MARKETPLACES } from "../../constants/marketplaces";
import { gstCopy, gstReturnCopy } from "../../i18n/tool";
import { trackEvent } from "../../lib/analytics";
import { CheckLine } from "../../components/common/CheckLine";
import { HelpTip } from "../../components/common/HelpTip";
import { buildGstr3bSummary, parseGstr2bSummary, parseMeeshoGstReport, parseMeeshoTaxInvoice, summarizeMeeshoGst, totalTaxVector } from "./gstProcessing";

export function GstAnalysis({ lang }) {
  const t = gstCopy[lang] || gstCopy.en;
  const r = gstReturnCopy[lang] || gstReturnCopy.en;
  const [returnType, setReturnType] = useState("gstr1");
  const [platform, setPlatform] = useState("meesho");
  const [files, setFiles] = useState({});
  const [threeBFiles, setThreeBFiles] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [threeBResult, setThreeBResult] = useState(null);
  const [homeState, setHomeState] = useState("");

  const onFile = async (key, file) => {
    setFiles((state) => ({ ...state, [key]: file }));
    setError("");
    setResult(null);
    trackEvent("gst_document_upload", {
      marketplace: platform,
      document_type: key,
      file_extension: file.name.split(".").pop()?.toLowerCase() || "unknown",
    });
  };

  const analyze = async () => {
    setBusy(true);
    setError("");
    try {
      trackEvent("gst_analysis_start", {
        marketplace: platform,
        document_count: Object.keys(files).length,
      });
      if (!files.gstReport) throw new Error("Meesho GST Report ZIP is required.");
      const gstReport = await parseMeeshoGstReport(files.gstReport);
      const docsRows = files.taxInvoice ? await parseMeeshoTaxInvoice(files.taxInvoice) : [];
      setResult(summarizeMeeshoGst(gstReport, docsRows, homeState));
      setThreeBResult(null);
      trackEvent("gst_analysis_complete", {
        marketplace: platform,
        has_tax_invoice: Boolean(files.taxInvoice),
        home_state: homeState || "auto",
      });
    } catch (err) {
      setError(err.message || "GST analysis failed.");
      trackEvent("gst_analysis_error", { marketplace: platform });
    } finally {
      setBusy(false);
    }
  };

  const onThreeBFile = (key, file) => {
    setThreeBFiles((state) => ({ ...state, [key]: file }));
    setThreeBResult(null);
    setError("");
    trackEvent("gst_document_upload", {
      marketplace: "overall",
      document_type: key,
      return_type: "gstr3b",
      file_extension: file.name.split(".").pop()?.toLowerCase() || "unknown",
    });
  };

  const analyzeThreeB = async () => {
    setBusy(true);
    setError("");
    try {
      if (!result) throw new Error(r.needGstr1);
      if (!threeBFiles.gstr2b) throw new Error("GSTR-2B Summary Excel is required.");
      const gstr2b = await parseGstr2bSummary(threeBFiles.gstr2b);
      setThreeBResult(buildGstr3bSummary(result, gstr2b));
      trackEvent("gst_analysis_complete", {
        marketplace: "overall",
        return_type: "gstr3b",
        has_system_generated_pdf: Boolean(threeBFiles.systemThreeB),
      });
    } catch (err) {
      setError(err.message || "GSTR-3B analysis failed.");
      trackEvent("gst_analysis_error", { marketplace: "overall", return_type: "gstr3b" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="gst-page">
      <div className="module-header">
        <div>
          <span>{t.kicker}</span>
          <h1>{returnType === "gstr1" ? t.title : r.threeBTitle}</h1>
          <p>{returnType === "gstr1" ? t.intro : r.threeBIntro}</p>
        </div>
        <div className="gst-return-switch" aria-label="GST return type">
          {["gstr1", "gstr3b"].map((id) => (
            <button key={id} className={returnType === id ? "active" : ""} onClick={() => {
              setReturnType(id);
              setError("");
              trackEvent("gst_return_tab_select", { return_type: id });
            }}>
              <strong>{r[id]}</strong>
              <small>{r[`${id}Hint`]}</small>
            </button>
          ))}
        </div>
      </div>

      {returnType === "gstr1" ? (
        <>
          <div className="platform-switch gst-market-switch">
            {["overall", "meesho", "flipkart", "amazon"].map((id) => (
              <button key={id} className={platform === id ? "active" : ""} onClick={() => {
                setPlatform(id);
                setError("");
                trackEvent("marketplace_tab_select", { module: "gst", marketplace: id });
              }}>{marketLabel(id)}</button>
            ))}
          </div>
          {platform === "meesho" ? (
            <>
              <section className="gst-layout guided">
                <div className="gst-upload-panel">
                  <h2>{t.docsTitle} <HelpTip text={t.docsHelp} /></h2>
                  <label className="state-field">
                    <span className="field-title"><span>{t.homeStateLabel}</span> <HelpTip text={t.homeStateHelp} /></span>
                    <select value={homeState} onChange={(event) => setHomeState(event.target.value)}>
                      <option value="">{t.homeStateAuto}</option>
                      {GST_STATE_OPTIONS.map((state) => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </label>
                  <DocUpload title={t.gstReport} hint={t.gstReportHint} help={t.gstReportHelp} requiredLabel={t.required} file={files.gstReport} onFile={(file) => onFile("gstReport", file)} required />
                  <DocUpload title={t.taxInvoice} hint={t.taxInvoiceHint} help={t.taxInvoiceHelp} requiredLabel={t.required} file={files.taxInvoice} onFile={(file) => onFile("taxInvoice", file)} required />
                  <DocUpload title={t.supplierInvoice} hint={t.supplierInvoiceHint} help={t.supplierInvoiceHelp} requiredLabel={t.required} file={files.supplierInvoice} onFile={(file) => onFile("supplierInvoice", file)} />
                  <DocUpload title={t.commission} hint={t.commissionHint} help={t.commissionHelp} requiredLabel={t.required} file={files.commissionBackup} onFile={(file) => onFile("commissionBackup", file)} />
                  {error && <div className="error"><AlertTriangle size={18} />{error}</div>}
                  <button className="primary-action" onClick={analyze} disabled={busy}>{busy ? t.analyzing : t.generate}</button>
                </div>
                <FilingGuide title={r.guideTitle} help={r.guideHelp} steps={r.gstr1Steps} />
              </section>
              {result && <GstResult result={result} lang={lang} />}
            </>
          ) : (
            <section className="portal-card gst-coming-soon">
              <h2>{t.comingTitle(platform)}</h2>
              <p>{t.comingBody(platform)}</p>
            </section>
          )}
        </>
      ) : (
        <>
          <section className="gst-layout guided">
            <div className="gst-upload-panel">
              <h2>{r.threeBTitle}</h2>
              <div className={`gst-source-status ${result ? "ready" : "pending"}`}>
                {result ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                <div>
                  <strong>{result ? r.liabilityReady : r.liabilityRequired}</strong>
                  <span>{result ? r.liabilitySummary(asMoney(result.totals.taxable), asMoney(result.totals.tax)) : r.needGstr1}</span>
                </div>
              </div>
              <DocUpload title={r.twoBTitle} hint={r.twoBHint} help={r.twoBHelp} requiredLabel={t.required} file={threeBFiles.gstr2b} onFile={(file) => onThreeBFile("gstr2b", file)} required />
              <DocUpload title={r.systemThreeBTitle} hint={r.systemThreeBHint} help={r.systemThreeBHelp} requiredLabel={t.required} file={threeBFiles.systemThreeB} onFile={(file) => onThreeBFile("systemThreeB", file)} />
              {error && <div className="error"><AlertTriangle size={18} />{error}</div>}
              <button className="primary-action" onClick={analyzeThreeB} disabled={busy}>{busy ? r.analyzeThreeB : r.generateThreeB}</button>
              <p className="gst-assistance-note"><ShieldAlert size={16} />{r.assistanceNote}</p>
            </div>
            <FilingGuide title={r.guideTitle} help={r.guideHelp} steps={r.gstr3bSteps} />
          </section>
          {!result && <button className="gst-back-to-one" onClick={() => setReturnType("gstr1")}><ChevronRight size={17} />{r.needGstr1}</button>}
          {threeBResult && <Gstr3bResult result={threeBResult} lang={lang} />}
        </>
      )}
    </section>
  );
}

function marketLabel(id) {
  return MARKETPLACES.find((market) => market.id === id)?.label || id;
}

function asMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="accordion">
      <button type="button" onClick={() => setOpen(!open)}><span>{title}</span><ChevronRight className={open ? "open" : ""} /></button>
      {open && <div>{children}</div>}
    </section>
  );
}

function Kpi({ label, value, tone, icon }) {
  return <div className={`kpi ${tone}`}><span>{icon}</span><small>{label}</small><strong>{value}</strong></div>;
}

function FilingGuide({ title, help, steps }) {
  return (
    <aside className="gst-guidance filing-guide">
      <h2>{title} <HelpTip text={help} /></h2>
      <div className="filing-steps">
        {steps.map(([step, detail], index) => (
          <Accordion key={step} title={step} defaultOpen={index === 0}>
            <p>{detail}</p>
          </Accordion>
        ))}
      </div>
    </aside>
  );
}

function DocUpload({ title, hint, help, file, onFile, required, requiredLabel = "required" }) {
  return (
    <label className="doc-upload">
      <input type="file" accept=".zip,.xlsx,.xls,.pdf" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      <div className="doc-icon"><FileSpreadsheet size={20} /></div>
      <div>
        <strong className="field-title"><span>{title}</span> {help && <HelpTip text={help} />} {required && <em>{requiredLabel}</em>}</strong>
        <span>{file ? file.name : hint}</span>
      </div>
    </label>
  );
}

function GstResult({ result, lang }) {
  const r = gstReturnCopy[lang] || gstReturnCopy.en;
  const table7Rows = result.states.map((row) => ({
    state: row.state,
    rate: 18,
    taxable: row.net,
    igst: row.state === result.homeState ? 0 : row.tax,
    cgst: row.state === result.homeState ? row.tax / 2 : 0,
    sgst: row.state === result.homeState ? row.tax / 2 : 0,
    cess: 0,
  }));
  const table14 = {
    gstin: "08AARCM9332R1CO",
    name: "MEESHO TECHNOLOGIES PRIVATE LIMITED",
    net: result.totals.taxable,
    igst: result.totals.igst,
    cgst: result.totals.cgst,
    sgst: result.totals.sgst,
  };
  return (
    <section className="gst-results">
      <div className="gst-kpis">
        <Kpi label="Gross taxable sales" value={`Rs ${asMoney(result.gross)}`} tone="blue" icon={<IndianRupee />} />
        <Kpi label="Returns taxable" value={`Rs ${asMoney(result.returns)}`} tone="orange" icon={<RotateCcw />} />
        <Kpi label="Net taxable" value={`Rs ${asMoney(result.totals.taxable)}`} tone="green" icon={<Calculator />} />
        <Kpi label="Net GST" value={`Rs ${asMoney(result.totals.tax)}`} tone="purple" icon={<ReceiptText />} />
        <Kpi label="Return match" value={`${result.rows.matchedReturns}/${result.rows.returnIds}`} tone={result.rows.matchedReturns === result.rows.returnIds ? "green" : "red"} icon={<CheckCircle2 />} />
      </div>

      <section className="portal-card">
        <h2>Table 7 - B2C Others</h2>
        <p>Add these rows state-wise in the portal. Local supplies for seller home state ({result.homeState}) are reported as CGST/SGST; other states are reported as IGST. Home state source: {result.homeStateSource}.</p>
        <PortalValueNote>{r.evaluatedValue}: taxable value and tax columns shown in every state row.</PortalValueNote>
        <CompactTable rows={table7Rows} columns={["state", "rate", "taxable", "igst", "cgst", "sgst", "cess"]} />
      </section>

      <section className="portal-card">
        <h2>Table 12 - HSN Summary, B2C Supplies tab</h2>
        <PortalValueNote>{r.evaluatedValue}: copy each HSN row into the B2C Supplies tab.</PortalValueNote>
        <CompactTable rows={result.hsn.map((row) => ({ ...row, rate: 18, uqc: "NOS" }))} columns={["hsn", "uqc", "qty", "totalValue", "taxable", "rate", "igst", "cgst", "sgst", "cess"]} />
      </section>

      <section className="portal-grid">
        <div className="portal-card">
          <h2>Table 13 - Documents Issued</h2>
          <CompactTable rows={result.docSummary} columns={["type", "from", "to", "count"]} />
          {!result.docSummary.length && <p className="soft-warning">Upload the Tax Invoice ZIP to populate the document series here.</p>}
        </div>
        <div className="portal-card">
          <h2>Table 14 - Supplies through ECO, u/s 52</h2>
          <CompactTable rows={[table14]} columns={["gstin", "name", "net", "igst", "cgst", "sgst"]} />
        </div>
      </section>
    </section>
  );
}

function PortalValueNote({ children }) {
  return <div className="portal-value-note"><CheckCircle2 size={16} /><span>{children}</span></div>;
}

function Gstr3bResult({ result, lang }) {
  const r = gstReturnCopy[lang] || gstReturnCopy.en;
  const itc = result.gstr2b;
  const table4Rows = [
    { table: "4(A)(1)", description: "Import of goods", ...itc.available.importGoods },
    { table: "4(A)(3)", description: "Inward supplies liable to reverse charge", ...itc.available.reverseCharge },
    { table: "4(A)(4)", description: "Inward supplies from ISD", ...itc.available.isd },
    { table: "4(A)(5)", description: "All other ITC", ...itc.available.allOther },
    { table: "4(B)(2)", description: "ITC reversal shown in GSTR-2B", ...itc.reversal },
    { table: "4(D)(2)", description: "ITC not available", ...itc.notAvailable },
    { table: "IMS", description: "Rejected ITC - do not claim", ...itc.rejected },
  ];
  const paymentRows = ["igst", "cgst", "sgst", "cess"].map((head) => ({
    taxHead: head.toUpperCase(),
    liability: result.liability[head],
    paidByItc: totalTaxVector(result.setoff.used[head]),
    cash: result.setoff.cash[head],
  }));
  const remainingItc = totalTaxVector(result.setoff.remaining);

  return (
    <section className="gst-results gstr3b-results">
      <div className="gst-kpis four">
        <Kpi label="Outward taxable value" value={`Rs ${asMoney(result.taxable)}`} tone="blue" icon={<IndianRupee />} />
        <Kpi label="Output GST liability" value={`Rs ${asMoney(totalTaxVector(result.liability))}`} tone="orange" icon={<ReceiptText />} />
        <Kpi label="Eligible ITC in GSTR-2B" value={`Rs ${asMoney(totalTaxVector(itc.available.total))}`} tone="green" icon={<CheckCircle2 />} />
        <Kpi label="Estimated cash required" value={`Rs ${asMoney(result.setoff.totalCash)}`} tone={result.setoff.totalCash ? "red" : "green"} icon={<Calculator />} />
      </div>

      <section className="portal-card">
        <h2>Table 3.1(a) - Outward taxable supplies</h2>
        <PortalValueNote>{r.evaluatedValue}: reconcile these totals with the auto-drafted GSTR-3B values.</PortalValueNote>
        <CompactTable rows={[{ taxable: result.taxable, ...result.liability }]} columns={["taxable", "igst", "cgst", "sgst", "cess"]} />
      </section>

      <section className="portal-card">
        <h2>Table 3.2 - Interstate B2C supplies</h2>
        <p>Total interstate taxable value Rs {asMoney(result.interstate.taxable)} and IGST Rs {asMoney(result.interstate.igst)}.</p>
        <CompactTable rows={result.interstateStates.map((row) => ({ state: row.state, taxable: row.net, igst: row.tax }))} columns={["state", "taxable", "igst"]} />
      </section>

      <section className="portal-card">
        <h2>Table 4 - Eligible ITC from GSTR-2B</h2>
        <PortalValueNote>{r.evaluatedValue}: claim available ITC only after checking the source invoices and eligibility conditions.</PortalValueNote>
        <CompactTable rows={table4Rows} columns={["table", "description", "igst", "cgst", "sgst", "cess"]} />
      </section>

      <section className="portal-grid gstr3b-final-grid">
        <div className="portal-card">
          <h2>Estimated ITC set-off</h2>
          <CompactTable rows={paymentRows} columns={["taxHead", "liability", "paidByItc", "cash"]} />
          <p className="soft-warning">The GST Portal applies available ledger balances and statutory rounding. Always verify the final Payment of Tax screen before posting credit.</p>
        </div>
        <div className="portal-card readiness-card">
          <h2>{r.readinessTitle}</h2>
          {r.readiness.map((text) => <CheckLine key={text} text={text} />)}
          <div className="remaining-credit"><span>Estimated ITC remaining after set-off</span><strong>Rs {asMoney(remainingItc)}</strong></div>
        </div>
      </section>
    </section>
  );
}

function CompactTable({ rows, columns }) {
  return (
    <div className="table-wrap compact-table">
      <table>
        <thead><tr>{columns.map((c) => <th key={c}>{label(c)}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.state || row.hsn || row.type || index}>
              {columns.map((c) => <td key={c}>{typeof row[c] === "number" ? asMoney(row[c]) : row[c]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
