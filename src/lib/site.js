export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://srhcodes.online";

export const site = {
  name: "SRH Codes",
  legalName: "SRH Codes",
  shortName: "SRH Codes",
  contactEmail: "shree.anjaneya.1304@gmail.com",
  jurisdiction: "Rajasthan, India",
  description:
    "Free browser-based ecommerce seller tools for Flipkart label crop, Meesho 4-up and 6-up label PDFs, Amazon Easy Ship fee calculator, volumetric weight checks, courier and SKU label sorting, picklist generation, GST helper values, performance insights, and marketplace data analysis.",
  url: siteUrl,
  keywords: [
    "flipkart label crop",
    "flipkart shipping label crop",
    "flipkart invoice crop",
    "meesho label 4 in 1",
    "meesho label 4 per page",
    "meesho label 6 per page",
    "meesho 6 up labels",
    "meesho shipping label pdf",
    "meesho label crop",
    "ecommerce label cropper",
    "seller shipping label tool",
    "marketplace label pdf tool",
    "courier wise label sorting",
    "sku wise label sorting",
    "sorted label pdf download",
    "download sorted shipping labels",
    "print sorted shipping labels",
    "ecommerce picklist generator",
    "packing picklist generator",
    "sort labels by courier partner",
    "sort shipping labels by sku",
    "label printer 4x6 pdf",
    "amazon easy ship fee calculator",
    "amazon shipping fee calculator india",
    "amazon volumetric weight calculator",
    "easy ship weight handling fee",
    "amazon seller shipping cost calculator",
    "gst helper for sellers",
    "gstr 1 helper",
    "ecommerce seller insights tools",
    "seller performance analytics",
    "marketplace data analysis",
    "recommerce seller tools",
  ],
};

export const landingFeatures = [
  {
    title: "Flipkart shipping label cropper",
    text: "Upload Flipkart label PDFs and download separate shipping and 4x6 billing PDFs that are easier to print.",
  },
  {
    title: "Meesho 4-in-1 label maker",
    text: "Convert Meesho labels into compact 4-up or 6-up A4 PDFs for normal page printers.",
  },
  {
    title: "Courier and SKU label sorting",
    text: "Upload multiple label PDFs, sort courier-wise or SKU-wise, download combined or courier-wise sorted label PDFs, print courier-wise label PDFs, and generate a packing picklist with seller account and courier pickup counts.",
  },
  {
    title: "Amazon Easy Ship fee calculator",
    text: "Estimate actual and volumetric chargeable weight, GST-inclusive Easy Ship fee, and pricing buffers for Amazon India seller orders.",
  },
  {
    title: "Private browser processing",
    text: "PDFs and reports are processed in your browser. Files do not need to be uploaded to a server.",
  },
  {
    title: "Seller analytics workspace",
    text: "Analyze marketplace orders, payments, ads, returns, GST helper tables, performance insights, and seller data in one app.",
  },
];

export const keywordPages = [
  {
    slug: "flipkart-label-crop",
    title: "Flipkart Label Crop Tool",
    h1: "Flipkart Label Crop Tool for Shipping and Billing PDFs",
    description:
      "Crop Flipkart label PDFs into a clean shipping label and a separate 4x6 portrait billing PDF for label printers.",
    primaryKeyword: "flipkart label crop",
    related: [
      "flipkart shipping label crop",
      "flipkart invoice label crop",
      "flipkart label printer pdf",
      "flipkart label 4x6",
    ],
    sections: [
      {
        title: "Create separate shipping and billing PDFs",
        text: "The tool reads each Flipkart PDF page, crops the shipping label up to the dotted line, and exports the billing invoice as a separate 4x6 portrait PDF.",
      },
      {
        title: "Built for seller packing desks",
        text: "Use it before printing labels for dispatch. The output is designed for faster handling on shipping label and packing desk workflows.",
      },
      {
        title: "No server upload required",
        text: "Your PDF is handled locally in the browser, which is useful for invoices and customer address documents.",
      },
    ],
  },
  {
    slug: "meesho-label-4-in-1",
    title: "Meesho Label Maker - 4-in-1 and 6-up PDF Tool",
    h1: "Meesho Label Maker for 4-up and 6-up PDFs",
    description:
      "Convert Meesho shipping label PDFs into 4-in-1 A4 pages or 6 labels per page for normal page printers.",
    primaryKeyword: "meesho label 4 in 1",
    related: [
      "meesho label 4 per page",
      "meesho label 6 per page",
      "meesho shipping label pdf",
      "meesho label print 4 in 1",
      "meesho label maker",
    ],
    sections: [
      {
        title: "Fit four or six Meesho labels on one page",
        text: "Upload the label PDF and generate a clean A4 output with either four labels or six compact labels per page.",
      },
      {
        title: "Download courier-wise sorted labels",
        text: "Use the Labels tool to group Meesho labels by courier partner and quantity, then download matching labels and picklists.",
      },
      {
        title: "Useful for marketplace sellers",
        text: "The same workspace also supports Flipkart label crop, performance analysis, GST summaries, and marketplace report workflows.",
      },
    ],
  },
];

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}
