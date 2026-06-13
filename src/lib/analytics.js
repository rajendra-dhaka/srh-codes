export function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", name, {
    app_name: "SRH Codes",
    ...params,
  });
}
