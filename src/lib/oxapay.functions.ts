import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * Creates an OxaPay invoice for a digital product and returns the pay link.
 * Works for guests (email only) — entitlement is granted by the callback
 * webhook once OxaPay confirms payment. Hosts without privileged backend
 * access (e.g. Vercel) forward the request to the Lovable deployment.
 */
export const createOxaPayPayment = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        productId: z.string().uuid(),
        email: z.string().email(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { createPaymentCore, hasPrivilegedBackend, PAYMENT_BACKEND_URL } = await import(
      "./oxapay.server"
    );
    const { resolveVisitorPricing, detectVisitorCountry } = await import("./pricing.server");
    const origin = new URL(getRequest().url).origin;

    if (hasPrivilegedBackend()) {
      const pricing = await resolveVisitorPricing();
      return createPaymentCore({
        productId: data.productId,
        email: data.email,
        pricing,
        callbackOrigin: origin,
        returnOrigin: origin,
      });
    }

    const res = await fetch(`${PAYMENT_BACKEND_URL}/api/public/oxapay-create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: data.productId,
        email: data.email,
        country: detectVisitorCountry(),
        returnOrigin: origin,
      }),
    });
    const payload = (await res.json().catch(() => null)) as any;
    if (!res.ok || !payload?.payLink) {
      throw new Error(payload?.error || "Could not create payment. Please try again.");
    }
    return { payLink: String(payload.payLink), trackId: String(payload.trackId) };
  });

/** Lets the success page check whether a payment has been confirmed. */
export const getOxaPayPaymentStatus = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ trackId: z.string().max(100) }).parse(d))
  .handler(async ({ data }) => {
    const { getPaymentStatusCore, hasPrivilegedBackend, PAYMENT_BACKEND_URL } = await import(
      "./oxapay.server"
    );
    if (hasPrivilegedBackend()) return getPaymentStatusCore(data.trackId);
    const res = await fetch(
      `${PAYMENT_BACKEND_URL}/api/public/oxapay-status?trackId=${encodeURIComponent(data.trackId)}`,
    );
    const payload = (await res.json().catch(() => null)) as any;
    return {
      status: String(payload?.status ?? "unknown"),
      productId: payload?.productId ?? null,
      productTitle: payload?.productTitle ?? null,
      productSlug: payload?.productSlug ?? null,
    };
  });
