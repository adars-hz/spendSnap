import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface ScannedReceiptResult {
  merchant: string;
  totalAmount: number;
  taxAmount?: number;
  date: string;
  suggestedCategoryId: string;
  suggestedTags: string[];
  items?: { name: string; price: number }[];
  confidence: number;
  rawText?: string;
}

const KNOWN_MERCHANTS: { name: string; categoryId: string; tags: string[]; patterns: RegExp }[] = [
  { name: 'Starbucks Coffee', categoryId: 'cat-food', tags: ['coffee', 'cafe'], patterns: /starbucks/i },
  { name: 'McDonald\'s', categoryId: 'cat-food', tags: ['fast-food', 'dining'], patterns: /mcdonald|mc donald/i },
  { name: 'Subway', categoryId: 'cat-food', tags: ['dining', 'fast-food'], patterns: /subway/i },
  { name: 'Chipotle', categoryId: 'cat-food', tags: ['dining', 'mexican'], patterns: /chipotle/i },
  { name: 'Whole Foods Market', categoryId: 'cat-groceries', tags: ['groceries', 'organic'], patterns: /whole\s*foods/i },
  { name: 'Trader Joe\'s', categoryId: 'cat-groceries', tags: ['groceries'], patterns: /trader\s*joe/i },
  { name: 'Walmart', categoryId: 'cat-groceries', tags: ['groceries', 'retail'], patterns: /walmart|wal-mart/i },
  { name: 'Costco Wholesale', categoryId: 'cat-groceries', tags: ['wholesale', 'groceries'], patterns: /costco/i },
  { name: 'Target', categoryId: 'cat-shopping', tags: ['shopping', 'retail'], patterns: /target/i },
  { name: 'Apple Store', categoryId: 'cat-shopping', tags: ['electronics', 'tech'], patterns: /apple\s*store|apple\s*retail/i },
  { name: 'Best Buy', categoryId: 'cat-shopping', tags: ['electronics'], patterns: /best\s*buy/i },
  { name: 'Shell', categoryId: 'cat-transport', tags: ['fuel', 'gas'], patterns: /shell/i },
  { name: 'Chevron', categoryId: 'cat-transport', tags: ['fuel', 'gas'], patterns: /chevron/i },
  { name: 'BP Gas', categoryId: 'cat-transport', tags: ['fuel', 'gas'], patterns: /\bbp\b|bp\s*oil/i },
  { name: 'ExxonMobil', categoryId: 'cat-transport', tags: ['fuel', 'gas'], patterns: /exxon|mobil/i },
  { name: 'Uber', categoryId: 'cat-transport', tags: ['ride', 'transport'], patterns: /\buber\b/i },
  { name: 'Lyft', categoryId: 'cat-transport', tags: ['ride', 'transport'], patterns: /\blyft\b/i },
  { name: 'CVS Pharmacy', categoryId: 'cat-health', tags: ['pharmacy', 'health'], patterns: /\bcvs\b/i },
  { name: 'Walgreens', categoryId: 'cat-health', tags: ['pharmacy', 'health'], patterns: /walgreens/i },
  { name: 'Home Depot', categoryId: 'cat-shopping', tags: ['home-improvement'], patterns: /home\s*depot/i },
];

/**
 * Real OCR Receipt Parser
 * 1. Takes imageUri and converts to Base64
 * 2. Sends to OCR engine
 * 3. Intelligently extracts Merchant, Total, Date, Tax, and Line Items from real text
 */
export const parseReceiptImage = async (
  imageUri: string,
  base64Data?: string
): Promise<ScannedReceiptResult> => {
  let rawText = '';

  try {
    let base64Image = base64Data;

    // Convert URI to base64 if not already provided
    if (!base64Image && Platform.OS !== 'web') {
      base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    if (base64Image) {
      const formData = new FormData();
      formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
      formData.append('apikey', 'K88893127488957');
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('OCREngine', '2'); // Engine 2 is optimized for receipts and numbers
      formData.append('scale', 'true');

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (json && json.ParsedResults && json.ParsedResults.length > 0) {
        rawText = json.ParsedResults[0].ParsedText || '';
      }
    }
  } catch (error) {
    console.warn('Real OCR network call failed, falling back to local heuristic:', error);
  }

  // Parse extracted raw text
  return extractDetailsFromReceiptText(rawText);
};

/**
 * Intelligent RegEx & NLP Extraction from raw receipt text
 */
export const extractDetailsFromReceiptText = (rawText: string): ScannedReceiptResult => {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const todayStr = new Date().toISOString().split('T')[0];

  if (lines.length === 0) {
    // Return empty fallback ready for manual user input
    return {
      merchant: 'Receipt Expense',
      totalAmount: 0.0,
      date: todayStr,
      suggestedCategoryId: 'cat-groceries',
      suggestedTags: ['receipt'],
      confidence: 0.5,
      rawText: rawText || 'No text detected from image. Please enter amount manually.',
    };
  }

  // 1. EXTRACT MERCHANT NAME
  let detectedMerchant = '';
  let suggestedCategoryId = 'cat-groceries';
  let suggestedTags: string[] = ['receipt'];

  // Match against known merchants first
  for (const m of KNOWN_MERCHANTS) {
    if (m.patterns.test(rawText)) {
      detectedMerchant = m.name;
      suggestedCategoryId = m.categoryId;
      suggestedTags = m.tags;
      break;
    }
  }

  // Fallback to finding the top heading line
  if (!detectedMerchant) {
    for (const line of lines.slice(0, 6)) {
      const clean = line.replace(/[^a-zA-Z0-9\s&'-]/g, '').trim();
      // Ignore common non-merchant header lines
      if (
        clean.length >= 3 &&
        !/welcome|receipt|customer|copy|cashier|terminal|store|date|time|tel|phone|www\.|http/i.test(
          clean
        )
      ) {
        detectedMerchant = clean;
        break;
      }
    }
  }

  if (!detectedMerchant && lines.length > 0) {
    detectedMerchant = lines[0].slice(0, 30);
  }

  // Auto-categorize based on keywords if not matched yet
  if (suggestedCategoryId === 'cat-groceries') {
    const lowerAll = rawText.toLowerCase();
    if (/coffee|cafe|latte|restaurant|bar|bistro|diner|pizza|burger|taco|grill|bakery/i.test(lowerAll)) {
      suggestedCategoryId = 'cat-food';
      suggestedTags = ['dining', 'food'];
    } else if (/gas|fuel|petrol|diesel|oil|chevron|shell|mobil|exxon/i.test(lowerAll)) {
      suggestedCategoryId = 'cat-transport';
      suggestedTags = ['fuel', 'commute'];
    } else if (/pharmacy|drug|health|clinic|vitamin|rx/i.test(lowerAll)) {
      suggestedCategoryId = 'cat-health';
      suggestedTags = ['health', 'pharmacy'];
    } else if (/apparel|clothing|shoes|fashion|boutique|electronics/i.test(lowerAll)) {
      suggestedCategoryId = 'cat-shopping';
      suggestedTags = ['shopping'];
    }
  }

  // 2. EXTRACT TOTAL AMOUNT
  let extractedTotal = 0;

  // Search for explicit TOTAL lines: TOTAL, AMOUNT DUE, BALANCE DUE, GRAND TOTAL, etc.
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Exclude subtotal lines
    if (/sub\s*total/i.test(line)) continue;

    // Check for "TOTAL", "AMOUNT DUE", "BALANCE DUE", "GRAND TOTAL"
    if (/(?:grand\s+total|\btotal\b|amount\s+due|balance\s+due|net\s+amount)/i.test(line)) {
      // Look for currency numbers like $12.50 or 12.50 or 1,234.50
      const matches = line.match(/(?:[\$€£₹¥]\s*)?([0-9]+[.,][0-9]{2})/g);
      if (matches && matches.length > 0) {
        const lastMatch = matches[matches.length - 1].replace(/[\$€£₹¥\s,]/g, '');
        const val = parseFloat(lastMatch);
        if (!isNaN(val) && val > 0) {
          extractedTotal = val;
          break;
        }
      } else if (i + 1 < lines.length) {
        // Sometimes the amount is printed on the next line
        const nextLineMatch = lines[i + 1].match(/(?:[\$€£₹¥]\s*)?([0-9]+[.,][0-9]{2})/);
        if (nextLineMatch) {
          const val = parseFloat(nextLineMatch[1].replace(/,/g, ''));
          if (!isNaN(val) && val > 0) {
            extractedTotal = val;
            break;
          }
        }
      }
    }
  }

  // Fallback: If no explicit total line was matched, pick the largest reasonable number before payments/cash
  if (extractedTotal === 0) {
    const numbers: number[] = [];
    for (const line of lines) {
      if (/tel|phone|zip|date|time|\b202\d\b/i.test(line)) continue;
      const matches = line.match(/\b([0-9]+[.,][0-9]{2})\b/g);
      if (matches) {
        for (const m of matches) {
          const val = parseFloat(m.replace(/,/g, ''));
          // Ignore unrealistic values (like barcodes or year numbers)
          if (!isNaN(val) && val > 0 && val < 5000) {
            numbers.push(val);
          }
        }
      }
    }
    if (numbers.length > 0) {
      extractedTotal = Math.max(...numbers);
    }
  }

  // 3. EXTRACT TAX
  let extractedTax: number | undefined = undefined;
  for (const line of lines) {
    if (/\btax\b|vat|gst|hst/i.test(line)) {
      const match = line.match(/([0-9]+[.,][0-9]{2})/);
      if (match) {
        const tVal = parseFloat(match[1]);
        if (!isNaN(tVal) && tVal > 0) {
          extractedTax = tVal;
          break;
        }
      }
    }
  }

  // 4. EXTRACT DATE
  let detectedDate = todayStr;

  // Look for date patterns: YYYY-MM-DD or MM/DD/YYYY or DD/MM/YYYY
  const dateRegex = /\b(\d{1,4})[/-](\d{1,2})[/-](\d{2,4})\b/;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      try {
        const part1 = parseInt(match[1], 10);
        const part2 = parseInt(match[2], 10);
        const part3 = parseInt(match[3], 10);

        if (part1 > 1900 && part1 < 2100) {
          // YYYY-MM-DD
          detectedDate = `${part1}-${String(part2).padStart(2, '0')}-${String(part3).padStart(2, '0')}`;
          break;
        } else if (part3 > 1900 || (part3 >= 20 && part3 <= 99)) {
          // MM/DD/YYYY or DD/MM/YYYY
          const year = part3 < 100 ? 2000 + part3 : part3;
          const month = Math.min(part1, 12);
          const day = Math.min(part2, 31);
          detectedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          break;
        }
      } catch (e) {
        // Keep fallback
      }
    }
  }

  // 5. EXTRACT ITEM LINES
  const detectedItems: { name: string; price: number }[] = [];
  for (const line of lines) {
    if (/(?:total|subtotal|tax|balance|cash|change|visa|mastercard|amex|debit|credit)/i.test(line)) {
      continue;
    }
    const itemMatch = line.match(/^([a-zA-Z0-9\s&'-]{3,28})\s+[\$€£₹¥]?([0-9]+[.,][0-9]{2})$/);
    if (itemMatch) {
      const p = parseFloat(itemMatch[2].replace(/,/g, ''));
      if (!isNaN(p) && p > 0 && p < extractedTotal) {
        detectedItems.push({
          name: itemMatch[1].trim(),
          price: p,
        });
      }
    }
  }

  return {
    merchant: detectedMerchant || 'Store Purchase',
    totalAmount: Number(extractedTotal.toFixed(2)),
    taxAmount: extractedTax ? Number(extractedTax.toFixed(2)) : undefined,
    date: detectedDate,
    suggestedCategoryId,
    suggestedTags,
    items: detectedItems.slice(0, 8),
    confidence: extractedTotal > 0 ? 0.92 : 0.65,
    rawText,
  };
};
