export { countBy, countBySkuQty, truncate } from "./labelStats";

export function CountList({ title, rows, initialOpen = false }) {
  return (
    <details className="count-list count-accordion" open={initialOpen}>
      <summary>
        <span>{title}</span>
        <em>{rows.length} rows</em>
      </summary>
      <div className="count-list-scroll">
        {rows.length ? rows.map((row) => (
          <div key={row.name} className="count-row">
            <span>{row.name}</span>
            <strong>{row.count}</strong>
          </div>
        )) : <p>No rows yet.</p>}
      </div>
    </details>
  );
}
