import { ClipboardList, Download, Printer } from "lucide-react";

export function LabelOutputOptions({
  t,
  platform,
  quantityGroup,
  setQuantityGroup,
  outputMode,
  setOutputMode,
  outputType,
  setOutputType,
  printerType,
  setPrinterType,
  normalLayout,
  setNormalLayout,
  thermalLayout,
  setThermalLayout,
  busy,
}) {
  const quantityOptions = [
    { key: "all", label: t.allLabels },
    { key: "single", label: t.singleQty },
    { key: "multi", label: t.multiQty },
  ];
  const formatOptions = platform === "meesho"
    ? [
        { key: "layout", label: t.keepFullLabels },
        { key: "crop", label: t.cropLabels },
      ]
    : [{ key: "crop", label: t.cropLabels }];
  const outputOptions = [
    { key: "shipping", label: t.croppedShipping },
    { key: "billing", label: t.croppedBilling },
    { key: "combined", label: t.croppedCombined },
    { key: "picklist", label: t.downloadPicklist },
  ];
  const layoutOutputOptions = [
    { key: "labels", label: t.fullLabelsPdf },
    { key: "picklist", label: t.downloadPicklist },
  ];
  const changeOutputMode = (nextMode) => {
    setOutputMode(nextMode);
    if (nextMode === "crop") {
      setOutputType("shipping");
    } else {
      setOutputType("labels");
    }
  };

  return (
    <div className="label-output-options">
      <div className="quick-output-head">
        <div>
          <h3>{t.chooseOutput}</h3>
          <p>{t.chooseOutputHint}</p>
        </div>
      </div>
      <div className="radio-option-grid">
        <OptionRadioGroup
          title={t.quantityGroup}
          value={quantityGroup}
          onChange={setQuantityGroup}
          options={quantityOptions}
          disabled={busy}
        />
        {formatOptions.length > 1 ? (
          <OptionRadioGroup
            title={t.outputMode}
            value={outputMode}
            onChange={changeOutputMode}
            options={formatOptions}
            disabled={busy}
          />
        ) : null}
        {outputMode === "crop" ? (
          <OptionRadioGroup
            title={t.cropOutput || t.outputType}
            value={outputType}
            onChange={setOutputType}
            options={outputOptions}
            disabled={busy}
          />
        ) : null}
        {outputMode === "layout" ? (
          <OptionRadioGroup
            title={t.fullLabelOutput}
            value={outputType}
            onChange={setOutputType}
            options={layoutOutputOptions}
            disabled={busy}
          />
        ) : null}
      </div>
      {platform === "meesho" && outputMode === "layout" && outputType !== "picklist" ? (
        <div className="output-setup-grid output-layout-grid compact-layout-grid">
          <label>
            <span>{t.printerType}</span>
            <select value={printerType} onChange={(event) => setPrinterType(event.target.value)} disabled={busy}>
              <option value="normal">{t.normalPrinter}</option>
              <option value="thermal">{t.thermalPrinter}</option>
            </select>
          </label>
          <label>
            <span>{t.layout}</span>
            {printerType === "thermal" ? (
              <select value={thermalLayout} onChange={(event) => setThermalLayout(event.target.value)} disabled={busy}>
                <option value="3x5">{t.thermal3x5}</option>
                <option value="4x6">{t.thermal4x6}</option>
              </select>
            ) : (
              <select value={normalLayout} onChange={(event) => setNormalLayout(event.target.value)} disabled={busy}>
                <option value="1">{t.onePerPage}</option>
                <option value="4">{t.downloadFour}</option>
                <option value="6">{t.downloadSix}</option>
                <option value="9">{t.ninePerPage}</option>
              </select>
            )}
          </label>
        </div>
      ) : null}
    </div>
  );
}

function OptionRadioGroup({ title, value, onChange, options, disabled }) {
  return (
    <fieldset className="option-radio-group">
      <legend>{title}</legend>
      <div>
        {options.map((option) => (
          <label key={option.key} className={value === option.key ? "active" : ""}>
            <input
              type="radio"
              value={option.key}
              checked={value === option.key}
              onChange={() => onChange(option.key)}
              disabled={disabled}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ReadyOutputActions({ t, rows, busy, outputMode, outputType, onAction }) {
  const disabled = busy || !rows.length;
  return (
    <article className="label-output-setup">
      <div className="output-ready-line">
        <div>
          <strong>{t.outputReady}</strong>
          <small>{rows.length ? `${rows.length} labels selected · ${t.outputReadyHint}` : t.noSubset}</small>
        </div>
        {outputType === "picklist" ? (
          <button disabled={disabled} onClick={() => onAction("download")}>
            <ClipboardList size={15} /> {t.downloadPicklist}
          </button>
        ) : (
          <div className="output-final-actions">
            <button disabled={disabled} onClick={() => onAction("download")}>
              <Download size={15} /> {t.downloadPdf}
            </button>
            <button disabled={disabled} onClick={() => onAction("print")}>
              <Printer size={15} /> {t.printPdf}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
