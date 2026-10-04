import { Link } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: any }) {
  return (
    <Link
      to="/products/$productId"
      params={{ productId: product.public_slug ?? product.id }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-video bg-secondary">
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
      <div className="p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
          {product.type === "course" ? "Course" : "Digital product"}
        </span>
        <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-card-foreground group-hover:text-primary">
          {product.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {product.short_summary || product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-base font-bold text-foreground">
            {formatPrice(product.price_minor, product.currency)}
          </span>
          <span className="text-xs capitalize text-muted-foreground">
            {product.access_plan.replace("_", " ")}
          </span>
        </div>
      </div>
    </Link>
  );
}
