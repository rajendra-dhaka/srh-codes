export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://srhcodes.online";

export const site = {
  name: "SRH Codes",
  legalName: "SRH Codes",
  shortName: "SRH Codes",
  contactEmail: "shree.anjaneya.1304@gmail.com",
  jurisdiction: "Rajasthan, India",
  description:
    "Free browser-based ecommerce seller tools for Flipkart label crop, Meesho 4-in-1 label PDFs, performance insights, GST analysis, and marketplace data analysis.",
  url: siteUrl,
  keywords: [
    "flipkart label crop",
    "flipkart shipping label crop",
    "flipkart invoice crop",
    "meesho label 4 in 1",
    "meesho label 4 per page",
    "meesho shipping label pdf",
    "ecommerce label cropper",
    "seller shipping label tool",
    "marketplace label pdf tool",
    "label printer 4x6 pdf",
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
    text: "Convert Meesho labels into a compact 4-per-page A4 layout for faster packing workflows.",
  },
  {
    title: "Private browser processing",
    text: "PDFs and reports are processed in your browser. Files do not need to be uploaded to a server.",
  },
  {
    title: "Seller analytics workspace",
    text: "Analyze marketplace orders, payments, ads, returns, GST tables, performance insights, and seller data in one app.",
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
        text: "Use it before printing labels for dispatch. The output is designed for faster handling on thermal and label-printer workflows.",
      },
      {
        title: "No server upload required",
        text: "Your PDF is handled locally in the browser, which is useful for invoices and customer address documents.",
      },
    ],
  },
  {
    slug: "meesho-label-4-in-1",
    title: "Meesho Label 4 in 1 Page Tool",
    h1: "Meesho Label 4-in-1 PDF Maker",
    description:
      "Convert Meesho shipping label PDFs into a 4-in-1 A4 layout so four labels fit on one printable page.",
    primaryKeyword: "meesho label 4 in 1",
    related: [
      "meesho label 4 per page",
      "meesho shipping label pdf",
      "meesho label print 4 in 1",
      "meesho label maker",
    ],
    sections: [
      {
        title: "Fit four Meesho labels on one page",
        text: "Upload the label PDF, generate a clean A4 output, and print four labels per page for low-volume packing work.",
      },
      {
        title: "Simple PDF workflow",
        text: "The converter keeps the original label pages intact and scales them into a printable 2x2 layout.",
      },
      {
        title: "Useful for marketplace sellers",
        text: "The same workspace also supports performance analysis, GST summaries, and marketplace report workflows.",
      },
    ],
  },
];

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}
