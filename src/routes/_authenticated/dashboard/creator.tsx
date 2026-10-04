import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, BookOpen, Package, DollarSign, BarChart3, UserRound } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getMyCreatorCourses, getMyCreatorProducts, getMySalesSummary, saveCourse, saveProduct } from "@/lib/creator.functions";
import { getMyAccount } from "@/lib/account.functions";
import { formatPrice } from "@/lib/format";
import { ProductFormDialog } from "@/components/dashboard/ProductFormDialog";

export const Route = createFileRoute("/_authenticated/dashboard/creator")({
  component: CreatorDashboard,
});

function CreatorDashboard() {
  const [section, setSection] = useState("overview");
  const { data: account, isLoading } = useQuery({ queryKey: ["my-account"], queryFn: () => getMyAccount() });
  
  if (isLoading) return <div className="p-10">Loading...</div>;
  if (!account?.roles.includes("creator")) return <div className="p-10">Creator access required.</div>;

  return (
    <DashboardLayout role="creator" active={section} onNavigate={setSection}>
      {section === "overview" && <Overview />}
      {section === "courses" && <Courses />}
      {section === "products" && <Products />}
      {section === "sales" && <Sales />}
      {section === "profile" && <div className="text-muted-foreground">Profile settings (UI in progress)</div>}
    </DashboardLayout>
  );
}

function Overview() {
  const { data: courses = [] } = useQuery({ queryKey: ["c-courses"], queryFn: () => getMyCreatorCourses() });
  const { data: products = [] } = useQuery({ queryKey: ["c-products"], queryFn: () => getMyCreatorProducts() });
  const { data: sales } = useQuery({ queryKey: ["c-sales"], queryFn: () => getMySalesSummary() });
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Creator Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Total Revenue", value: formatPrice(sales?.totalMinor || 0) },
          { label: "Total Orders", value: sales?.salesCount || 0 },
          { label: "Active Courses", value: courses.length },
          { label: "Products", value: products.length },
        ].map(s => (
          <div key={s.label} className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Courses() {
  const { data: courses = [] } = useQuery({ queryKey: ["c-courses"], queryFn: () => getMyCreatorCourses() });
  return (
    <div>
        <h1 className="text-3xl font-bold">Courses</h1>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {courses.map((c: any) => <div key={c.id} className="rounded-xl border p-4 bg-card">{c.title}</div>)}
        </div>
    </div>
  );
}

function Products() {
    const { data: products = [] } = useQuery({ queryKey: ["c-products"], queryFn: () => getMyCreatorProducts() });
    return (
      <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {products.map((p: any) => <div key={p.id} className="rounded-xl border p-4 bg-card">{p.title}</div>)}
          </div>
      </div>
    );
}

function Sales() {
    const { data: sales } = useQuery({ queryKey: ["c-sales"], queryFn: () => getMySalesSummary() });
    return (
      <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="mt-4 text-muted-foreground">Total Revenue: {formatPrice(sales?.totalMinor || 0)}</p>
      </div>
    );
}
