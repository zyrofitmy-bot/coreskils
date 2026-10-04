import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BookOpen, Package, ShoppingCart, Heart, Video, Trophy } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CourseCard } from "@/components/CourseCard";
import { ProductCard } from "@/components/ProductCard";
import { getMyLibrary, getMyOrders, getMyWishlist, getMyProducts, toggleWishlist, getMyAccount } from "@/lib/account.functions";
import { formatPrice, formatDate } from "@/lib/format";
import { UpgradeCreatorButton } from "@/components/auth/UpgradeCreatorButton";

export const Route = createFileRoute("/_authenticated/dashboard/student")({
  component: StudentDashboard,
});

function StudentDashboard() {
  const [section, setSection] = useState("overview");
  const queryClient = useQueryClient();

  const { data: account } = useQuery({ queryKey: ["my-account"], queryFn: () => getMyAccount() });
  const { data: library = [] } = useQuery({ queryKey: ["my-library"], queryFn: () => getMyLibrary() });
  const { data: orders = [] } = useQuery({ queryKey: ["my-orders"], queryFn: () => getMyOrders() });
  const { data: wishlist = [] } = useQuery({ queryKey: ["my-wishlist"], queryFn: () => getMyWishlist() });
  const { data: myProducts = [] } = useQuery({ queryKey: ["my-products"], queryFn: () => getMyProducts() });

  return (
    <DashboardLayout role="student" active={section} onNavigate={setSection}>
      {section === "overview" && (
        <div className="space-y-12">
          <div>
            <h1 className="text-4xl font-bold text-black tracking-tight">Welcome back, {account?.profile?.name?.split(' ')[0] || "Student"}!</h1>
            <p className="mt-1 text-[#4D4D4D]">Ready to learn something new today?</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-[#515151] p-8 text-white shadow-sm">
              <h3 className="mb-6 font-bold">Learning Stats</h3>
              <div className="space-y-6">
                {[
                  { label: "Courses Enrolled", value: library.length, icon: BookOpen },
                  { label: "Products Acquired", value: myProducts.length, icon: Package },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-white/10"><s.icon className="size-6" /></div>
                      <div>
                        <p className="font-medium">{s.label}</p>
                        <p className="text-[13px] text-[#A3A3A3]">All time</p>
                      </div>
                    </div>
                    <span className="text-[32px] font-bold text-primary">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <Trophy className="mb-5 size-14 text-primary" />
              <h3 className="mb-3 text-[24px] font-bold text-black">Ready to share your knowledge?</h3>
              <p className="mb-6 max-w-sm text-[14px] text-[#4D4D4D]">Upgrade your account to become a creator. Start building courses and digital products today.</p>
              <UpgradeCreatorButton />
            </div>
          </div>
        </div>
      )}

      {section === "library" && (
        <div>
          <h1 className="text-3xl font-bold text-black">My Learning</h1>
          {library.length === 0 ? <p className="mt-6 text-[#4D4D4D]">No enrolled courses yet.</p> : <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{library.map((e: any) => <CourseCard key={e.id} course={e.courses} />)}</div>}
        </div>
      )}

      {section === "products" && (
        <div>
          <h1 className="text-3xl font-bold text-black">My Products</h1>
          {myProducts.length === 0 ? <p className="mt-6 text-[#4D4D4D]">No purchased products yet.</p> : <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{myProducts.map((e: any) => <div key={e.id}><ProductCard product={e.products} /><p className="mt-2 text-xs text-[#4D4D4D]">Acquired {formatDate(e.acquired_at)}</p></div>)}</div>}
        </div>
      )}

      {section === "orders" && (
        <div>
          <h1 className="text-3xl font-bold text-black">Orders</h1>
          {orders.length === 0 ? <p className="mt-6 text-[#4D4D4D]">No orders yet.</p> : <div className="mt-6 space-y-4">{orders.map((o: any) => <div key={o.id} className="rounded-xl border border-border bg-card p-5"><div className="flex justify-between items-center"><p className="font-semibold">Order #{o.id.slice(0, 8)}</p><p className="font-bold">{formatPrice(o.total_minor, o.currency)}</p></div><p className="text-sm text-[#4D4D4D]">{formatDate(o.created_at)}</p></div>)}</div>}
        </div>
      )}

      {section === "wishlist" && (
        <div>
          <h1 className="text-3xl font-bold text-black">Wishlist</h1>
          {wishlist.length === 0 ? <p className="mt-6 text-[#4D4D4D]">Your wishlist is empty.</p> : <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{wishlist.map((w: any) => <div key={w.id} className="relative"><ProductCard product={w.products} /><button onClick={async () => { await toggleWishlist({ data: { productId: w.product_id } }); queryClient.invalidateQueries({ queryKey: ["my-wishlist"] }); }} className="mt-2 text-xs font-medium text-destructive hover:underline">Remove</button></div>)}</div>}
        </div>
      )}

      {section === "live-classes" && (
        <div>
          <h1 className="text-3xl font-bold text-black">Live Classes</h1>
          <p className="mt-6 text-[#4D4D4D]">Live classes feature coming soon (Phase 2).</p>
        </div>
      )}
    </DashboardLayout>
  );
}
