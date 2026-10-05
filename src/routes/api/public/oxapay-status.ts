import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Returns only the payment status and product name for a track ID (no personal data).
export const Route = createFileRoute("/api/public/oxapay-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const trackId = new URL(request.url).searchParams.get("trackId") ?? "";
        if (!z.string().min(1).max(100).safeParse(trackId).success) {
          return Response.json({ status: "unknown" });
        }
        const { getPaymentStatusCore } = await import("@/lib/oxapay.server");
        return Response.json(await getPaymentStatusCore(trackId));
      },
    },
  },
});
