// Client-safe pricing helpers shared by the UI and the checkout server function.
// Product prices are stored in INR (paise). Visitors outside India see and pay in USD.

export type VisitorPricing = {
  country: string | null;
  currency: "INR" | "USD";
  /** How many INR equal 1 USD. */
  inrPerUsd: number;
};

export const FALLBACK_INR_PER_USD = 84;

export function currencyForCountry(country: string | null | undefined): "INR" | "USD" {
  // Unknown country (e.g. local development) keeps the original INR price.
  if (!country) return "INR";
  return country.toUpperCase() === "IN" ? "INR" : "USD";
}

/** Converts an INR amount in paise to USD cents. */
export function inrMinorToUsdCents(inrMinor: number, inrPerUsd: number): number {
  const rate = inrPerUsd > 0 ? inrPerUsd : FALLBACK_INR_PER_USD;
  return Math.max(1, Math.round(inrMinor / rate));
}

/** Returns the amount (minor units) and currency the visitor should see and pay. */
export function localizeInrPrice(
  inrMinor: number,
  pricing: Pick<VisitorPricing, "currency" | "inrPerUsd">,
): { minor: number; currency: "INR" | "USD" } {
  if (pricing.currency === "USD") {
    return { minor: inrMinorToUsdCents(inrMinor, pricing.inrPerUsd), currency: "USD" };
  }
  return { minor: inrMinor, currency: "INR" };
}

export function formatMinor(minor: number, currency: string): string {
  const amount = minor / 100;
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
