import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BookOpen, Package, ShoppingCart, Heart } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CourseCard } from "@/components/CourseCard";
import { ProductCard } from "@/components/ProductCard";
import {
  getMyLibrary,
  getMyOrders,
  getMyWishlist,
  getMyProducts,
  toggleWishlist,
} from "@/lib/account.functions";
import { formatPrice, formatDate } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/dashboard/student")({
  head: () => ({
    meta: [
      { title: "My Learning — CoreSkils" },
      { name: "description", content: "Your CoreSkils student dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const [section, setSection] = useState("overview");
  const queryClient = useQueryClient();

  const { data: library = [] } = useQuery({
    queryKey: ["my-library"],
    queryFn: () => getMyLibrary(),
  });
  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => getMyOrders(),
  });
  const { data: wishlist = [] } = useQuery({
    queryKey: ["my-wishlist"],
    queryFn: () => getMyWishlist(),
  });
  const { data: myProducts = [] } = useQuery({
    queryKey: ["my-products"],
    queryFn: () => getMyProducts(),
  });

  return (
    <DashboardLayout role="student" active={section} onNavigate={setSection}>
      {section === "overview" && (
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Enrolled courses", value: library.length, icon: BookOpen },
              { label: "Products owned", value: myProducts.length, icon: Package },
              { label: "Orders", value: orders.length, icon: ShoppingCart },
              { label: "Wishlist", value: wishlist.length, icon: Heart },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-6">
                <s.icon className="size-5 text-primary" />
                <p className="mt-3 text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          {library.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-muted-foreground">You haven't enrolled in any courses yet.</p>
              <Link
                to="/courses"
                className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Browse courses
              </Link>
            </div>
          )}
        </div>
      )}

      {section === "library" && (
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Learning</h1>
          {library.length === 0 ? (
            <p className="mt-6 text-muted-foreground">No enrolled courses yet.</p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {library.map((e: any) => (
                <CourseCard key={e.id} course={e.courses} />
              ))}
            </div>
          )}
        </div>
      )}

      {section === "products" && (
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Products</h1>
          {myProducts.length === 0 ? (
            <p className="mt-6 text-muted-foreground">No purchased products yet.</p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myProducts.map((e: any) => (
                <div key={e.id}>
                  <ProductCard product={e.products} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Acquired {formatDate(e.acquired_at)}
                    {e.expires_at && ` · expires ${formatDate(e.expires_at)}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === "orders" && (
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          {orders.length === 0 ? (
            <p className="mt-6 text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((o: any) => (
                <div key={o.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Order #{o.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {formatPrice(o.total_minor, o.currency)}
                      </p>
                      <span className="text-xs capitalize text-muted-foreground">{o.status}</span>
                    </div>
                  </div>
                  {o.order_items?.length > 0 && (
                    <ul className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
                      {o.order_items.map((i: any) => (
                        <li key={i.id}>{i.products?.title ?? "Item"}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === "wishlist" && (
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wishlist</h1>
          {wishlist.length === 0 ? (
            <p className="mt-6 text-muted-foreground">Your wishlist is empty.</p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((w: any) => (
                <div key={w.id} className="relative">
                  <ProductCard product={w.products} />
                  <button
                    onClick={async () => {
                      await toggleWishlist({ data: { productId: w.product_id } });
                      queryClient.invalidateQueries({ queryKey: ["my-wishlist"] });
                    }}
                    className="mt-2 text-xs font-medium text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
