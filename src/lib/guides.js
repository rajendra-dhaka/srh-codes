export const guides = [
  {
    slug: "courier-sku-label-sorting",
    title: "Courier and SKU Label Sorting Guide",
    description: "A practical packing workflow for sorting marketplace labels by courier, quantity, SKU, and seller account, with matching picklists.",
    updated: "June 22, 2026",
    copy: {
      en: {
        kicker: "Packing desk guide",
        title: "How to sort marketplace labels by courier, quantity, and SKU",
        intro: "When several seller accounts and courier pickups are packed together, a single unsorted label stack creates avoidable searching. This workflow keeps dispatch priority, product picking, label printing, and pickup counts connected.",
        sections: [
          { title: "Start with courier priority", paragraphs: ["Upload all label PDFs for the packing session together. Grouping by courier creates one visible queue for Valmo, Delhivery, Shadowfax, Ekart, or any other courier detected in the PDF. The list is dynamic; couriers with no labels are not shown.", "Pack the courier whose pickup closes first. Inside that courier group, sort by SKU so the same product can be picked and packed in one run."] },
          { title: "Separate single and multi-quantity orders", paragraphs: ["Qty 1 orders are usually the fastest batch. Multi-quantity orders deserve a separate check because the same label may require two or more pieces. Mixing both groups is a common cause of short shipments.", "The SRH Codes Labels tool creates Qty 1, Multi qty, and All labels subsets for every courier. Each subset has a matching picklist, so the document used for picking and the labels used for packing describe the same orders."] },
          { title: "Choose 4-up or 6-up output", paragraphs: ["Use 4 labels per A4 page when readability and larger barcodes matter most. Use 6 labels per page when paper saving matters and your printer can reproduce smaller text and barcodes clearly.", "Always print one test page at actual size. Disable browser options such as Fit to page when they introduce a second scaling step, and scan one barcode before printing the full batch."] },
          { title: "Multiple seller accounts", paragraphs: ["You can upload PDFs from multiple seller accounts in one session. Seller detection is read from label text where available. Keep source PDFs as a fallback because marketplace formats and exchange labels may omit some fields.", "After processing, compare total label count, courier counts, top SKU counts, and multi-quantity count with the marketplace dispatch screen before handing parcels to the courier."] },
        ],
        checklist: ["Upload all PDFs for one packing session", "Confirm total labels and courier counts", "Open the earliest courier group", "Print Qty 1 and Multi qty separately", "Use the matching picklist", "Scan a sample barcode and reconcile the final parcel count"],
      },
      hi: {
        kicker: "पैकिंग डेस्क गाइड",
        title: "Marketplace labels को courier, quantity और SKU से कैसे sort करें",
        intro: "Multiple seller accounts और courier pickups के labels साथ हों तो unsorted stack में search और packing mistakes बढ़ती हैं. यह workflow dispatch priority, product picking, label printing और pickup counts को साथ रखता है.",
        sections: [
          { title: "Courier priority से शुरू करो", paragraphs: ["एक packing session की सभी label PDFs साथ upload करो. Tool PDF में मिले courier names से dynamic groups बनाता है; zero-label courier नहीं दिखता.", "जिस courier का pickup पहले है उसे पहले pack करो, और उसके अंदर SKU के हिसाब से same products साथ रखो."] },
          { title: "Single और multi-quantity अलग रखो", paragraphs: ["Qty 1 orders fast batch होते हैं. Multi qty orders अलग verify करो क्योंकि एक label पर दो या ज्यादा pieces pack हो सकते हैं.", "हर courier के लिए Qty 1, Multi qty और All labels subset तथा matching picklist मिलता है."] },
          { title: "4-up या 6-up चुनो", paragraphs: ["Readable text और बड़े barcode के लिए 4 labels per A4 चुनो. Paper saving के लिए 6 labels चुन सकते हो, लेकिन पहले barcode scan test जरूर करो.", "Print dialog में unnecessary Fit to page scaling avoid करो."] },
          { title: "Multiple seller accounts", paragraphs: ["Multiple accounts की PDFs एक साथ process हो सकती हैं. Marketplace format या exchange label में field missing हो तो original PDF fallback के लिए रखो.", "Dispatch से पहले total labels, courier counts, top SKU और multi qty counts marketplace screen से match करो."] },
        ],
        checklist: ["Session की सभी PDFs upload करो", "Total labels और couriers verify करो", "Earliest pickup courier खोलो", "Qty 1 और Multi qty अलग print करो", "Matching picklist use करो", "Sample barcode scan और final parcel count match करो"],
      },
    },
  },
  {
    slug: "amazon-fees-and-listing-price",
    title: "Amazon India Fees and Listing Price Guide",
    description: "Understand actual versus volumetric weight, Easy Ship charges, GST on fees, referral and closing fees, break-even price, and profit.",
    updated: "June 22, 2026",
    copy: {
      en: {
        kicker: "Amazon pricing guide",
        title: "Estimate Amazon fees before choosing a listing price",
        intro: "A profitable selling price needs more than product cost plus margin. Shipping weight, package dimensions, Amazon fee slabs, GST on marketplace fees, output GST, advertising, packaging, and return risk can all change the result.",
        sections: [
          { title: "Actual and volumetric weight", paragraphs: ["Actual weight is the packed parcel weight. Volumetric weight estimates the space occupied in the delivery network: length x breadth x height in centimetres divided by 5000. Amazon generally charges the higher applicable weight after its rounding and minimum-weight rules.", "Compact packaging matters. A light product in a large box can move into a much higher shipping slab even though the scale weight is low."] },
          { title: "Marketplace fees and GST", paragraphs: ["A listing estimate may include Easy Ship weight handling, referral fee, closing fee, and 18% GST on Amazon service fees. Fee tables, STEP levels, category rates, and zone rules can change, so verify the latest Seller Central policy before making a final price decision.", "The calculator separates fee before GST and fee including GST so the cost is easier to audit."] },
          { title: "Product GST and input credit", paragraphs: ["Selling price is normally entered inclusive of product GST. Output GST is calculated from that inclusive price. Eligible GST already paid on business inputs can reduce the net GST cash burden, subject to invoice eligibility and GSTR-2B conditions.", "Do not treat every expense as automatic ITC. Blocked credits, personal use, missing invoices, or supplier reporting issues need separate review."] },
          { title: "Break-even and target profit", paragraphs: ["Break-even is the price where expected proceeds cover product cost, packaging, ads, Amazon fees, and net GST impact. A target-profit price adds the desired rupee profit after those costs.", "Run conservative scenarios for return risk and advertising. The result is an estimate, not an Amazon settlement guarantee, because actual fees depend on order, category, zone, dimensions, and current policy."] },
        ],
        checklist: ["Enter packed weight and dimensions", "Select current STEP level and shipping zone", "Confirm category referral rate", "Enter GST-inclusive product cost and selling GST rate", "Add packaging, ads, and return-risk buffer", "Compare break-even and target-profit prices"],
      },
      hi: {
        kicker: "Amazon pricing गाइड",
        title: "Listing price तय करने से पहले Amazon fees estimate करो",
        intro: "Profitable selling price सिर्फ product cost plus margin नहीं है. Shipping weight, dimensions, fee slabs, fees पर GST, product GST, ads, packaging और return risk result बदलते हैं.",
        sections: [
          { title: "Actual और volumetric weight", paragraphs: ["Actual weight packed parcel का scale weight है. Volumetric weight = length x breadth x height (cm) / 5000. Applicable rounding के बाद higher weight shipping slab decide कर सकता है.", "Light product का बड़ा box shipping cost बढ़ा सकता है, इसलिए compact packaging जरूरी है."] },
          { title: "Marketplace fees और GST", paragraphs: ["Estimate में Easy Ship handling, referral fee, closing fee और Amazon service fees पर 18% GST शामिल हो सकता है. STEP, category और zone rates बदल सकती हैं, इसलिए latest Seller Central policy verify करो.", "Calculator fee before GST और including GST अलग दिखाता है."] },
          { title: "Product GST और input credit", paragraphs: ["Selling price GST-inclusive enter होती है. Eligible business inputs पर paid GST, invoice और GSTR-2B conditions पूरी होने पर net GST burden कम कर सकता है.", "हर खर्च automatic ITC नहीं होता; blocked credit और missing invoice अलग review करो."] },
          { title: "Break-even और target profit", paragraphs: ["Break-even वह price है जहाँ product, packaging, ads, Amazon fees और net GST impact cover हो जाए. Target-profit price desired rupee profit भी जोड़ता है.", "Return और ad spend के conservative scenarios compare करो; actual settlement current policy पर depend करेगा."] },
        ],
        checklist: ["Packed weight और dimensions भरो", "Current STEP और zone चुनो", "Category referral rate verify करो", "GST-inclusive cost और sale GST rate भरो", "Packaging, ads और return buffer जोड़ो", "Break-even और target-profit compare करो"],
      },
    },
  },
  {
    slug: "gstr1-gstr2b-gstr3b-ecommerce",
    title: "GSTR-1, GSTR-2B and GSTR-3B Guide for Ecommerce Sellers",
    description: "A beginner-friendly workflow connecting marketplace sales reports, GSTR-1 outward supplies, GSTR-2B input credit, and GSTR-3B tax payment.",
    updated: "June 22, 2026",
    copy: {
      en: {
        kicker: "GST workflow guide",
        title: "How GSTR-1, GSTR-2B, and GSTR-3B connect for ecommerce sellers",
        intro: "GSTR-1 reports outward sales. GSTR-2B is the portal's static input-tax-credit statement for the period. GSTR-3B summarizes tax liability, eligible ITC, reversal, and payment. Treat them as one reconciliation workflow rather than three unrelated forms.",
        sections: [
          { title: "Before filing GSTR-1", paragraphs: ["Download marketplace GST reports, tax invoice details, sales returns, and credit-note information for the return period. Reconcile delivered sales, cancellations, customer returns, RTO, and exchange documents before entering portal values.", "For B2C supplies, split local supplies into CGST and SGST and interstate supplies into IGST using the seller's GST registration state, not a hard-coded state."] },
          { title: "Check HSN, documents, and ECO totals", paragraphs: ["HSN summary should reconcile with the same net outward-supply population used in the return. Document series and cancelled documents need source invoice records. Supplies through ecommerce operators may require separate reporting depending on the applicable table and section.", "Generate the GSTR-1 summary and compare taxable value and tax totals with the marketplace reconciliation before filing."] },
          { title: "Reconcile GSTR-2B ITC", paragraphs: ["Download GSTR-2B in PDF or Excel. Match supplier GSTIN, invoice number, date, taxable value, and tax with purchase invoices. Claim only eligible business ITC supported by valid documents and applicable conditions.", "Keep invoices even though they are not normally scanned and uploaded with GSTR-3B. They support the claim during reconciliation or future verification."] },
          { title: "Review and file GSTR-3B", paragraphs: ["Confirm Table 3.1 outward tax against filed GSTR-1, Table 3.2 interstate B2C values, Table 4 eligible ITC and reversals, and Table 5 exempt, nil-rated, and non-GST inward supplies where applicable.", "Preview the draft, proceed to payment, review system-proposed ITC utilization, post the credit to the ledger, and file with EVC or DSC. Download the filed return and acknowledgement for records."] },
        ],
        checklist: ["Reconcile marketplace sales and returns", "File and download GSTR-1", "Download GSTR-2B and match purchase invoices", "Review eligible and ineligible ITC", "Compare GSTR-3B outward liability with GSTR-1", "Preview, offset liability, file, and archive the acknowledgement"],
      },
      hi: {
        kicker: "GST workflow गाइड",
        title: "Ecommerce sellers के लिए GSTR-1, GSTR-2B और GSTR-3B कैसे connect होते हैं",
        intro: "GSTR-1 outward sales report करता है, GSTR-2B period का static ITC statement है, और GSTR-3B liability, eligible ITC, reversal और payment summarize करता है. इन्हें एक reconciliation workflow की तरह देखो.",
        sections: [
          { title: "GSTR-1 से पहले", paragraphs: ["Period की marketplace GST reports, tax invoice details, sales returns और credit notes download करो. Delivered sales, cancellation, customer return, RTO और exchange documents reconcile करो.", "B2C में seller की GST registration state से local supplies को CGST/SGST और interstate को IGST में split करो; state hard-code मत करो."] },
          { title: "HSN, documents और ECO totals", paragraphs: ["HSN summary उसी net outward population से match होनी चाहिए. Document series के लिए invoice source records रखो. Applicable होने पर ecommerce operator supplies अलग table में report करो.", "File करने से पहले generated summary का taxable value और tax marketplace reconciliation से match करो."] },
          { title: "GSTR-2B ITC reconcile करो", paragraphs: ["GSTR-2B PDF/Excel download करके supplier GSTIN, invoice number, date, taxable value और tax purchase invoice से match करो. सिर्फ eligible business ITC claim करो.", "Invoices scan-upload नहीं होते, फिर भी reconciliation और future verification के लिए संभाल कर रखो."] },
          { title: "GSTR-3B review और file", paragraphs: ["Table 3.1 को filed GSTR-1, Table 3.2 interstate B2C, Table 4 ITC/reversal और Table 5 applicable inward supplies से check करो.", "Draft preview करो, payment screen पर ITC utilization review करो, ledger post करो और EVC/DSC से file करके acknowledgement download करो."] },
        ],
        checklist: ["Sales और returns reconcile करो", "GSTR-1 file और download करो", "GSTR-2B invoices से match करो", "Eligible/ineligible ITC review करो", "GSTR-3B liability GSTR-1 से compare करो", "Preview, offset, file और acknowledgement archive करो"],
      },
    },
  },
];

export function getGuide(slug) {
  return guides.find((guide) => guide.slug === slug);
}
