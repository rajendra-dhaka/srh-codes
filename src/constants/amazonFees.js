export const AMAZON_REFERRAL_CATEGORIES = [
  { id: "custom", label: "Custom referral %", slabs: [{ rate: 10 }] },
  { id: "school_textbook", label: "School Textbook Bundles", slabs: [{ max: 250, rate: 2 }, { max: 1000, rate: 3 }, { max: 1500, rate: 4 }, { rate: 4.5 }], closingProfile: "textbook" },
  { id: "books", label: "Books", slabs: [{ max: 250, rate: 0 }, { max: 500, rate: 2 }, { max: 1000, rate: 4 }, { rate: 13.5 }] },
  { id: "laptops", label: "Laptops", slabs: [{ rate: 6 }] },
  { id: "mobile_phones", label: "Mobile Phones", slabs: [{ rate: 5 }] },
  { id: "tablets", label: "Tablets", slabs: [{ max: 300, rate: 0 }, { max: 12000, rate: 6 }, { rate: 10 }] },
  { id: "electronics_accessories", label: "Accessories - Electronics, PC and Wireless", slabs: [{ max: 300, rate: 0 }, { max: 1000, rate: 5 }, { rate: 17 }] },
  { id: "headphones", label: "Headsets, Headphones and Earphones", slabs: [{ max: 1000, rate: 0 }, { rate: 18 }] },
  { id: "power_banks", label: "Power Banks and Chargers", slabs: [{ max: 1000, rate: 0 }, { rate: 20.5 }] },
  { id: "cases_covers", label: "Cases, Covers and Screen Guards", slabs: [{ max: 1000, rate: 0 }, { rate: 25 }] },
  { id: "beauty_other", label: "Beauty - Other products", slabs: [{ max: 500, rate: 0 }, { rate: 9 }] },
  { id: "beauty_makeup", label: "Beauty - Make-up", slabs: [{ max: 1000, rate: 0 }, { rate: 7 }] },
  { id: "deodorants", label: "Deodorants", slabs: [{ max: 500, rate: 0 }, { max: 1000, rate: 6.5 }, { rate: 7 }] },
  { id: "face_wash", label: "Face Wash / Moisturiser / Sunscreen", slabs: [{ max: 500, rate: 0 }, { max: 1000, rate: 9 }, { rate: 9.5 }] },
  { id: "pet_foods", label: "Pet Foods", slabs: [{ max: 300, rate: 0 }, { max: 1000, rate: 6.5 }, { rate: 9.5 }] },
  { id: "toys_other", label: "Toys - Other products", slabs: [{ max: 1000, rate: 0 }, { rate: 11.5 }] },
  { id: "toys_drones", label: "Toys - Drones", slabs: [{ max: 1000, rate: 0 }, { rate: 30 }] },
  { id: "packing_materials", label: "Packing Materials", slabs: [{ max: 1000, rate: 0 }, { rate: 5 }] },
  { id: "office_supplies", label: "Office Products - Office Supplies", slabs: [{ max: 1000, rate: 0 }, { rate: 13 }] },
  { id: "sports_other", label: "Sports - Other products", slabs: [{ max: 1000, rate: 0 }, { rate: 13 }] },
  { id: "sports_equipment", label: "Sports - Cricket/Badminton/Tennis equipment", slabs: [{ max: 1000, rate: 0 }, { rate: 8.5 }] },
  { id: "fashion_jewellery", label: "Fashion Jewellery", slabs: [{ max: 300, rate: 0 }, { max: 1000, rate: 5 }, { rate: 22.5 }] },
  { id: "apparel_other", label: "Apparel - Other products", slabs: [{ max: 300, rate: 0 }, { max: 1000, rate: 5 }, { rate: 19 }] },
  { id: "kitchen", label: "Kitchen tools / Home - Other products", slabs: [{ max: 1000, rate: 0 }, { rate: 11.5 }] },
  { id: "furniture_other", label: "Furniture - Other products", slabs: [{ max: 1000, rate: 0 }, { max: 15000, rate: 15.5 }, { rate: 11 }] },
  { id: "major_appliances", label: "Major Appliances - Other products", slabs: [{ rate: 5.5 }] },
];

export const AMAZON_FULFILMENT_CHANNELS = [
  { id: "easy_ship", label: "Easy Ship" },
  { id: "self_ship", label: "Self-Ship" },
  { id: "seller_flex", label: "Seller Flex" },
  { id: "fulfilment_centre", label: "Fulfilment Centre" },
];

export const EASY_SHIP_STANDARD_FEES = {
  premium: { label: "Premium", first500: 53, upTo1kg: 73, upTo2kg: 110, after2: 34, after5: 18 },
  advanced: { label: "Advanced", first500: 53, upTo1kg: 73, upTo2kg: 110, after2: 34, after5: 18 },
  standard: { label: "Standard", first500: 55, upTo1kg: 75, upTo2kg: 112, after2: 34, after5: 18 },
  basic: { label: "Basic", first500: 59, upTo1kg: 79, upTo2kg: 116, after2: 34, after5: 18 },
};

export const EASY_SHIP_HEAVY_FEES = {
  premium: { local: 186, regional: 275.5, national: 370 },
  advanced: { local: 186, regional: 275.5, national: 370 },
  standard: { local: 192, regional: 277, national: 371 },
  basic: { local: 198, regional: 281.5, national: 375 },
};

export const EASY_SHIP_HEAVY_ADDITIONAL = { local: 5, regional: 6, national: 12 };

export const GST_RATE = 0.18;
