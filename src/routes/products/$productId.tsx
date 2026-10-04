import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Heart, Package } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getProduct } from "@/lib/marketplace.functions";
import { acquireProduct, toggleWishlist } from "@/lib/account.functions";
import { formatPrice } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: () => getProduct({ data: { id } }),
  });

export const Route = createFileRoute("/products/$productId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(productQuery(params.productId)),
  head: () => ({
    meta: [
      { title: "Product — CoreSkils" },
      { name: "description", content: "Digital product on CoreSkils." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(productId));
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  if (!product) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link to="/products" className="mt-4 inline-block text-primary hover:underline">
            Browse all products
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const sp = (product.sales_page ?? {}) as any;

  async function handleBuy() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    try {
      await acquireProduct({ data: { productId: product!.id } });
      toast.success("It's yours! Find it in your dashboard.");
      navigate({ to: "/dashboard/student" });
    } catch (e: any) {
      toast.error(e.message ?? "Could not complete purchase");
    } finally {
      setBusy(false);
    }
  }

  async function handleWishlist() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      navigate({ to: "/auth" });
      return;
    }
    try {
      const res = await toggleWishlist({ data: { productId: product!.id } });
      toast.success(res.wishlisted ? "Added to wishlist" : "Removed from wishlist");
    } catch (e: any) {
      toast.error(e.message ?? "Could not update wishlist");
    }
  }

  return (
    <PublicLayout>
      <section className="bg-secondary/50 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1fr_360px]">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              {product.type === "course" ? "Course" : "Digital product"}
            </span>
            <h1 className="mt-2 text-4xl font-bold text-foreground">{product.title}</h1>
            {sp.tagline && (
              <p className="mt-3 text-xl font-medium text-foreground">{sp.tagline}</p>
            )}
            <p className="mt-4 text-lg text-muted-foreground">
              {product.short_summary || product.description}
            </p>
            {product.creator && (
              <div className="mt-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {product.creator.display_name?.[0] ?? "C"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {product.creator.display_name}
                  </p>
                  {product.creator.username && (
                    <Link
                      to="/creators/$username"
                      params={{ username: product.creator.username }}
                      className="text-xs text-primary hover:underline"
                    >
                      View creator profile
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="aspect-video overflow-hidden rounded-xl bg-secondary">
              {product.cover_image_url ? (
                <img
                  src={product.cover_image_url}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="size-10 text-primary/40" />
                </div>
              )}
            </div>
            <p className="mt-5 text-3xl font-bold text-foreground">
              {formatPrice(product.price_minor, product.currency)}
            </p>
            <p className="mt-1 text-sm capitalize text-muted-foreground">
              {product.access_plan.replace("_", " ")} access
              {product.trial_days > 0 && ` · ${product.trial_days}-day trial`}
            </p>
            <button
              onClick={handleBuy}
              disabled={busy}
              className="mt-4 w-full rounded-full bg-action py-3 text-base font-semibold text-action-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {busy ? "Processing…" : sp.ctaLabel || "Get instant access"}
            </button>
            <button
              onClick={handleWishlist}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <Heart className="size-4" /> Save for later
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl space-y-12">
          {sp.benefits?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground">What you get</h2>
              <ul className="mt-4 space-y-2">
                {sp.benefits.map((b: string) => (
                  <li key={b} className="flex items-start gap-2 text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {sp.includedItems?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground">Included</h2>
              <ul className="mt-4 space-y-2">
                {sp.includedItems.map((b: string) => (
                  <li key={b} className="flex items-start gap-2 text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {sp.sections?.map((s: any) => (
            <div key={s.heading}>
              <h2 className="text-2xl font-bold text-foreground">{s.heading}</h2>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{s.body}</p>
            </div>
          ))}
          {product.description && sp.sections?.length > 0 === false && (
            <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
          )}
          {sp.faqs?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground">FAQ</h2>
              <div className="mt-4 space-y-4">
                {sp.faqs.map((f: any) => (
                  <div key={f.question} className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-semibold text-card-foreground">{f.question}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
