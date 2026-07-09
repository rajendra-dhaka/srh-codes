import { useMemo } from "react";
import { trackEvent } from "../../lib/analytics";
import {
  buildAmazonBillingPdf,
  buildAmazonPreparedPdf,
  buildFlipkartCroppedPdf,
  buildMeeshoOutputPdf,
  buildOriginalSortedPdf,
  buildPicklistPdf,
  extractLabelPages,
  flattenAmazonLineItems,
  groupItemsByCourier,
  meeshoOutputKind,
  pairAmazonOrders,
  parseMeeshoOutputKind,
  printPdfBytes,
  safeFilename,
  saveBytes,
  sortLabels,
  splitByQuantity,
} from "./labelProcessing";
import { useLabelProcessing } from "./LabelProcessingContext";
import { countBy, countBySkuQty } from "./LabelSummaryHelpers";

export function useLabelProcessingModel(t) {
  const { state, dispatch } = useLabelProcessing();
  const {
    platform,
    files,
    busy,
    error,
    items,
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
  } = state;

  const sortedItems = useMemo(() => sortLabels(items, labelSortMode), [items, labelSortMode]);
  const courierGroups = useMemo(() => groupItemsByCourier(sortedItems), [sortedItems]);
  const amazonOrders = useMemo(() => platform === "amazon" ? pairAmazonOrders(items) : [], [items, platform]);
  const counts = useMemo(() => ({
    courier: countBy(sortedItems, "courier"),
    seller: countBy(sortedItems, "seller"),
    skuQty: countBySkuQty(sortedItems),
    sku: countBy(sortedItems, "sku").slice(0, 5),
  }), [sortedItems]);
  const amazonCounts = useMemo(() => ({
    sku: countBy(flattenAmazonLineItems(amazonOrders), "sku").slice(0, 5),
    skuQty: countBySkuQty(flattenAmazonLineItems(amazonOrders)).slice(0, 5),
  }), [amazonOrders]);
  const amazonLineItems = useMemo(() => flattenAmazonLineItems(amazonOrders), [amazonOrders]);
  const getConfiguredRows = (sourceRows) => {
    const groups = splitByQuantity(sourceRows);
    const selected = labelQuantityGroup === "single"
      ? groups.single
      : labelQuantityGroup === "multi"
        ? groups.multi
        : groups.all;
    if (platform === "meesho" && labelOutputMode === "crop" && labelOutputType === "billing") {
      return selected.filter((item) => item.taxInvoiceBox);
    }
    return selected;
  };
  const getConfiguredOutputKind = () => {
    if (platform === "meesho") {
      if (labelOutputMode === "layout") {
        const layout = labelPrinterType === "thermal" ? labelThermalLayout : labelNormalLayout;
        return meeshoOutputKind("full", layout);
      }
      if (labelOutputType === "shipping") return meeshoOutputKind("shipping", "1");
      if (labelOutputType === "billing") return meeshoOutputKind("billing", "1");
      if (labelOutputType === "combined") return meeshoOutputKind("full", "1");
      return "labels";
    }
    if (labelOutputType === "shipping" || labelOutputType === "billing") return labelOutputType;
    return "labels";
  };
  const quantityLabel = labelQuantityGroup === "single" ? t.singleQty : labelQuantityGroup === "multi" ? t.multiQty : t.allLabels;
  const selectedOutputRows = useMemo(() => getConfiguredRows(sortedItems), [sortedItems, labelQuantityGroup, labelOutputMode, labelOutputType]);

  const onFiles = (selectedFiles) => {
    const pdfFiles = Array.from(selectedFiles || []).filter((file) => /\.pdf$/i.test(file.name) || file.type === "application/pdf");
    dispatch({ type: "filesSelected", files: pdfFiles });
    trackEvent("label_processing_upload", { file_count: pdfFiles.length });
  };

  const analyze = async () => {
    if (!files.length) {
      dispatch({ type: "setError", error: "Upload at least one label PDF." });
      return;
    }
    dispatch({ type: "startBusy", clearToast: true });
    try {
      trackEvent("label_processing_start", { file_count: files.length, sort_mode: "auto_packing" });
      const extracted = await extractLabelPages(files);
      const orderCount = platform === "amazon" ? pairAmazonOrders(extracted).length : extracted.length;
      dispatch({ type: "analysisComplete", items: extracted, toast: platform === "amazon" ? "Amazon labels are ready." : "Courier-wise labels and picklists are ready." });
      trackEvent("label_processing_complete", { label_count: orderCount, marketplace: platform, sort_mode: "auto_packing" });
    } catch (err) {
      dispatch({ type: "setError", error: err.message || "Label processing failed." });
      trackEvent("label_processing_error", { sort_mode: "auto_packing" });
    } finally {
      dispatch({ type: "finishBusy" });
    }
  };

  const runOutputAction = async (rows, action, scopeName, subsetName, outputKind = "labels") => {
    if (!rows.length) return;
    dispatch({ type: "startBusy" });
    try {
      const sorted = sortLabels(rows, labelSortMode);
      const scope = safeFilename(scopeName);
      const subset = safeFilename(subsetName);
      if (action === "picklist") {
        const bytes = await buildPicklistPdf(sorted, `${scopeName} - ${subsetName}`);
        const filename = `${scope}-${subset}-picklist.pdf`;
        saveBytes(bytes, filename);
        dispatch({ type: "patch", patch: { toast: `${filename} downloaded.` } });
      } else {
        const meeshoOutput = platform === "meesho" ? parseMeeshoOutputKind(outputKind) : null;
        const bytes = meeshoOutput
          ? await buildMeeshoOutputPdf(sorted, meeshoOutput.section, meeshoOutput.labelsPerPage, meeshoOutput.layout)
          : platform === "flipkart" && outputKind !== "labels"
            ? await buildFlipkartCroppedPdf(sorted, outputKind)
            : await buildOriginalSortedPdf(sorted);
        const filename = meeshoOutput
          ? `${scope}-${subset}-${meeshoOutput.section}-${meeshoOutput.layout}-labels.pdf`
          : platform === "flipkart" && outputKind !== "labels"
            ? `${scope}-${subset}-${outputKind}.pdf`
            : `${scope}-${subset}-labels.pdf`;
        if (action === "print") {
          printPdfBytes(bytes);
          dispatch({ type: "patch", patch: { toast: `${scopeName} ${subsetName} ${outputKind} opened for printing.` } });
        } else {
          saveBytes(bytes, filename);
          dispatch({ type: "patch", patch: { toast: `${filename} downloaded.` } });
        }
      }
      trackEvent("label_processing_output", {
        action,
        scope: scopeName,
        subset: subsetName,
        output_kind: outputKind,
        label_count: rows.length,
      });
    } catch (err) {
      dispatch({ type: "setError", error: err.message || "Output generation failed." });
    } finally {
      dispatch({ type: "finishBusy" });
    }
  };

  const runConfiguredOutputAction = (rows, action, scopeName = t.allCouriers) => {
    const selectedRows = getConfiguredRows(rows);
    if (labelOutputType === "picklist") {
      runOutputAction(selectedRows, "picklist", scopeName, quantityLabel);
      return;
    }
    runOutputAction(selectedRows, action, scopeName, quantityLabel, getConfiguredOutputKind());
  };

  const runAmazonAction = async (action, outputKind = "prepared") => {
    if (!amazonOrders.length) return;
    dispatch({ type: "startBusy" });
    try {
      const modeName = amazonInfoMode === "description" ? "sku-title" : amazonInfoMode === "clean" ? "clean" : "sku";
      const bytes = outputKind === "billing"
        ? await buildAmazonBillingPdf(amazonOrders, { sortBySku: amazonSortBySku })
        : await buildAmazonPreparedPdf(amazonOrders, {
          mode: amazonInfoMode,
          keepInvoice: outputKind === "combined",
          sortBySku: amazonSortBySku,
        });
      const filename = outputKind === "billing"
        ? "amazon-billing-pages.pdf"
        : outputKind === "combined"
          ? `amazon-${modeName}-combined-labels-and-invoices.pdf`
          : `amazon-${modeName}-shipping-labels.pdf`;
      if (action === "print") {
        printPdfBytes(bytes);
        dispatch({ type: "patch", patch: { toast: outputKind === "billing" ? "Amazon billing pages opened for printing." : "Amazon labels opened for printing." } });
      } else {
        saveBytes(bytes, filename);
        dispatch({ type: "patch", patch: { toast: `${filename} downloaded.` } });
      }
      trackEvent("amazon_label_output", {
        action,
        mode: amazonInfoMode,
        output_kind: outputKind,
        keep_invoice: outputKind === "combined",
        sort_by_sku: amazonSortBySku,
        order_count: amazonOrders.length,
      });
    } catch (err) {
      dispatch({ type: "setError", error: err.message || "Amazon label generation failed." });
    } finally {
      dispatch({ type: "finishBusy" });
    }
  };


  return {
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
  };
}
