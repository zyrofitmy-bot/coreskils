// Server-only OxaPay helpers. Payment records are written with the privileged
// backend client, so these run only where that backend access is configured
// (the Lovable deployment). Other hosts (e.g. Vercel) proxy to it.
import { localizeInrPrice, type VisitorPricing } from "./pricing";

export const PAYMENT_BACKEND_URL = "https://coreskils.lovable.app";

const ALLOWED_RETURN_HOSTS = [
  "coreskils.org",
  "www.coreskils.org",
  "coreskills.org",
  "www.coreskills.org",
  "coreskils.lovable.app",
];

export function hasPrivilegedBackend() {
  return Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_SERVICE_ROLE_KEY"]);
}

/** Only allow redirects back to our own sites. */
export function safeReturnOrigin(candidate: string | undefined, fallback: string) {
  if (!candidate) return fallback;
  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    const ok =
      url.protocol === "https:" &&
      (ALLOWED_RETURN_HOSTS.includes(host) ||
        host.endsWith(".vercel.app") ||
        host.endsWith(".lovable.app"));
    return ok ? url.origin : fallback;
  } catch {
    return fallback;
  }
}

export async function createPaymentCore(input: {
  productId: string;
  email: string;
  pricing: Pick<VisitorPricing, "currency" | "inrPerUsd">;
  callbackOrigin: string;
  returnOrigin: string;
}) {
  const merchantKey = process.env["OXAPAY_MERCHANT_API_KEY"];
  if (!merchantKey) throw new Error("Payment gateway is not configured");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: product } = await supabaseAdmin
    .from("products")
    .select("id, title, price_minor, currency, status")
    .eq("id", input.productId)
    .eq("status", "published")
    .single();
  if (!product) throw new Error("Product not found");
  if ((product.price_minor ?? 0) <= 0) throw new Error("This product is free");

  const charge = localizeInrPrice(product.price_minor, input.pricing);

  const res = await fetch("https://api.oxapay.com/v1/payment/invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json", merchant_api_key: merchantKey },
    body: JSON.stringify({
      amount: charge.minor / 100,
      currency: charge.currency,
      lifetime: 60,
      fee_paid_by_payer: 1,
      under_paid_coverage: 0,
      description: `CoreSkils: ${product.title}`,
      callback_url: `${input.callbackOrigin}/api/public/oxapay-callback`,
      return_url: `${input.returnOrigin}/payment/success`,
      order_id: product.id,
      email: input.email,
    }),
  });

  const payload = (await res.json().catch(() => null)) as any;
  const payLink = payload?.data?.payment_url ?? payload?.payLink;
  const trackId = payload?.data?.track_id ?? payload?.trackId;
  if (!res.ok || !payLink || !trackId) {
    console.error("OxaPay invoice failed", payload);
    throw new Error(payload?.message || "Could not create payment. Please try again.");
  }

  const { error } = await supabaseAdmin.from("oxapay_payments").insert({
    track_id: String(trackId),
    product_id: product.id,
    email: input.email.toLowerCase(),
    amount_minor: product.price_minor,
    currency: product.currency || "INR",
    status: "waiting",
    pay_link: payLink,
  });
  if (error) throw new Error(error.message);

  return { payLink: String(payLink), trackId: String(trackId) };
}

export async function getPaymentStatusCore(trackId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: payment } = await supabaseAdmin
    .from("oxapay_payments")
    .select("status, product_id, products(title, public_slug)")
    .eq("track_id", trackId)
    .maybeSingle();
  if (!payment) return { status: "unknown" as string };
  return {
    status: payment.status as string,
    productId: payment.product_id as string,
    productTitle: ((payment as any).products?.title ?? null) as string | null,
    productSlug: ((payment as any).products?.public_slug ?? null) as string | null,
  };
}
