# Meesho Insight Tool

Local React dashboard for Meesho seller analysis.

## Run

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

## Upload These Files

1. Orders CSV from Meesho Orders export.
2. Outstanding Payment report as `.zip` or `.xlsx`.

The app parses files in your browser and shows:

- KPI cards
- Source split: ads vs organic
- Delivered, shipped, cancelled, RTO, customer return
- Settlement, ads spend, net after ads
- Daily ads chart
- Top campaign spend
- Product/state risk tables
- English/Hindi wording toggle with English digits

## Note

Payment report gives ads deduction and settlement. For campaign ROI, upload a dedicated Advertisement campaign export when available.
