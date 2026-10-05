import { getRequest } from "@tanstack/react-start/server";
import { FALLBACK_INR_PER_USD, currencyForCountry, type VisitorPricing } from "./pricing";

let cachedRate: { value: number; at: number } | null = null;
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

export async function getInrPerUsd(): Promise<number> {
  if (cachedRate && Date.now() - cachedRate.at < RATE_TTL_MS) return cachedRate.value;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(3000),
    });
    const json = (await res.json()) as { rates?: Record<string, number> };
    const rate = json?.rates?.["INR"];
    if (typeof rate === "number" && rate > 10 && rate < 1000) {
      cachedRate = { value: rate, at: Date.now() };
      return rate;
    }
  } catch (e) {
    console.error("Exchange rate fetch failed", e);
  }
  return cachedRate?.value ?? FALLBACK_INR_PER_USD;
}

export async function resolveVisitorPricing(): Promise<VisitorPricing> {
  const country = detectVisitorCountry();
  const currency = currencyForCountry(country);
  const inrPerUsd = currency === "USD" ? await getInrPerUsd() : FALLBACK_INR_PER_USD;
  return { country, currency, inrPerUsd };
}
