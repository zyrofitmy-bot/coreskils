import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getAdminOverview, getAdminUsers, getAdminApplications, getAdminCourses, getAdminProducts, getAdminOrders } from "@/lib/admin.functions";
import { getMyAccount } from "@/lib/account.functions";
import { listCategories } from "@/lib/marketplace.functions";
import { CategoryFormDialog } from "@/components/dashboard/CategoryFormDialog";
import { SettingFormDialog } from "@/components/dashboard/SettingFormDialog";

export const Route = createFileRoute("/_authenticated/dashboard/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [section, setSection] = useState("overview");
  const { data: account } = useQuery({ queryKey: ["my-account"], queryFn: () => getMyAccount() });

  if (!account?.roles.includes("admin")) return <div className="p-10">Admin only.</div>;

  return (
    <DashboardLayout role="admin" active={section} onNavigate={setSection}>
      {section === "overview" && <Overview />}
      {section === "users" && <Users />}
      {section === "categories" && <Categories />}
      <div className="mt-8 text-muted-foreground">Section {section} content WIP.</div>
    </DashboardLayout>
  );
}

function Overview() {
  const { data } = useQuery({ queryKey: ["a-overview"], queryFn: () => getAdminOverview() });
  return (
    <div className="grid gap-4 sm:grid-cols-3">
        {[{l: "Users", v: data?.userCount}, {l: "Courses", v: data?.courseCount}, {l: "Revenue", v: data?.revenueMinor}].map(s => (
            <div key={s.l} className="p-6 border rounded-xl bg-card">
                <p className="text-sm text-muted-foreground">{s.l}</p>
                <p className="text-2xl font-bold">{s.v}</p>
            </div>
        ))}
    </div>
  );
}

function Users() {
    const { data: users = [] } = useQuery({ queryKey: ["a-users"], queryFn: () => getAdminUsers() });
    return (
        <div className="rounded-xl border p-4 bg-card">
            <h1 className="font-bold text-xl mb-4">Users</h1>
            {users.map((u: any) => <div key={u.id} className="py-2 border-b">{u.name} - {u.email}</div>)}
        </div>
    );
}

function Categories() {
    const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
    return (
        <div className="rounded-xl border p-4 bg-card">
            <h1 className="font-bold text-xl mb-4">Categories</h1>
            <CategoryFormDialog>
                <button className="h-11 px-6 bg-primary text-white font-medium rounded-md text-[14px]">Add Category</button>
            </CategoryFormDialog>
            {cats.map((c: any) => <div key={c.id} className="py-2">{c.name}</div>)}
        </div>
    );
}
