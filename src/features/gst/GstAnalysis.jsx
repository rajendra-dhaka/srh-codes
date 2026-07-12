import { useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Calculator, CheckCircle2, ChevronRight, Circle, ClipboardCheck, FileSpreadsheet, IndianRupee, Landmark, ReceiptText, RotateCcw, ShieldAlert, Store, UploadCloud } from "lucide-react";
import { GST_FILING_MONTHS, GST_FILING_YEARS, GST_STATE_OPTIONS, GSTR1_MARKETPLACE_DOCUMENTS } from "../../constants/gst";
import { MARKETPLACE_ICONS, MARKETPLACES } from "../../constants/marketplaces";
import { gstCopy, gstReturnCopy } from "../../i18n/tool";
import { trackEvent } from "../../lib/analytics";
import { CheckLine } from "../../components/common/CheckLine";
import { HelpTip } from "../../components/common/HelpTip";
import {
  buildGstr3bSummary,
  combineGstr1Summaries,
  parseAmazonGstReport,
  parseAmazonMonthlyMtr,
  parseFlipkartGstReport,
  parseFlipkartSalesReport,
  parseGstr2bSummary,
  parseMeeshoGstReport,
  parseMeeshoTaxInvoice,
  summarizeAmazonGst,
  summarizeFlipkartGst,
  summarizeMeeshoGst,
  totalTaxVector,
} from "./gstProcessing";

function getMarketplaceFile(files, marketplace, documentId) {
  return files?.[marketplace]?.[documentId] || null;
}

function getMissingRequiredUploads(files, selectedPlatforms) {
  return selectedPlatforms.flatMap((marketplace) => {
    const config = GSTR1_MARKETPLACE_DOCUMENTS[marketplace];
    if (!config) return [];
    return config.required
      .filter((document) => !getMarketplaceFile(files, marketplace, document.id))
      .map((document) => ({ marketplace, document }));
  });
}

export function GstAnalysis({ lang }) {
  const t = gstCopy[lang] || gstCopy.en;
  const r = gstReturnCopy[lang] || gstReturnCopy.en;
  const [returnType, setReturnType] = useState("gstr1");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["meesho"]);
  const [filingMonth, setFilingMonth] = useState("June");
  const [filingYear, setFilingYear] = useState("2026-27");
  const [files, setFiles] = useState({});
  const [threeBFiles, setThreeBFiles] = useState({});
  const [error, setError] = useState("");
  const [workspaceNotice, setWorkspaceNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [threeBResult, setThreeBResult] = useState(null);
  const [homeState, setHomeState] = useState("");
  const selectedPeriod = `${filingMonth} ${filingYear}`;
  const gstr1Steps = useMemo(() => buildGstr1Steps(selectedPlatforms, selectedPeriod, lang), [selectedPlatforms, selectedPeriod, lang]);
  const missingRequiredUploads = useMemo(() => getMissingRequiredUploads(files, selectedPlatforms), [files, selectedPlatforms]);
  const selectedUploadsComplete = missingRequiredUploads.length === 0;
  const requiredUploadCount = useMemo(
    () => selectedPlatforms.reduce((count, marketplace) => count + (GSTR1_MARKETPLACE_DOCUMENTS[marketplace]?.required.length || 0), 0),
    [selectedPlatforms],
  );
  const uploadedRequiredCount = requiredUploadCount - missingRequiredUploads.length;
  const progressPercent = requiredUploadCount ? Math.round((uploadedRequiredCount / requiredUploadCount) * 100) : 0;

  const onFile = async (marketplace, key, file) => {
    setFiles((state) => ({
      ...state,
      [marketplace]: {
        ...(state[marketplace] || {}),
        [key]: file,
      },
    }));
    setError("");
    setWorkspaceNotice("");
    setResult(null);
    trackEvent("gst_document_upload", {
      marketplace,
      document_type: key,
      file_extension: file.name.split(".").pop()?.toLowerCase() || "unknown",
    });
  };

  const togglePlatform = (id) => {
    setSelectedPlatforms((current) => {
      if (current.includes(id)) {
        return current.length === 1 ? current : current.filter((item) => item !== id);
      }
      return [...current, id];
    });
    setError("");
    setWorkspaceNotice("");
    setResult(null);
    trackEvent("gst_marketplace_select", { module: "gst", marketplace: id });
  };

  const analyze = async () => {
    setBusy(true);
    setError("");
    setWorkspaceNotice("");
    try {
      trackEvent("gst_analysis_start", {
        marketplace: selectedPlatforms.join(","),
        document_count: selectedPlatforms.reduce((count, marketplace) => count + Object.keys(files[marketplace] || {}).length, 0),
      });
      const missing = getMissingRequiredUploads(files, selectedPlatforms);
      if (missing.length) throw new Error(`Upload required files first: ${missing.map((item) => `${marketLabel(item.marketplace)} ${item.document.title}`).join(", ")}.`);
      const summaries = [];
      if (selectedPlatforms.includes("meesho")) {
        const meeshoFiles = files.meesho || {};
        const gstReport = await parseMeeshoGstReport(meeshoFiles.gstReport);
        const docsRows = await parseMeeshoTaxInvoice(meeshoFiles.taxInvoice);
        summaries.push(summarizeMeeshoGst(gstReport, docsRows, homeState));
      }
      if (selectedPlatforms.includes("flipkart")) {
        const flipkartFiles = files.flipkart || {};
        const gstReport = await parseFlipkartGstReport(flipkartFiles.gstReturnReport);
        const salesReport = await parseFlipkartSalesReport(flipkartFiles.salesReport);
        summaries.push(summarizeFlipkartGst(gstReport, salesReport, homeState));
      }
      if (selectedPlatforms.includes("amazon")) {
        const amazonFiles = files.amazon || {};
        const gstReport = await parseAmazonGstReport(amazonFiles.readyToFileReport);
        const mtrRows = await parseAmazonMonthlyMtr(amazonFiles.monthlyTransactionReport);
        summaries.push(summarizeAmazonGst(gstReport, mtrRows, homeState));
      }
      const combined = combineGstr1Summaries(summaries, homeState);
      if (!combined) throw new Error("No taxable GSTR-1 rows were found in the uploaded marketplace files.");
      setResult(combined);
      setThreeBResult(null);
      trackEvent("gst_analysis_complete", {
        marketplace: selectedPlatforms.join(","),
        home_state: homeState || "auto",
      });
    } catch (err) {
      setError(err.message || "GST analysis failed.");
      trackEvent("gst_analysis_error", { marketplace: "meesho" });
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
          <GstFilingHero
            t={t}
            selectedPeriod={selectedPeriod}
            selectedPlatforms={selectedPlatforms}
            uploadedRequiredCount={uploadedRequiredCount}
            requiredUploadCount={requiredUploadCount}
            progressPercent={progressPercent}
          />
          <Gstr1Setup
            t={t}
            filingMonth={filingMonth}
            filingYear={filingYear}
            selectedPlatforms={selectedPlatforms}
            onMonth={setFilingMonth}
            onYear={setFilingYear}
            onTogglePlatform={togglePlatform}
          />
          <section className="gst-layout guided">
            <div className="gst-upload-panel">
              <div className="gst-panel-title">
                <div>
                  <span>{t.stepOne}</span>
                  <h2>{t.docsTitle} <HelpTip text={t.docsHelp} /></h2>
                </div>
                <strong>{uploadedRequiredCount}/{requiredUploadCount}</strong>
              </div>
              <MarketplaceUploadCards
                t={t}
                files={files}
                selectedPlatforms={selectedPlatforms}
                homeState={homeState}
                onHomeState={setHomeState}
                onFile={onFile}
              />
              {error && <div className="error"><AlertTriangle size={18} />{error}</div>}
              {workspaceNotice && (
                <div className="gst-source-status ready">
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>{t.manualOnlyTitle}</strong>
                    <span>{workspaceNotice}</span>
                  </div>
                </div>
              )}
              <div className={`gst-final-action ${selectedUploadsComplete ? "ready" : ""}`}>
                <div>
                  <span>{selectedUploadsComplete ? t.readyToGenerate : t.notReadyYet}</span>
                  <strong>{selectedUploadsComplete ? t.allRequiredReady : t.requiredPending(missingRequiredUploads.length)}</strong>
                </div>
                <button className="primary-action" onClick={analyze} disabled={busy || !selectedUploadsComplete}>{busy ? t.analyzing : t.generate}</button>
              </div>
            </div>
            <FilingGuide title={`${r.guideTitle} - ${selectedPeriod}`} help={r.guideHelp} steps={gstr1Steps} />
          </section>
          {result && <GstResult result={result} lang={lang} />}
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

function GstFilingHero({ t, selectedPeriod, selectedPlatforms, uploadedRequiredCount, requiredUploadCount, progressPercent }) {
  const selectedNames = selectedPlatforms.map(marketLabel).join(", ");
  return (
    <section className="gst-filing-hero">
      <div>
        <span className="gst-kicker">{t.freeHelperKicker}</span>
        <h2>{t.heroTitle}</h2>
        <p>{t.heroBody}</p>
      </div>
      <div className="gst-readiness-card">
        <div className="gst-readiness-ring" style={{ "--gst-progress": `${progressPercent}%` }}>
          <strong>{progressPercent}%</strong>
          <span>ready</span>
        </div>
        <div>
          <span>{selectedPeriod}</span>
          <strong>{uploadedRequiredCount}/{requiredUploadCount} required files</strong>
          <p>{selectedNames}</p>
        </div>
      </div>
    </section>
  );
}

function marketLabel(id) {
  return MARKETPLACES.find((market) => market.id === id)?.label || id;
}

function asMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Gstr1Setup({ t, filingMonth, filingYear, selectedPlatforms, onMonth, onYear, onTogglePlatform }) {
  return (
    <section className="gst-filing-setup">
      <div className="gst-period-card">
        <div className="setup-icon"><CalendarDays size={20} /></div>
        <div>
          <strong>{t.periodTitle}</strong>
          <span>{t.periodHelp}</span>
        </div>
        <div className="gst-period-fields">
          <select value={filingMonth} onChange={(event) => onMonth(event.target.value)} aria-label="GST filing month">
            {GST_FILING_MONTHS.map((month) => <option key={month} value={month}>{month}</option>)}
          </select>
          <select value={filingYear} onChange={(event) => onYear(event.target.value)} aria-label="GST filing financial year">
            {GST_FILING_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      </div>
      <div className="gst-platform-card">
        <div className="setup-icon"><Store size={20} /></div>
        <div className="gst-platform-copy">
          <strong>{t.platformTitle}</strong>
          <span>{t.platformHelp}</span>
        </div>
        <div className="gst-platform-select">
          {Object.keys(GSTR1_MARKETPLACE_DOCUMENTS).map((id) => {
            const selected = selectedPlatforms.includes(id);
            return (
              <button key={id} type="button" className={selected ? "active" : ""} onClick={() => onTogglePlatform(id)} aria-pressed={selected}>
                <img src={MARKETPLACE_ICONS[id]} alt="" />
                <span>{marketLabel(id)}</span>
                <CheckCircle2 size={16} />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MarketplaceUploadCards({ t, files, selectedPlatforms, homeState, onHomeState, onFile }) {
  return (
    <div className="gst-marketplace-upload-grid">
      {selectedPlatforms.map((id) => {
        const config = GSTR1_MARKETPLACE_DOCUMENTS[id];
        const requiredDone = config.required.filter((document) => getMarketplaceFile(files, id, document.id)).length;
        const totalRequired = config.required.length;
        return (
          <article key={id} className={`gst-marketplace-upload-card ${requiredDone === totalRequired ? "complete" : ""}`}>
            <div className="gst-doc-card-head">
              <img src={MARKETPLACE_ICONS[id]} alt="" />
              <div>
                <strong>{config.label}</strong>
                <span>{requiredDone === totalRequired ? t.marketReady : t.marketPending(totalRequired - requiredDone)}</span>
              </div>
              <em>{requiredDone}/{totalRequired} ready</em>
            </div>
            <div className="gst-table-tags">
              {config.portalTables.map((table) => <span key={table}>{table}</span>)}
            </div>
            {id === "meesho" && (
              <label className="state-field">
                <span className="field-title"><span>{t.homeStateLabel}</span> <HelpTip text={t.homeStateHelp} /></span>
                <select value={homeState} onChange={(event) => onHomeState(event.target.value)}>
                  <option value="">{t.homeStateAuto}</option>
                  {GST_STATE_OPTIONS.map((state) => <option key={state} value={state}>{state}</option>)}
                </select>
              </label>
            )}
            <div className="gst-doc-section">
              <small>{t.requiredForGstr1}</small>
              {config.required.map((document) => (
                <DocUpload
                  key={document.id}
                  title={document.title}
                  hint={document.hint}
                  help={document.help}
                  requiredLabel={t.required}
                  file={getMarketplaceFile(files, id, document.id)}
                  onFile={(file) => onFile(id, document.id, file)}
                  required
                  compact
                />
              ))}
            </div>
            <div className="gst-doc-section optional">
              <small>{t.optionalBackup}</small>
              {config.optional.map((document) => (
                <DocUpload
                  key={document.id}
                  title={document.title}
                  hint={document.hint}
                  help={document.help}
                  file={getMarketplaceFile(files, id, document.id)}
                  onFile={(file) => onFile(id, document.id, file)}
                  compact
                />
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function buildGstr1Steps(selectedPlatforms, selectedPeriod, lang) {
  const isHindi = lang === "hi";
  const selectedNames = selectedPlatforms.map(marketLabel).join(" + ");
  const uploadText = isHindi
    ? `${selectedPeriod} के लिए सिर्फ ${selectedNames} की reports use करो. जिन platforms पर sale नहीं हुई उन्हें skip रखो.`
    : `Use only ${selectedNames} reports for ${selectedPeriod}. Skip marketplaces with no sales for the selected month.`;
  const b2cText = isHindi
    ? "हर selected marketplace की B2C state-wise taxable value combine करके Table 7 में POS, rate, taxable value और tax भरो. Differential percentage checkbox unticked रखो."
    : "Combine state-wise B2C taxable values from the selected marketplaces, then fill POS, rate, taxable value and tax in Table 7. Keep differential percentage unchecked.";
  const hsnText = isHindi
    ? "Selected marketplaces के HSN rows को HSN code wise combine करो. B2C Supplies tab में quantity, taxable value, IGST, CGST, SGST और cess भरो."
    : "Combine HSN rows from the selected marketplaces by HSN code. In the B2C Supplies tab, fill quantity, taxable value, IGST, CGST, SGST and cess.";
  const docsText = isHindi
    ? "Invoice और credit-note document series selected marketplaces से भरो. Commission/TDS reports को यहां मत भरो; वे reconciliation/3B backup हैं."
    : "Fill invoice and credit-note document series from the selected marketplaces. Do not enter commission or TDS reports here; they are reconciliation/3B backup.";

  return [
    [isHindi ? "Return period" : "Return period", isHindi ? `GST Portal पर ${selectedPeriod} GSTR-1 > Prepare Online खोलो.` : `Open GSTR-1 > Prepare Online for ${selectedPeriod} on the GST portal.`, CalendarDays],
    [isHindi ? "Source reports" : "Source reports", uploadText, UploadCloud],
    [isHindi ? "Table 7 - B2C Others" : "Table 7 - B2C Others", b2cText, Landmark],
    [isHindi ? "Table 12 - HSN Summary" : "Table 12 - HSN Summary", hsnText, ClipboardCheck],
    [isHindi ? "Table 13 - Documents Issued" : "Table 13 - Documents Issued", docsText, ReceiptText],
    [isHindi ? "Reconcile and file" : "Reconcile and file", isHindi ? "Generate Summary करके preview PDF download करो. Table 7 taxable total, HSN total और total tax match करके EVC/DSC से file करो." : "Generate Summary, download the preview PDF, match Table 7 taxable total, HSN total and total tax, then file with EVC/DSC.", CheckCircle2],
  ];
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
      <div className="gst-panel-title">
        <div>
          <span>Portal roadmap</span>
          <h2>{title} <HelpTip text={help} /></h2>
        </div>
      </div>
      <div className="filing-steps">
        {steps.map(([step, detail, Icon], index) => {
          const StepIcon = Icon || Circle;
          return (
            <section key={step} className="gst-filing-step">
              <div className="gst-step-number">{index + 1}</div>
              <div className="gst-step-icon"><StepIcon size={17} /></div>
              <div>
                <strong>{step}</strong>
                <p>{detail}</p>
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}

function DocUpload({ title, hint, help, file, onFile, required, requiredLabel = "required", compact = false }) {
  return (
    <label className={`doc-upload ${compact ? "compact" : ""} ${file ? "has-file" : ""}`}>
      <input type="file" accept=".zip,.xlsx,.xls,.pdf" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      <div className="doc-icon">{file ? <CheckCircle2 size={20} /> : <FileSpreadsheet size={20} />}</div>
      <div>
        <strong className="field-title"><span>{title}</span> {help && <HelpTip text={help} />} {required && <em>{requiredLabel}</em>}</strong>
        <span>{file ? file.name : hint}</span>
      </div>
      <b>{file ? "Replace" : "Upload"}</b>
    </label>
  );
}

function GstResult({ result, lang }) {
  const r = gstReturnCopy[lang] || gstReturnCopy.en;
  const hsnRows = result.hsn.map((row) => ({ ...row, rate: 18, uqc: "NOS" }));
  const negativeHsnRows = hsnRows.filter((row) => row.taxable < 0 || row.qty < 0);
  const table7Rows = result.states.map((row) => ({
    state: row.state,
    rate: 18,
    taxable: row.net,
    igst: row.state === result.homeState ? 0 : row.tax,
    cgst: row.state === result.homeState ? row.tax / 2 : 0,
    sgst: row.state === result.homeState ? row.tax / 2 : 0,
    cess: 0,
  }));
  const table14Rows = result.eco?.length ? result.eco : [];
  return (
    <section className="gst-results">
      <div className="gst-kpis">
        <Kpi label="Gross taxable sales" value={`Rs ${asMoney(result.gross)}`} tone="blue" icon={<IndianRupee />} />
        <Kpi label="Returns taxable" value={`Rs ${asMoney(result.returns)}`} tone="orange" icon={<RotateCcw />} />
        <Kpi label="Portal taxable" value={`Rs ${asMoney(result.totals.taxable)}`} tone="green" icon={<Calculator />} />
        <Kpi label="Net GST" value={`Rs ${asMoney(result.totals.tax)}`} tone="purple" icon={<ReceiptText />} />
        <Kpi label="Return trace" value={`${result.rows.matchedReturns}/${result.rows.returnIds}`} tone="blue" icon={<CheckCircle2 />} />
      </div>

      {Boolean(result.marketplaces?.length) && (
        <section className="portal-card">
          <h2>Marketplace reconciliation</h2>
          <p>Use this first if totals look unexpected. Gross and returns are audit values; portal taxable is the net value after marketplace return/credit-note impact.</p>
          {result.rows.returnIds > result.rows.matchedReturns && (
            <p className="soft-warning">Return trace is informational only. Unmatched returns usually mean the original sale happened in an earlier month; all uploaded marketplace returns are still reduced from portal taxable.</p>
          )}
          <CompactTable
            rows={result.marketplaces.map((marketplace) => ({
              marketplace: marketplace.marketplace,
              gross: marketplace.gross,
              returns: marketplace.returns,
              portalTaxable: marketplace.totals?.taxable,
              gst: marketplace.totals?.tax,
              sourceRows: marketplace.rows?.sourceLabel || `${marketplace.rows?.sales || 0} sales / ${marketplace.rows?.returns || 0} returns`,
            }))}
            columns={["marketplace", "gross", "returns", "portalTaxable", "gst", "sourceRows"]}
          />
        </section>
      )}

      <section className="portal-card">
        <h2>Table 7 - B2C Others</h2>
        <p>Add these rows state-wise in the portal. Local supplies for seller home state ({result.homeState}) are reported as CGST/SGST; other states are reported as IGST. Home state source: {result.homeStateSource}.</p>
        <PortalValueNote>{r.evaluatedValue}: use the net taxable values below, not gross sales. Returns/credit notes are already reduced from the selected marketplace reports.</PortalValueNote>
        <CompactTable rows={table7Rows} columns={["state", "rate", "taxable", "igst", "cgst", "sgst", "cess"]} />
      </section>

      <section className="portal-card">
        <h2>Table 12 - HSN Summary, B2C Supplies tab</h2>
        <PortalValueNote>{r.evaluatedValue}: total HSN taxable should match Table 7 taxable. Review any negative HSN row before filing because it means returns exceeded sales for that HSN in this month.</PortalValueNote>
        {negativeHsnRows.length > 0 && (
          <p className="soft-warning">{negativeHsnRows.length} HSN row(s) are negative after returns. Do not paste blindly if the GST portal rejects negative values; use marketplace credit-note details for review.</p>
        )}
        <CompactTable rows={hsnRows} columns={["hsn", "uqc", "qty", "totalValue", "taxable", "rate", "igst", "cgst", "sgst", "cess"]} />
      </section>

      <section className="portal-grid">
        <div className="portal-card">
          <h2>Table 13 - Documents Issued</h2>
          <CompactTable rows={result.docSummary} columns={["marketplace", "type", "from", "to", "count"]} />
          {!result.docSummary.length && <p className="soft-warning">Upload the Tax Invoice ZIP to populate the document series here.</p>}
        </div>
        <div className="portal-card">
          <h2>Table 14 - Supplies through ECO, u/s 52</h2>
          <CompactTable rows={table14Rows} columns={["gstin", "name", "net", "igst", "cgst", "sgst"]} />
          {!table14Rows.length && <p className="soft-warning">No ECO rows were found in the uploaded marketplace files.</p>}
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
        <thead><tr>{columns.map((c) => <th key={c}>{formatColumnLabel(c)}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${index}-${row.marketplace || ""}-${row.state || ""}-${row.hsn || ""}-${row.type || ""}-${row.from || ""}-${row.to || ""}`}>
              {columns.map((c) => <td key={c}>{typeof row[c] === "number" ? asMoney(row[c]) : row[c]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatColumnLabel(value) {
  return String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
