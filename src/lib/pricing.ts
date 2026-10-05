// Client-safe pricing helpers shared by the UI and the checkout server function.
// Rule: visitors in India pay in INR, everyone else pays in USD.
// The price SHOWN and the price CHARGED come from the same function (finalPrice),
// so they can never differ. Other local currencies are only an "approx." hint.

export type VisitorPricing = {
  country: string | null;
  /** Visitor's local currency (ISO code) — used only for the approx. hint. */
  currency: string;
  /** Exchange rates: how many units of each currency equal 1 USD. */
  rates: Record<string, number>;
};

export const FALLBACK_RATES: Record<string, number> = { USD: 1, INR: 85 };

const EURO = ["AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES","HR"];
const COUNTRY_CURRENCY: Record<string, string> = {
  IN: "INR", US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", NZ: "NZD", SG: "SGD", AE: "AED",
  SA: "SAR", QA: "QAR", KW: "KWD", OM: "OMR", BH: "BHD", JP: "JPY", CN: "CNY", HK: "HKD",
  KR: "KRW", MY: "MYR", ID: "IDR", TH: "THB", PH: "PHP", VN: "VND", PK: "PKR", BD: "BDT",
  NP: "NPR", LK: "LKR", ZA: "ZAR", NG: "NGN", KE: "KES", EG: "EGP", BR: "BRL", MX: "MXN",
  AR: "ARS", CL: "CLP", CO: "COP", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN",
  CZ: "CZK", HU: "HUF", RO: "RON", TR: "TRY", IL: "ILS", RU: "RUB", UA: "UAH",
  ...Object.fromEntries(EURO.map((c) => [c, "EUR"])),
};

export function currencyForCountry(country: string | null | undefined): string {
  // Unknown country (e.g. local development) is treated as India.
  if (!country) return "INR";
  return COUNTRY_CURRENCY[country.toUpperCase()] ?? "USD";
}

function rateOf(currency: string, rates: Record<string, number>) {
  const r = rates[currency.toUpperCase()] ?? FALLBACK_RATES[currency.toUpperCase()];
  return r && r > 0 ? r : null;
}

/** Plain conversion in minor units. Returns null if a rate is missing. */
export function convertMinor(minor: number, from: string, to: string, rates: Record<string, number>) {
  if (from.toUpperCase() === to.toUpperCase()) return minor;
  const rf = rateOf(from, rates);
  const rt = rateOf(to, rates);
  if (!rf || !rt) return null;
  return Math.max(1, Math.round((minor / rf) * rt));
}

/** Currency the visitor pays in: INR for India, USD for everyone else. */
export function payCurrency(pricing: Pick<VisitorPricing, "currency">): "INR" | "USD" {
  return pricing.currency === "INR" ? "INR" : "USD";
}

/**
 * The one and only price for a visitor — used for display AND for the OxaPay invoice.
 * Converted prices are rounded to clean numbers (₹1,699 / $2.99).
 */
export function finalPrice(minor: number, productCurrency: string, pricing: Pick<VisitorPricing, "currency" | "rates">) {
  const from = (productCurrency || "INR").toUpperCase();
  const target = payCurrency(pricing);
  if (from === target) return { minor, currency: target };

  const raw = convertMinor(minor, from, target, pricing.rates) ?? convertMinor(minor, from, target, FALLBACK_RATES)!;
  if (target === "INR") {
    // Whole rupees ending in 9, e.g. ₹1,699, ₹249.
    const rupees = Math.max(9, Math.round(raw / 100 / 10) * 10 - 1);
    return { minor: rupees * 100, currency: target };
  }
  // USD ending in .99, e.g. $2.99, $11.99.
  const cents = Math.max(99, Math.ceil(raw / 100) * 100 - 1);
  return { minor: cents, currency: target };
}

/** Backwards-compatible aliases — both return exactly the same value. */
export const localizePrice = finalPrice;
export const chargePrice = finalPrice;

/** Optional "≈ £15.70" hint for visitors whose local currency isn't INR/USD. */
export function approxLocalHint(minor: number, productCurrency: string, pricing: VisitorPricing): string | null {
  const local = pricing.currency.toUpperCase();
  if (local === "INR" || local === "USD") return null;
  const price = finalPrice(minor, productCurrency, pricing);
  const converted = convertMinor(price.minor, price.currency, local, pricing.rates);
  if (converted === null) return null;
  return `≈ ${formatMinor(converted, local)}`;
}

export function formatMinor(minor: number, currency: string): string {
  const amount = minor / 100;
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
