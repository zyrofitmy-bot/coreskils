import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getOxaPayPaymentStatus } from "@/lib/oxapay.functions";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    trackId: typeof search["trackId"] === "string" ? search["trackId"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Payment Status — CoreSkils" },
      { name: "description", content: "Check your CoreSkils payment status and access your digital product." },
    ],
  }),
  component: PaymentSuccess,
});

function PaymentSuccess() {
  const { trackId } = useSearch({ from: "/payment/success" });

  const { data, isLoading } = useQuery({
    queryKey: ["oxapay-status", trackId],
    queryFn: () => getOxaPayPaymentStatus({ data: { trackId } }),
    enabled: Boolean(trackId),
    refetchInterval: (query) =>
      query.state.data?.status === "paid" ? false : 8000,
  });

  const status = data?.status ?? (trackId ? "waiting" : "unknown");
  const paid = status === "paid";

  return (
    <PublicLayout>
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] px-4 pt-24 pb-16 text-center">
        {isLoading ? (
          <Loader2 className="h-12 w-12 animate-spin text-[#10A364]" />
        ) : paid ? (
          <>
            <CheckCircle2 className="mb-4 h-16 w-16 text-[#10A364]" />
            <h1 className="mb-2 text-[32px] font-bold text-[#0F1C16]">Payment successful!</h1>
            <p className="mb-8 max-w-md text-[16px] text-[#5A6C64]">
              {data?.productTitle
                ? `Your payment for "${data.productTitle}" is confirmed.`
                : "Your payment is confirmed."}{" "}
              {data && "downloadUrl" in data && data.downloadUrl
                ? "Download your e-book below. The link stays valid for 24 hours — you can also open this page again later."
                : "Sign in (or create an account) with the same email you used at checkout to access your product in My Library."}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {data && "downloadUrl" in data && data.downloadUrl ? (
                <Button asChild className="h-12 rounded-lg bg-primary px-8 font-semibold text-white hover:bg-[#10A364]">
                  <a href={data.downloadUrl} target="_blank" rel="noopener noreferrer">Download your e-book (PDF)</a>
                </Button>
              ) : (
                <Button asChild className="h-12 rounded-lg bg-primary px-8 font-semibold text-white hover:bg-[#10A364]">
                  <Link to="/auth/login">Sign in to access</Link>
                </Button>
              )}
              {data?.productSlug && (
                <Button asChild variant="outline" className="h-12 rounded-lg px-8 font-semibold">
                  <Link to="/products/$productId" params={{ productId: data.productSlug }}>
                    Back to product
                  </Link>
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <Clock className="mb-4 h-16 w-16 text-[#E8A13A]" />
            <h1 className="mb-2 text-[32px] font-bold text-[#0F1C16]">
              {status === "confirming" ? "Confirming your payment…" : "Waiting for payment…"}
            </h1>
            <p className="mb-8 max-w-md text-[16px] text-[#5A6C64]">
              Your crypto payment is being verified on the blockchain. This page updates automatically — it usually takes a few minutes.
            </p>
            <Button asChild variant="outline" className="h-12 rounded-lg px-8 font-semibold">
              <Link to="/products">Browse products</Link>
            </Button>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
