// Client-safe pricing helpers shared by the UI and the checkout server function.
// Each product stores its price in its own currency (e.g. USD 20.00 or INR 499).
// Visitors see the price converted to their local currency (from their IP country).
// Checkout charges in INR for India and USD everywhere else.

export type VisitorPricing = {
  country: string | null;
  /** Currency shown to the visitor (ISO code). */
  currency: string;
  /** Exchange rates: how many units of each currency equal 1 USD. */
  rates: Record<string, number>;
};

export const FALLBACK_RATES: Record<string, number> = { USD: 1, INR: 84 };

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
  // Unknown country (e.g. local development) shows INR.
  if (!country) return "INR";
  return COUNTRY_CURRENCY[country.toUpperCase()] ?? "USD";
}

function rateOf(currency: string, rates: Record<string, number>) {
  const r = rates[currency.toUpperCase()] ?? FALLBACK_RATES[currency.toUpperCase()];
  return r && r > 0 ? r : null;
}

/** Converts an amount in minor units between currencies. Returns null if a rate is missing. */
export function convertMinor(minor: number, from: string, to: string, rates: Record<string, number>) {
  if (from.toUpperCase() === to.toUpperCase()) return minor;
  const rf = rateOf(from, rates);
  const rt = rateOf(to, rates);
  if (!rf || !rt) return null;
  return Math.max(1, Math.round((minor / rf) * rt));
}

/** Amount (minor units) and currency the visitor should SEE. */
export function localizePrice(minor: number, productCurrency: string, pricing: Pick<VisitorPricing, "currency" | "rates">) {
  const converted = convertMinor(minor, productCurrency, pricing.currency, pricing.rates);
  if (converted !== null) return { minor: converted, currency: pricing.currency };
  const usd = convertMinor(minor, productCurrency, "USD", pricing.rates) ?? minor;
  return { minor: usd, currency: "USD" };
}

/** Amount (minor units) and currency the visitor is CHARGED: INR in India, USD elsewhere. */
export function chargePrice(minor: number, productCurrency: string, pricing: Pick<VisitorPricing, "currency" | "rates">) {
  const target = pricing.currency === "INR" ? "INR" : "USD";
  return { minor: convertMinor(minor, productCurrency, target, pricing.rates) ?? minor, currency: target };
}

export function formatMinor(minor: number, currency: string): string {
  const amount = minor / 100;
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 || amount >= 1000 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
