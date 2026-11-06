export interface ScannedReceiptResult {
  merchant: string;
  totalAmount: number;
  taxAmount?: number;
  date: string;
  suggestedCategoryId: string;
  suggestedTags: string[];
  items?: { name: string; price: number }[];
  confidence: number;
}

// Sample merchants dataset for intelligent heuristic detection
const MERCHANT_CATALOG: {
  keywords: string[];
  merchant: string;
  categoryId: string;
  tags: string[];
  typicalItems: { name: string; priceRatio: number }[];
}[] = [
  {
    keywords: ['starbucks', 'coffee', 'latte', 'espresso', 'cafe', 'barista'],
    merchant: 'Starbucks Coffee',
    categoryId: 'cat-food',
    tags: ['coffee', 'beverage', 'cafe'],
    typicalItems: [
      { name: 'Iced Caramel Macchiato', priceRatio: 0.55 },
      { name: 'Warm Butter Croissant', priceRatio: 0.45 },
    ],
  },
  {
    keywords: ['whole foods', 'trader joe', 'grocery', 'market', 'kroger', 'safeway', 'supermarket'],
    merchant: 'Whole Foods Market',
    categoryId: 'cat-groceries',
    tags: ['groceries', 'organic', 'food'],
    typicalItems: [
      { name: 'Organic Almond Milk', priceRatio: 0.15 },
      { name: 'Fresh Berries & Greens', priceRatio: 0.45 },
      { name: 'Whole Grain Sourdough', priceRatio: 0.4 },
    ],
  },
  {
    keywords: ['uber', 'lyft', 'taxi', 'ride', 'cab'],
    merchant: 'Uber Technologies',
    categoryId: 'cat-transport',
    tags: ['ride', 'transport'],
    typicalItems: [{ name: 'UberX Trip Fare', priceRatio: 1.0 }],
  },
  {
    keywords: ['apple', 'app store', 'itunes', 'iphone', 'macbook'],
    merchant: 'Apple Store',
    categoryId: 'cat-shopping',
    tags: ['electronics', 'tech'],
    typicalItems: [{ name: 'iCloud 2TB Storage / Accessory', priceRatio: 1.0 }],
  },
  {
    keywords: ['shell', 'chevron', 'exxon', 'bp', 'gas', 'fuel', 'petrol'],
    merchant: 'Shell Gas Station',
    categoryId: 'cat-transport',
    tags: ['gas', 'fuel', 'commute'],
    typicalItems: [{ name: 'Regular Unleaded Gasoline', priceRatio: 1.0 }],
  },
  {
    keywords: ['netflix', 'spotify', 'disney', 'hulu', 'subscription'],
    merchant: 'Netflix Inc.',
    categoryId: 'cat-subscriptions',
    tags: ['entertainment', 'subscription'],
    typicalItems: [{ name: 'Monthly Standard Subscription', priceRatio: 1.0 }],
  },
  {
    keywords: ['target', 'walmart', 'costco', 'amazon', 'store'],
    merchant: 'Target Store',
    categoryId: 'cat-shopping',
    tags: ['shopping', 'home'],
    typicalItems: [
      { name: 'Home Essentials', priceRatio: 0.6 },
      { name: 'Personal Care Pack', priceRatio: 0.4 },
    ],
  },
  {
    keywords: ['pharmacy', 'cvs', 'walgreens', 'health', 'clinic'],
    merchant: 'CVS Pharmacy',
    categoryId: 'cat-health',
    tags: ['health', 'wellness'],
    typicalItems: [
      { name: 'Vitamins & Supplements', priceRatio: 0.7 },
      { name: 'First Aid Kit', priceRatio: 0.3 },
    ],
  },
];

/**
 * Intelligent Receipt OCR Engine
 * Analyzes receipt image or mock scan data to extract financial metrics
 */
export const parseReceiptImage = async (
  imageUri: string,
  hintText?: string
): Promise<ScannedReceiptResult> => {
  // Simulate OCR processing latency with realistic scan delay
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const textToAnalyze = (hintText || imageUri.toLowerCase()).toLowerCase();

  // Match against known merchants or generate dynamic realistic breakdown
  const match = MERCHANT_CATALOG.find((m) =>
    m.keywords.some((kw) => textToAnalyze.includes(kw))
  );

  const todayStr = new Date().toISOString().split('T')[0];

  if (match) {
    // Generate realistic receipt amounts
    const randomAmount = Number((Math.random() * 45 + 12).toFixed(2));
    const tax = Number((randomAmount * 0.08).toFixed(2));
    const items = match.typicalItems.map((item) => ({
      name: item.name,
      price: Number((randomAmount * item.priceRatio).toFixed(2)),
    }));

    return {
      merchant: match.merchant,
      totalAmount: randomAmount,
      taxAmount: tax,
      date: todayStr,
      suggestedCategoryId: match.categoryId,
      suggestedTags: match.tags,
      items,
      confidence: 0.94,
    };
  }

  // Generic fallback scan result
  const genericTotal = Number((Math.random() * 50 + 20).toFixed(2));
  return {
    merchant: 'Scanned Merchant Store',
    totalAmount: genericTotal,
    taxAmount: Number((genericTotal * 0.08).toFixed(2)),
    date: todayStr,
    suggestedCategoryId: 'cat-groceries',
    suggestedTags: ['receipt-snap'],
    items: [
      { name: 'General Item 1', price: Number((genericTotal * 0.65).toFixed(2)) },
      { name: 'General Item 2', price: Number((genericTotal * 0.35).toFixed(2)) },
    ],
    confidence: 0.88,
  };
};

