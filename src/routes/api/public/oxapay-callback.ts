import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * OxaPay payment callback (webhook).
 * OxaPay POSTs payment status updates here; the HMAC-SHA512 signature of the
 * raw body (signed with the merchant API key) arrives in the `HMAC` header.
 */
export const Route = createFileRoute("/api/public/oxapay-callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const merchantKey = process.env["OXAPAY_MERCHANT_API_KEY"];
        if (!merchantKey) return new Response("not configured", { status: 500 });

        const rawBody = await request.text();
        const signature = request.headers.get("hmac") || request.headers.get("HMAC");
        const expected = createHmac("sha512", merchantKey).update(rawBody).digest("hex");
        if (
          !signature ||
          signature.length !== expected.length ||
          !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
        ) {
          return new Response("invalid signature", { status: 401 });
        }

        let payload: any;
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return new Response("bad json", { status: 400 });
        }

        const trackId = String(payload.trackId ?? payload.track_id ?? "");
        const status = String(payload.status ?? "").toLowerCase();
        if (!trackId) return new Response("missing trackId", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: payment } = await supabaseAdmin
          .from("oxapay_payments")
          .select("id, product_id, email, amount_minor, status")
          .eq("track_id", trackId)
          .maybeSingle();
        if (!payment) return new Response("unknown payment", { status: 200 });

        // Already processed — idempotent
        if (payment.status === "paid") return new Response("ok");

        if (status === "paid" || status === "confirming") {
          if (status === "paid") {
            await supabaseAdmin
              .from("oxapay_payments")
              .update({ status: "paid", paid_at: new Date().toISOString() })
              .eq("id", payment.id);

            // Grant access if the buyer has an account with this email
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("id")
              .eq("email", payment.email)
              .maybeSingle();

            if (profile) {
              const { data: product } = await supabaseAdmin
                .from("products")
                .select("access_plan, access_days, title, price_minor")
                .eq("id", payment.product_id)
                .single();

              let expiresAt: string | null = null;
              const days =
                product?.access_plan === "fixed_days"
                  ? product.access_days
                  : product?.access_plan === "monthly"
                    ? 30
                    : product?.access_plan === "yearly"
                      ? 365
                      : null;
              if (days) {
                const d = new Date();
                d.setDate(d.getDate() + days);
                expiresAt = d.toISOString();
              }

              const { data: order } = await supabaseAdmin
                .from("orders")
                .insert({
                  user_id: profile.id,
                  status: "paid",
                  total_minor: payment.amount_minor,
                })
                .select()
                .single();
              if (order) {
                await supabaseAdmin.from("order_items").insert({
                  order_id: order.id,
                  product_id: payment.product_id,
                  unit_price_minor: payment.amount_minor,
                });
              }
              await supabaseAdmin
                .from("digital_product_entitlements")
                .upsert({ user_id: profile.id, product_id: payment.product_id, expires_at: expiresAt });
            }
            // No account yet: payment stays "paid"; access is claimable after signup.
          } else {
            await supabaseAdmin
              .from("oxapay_payments")
              .update({ status: "confirming" })
              .eq("id", payment.id);
          }
        } else if (status === "expired" || status === "failed") {
          await supabaseAdmin
            .from("oxapay_payments")
            .update({ status })
            .eq("id", payment.id);
        }

        return new Response("ok");
      },
    },
  },
});
