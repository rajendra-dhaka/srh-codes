import { AMAZON_REFERRAL_CATEGORIES, EASY_SHIP_HEAVY_ADDITIONAL, EASY_SHIP_HEAVY_FEES, EASY_SHIP_STANDARD_FEES, GST_RATE } from "../../constants/amazonFees";

export function positiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function roundStandardWeightKg(weightKg) {
  if (weightKg <= 0) return 0.5;
  if (weightKg <= 0.5) return 0.5;
  if (weightKg <= 1) return 1;
  if (weightKg <= 2) return 2;
  return Math.ceil(weightKg);
}

function roundHeavyWeightKg(weightKg) {
  return Math.max(12, Math.ceil(weightKg || 0));
}

function calculateStandardFee(step, chargeableKg) {
  const slab = EASY_SHIP_STANDARD_FEES[step] || EASY_SHIP_STANDARD_FEES.standard;
  if (chargeableKg <= 0.5) return slab.first500;
  if (chargeableKg <= 1) return slab.upTo1kg;
  if (chargeableKg <= 2) return slab.upTo2kg;
  const roundedKg = Math.ceil(chargeableKg);
  const kgAfter2Until5 = Math.max(0, Math.min(roundedKg, 5) - 2);
  const kgAfter5 = Math.max(0, roundedKg - 5);
  return slab.upTo2kg + kgAfter2Until5 * slab.after2 + kgAfter5 * slab.after5;
}

function calculateTextbookFee(chargeableKg) {
  const kg = Math.max(0.5, chargeableKg || 0.5);
  if (kg <= 0.5) return 9.4;
  if (kg <= 1) return 9.4 + 1.9;
  const roundedKg = Math.ceil(kg);
  const kgAfter1Until5 = Math.max(0, Math.min(roundedKg, 5) - 1);
  const kgAfter5 = Math.max(0, roundedKg - 5);
  return 9.4 + 1.9 + kgAfter1Until5 * 2.2 + kgAfter5 * 1;
}

function calculateHeavyFee(step, zone, chargeableKg) {
  const baseByZone = EASY_SHIP_HEAVY_FEES[step] || EASY_SHIP_HEAVY_FEES.standard;
  const base = baseByZone[zone] || baseByZone.regional;
  const additional = EASY_SHIP_HEAVY_ADDITIONAL[zone] || EASY_SHIP_HEAVY_ADDITIONAL.regional;
  return base + Math.max(0, Math.ceil(chargeableKg) - 12) * additional;
}

export function calculateEasyShipEstimate({ step, shipmentType, zone, weightGm, lengthCm, breadthCm, heightCm, returnRisk }) {
  const actualKg = positiveNumber(weightGm) / 1000;
  const l = positiveNumber(lengthCm);
  const b = positiveNumber(breadthCm);
  const h = positiveNumber(heightCm);
  const volumetricKg = l && b && h ? (l * b * h) / 5000 : 0;
  const rounder = shipmentType === "heavy" ? roundHeavyWeightKg : roundStandardWeightKg;
  const actualSlabKg = rounder(actualKg);
  const volumetricSlabKg = rounder(volumetricKg);
  const chargeableKg = Math.max(actualSlabKg, volumetricSlabKg);
  const calculateFee = (kg) => {
    if (shipmentType === "heavy") return calculateHeavyFee(step, zone, kg);
    if (shipmentType === "textbook") return calculateTextbookFee(kg);
    return calculateStandardFee(step, kg);
  };
  const baseFee = calculateFee(chargeableKg);
  const actualFee = calculateFee(actualSlabKg);
  const volumetricFee = calculateFee(volumetricSlabKg);
  const gst = baseFee * GST_RATE;
  const total = baseFee + gst;
  const returnRiskAmount = total * (positiveNumber(returnRisk) / 100);
  const girth = l + 2 * (b + h);
  return {
    actualKg,
    volumetricKg,
    actualSlabKg,
    volumetricSlabKg,
    chargeableKg,
    baseFee,
    actualFee,
    volumetricFee,
    gst,
    total,
    suggestedBuffer: total + returnRiskAmount,
    returnRiskAmount,
    girth,
    heavyWarning: actualKg > 22.5 || Math.max(l, b, h) > 183 || girth > 300,
    volumetricHigher: volumetricSlabKg > actualSlabKg,
  };
}

function getReferralRate(categoryId, itemPrice, customReferralRate) {
  if (categoryId === "custom") return positiveNumber(customReferralRate);
  const category = AMAZON_REFERRAL_CATEGORIES.find((item) => item.id === categoryId) || AMAZON_REFERRAL_CATEGORIES[0];
  const slab = category.slabs.find((item) => item.max === undefined || itemPrice <= item.max) || category.slabs.at(-1);
  return slab?.rate || 0;
}

function getClosingFee(channel, itemPrice, categoryId) {
  const category = AMAZON_REFERRAL_CATEGORIES.find((item) => item.id === categoryId);
  if (category?.closingProfile === "textbook") {
    if (channel === "fulfilment_centre") {
      if (itemPrice <= 500) return 2.4;
      if (itemPrice <= 1000) return 3;
      if (itemPrice <= 1500) return 6;
      return 30;
    }
    if (channel === "seller_flex") {
      if (itemPrice <= 250) return 1.6;
      if (itemPrice <= 500) return 2.2;
      if (itemPrice <= 1000) return 6;
      return 9;
    }
    if (itemPrice <= 250) return 0.75;
    if (itemPrice <= 500) return 1.2;
    if (itemPrice <= 1000) return 4.2;
    return 7.5;
  }

  if (channel === "self_ship") {
    if (itemPrice <= 300) return 20;
    if (itemPrice <= 500) return 26;
    if (itemPrice <= 1000) return 51;
    return 101;
  }
  if (channel === "seller_flex") {
    if (itemPrice <= 300) return 6;
    if (itemPrice <= 500) return 12;
    if (itemPrice <= 1000) return 35;
    return 66;
  }
  if (channel === "fulfilment_centre") {
    if (itemPrice <= 300) return 26;
    if (itemPrice <= 500) return 22;
    if (itemPrice <= 1000) return 27;
    return 52;
  }
  if (itemPrice <= 300) return 1;
  if (itemPrice <= 500) return 22;
  if (itemPrice <= 1000) return 45;
  return 76;
}

export function calculateListingEstimate({
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
  shippingFee,
  shippingGst,
  includeShipping,
  targetProfit,
}) {
  const price = positiveNumber(itemPrice);
  const outputRate = positiveNumber(saleGstRate) / 100;
  const taxableSaleValue = outputRate ? price / (1 + outputRate) : price;
  const outputGst = Math.max(price - taxableSaleValue, 0);
  const referralRate = getReferralRate(categoryId, price, customReferralRate);
  const referralFee = price * (referralRate / 100);
  const closingFee = getClosingFee(fulfilmentChannel, price, categoryId);
  const amazonFeesBeforeGst = referralFee + closingFee;
  const feeGst = amazonFeesBeforeGst * GST_RATE;
  const shipping = includeShipping ? positiveNumber(shippingFee) : 0;
  const shippingInputGst = includeShipping ? positiveNumber(shippingGst) : 0;
  const shippingBeforeGst = Math.max(shipping - shippingInputGst, 0);
  const product = splitInclusiveTax(productCost, productGstRate);
  const packaging = splitInclusiveTax(packagingCost, packagingGstRate);
  const ads = splitInclusiveTax(adCost, adGstRate);
  const inputGstCredit = product.gst + packaging.gst + ads.gst + feeGst + shippingInputGst;
  const netGstPayableRaw = outputGst - inputGstCredit;
  const netGstPayable = Math.max(netGstPayableRaw, 0);
  const gstCredit = Math.max(inputGstCredit - outputGst, 0);
  const taxAdjustedCost = product.taxable + packaging.taxable + ads.taxable + shippingBeforeGst + amazonFeesBeforeGst;
  const cashCostBeforeGstSettlement = positiveNumber(productCost) + positiveNumber(packagingCost) + positiveNumber(adCost) + shipping + amazonFeesBeforeGst + feeGst;
  const profit = taxableSaleValue - taxAdjustedCost;
  const margin = price ? profit / price : 0;
  const taxableRevenueRate = outputRate ? 1 / (1 + outputRate) : 1;
  const variableFeeRate = taxableRevenueRate - (referralRate / 100);
  const fixedCosts = product.taxable + packaging.taxable + ads.taxable + shippingBeforeGst + closingFee;
  const breakEven = variableFeeRate > 0 ? fixedCosts / variableFeeRate : 0;
  const suggestedPrice = variableFeeRate > 0 ? (fixedCosts + positiveNumber(targetProfit)) / variableFeeRate : 0;
  return {
    taxableSaleValue,
    outputGst,
    referralRate,
    referralFee,
    closingFee,
    amazonFeesBeforeGst,
    feeGst,
    shipping,
    shippingBeforeGst,
    shippingInputGst,
    productInputGst: product.gst,
    packagingInputGst: packaging.gst,
    adInputGst: ads.gst,
    inputGstCredit,
    netGstPayable,
    gstCredit,
    netGstPayableRaw,
    cashCostBeforeGstSettlement,
    totalCost: taxAdjustedCost,
    profit,
    margin,
    breakEven,
    suggestedPrice,
  };
}

function splitInclusiveTax(amount, ratePercent) {
  const gross = positiveNumber(amount);
  const rate = positiveNumber(ratePercent) / 100;
  if (!gross || !rate) return { taxable: gross, gst: 0 };
  const taxable = gross / (1 + rate);
  return { taxable, gst: gross - taxable };
}

export function formatWeight(kg) {
  if (kg < 1) return `${Math.round(kg * 1000)} g`;
  return `${Number(kg).toLocaleString("en-IN", { maximumFractionDigits: 2 })} kg`;
}


