import { createContext, useContext, useReducer } from "react";

export function initialLabelPlatform() {
  if (typeof window === "undefined") return "meesho";
  const path = window.location.pathname.toLowerCase();
  if (path.includes("amazon-label")) return "amazon";
  if (path.includes("flipkart-label")) return "flipkart";
  return "meesho";
}

function initialState() {
  const platform = initialLabelPlatform();
  return {
    platform,
    files: [],
    busy: false,
    error: "",
    items: [],
    toast: "",
    amazonInfoMode: "sku",
    amazonSortBySku: true,
    uploadInputKey: 0,
    labelSortMode: "auto",
    labelQuantityGroup: "all",
    labelOutputMode: platform === "meesho" ? "layout" : "crop",
    labelOutputType: platform === "meesho" ? "labels" : "shipping",
    labelPrinterType: "normal",
    labelNormalLayout: "6",
    labelThermalLayout: "4x6",
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.patch };
    case "selectPlatform":
      return {
        ...state,
        platform: action.platform,
        files: [],
        items: [],
        error: "",
        toast: "",
        labelOutputMode: action.platform === "meesho" ? "layout" : "crop",
        labelOutputType: action.platform === "meesho" ? "labels" : "shipping",
        uploadInputKey: state.uploadInputKey + 1,
      };
    case "filesSelected":
      return { ...state, files: action.files, items: [], toast: "", error: "" };
    case "startBusy":
      return { ...state, busy: true, error: "", toast: action.clearToast ? "" : state.toast };
    case "finishBusy":
      return { ...state, busy: false };
    case "analysisComplete":
      return { ...state, busy: false, items: action.items, toast: action.toast, error: "" };
    case "setError":
      return { ...state, busy: false, error: action.error };
    default:
      return state;
  }
}

const LabelProcessingContext = createContext(null);

export function LabelProcessingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  return <LabelProcessingContext.Provider value={{ state, dispatch }}>{children}</LabelProcessingContext.Provider>;
}

export function useLabelProcessing() {
  const context = useContext(LabelProcessingContext);
  if (!context) throw new Error("useLabelProcessing must be used inside LabelProcessingProvider");
  return context;
}
