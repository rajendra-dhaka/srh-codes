import { UNKNOWN, sortKey } from "./labelCore";

export function countBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const value = item[key] || UNKNOWN;
    map.set(value, (map.get(value) || 0) + 1);
  }
  return Array.from(map, ([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || sortKey(a.name).localeCompare(sortKey(b.name)));
}

export function countBySkuQty(items) {
  const map = new Map();
  for (const item of items) {
    const sku = item.sku || UNKNOWN;
    const qty = Number(item.qty) || 1;
    const key = `${sku} | Qty ${qty}`;
    const current = map.get(key) || { name: key, count: 0, pieces: 0 };
    current.count += 1;
    current.pieces += qty;
    map.set(key, current);
  }
  return Array.from(map.values())
    .map((row) => ({
      ...row,
      name: `${row.name} - ${row.count} orders / ${row.pieces} pcs`,
    }))
    .sort((a, b) => b.pieces - a.pieces || sortKey(a.name).localeCompare(sortKey(b.name)));
}

export function truncate(value, max = 40) {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, Math.max(0, max - 3))}...` : text;
}
