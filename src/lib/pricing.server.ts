import { getRequest } from "@tanstack/react-start/server";
import { FALLBACK_RATES, currencyForCountry, type VisitorPricing } from "./pricing";

let cachedRates: { value: Record<string, number>; at: number } | null = null;
const RATE_TTL_MS = 6 * 60 * 60 * 1000;

/** Reads the visitor's country from the hosting provider's IP geolocation headers. */
export function detectVisitorCountry(): string | null {
  try {
    const h = getRequest().headers;
    const raw =
      h.get("x-vercel-ip-country") ||
      h.get("cf-ipcountry") ||
      h.get("x-country-code") ||
      h.get("cloudfront-viewer-country");
    if (!raw || raw === "XX" || raw === "T1") return null;
    return raw.toUpperCase();
  } catch {
    return null;
  }
}

/** All exchange rates relative to 1 USD, cached for six hours. */
export async function getUsdRates(): Promise<Record<string, number>> {
  if (cachedRates && Date.now() - cachedRates.at < RATE_TTL_MS) return cachedRates.value;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(3000),
    });
    const json = (await res.json()) as { rates?: Record<string, number> };
    const inr = json?.rates?.["INR"];
    if (json?.rates && typeof inr === "number" && inr > 10 && inr < 1000) {
      cachedRates = { value: json.rates, at: Date.now() };
      return json.rates;
    }
  } catch (e) {
    console.error("Exchange rate fetch failed", e);
  }
  return cachedRates?.value ?? FALLBACK_RATES;
}

export async function resolvePricingForCountry(country: string | null): Promise<VisitorPricing> {
  const currency = currencyForCountry(country);
  const all = await getUsdRates();
  const rates: Record<string, number> = { USD: 1, INR: all["INR"] ?? FALLBACK_RATES["INR"]! };
  if (all[currency]) rates[currency] = all[currency]!;
  return { country, currency: rates[currency] ? currency : "USD", rates };
}

export async function resolveVisitorPricing(): Promise<VisitorPricing> {
  return resolvePricingForCountry(detectVisitorCountry());
}
