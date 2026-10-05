import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Creates an OxaPay invoice. Used by other hosts of this site (e.g. Vercel)
// that don't have privileged backend access. Prices always come from the
// database; the caller can only choose INR (India) or USD (elsewhere).
const Body = z.object({
  productId: z.string().uuid(),
  email: z.string().email().max(255),
  country: z.string().max(4).nullable().optional(),
  returnOrigin: z.string().url().max(200).optional(),
});

export const Route = createFileRoute("/api/public/oxapay-create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
        try {
          const { createPaymentCore, safeReturnOrigin } = await import("@/lib/oxapay.server");
          const { getInrPerUsd } = await import("@/lib/pricing.server");
          const { currencyForCountry } = await import("@/lib/pricing");
          const currency = currencyForCountry(parsed.data.country);
          const inrPerUsd = currency === "USD" ? await getInrPerUsd() : 84;
          const origin = new URL(request.url).origin;
          const result = await createPaymentCore({
            productId: parsed.data.productId,
            email: parsed.data.email,
            pricing: { currency, inrPerUsd },
            callbackOrigin: origin,
            returnOrigin: safeReturnOrigin(parsed.data.returnOrigin, origin),
          });
          return Response.json(result);
        } catch (e) {
          return Response.json(
            { error: e instanceof Error ? e.message : "Could not create payment" },
            { status: 400 },
          );
        }
      },
    },
  },
});
