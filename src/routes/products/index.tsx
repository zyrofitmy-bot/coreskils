import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ProductCard } from "@/components/ProductCard";
import { listProducts, listCategories } from "@/lib/marketplace.functions";

const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts({ data: {} }),
});
const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategories(),
});

export const Route = createFileRoute("/products/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery);
    context.queryClient.ensureQueryData(categoriesQuery);
  },
  head: () => ({
    meta: [
      { title: "Digital Products — CoreSkils" },
      { name: "description", content: "Guides, templates and digital products from CoreSkils creators." },
      { property: "og:title", content: "Digital Products — CoreSkils" },
      { property: "og:description", content: "Guides, templates and digital products from CoreSkils creators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const [category, setCategory] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const filtered = products.filter(
    (p: any) =>
      (!category || p.categories?.slug === category) &&
      (!q || p.title.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="text-4xl font-bold text-foreground">Digital products</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Guides, templates, and tools you can download and use today.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => setCategory(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !category ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            All
          </button>
          {categories.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                category === c.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">
            No products found. Check back soon.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
