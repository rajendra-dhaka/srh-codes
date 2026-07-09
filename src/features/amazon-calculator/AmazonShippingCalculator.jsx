import { useMemo, useState } from "react";
import { Calculator, IndianRupee, ShieldAlert } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { AMAZON_FULFILMENT_CHANNELS, AMAZON_REFERRAL_CATEGORIES, EASY_SHIP_STANDARD_FEES } from "../../constants/amazonFees";
import { amazonFeeCopy } from "../../i18n/tool";
import { trackEvent } from "../../lib/analytics";
import { moneyPrecise } from "../../utils/formatters";
import { CheckLine } from "../../components/common/CheckLine";
import { HelpTip } from "../../components/common/HelpTip";
import { MiniMetric } from "../../components/common/MiniMetric";
import { calculateEasyShipEstimate, calculateListingEstimate, formatWeight, positiveNumber } from "./calculator";

export function AmazonShippingCalculator() {
  const { lang } = useLanguage();
  const t = amazonFeeCopy[lang] || amazonFeeCopy.en;
  const [mode, setMode] = useState("listing");
  const [step, setStep] = useState("standard");
  const [shipmentType, setShipmentType] = useState("standard");
  const [zone, setZone] = useState("regional");
  const [weightGm, setWeightGm] = useState("500");
  const [lengthCm, setLengthCm] = useState("20");
  const [breadthCm, setBreadthCm] = useState("15");
  const [heightCm, setHeightCm] = useState("5");
  const [returnRisk, setReturnRisk] = useState("15");
  const [itemPrice, setItemPrice] = useState("499");
  const [saleGstRate, setSaleGstRate] = useState("18");
  const [productCost, setProductCost] = useState("180");
  const [productGstRate, setProductGstRate] = useState("18");
  const [packagingCost, setPackagingCost] = useState("10");
  const [packagingGstRate, setPackagingGstRate] = useState("18");
  const [adCost, setAdCost] = useState("20");
  const [adGstRate, setAdGstRate] = useState("18");
  const [targetProfit, setTargetProfit] = useState("50");
  const [categoryId, setCategoryId] = useState("packing_materials");
  const [customReferralRate, setCustomReferralRate] = useState("10");
  const [fulfilmentChannel, setFulfilmentChannel] = useState("easy_ship");
  const [includeShipping, setIncludeShipping] = useState(true);

  const result = useMemo(() => {
    return calculateEasyShipEstimate({ step, shipmentType, zone, weightGm, lengthCm, breadthCm, heightCm, returnRisk });
  }, [breadthCm, heightCm, lengthCm, returnRisk, shipmentType, step, weightGm, zone]);

  const listingResult = useMemo(() => calculateListingEstimate({
    itemPrice,
    saleGstRate,
    categoryId,
    customReferralRate,
    fulfilmentChannel,
    productCost,
    productGstRate,
    packagingCost,
    packagingGstRate,
    adCost,
    adGstRate,
    shippingFee: result.total,
    shippingGst: result.gst,
    includeShipping: includeShipping && fulfilmentChannel === "easy_ship",
    targetProfit,
  }), [adCost, adGstRate, categoryId, customReferralRate, fulfilmentChannel, includeShipping, itemPrice, packagingCost, packagingGstRate, productCost, productGstRate, result.gst, result.total, saleGstRate, targetProfit]);

  const stepOptions = Object.entries(EASY_SHIP_STANDARD_FEES);
  const shipmentOptions = [
    ["standard", t.standard],
    ["heavy", t.heavy],
    ["textbook", t.textbook],
  ];
  const zoneOptions = [
    ["local", t.local],
    ["regional", t.regional],
    ["national", t.national],
  ];

  return (
    <>
      <section className="module-header">
        <span>{t.kicker}</span>
        <h1>{t.title}<HelpTip text="Fees are estimated from the attached Amazon fee schedule and Easy Ship policy tables. Use Seller Central for final billing confirmation." /></h1>
        <p>{t.intro}</p>
      </section>

      <nav className="market-tabs amazon-mode-tabs">
        <button type="button" className={mode === "shipping" ? "active" : ""} onClick={() => setMode("shipping")}>
          {t.shippingTab}
        </button>
        <button type="button" className={mode === "listing" ? "active" : ""} onClick={() => setMode("listing")}>
          {t.listingTab}
        </button>
      </nav>

      <section className="shipping-calculator-grid">
        <div className="portal-card shipping-input-card">
          <h2><Calculator size={18} /> {mode === "listing" ? t.listingTab : t.shippingTab}</h2>

          {mode === "listing" && (
            <>
              <div className="calculator-field-grid">
                <NumberField label={`${t.itemPrice} (Rs)`} value={itemPrice} onChange={setItemPrice} help={t.tooltips.itemPrice} />
                <RateField label={`${t.saleGstRate} %`} value={saleGstRate} onChange={setSaleGstRate} help={t.tooltips.saleGstRate} />
                <NumberField label={`${t.productCost} (Rs)`} value={productCost} onChange={setProductCost} help={t.tooltips.productCost} />
                <RateField label={`${t.productGstRate} %`} value={productGstRate} onChange={setProductGstRate} help={t.tooltips.productGstRate} />
                <NumberField label={`${t.packagingCost} (Rs)`} value={packagingCost} onChange={setPackagingCost} help={t.tooltips.packagingCost} />
                <RateField label={`${t.packagingGstRate} %`} value={packagingGstRate} onChange={setPackagingGstRate} help={t.tooltips.packagingGstRate} />
                <NumberField label={`${t.adCost} (Rs)`} value={adCost} onChange={setAdCost} help={t.tooltips.adCost} />
                <RateField label={`${t.adGstRate} %`} value={adGstRate} onChange={setAdGstRate} help={t.tooltips.adGstRate} />
                <NumberField label={`${t.targetProfit} (Rs)`} value={targetProfit} onChange={setTargetProfit} help={t.tooltips.targetProfit} />
              </div>

              <label className="calculator-field full">
                <FieldLabel label={t.category} help={t.tooltips.category} />
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                  {AMAZON_REFERRAL_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>{category.label}</option>
                  ))}
                </select>
              </label>

              {categoryId === "custom" && (
                <NumberField label={t.customReferral} value={customReferralRate} onChange={setCustomReferralRate} help={t.tooltips.customReferral} />
              )}

              <label className="calculator-field full">
                <FieldLabel label={t.fulfilment} help={t.tooltips.fulfilment} />
                <div className="pill-selector">
                  {AMAZON_FULFILMENT_CHANNELS.map((channel) => (
                    <button
                      key={channel.id}
                      className={fulfilmentChannel === channel.id ? "active" : ""}
                      type="button"
                      onClick={() => setFulfilmentChannel(channel.id)}
                    >
                      {channel.label}
                    </button>
                  ))}
                </div>
              </label>

              {fulfilmentChannel === "easy_ship" && (
                <label className="amazon-toggle-row">
                  <input checked={includeShipping} type="checkbox" onChange={(event) => setIncludeShipping(event.target.checked)} />
                  <FieldLabel label={t.includeShipping} help={t.tooltips.includeShipping} />
                </label>
              )}
            </>
          )}

          <label className="calculator-field full">
            <FieldLabel label={t.step} help={t.tooltips.step} />
            <div className="pill-selector">
              {stepOptions.map(([id, option]) => (
                <button
                  key={id}
                  className={step === id ? "active" : ""}
                  type="button"
                  onClick={() => {
                    setStep(id);
                    trackEvent("amazon_fee_step_select", { step: id });
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </label>

          <label className="calculator-field full">
            <FieldLabel label={t.shipment} help={t.tooltips.shipment} />
            <div className="pill-selector">
              {shipmentOptions.map(([id, labelText]) => (
                <button
                  key={id}
                  className={shipmentType === id ? "active" : ""}
                  type="button"
                  onClick={() => setShipmentType(id)}
                >
                  {labelText}
                </button>
              ))}
            </div>
          </label>

          {shipmentType === "heavy" && (
            <label className="calculator-field full">
              <FieldLabel label={t.zone} help={t.tooltips.zone} />
              <div className="pill-selector">
                {zoneOptions.map(([id, labelText]) => (
                  <button key={id} className={zone === id ? "active" : ""} type="button" onClick={() => setZone(id)}>
                    {labelText}
                  </button>
                ))}
              </div>
            </label>
          )}

          <div className="calculator-field-grid">
            <NumberField label={`${t.actualWeight} (gm)`} value={weightGm} onChange={setWeightGm} help={t.tooltips.actualWeight} />
            <NumberField label={`${t.length} (cm)`} value={lengthCm} onChange={setLengthCm} help={t.tooltips.length} />
            <NumberField label={`${t.breadth} (cm)`} value={breadthCm} onChange={setBreadthCm} help={t.tooltips.breadth} />
            <NumberField label={`${t.height} (cm)`} value={heightCm} onChange={setHeightCm} help={t.tooltips.height} />
            <NumberField label={`${t.returnRisk} %`} value={returnRisk} onChange={setReturnRisk} help={t.tooltips.returnRisk} />
          </div>
        </div>

        {mode === "shipping" ? (
          <div className="portal-card fee-result-card">
          <h2><IndianRupee size={18} /> {t.summary}</h2>
          <div className="shipping-kpis">
            <MiniMetric label={t.chargeable} value={formatWeight(result.chargeableKg)} tone="blue" />
            <MiniMetric label={t.baseFee} value={moneyPrecise(result.baseFee)} tone="green" />
            <MiniMetric label={t.gst} value={moneyPrecise(result.gst)} tone="orange" />
            <MiniMetric label={t.total} value={moneyPrecise(result.total)} tone="purple" />
          </div>

          <div className="fee-highlight">
            <strong>{t.buffer}: {moneyPrecise(result.suggestedBuffer)}</strong>
            <span>
              {moneyPrecise(result.total)} Easy Ship + {moneyPrecise(result.returnRiskAmount)} return-risk buffer
              {positiveNumber(itemPrice) ? ` (${((result.suggestedBuffer / positiveNumber(itemPrice)) * 100).toFixed(1)}% of selling price)` : ""}
            </span>
          </div>

          <div className="comparison-card">
            <h3>{t.comparison}</h3>
            <div className="comparison-row">
              <span>{t.actual}</span>
              <strong>{formatWeight(result.actualSlabKg)}</strong>
              <em>{moneyPrecise(result.actualFee)} + GST</em>
            </div>
            <div className="comparison-row">
              <span>{t.volumetric}</span>
              <strong>{formatWeight(result.volumetricSlabKg)}</strong>
              <em>{moneyPrecise(result.volumetricFee)} + GST</em>
            </div>
            <div className="comparison-row selected">
              <span>{lang === "hi" ? "Used for billing" : "Used for billing"}</span>
              <strong>{result.volumetricHigher ? t.volumetric : t.actual}</strong>
              <em>{result.volumetricHigher ? t.volumetricHigh : t.actualHigh}</em>
            </div>
          </div>

          {result.heavyWarning && <p className="soft-warning">{t.dimensionWarning}</p>}
        </div>
        ) : (
          <div className="portal-card fee-result-card">
            <h2><IndianRupee size={18} /> {t.listingSummary}</h2>
            <div className="shipping-kpis">
              <MiniMetric label={t.netProfit} value={moneyPrecise(listingResult.profit)} tone={listingResult.profit >= 0 ? "green" : "red"} />
              <MiniMetric label={t.margin} value={`${(listingResult.margin * 100).toFixed(1)}%`} tone="blue" />
              <MiniMetric label={listingResult.gstCredit ? t.gstCredit : t.netGstPayable} value={moneyPrecise(listingResult.gstCredit || listingResult.netGstPayable)} tone={listingResult.gstCredit ? "green" : "orange"} />
              <MiniMetric label={t.breakEven} value={moneyPrecise(listingResult.breakEven)} tone="orange" />
              <MiniMetric label={t.suggestedPrice} value={moneyPrecise(listingResult.suggestedPrice)} tone="purple" />
            </div>

            <div className="fee-highlight">
              <strong>{t.totalCost}: {moneyPrecise(listingResult.totalCost)}</strong>
              <span>
                {t.taxableSale} {moneyPrecise(listingResult.taxableSaleValue)} + {t.outputGst} {moneyPrecise(listingResult.outputGst)}. {t.inputGst}: {moneyPrecise(listingResult.inputGstCredit)}
              </span>
            </div>

            <div className="comparison-card">
              <h3>{lang === "hi" ? "Cost breakup" : "Cost breakup"}</h3>
              <div className="comparison-row">
                <span>{t.taxableSale}</span>
                <strong>{moneyPrecise(listingResult.taxableSaleValue)}</strong>
                <em>{t.itemPrice} minus {t.outputGst}</em>
              </div>
              <div className="comparison-row">
                <span>{t.outputGst}</span>
                <strong>{moneyPrecise(listingResult.outputGst)}</strong>
                <em>{t.saleGstRate}</em>
              </div>
              <div className="comparison-row">
                <span>{t.amazonFees}</span>
                <strong>{moneyPrecise(listingResult.amazonFeesBeforeGst)}</strong>
                <em>{t.referralFee} + {t.closingFee}</em>
              </div>
              <div className="comparison-row">
                <span>{t.feeGst}</span>
                <strong>{moneyPrecise(listingResult.feeGst)}</strong>
                <em>18% GST</em>
              </div>
              <div className="comparison-row">
                <span>{t.inputGst}</span>
                <strong>{moneyPrecise(listingResult.inputGstCredit)}</strong>
                <em>Cost GST + Amazon fee GST + shipping GST</em>
              </div>
              <div className="comparison-row">
                <span>{listingResult.gstCredit ? t.gstCredit : t.netGstPayable}</span>
                <strong>{moneyPrecise(listingResult.gstCredit || listingResult.netGstPayable)}</strong>
                <em>{listingResult.gstCredit ? "Paid GST is higher than selling GST" : "Selling GST minus paid GST"}</em>
              </div>
              <div className="comparison-row">
                <span>Easy Ship</span>
                <strong>{moneyPrecise(listingResult.shipping)}</strong>
                <em>{moneyPrecise(listingResult.shippingBeforeGst)} + GST {moneyPrecise(listingResult.shippingInputGst)}</em>
              </div>
              <div className="comparison-row selected">
                <span>{t.netProfit}</span>
                <strong>{moneyPrecise(listingResult.profit)}</strong>
                <em>{listingResult.profit >= 0 ? "Profitable at this price" : "Increase price or reduce cost"}</em>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="portal-card fee-policy-card">
        <h2><ShieldAlert size={18} /> {t.policy}</h2>
        {mode === "listing" && <p className="soft-note">{t.listingNote}</p>}
        <div>
          {t.policyLines.map((line) => <CheckLine key={line} text={line} />)}
        </div>
      </section>
    </>
  );
}

function FieldLabel({ label, help }) {
  return (
    <span className="field-label">
      {label}
      {help ? <HelpTip text={help} /> : null}
    </span>
  );
}

function NumberField({ label, value, onChange, help }) {
  return (
    <label className="calculator-field">
      <FieldLabel label={label} help={help} />
      <input
        inputMode="decimal"
        min="0"
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function RateField({ label, value, onChange, help }) {
  return (
    <label className="calculator-field">
      <FieldLabel label={label} help={help} />
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {["0", "5", "12", "18", "28"].map((rate) => (
          <option key={rate} value={rate}>{rate}%</option>
        ))}
      </select>
    </label>
  );
}

