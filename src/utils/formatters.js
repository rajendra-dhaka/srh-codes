export const money = (value) =>
  `Rs ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const moneyPrecise = (value) =>
  `Rs ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const num = (value) => Number(value || 0).toLocaleString("en-IN");

export const percent = (value) => `${(Number(value || 0) * 100).toFixed(1)}%`;

export const n = (value) => Number(value || 0);
