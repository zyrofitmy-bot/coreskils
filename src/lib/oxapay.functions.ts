import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * Creates an OxaPay invoice for a digital product and returns the pay link.
 * Works for guests (email only) — entitlement is granted by the callback
 * webhook once OxaPay confirms payment.
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
    const merchantKey = process.env["OXAPAY_MERCHANT_API_KEY"];
    if (!merchantKey) throw new Error("Payment gateway is not configured");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, title, price_minor, currency, status")
      .eq("id", data.productId)
      .eq("status", "published")
      .single();
    if (!product) throw new Error("Product not found");
    if ((product.price_minor ?? 0) <= 0) throw new Error("This product is free");

    const origin = new URL(getRequest().url).origin;
    const amountInr = product.price_minor / 100;

    const res = await fetch("https://api.oxapay.com/v1/payment/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amountInr,
        currency: "INR",
        lifeTime: 60,
        feePaidByPayer: 1,
        underPaidCoverage: 0,
        description: `CoreSkils: ${product.title}`,
        callbackUrl: `${origin}/api/public/oxapay-callback`,
        returnUrl: `${origin}/payment/success`,
        orderId: product.id,
        email: data.email,
      }),
    });

    const payload = (await res.json().catch(() => null)) as any;
    if (!res.ok || !payload || payload.result !== 100 || !payload.payLink) {
      console.error("OxaPay invoice failed", payload);
      throw new Error(payload?.message || "Could not create payment. Please try again.");
    }

    const { error } = await supabaseAdmin.from("oxapay_payments").insert({
      track_id: String(payload.trackId),
      product_id: product.id,
      email: data.email.toLowerCase(),
      amount_minor: product.price_minor,
      currency: product.currency || "INR",
      status: "waiting",
      pay_link: payload.payLink,
    });
    if (error) throw new Error(error.message);

    return { payLink: payload.payLink as string, trackId: String(payload.trackId) };
  });

/** Lets the success page check whether a payment has been confirmed. */
export const getOxaPayPaymentStatus = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ trackId: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: payment } = await supabaseAdmin
      .from("oxapay_payments")
      .select("status, product_id, products(title, slug)")
      .eq("track_id", data.trackId)
      .maybeSingle();
    if (!payment) return { status: "unknown" as const };
    return {
      status: payment.status as string,
      productId: payment.product_id as string,
      productTitle: (payment as any).products?.title ?? null,
      productSlug: (payment as any).products?.slug ?? null,
    };
  });
