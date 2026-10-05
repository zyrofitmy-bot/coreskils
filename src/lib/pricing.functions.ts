import { createServerFn } from "@tanstack/react-start";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { FALLBACK_RATES, approxLocalHint, finalPrice, formatMinor, type VisitorPricing } from "./pricing";

const FALLBACK: VisitorPricing = { country: null, currency: "INR", rates: FALLBACK_RATES };

export const getVisitorPricing = createServerFn({ method: "GET" }).handler(
  async (): Promise<VisitorPricing> => {
    try {
      const { resolveVisitorPricing } = await import("./pricing.server");
      return await resolveVisitorPricing();
    } catch {
      return FALLBACK;
    }
  },
);

export const visitorPricingQuery = queryOptions({
  queryKey: ["visitor-pricing-v2"],
  queryFn: () => getVisitorPricing(),
  staleTime: Infinity,
});

export function useVisitorPricing() {
  return useQuery(visitorPricingQuery).data ?? FALLBACK;
}

/** Returns a formatter that shows the exact price the visitor will pay (INR in India, USD elsewhere). */
export function useLocalPrice() {
  const pricing = useVisitorPricing();
  return useCallback(
    (minor: number | null | undefined, currency?: string | null) => {
      const m = minor ?? 0;
      if (m === 0) return "Free";
      const local = finalPrice(m, currency || "INR", pricing);
      return formatMinor(local.minor, local.currency);
    },
    [pricing],
  );
}

/** Returns an "≈ local currency" hint (or null) for visitors outside India/USA. */
export function useLocalHint() {
  const pricing = useVisitorPricing();
  return useCallback(
    (minor: number | null | undefined, currency?: string | null) =>
      (minor ?? 0) > 0 ? approxLocalHint(minor ?? 0, currency || "INR", pricing) : null,
    [pricing],
  );
}
