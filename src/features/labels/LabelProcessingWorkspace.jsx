import { AlertTriangle, ClipboardList, Download, Printer, Upload } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { processingCopy } from "../../i18n/tool";
import { trackEvent } from "../../lib/analytics";
import { MARKETPLACE_ICONS, MARKETPLACES } from "../../constants/marketplaces";
import { HelpTip } from "../../components/common/HelpTip";
import { MiniMetric } from "../../components/common/MiniMetric";
import { LabelOutputOptions, ReadyOutputActions } from "./LabelOutputControls";
import { CountList, truncate } from "./LabelSummaryHelpers";
import { useLabelProcessingModel } from "./useLabelProcessingModel";

function marketLabel(id) {
  return MARKETPLACES.find((market) => market.id === id)?.label || id;
}

export function LabelProcessingWorkspace() {
  const { lang } = useLanguage();
  const t = processingCopy[lang] || processingCopy.en;
  const {
    platform,
    files,
    busy,
    error,
    toast,
    amazonInfoMode,
    amazonSortBySku,
    uploadInputKey,
    labelSortMode,
    labelQuantityGroup,
    labelOutputMode,
    labelOutputType,
    labelPrinterType,
    labelNormalLayout,
    labelThermalLayout,
    sortedItems,
    courierGroups,
    amazonOrders,
    counts,
    amazonCounts,
    amazonLineItems,
    selectedOutputRows,
    dispatch,
    onFiles,
    analyze,
    runConfiguredOutputAction,
    runAmazonAction,
    getConfiguredRows,
  } = useLabelProcessingModel(t);
  return (
    <section className="labels-page processing-page">
      <div className="module-header">
        <div>
          <span>{t.kicker}</span>
          <h1>{t.title} <HelpTip text={t.titleHelp} /></h1>
          <p>{t.intro}</p>
        </div>
        <div className="platform-switch">
          {["meesho", "flipkart", "amazon"].map((id) => (
            <button key={id} className={platform === id ? "active" : ""} onClick={() => {
              trackEvent("marketplace_tab_select", {
                module: "label_processing",
                marketplace: id,
              });
              dispatch({ type: "selectPlatform", platform: id });
            }}>
              {MARKETPLACE_ICONS[id] ? <img src={MARKETPLACE_ICONS[id]} alt="" /> : null}
              {marketLabel(id)}
            </button>
          ))}
        </div>
      </div>

      {platform === "amazon" ? (
        <section className="processing-layout amazon-processing-layout">
          <div className="label-workbench amazon-label-workbench">
            <label className="label-dropzone compact">
              <input
                key={`amazon-${uploadInputKey}`}
                type="file"
                accept="application/pdf,.pdf"
                multiple
                onClick={(event) => {
                  event.currentTarget.value = "";
                }}
                onChange={(e) => onFiles(e.target.files)}
              />
              <span className="label-drop-icon"><Upload size={26} /></span>
              <strong>{files.length ? `${files.length} Amazon PDF file${files.length > 1 ? "s" : ""} selected` : t.uploadTitle}</strong>
              <em>{files.length ? files.map((file) => file.name).join(", ") : "Upload Amazon Print Documents PDF"} <HelpTip text={t.amazonHelp} /></em>
            </label>

            <div className="amazon-option-section">
              <strong>{t.amazonNoteMode}</strong>
              <div className="amazon-option-grid">
                <button
                  type="button"
                  className={amazonInfoMode === "clean" ? "amazon-option-card active" : "amazon-option-card"}
                  onClick={() => dispatch({ type: "patch", patch: { amazonInfoMode: "clean" } })}
                >
                  <span>{t.amazonNoNote}</span>
                  <small>{t.amazonNoNoteHint}</small>
                </button>
                <button
                  type="button"
                  className={amazonInfoMode === "sku" ? "amazon-option-card active" : "amazon-option-card"}
                  onClick={() => dispatch({ type: "patch", patch: { amazonInfoMode: "sku" } })}
                >
                  <span>{t.amazonSkuOnly}</span>
                  <small>Best when invoice is not printed.</small>
                </button>
                <button
                  type="button"
                  className={amazonInfoMode === "description" ? "amazon-option-card active" : "amazon-option-card"}
                  onClick={() => dispatch({ type: "patch", patch: { amazonInfoMode: "description" } })}
                >
                  <span>{t.amazonSkuWithTitle}</span>
                  <small>Adds product identity on shipping label.</small>
                </button>
              </div>
            </div>

            <label className="amazon-toggle-line">
              <input
                type="checkbox"
                checked={amazonSortBySku}
                onChange={(event) => dispatch({ type: "patch", patch: { amazonSortBySku: event.target.checked } })}
              />
              <span>{t.amazonSortSku}</span>
            </label>

            {error && <div className="error"><AlertTriangle size={18} />{error}</div>}
            <button className="primary-action label-process" onClick={analyze} disabled={busy}>
              {busy ? t.analyzing : t.amazonPrepare}
            </button>

            {amazonOrders.length ? (
              <div className="amazon-action-panel">
                <div>
                  <strong>Shipping labels</strong>
                  <div className="amazon-action-row">
                    <button disabled={busy} onClick={() => runAmazonAction("download", "shipping")}>
                      <Download size={16} /> {t.amazonDownloadShipping}
                    </button>
                    <button disabled={busy} onClick={() => runAmazonAction("print", "shipping")}>
                      <Printer size={16} /> {t.amazonPrintShipping}
                    </button>
                  </div>
                </div>
                <div>
                  <strong>Billing pages</strong>
                  <div className="amazon-action-row">
                    <button disabled={busy} onClick={() => runAmazonAction("download", "billing")}>
                      <Download size={16} /> {t.amazonDownloadBilling}
                    </button>
                    <button disabled={busy} onClick={() => runAmazonAction("print", "billing")}>
                      <Printer size={16} /> {t.amazonPrintBilling}
                    </button>
                  </div>
                </div>
                <div>
                  <strong>Combined PDF</strong>
                  <div className="amazon-action-row">
                    <button disabled={busy} onClick={() => runAmazonAction("download", "combined")}>
                      <Download size={16} /> {t.amazonDownload}
                    </button>
                    <button disabled={busy} onClick={() => runAmazonAction("print", "combined")}>
                      <Printer size={16} /> {t.amazonPrint}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="processing-summary amazon-processing-summary">
            <h2>Amazon output</h2>
            {amazonOrders.length ? (
              <>
                <div className="processing-kpis">
                  <MiniMetric label="PDF files" value={files.length} tone="blue" />
                  <MiniMetric label={t.amazonOrders} value={amazonOrders.length} tone="green" />
                  <MiniMetric label={t.amazonItems} value={amazonLineItems.length} tone="orange" />
                  <MiniMetric label="Billing pages" value={amazonOrders.reduce((sum, order) => sum + (order.invoicePages?.length || 0), 0)} tone="purple" />
                </div>
                <CountList title={t.skuCounts} rows={amazonCounts.sku} />
                <CountList title={t.qtyCounts} rows={amazonCounts.skuQty} />
                <div className="amazon-preview-table">
                  <h3>{t.amazonPreview}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Seq</th>
                        <th>SKU</th>
                        <th>Qty</th>
                        <th>Title</th>
                        <th>Order ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amazonLineItems.slice(0, 8).map((item) => (
                        <tr key={`${item.orderSeq}-${item.itemSeq}-${item.sku}`}>
                          <td>{item.orderSeq}.{item.itemSeq}</td>
                          <td>{truncate(item.sku, 28)}</td>
                          <td>{item.qty || 1}</td>
                          <td>{truncate(item.title, 52)}</td>
                          <td>{truncate(item.orderId, 24)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="placeholder compact">
                <ClipboardList size={28} />
                <p>{t.amazonHelp}</p>
              </div>
            )}
            <div className="workflow-note">Amazon pages are separated with shipping and invoice text markers, then invoice pages stay attached until the next shipping label.</div>
          </div>
        </section>
      ) : (
      <section className="processing-layout">
        <div className="label-workbench">
          <label className="label-dropzone compact">
            <input
              key={`${platform}-${uploadInputKey}`}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              onClick={(event) => {
                event.currentTarget.value = "";
              }}
              onChange={(e) => onFiles(e.target.files)}
            />
            <span className="label-drop-icon"><Upload size={26} /></span>
            <strong>{files.length ? `${files.length} PDF file${files.length > 1 ? "s" : ""} selected` : t.uploadTitle}</strong>
            <em>{files.length ? files.map((file) => file.name).join(", ") : t.uploadHint} <HelpTip text={t.uploadHelp} /></em>
          </label>

          <label className="label-sort-control">
            <span>{t.sortBy}</span>
            <select value={labelSortMode} onChange={(event) => dispatch({ type: "patch", patch: { labelSortMode: event.target.value } })}>
              <option value="auto">{t.none}</option>
              <option value="courier">{t.courier}</option>
              <option value="sku">{t.sku}</option>
              <option value="courierSku">{t.courierSku}</option>
              <option value="seller">{t.seller}</option>
              <option value="sellerCourierSku">{t.sellerCourierSku}</option>
            </select>
          </label>

          {files.length ? (
            <LabelOutputOptions
              t={t}
              platform={platform}
              quantityGroup={labelQuantityGroup}
              setQuantityGroup={(value) => dispatch({ type: "patch", patch: { labelQuantityGroup: value } })}
              outputMode={labelOutputMode}
              setOutputMode={(value) => dispatch({ type: "patch", patch: { labelOutputMode: value } })}
              outputType={labelOutputType}
              setOutputType={(value) => dispatch({ type: "patch", patch: { labelOutputType: value } })}
              printerType={labelPrinterType}
              setPrinterType={(value) => dispatch({ type: "patch", patch: { labelPrinterType: value } })}
              normalLayout={labelNormalLayout}
              setNormalLayout={(value) => dispatch({ type: "patch", patch: { labelNormalLayout: value } })}
              thermalLayout={labelThermalLayout}
              setThermalLayout={(value) => dispatch({ type: "patch", patch: { labelThermalLayout: value } })}
              busy={busy}
            />
          ) : null}

          {error && <div className="error"><AlertTriangle size={18} />{error}</div>}
          <button className="primary-action label-process" onClick={analyze} disabled={busy}>
            {busy ? t.analyzing : t.analyze}
          </button>

        </div>

        <div className="processing-summary">
          <h2>{t.summary}</h2>
          {sortedItems.length ? (
            <>
              <div className="processing-kpis">
                <MiniMetric label="PDF files" value={files.length} tone="blue" />
                <MiniMetric label="Labels" value={sortedItems.length} tone="green" />
                <MiniMetric label="Couriers" value={counts.courier.length} tone="orange" />
                <MiniMetric label="SKUs" value={counts.sku.length} tone="purple" />
              </div>
              <div className="quick-output-panel">
                <div className="quick-output-head">
                  <div>
                    <h3>{t.outputActions}</h3>
                    <p>{t.outputActionsHint}</p>
                  </div>
                  <span>{sortedItems.length} labels</span>
                </div>
                <ReadyOutputActions
                  t={t}
                  rows={selectedOutputRows}
                  busy={busy}
                  outputMode={labelOutputMode}
                  outputType={labelOutputType}
                  onAction={(action) => runConfiguredOutputAction(sortedItems, action, t.allCouriers)}
                />
              </div>
              <div className="summary-accordion-stack">
                <CountList title={t.courierCounts} rows={counts.courier} initialOpen />
                <CountList title={t.sellerCounts} rows={counts.seller} />
                <CountList title={t.qtyCounts} rows={counts.skuQty} />
                <CountList title={t.skuCounts} rows={counts.sku} />
              </div>
            </>
          ) : (
            <div className="placeholder compact"><ClipboardList size={28} /><p>{t.noData}</p></div>
          )}
          <div className="workflow-note">{t.extractionNote}</div>
        </div>
      </section>
      )}

      {["meesho", "flipkart"].includes(platform) && sortedItems.length ? (
        <section className="portal-card courier-actions-panel">
          <div className="section-title-row">
            <h2>{t.advancedBatches}</h2>
            <span>{courierGroups.length} couriers</span>
          </div>
          <div className="courier-card-grid">
            {courierGroups.map((group) => (
              <details className="courier-accordion-card" key={group.courier}>
                <summary>
                  <span>{group.courier}</span>
                  <em>{group.rows.length} labels</em>
                </summary>
                <ReadyOutputActions
                  t={t}
                  rows={getConfiguredRows(group.rows)}
                  busy={busy}
                  outputMode={labelOutputMode}
                  outputType={labelOutputType}
                  onAction={(action) => runConfiguredOutputAction(group.rows, action, group.courier)}
                />
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {toast && <div className="snackbar">{toast}</div>}
    </section>
  );
}
