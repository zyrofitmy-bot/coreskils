import { createServerFn } from "@tanstack/react-start";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { formatMinor, localizeInrPrice, type VisitorPricing } from "./pricing";

export const getVisitorPricing = createServerFn({ method: "GET" }).handler(
  async (): Promise<VisitorPricing> => {
    try {
      const { resolveVisitorPricing } = await import("./pricing.server");
      return await resolveVisitorPricing();
    } catch {
      return { country: null, currency: "INR", inrPerUsd: 84 };
    }
  },
);

export const visitorPricingQuery = queryOptions({
  queryKey: ["visitor-pricing"],
  queryFn: () => getVisitorPricing(),
  staleTime: Infinity,
});

/** Returns a formatter that shows INR prices in the visitor's currency (INR in India, USD elsewhere). */
export function useLocalPrice() {
  const { data } = useQuery(visitorPricingQuery);
  return useCallback(
    (inrMinor: number | null | undefined, _currency?: string | null) => {
      const minor = inrMinor ?? 0;
      if (minor === 0) return "Free";
      const local = localizeInrPrice(minor, data ?? { currency: "INR", inrPerUsd: 84 });
      return formatMinor(local.minor, local.currency);
    },
    [data],
  );
}
