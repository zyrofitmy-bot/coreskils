import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  getAdminOverview,
  getAdminUsers,
  setUserRole,
  getAdminApplications,
  reviewApplication,
  getAdminCourses,
  getAdminProducts,
  getAdminOrders,
  saveCategory,
  deleteCategory,
} from "@/lib/admin.functions";
import { getMyAccount } from "@/lib/account.functions";
import { listCategories } from "@/lib/marketplace.functions";
import { formatPrice, formatDate, slugify } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/admin")({
  head: () => ({
    meta: [
      { title: "Admin — CoreSkils" },
      { name: "description", content: "CoreSkils platform administration." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
const btnPrimary =
  "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90";
const btnOutline =
  "rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent";

function AdminDashboard() {
  const [section, setSection] = useState("overview");
  const { data: account, isLoading } = useQuery({ queryKey: ["my-account"], queryFn: () => getMyAccount() });

  if (isLoading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (!account?.roles.includes("admin")) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-muted-foreground">This area is only for platform administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout role="admin" active={section} onNavigate={setSection}>
      {section === "overview" && <Overview />}
      {section === "users" && <Users />}
      {section === "applications" && <Applications />}
      {section === "courses" && <CatalogTable kind="courses" />}
      {section === "products" && <CatalogTable kind="products" />}
      {section === "orders" && <Orders />}
      {section === "categories" && <Categories />}
    </DashboardLayout>
  );
}

function Overview() {
  const { data } = useQuery({ queryKey: ["a-overview"], queryFn: () => getAdminOverview() });
  const stats = [
    { label: "Users", value: data?.userCount ?? 0 },
    { label: "Courses", value: data?.courseCount ?? 0 },
    { label: "Products", value: data?.productCount ?? 0 },
    { label: "Paid orders", value: data?.orderCount ?? 0 },
    { label: "Revenue", value: formatPrice(data?.revenueMinor ?? 0) },
    { label: "Pending applications", value: data?.pendingApplications ?? 0 },
  ];
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Platform overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-6">
            <p className="text-3xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Users() {
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ["a-users"], queryFn: () => getAdminUsers() });
  async function toggle(userId: string, role: "creator" | "admin", grant: boolean) {
    try {
      await setUserRole({ data: { userId, role, grant } });
      qc.invalidateQueries({ queryKey: ["a-users"] });
    } catch (e: any) { toast.error(e.message); }
  }
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Users</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Roles</th><th className="p-4">Joined</th><th className="p-4"></th></tr>
          </thead>
          <tbody>
            {users.map((u: any) => {
              const isCreator = u.roles.includes("creator");
              const isAdmin = u.roles.includes("admin");
              return (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-muted-foreground">{u.email}</td>
                  <td className="p-4 capitalize">{u.roles.join(", ")}</td>
                  <td className="p-4 text-muted-foreground">{formatDate(u.created_at)}</td>
                  <td className="space-x-2 whitespace-nowrap p-4 text-right">
                    <button onClick={() => toggle(u.id, "creator", !isCreator)} className={btnOutline}>
                      {isCreator ? "Remove creator" : "Make creator"}
                    </button>
                    <button onClick={() => toggle(u.id, "admin", !isAdmin)} className={btnOutline}>
                      {isAdmin ? "Remove admin" : "Make admin"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Applications() {
  const qc = useQueryClient();
  const { data: apps = [] } = useQuery({ queryKey: ["a-apps"], queryFn: () => getAdminApplications() });
  async function review(id: string, approve: boolean) {
    const reason = approve ? undefined : (prompt("Reason for rejection (optional)") ?? undefined);
    try {
      await reviewApplication({ data: { applicationId: id, approve, reason } });
      toast.success(approve ? "Approved" : "Rejected");
      qc.invalidateQueries({ queryKey: ["a-apps"] });
    } catch (e: any) { toast.error(e.message); }
  }
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Creator applications</h1>
      <div className="mt-6 space-y-4">
        {apps.length === 0 && <p className="text-muted-foreground">No applications yet.</p>}
        {apps.map((a: any) => (
          <div key={a.id} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-foreground">{a.display_name}</p>
                <p className="text-sm text-muted-foreground">{a.profiles?.email} · {formatDate(a.created_at)}</p>
                {a.headline && <p className="mt-1 text-sm">{a.headline}</p>}
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize">{a.status}</span>
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {a.expertise && <div><dt className="text-muted-foreground">Expertise</dt><dd>{a.expertise} ({a.experience_years} yrs)</dd></div>}
              {a.teaching_topics?.length > 0 && <div><dt className="text-muted-foreground">Topics</dt><dd>{a.teaching_topics.join(", ")}</dd></div>}
              {a.course_proposal && <div className="sm:col-span-2"><dt className="text-muted-foreground">Proposal</dt><dd>{a.course_proposal}</dd></div>}
              {a.motivation && <div className="sm:col-span-2"><dt className="text-muted-foreground">Motivation</dt><dd>{a.motivation}</dd></div>}
            </dl>
            {a.status === "pending" && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => review(a.id, true)} className={btnPrimary}>Approve</button>
                <button onClick={() => review(a.id, false)} className={btnOutline}>Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CatalogTable({ kind }: { kind: "courses" | "products" }) {
  const { data: rows = [] } = useQuery({
    queryKey: ["a-" + kind],
    queryFn: async (): Promise<any[]> => (kind === "courses" ? getAdminCourses() : getAdminProducts()),
  });
  return (
    <div>
      <h1 className="text-3xl font-bold capitalize text-foreground">{kind}</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr><th className="p-4">Title</th><th className="p-4">Category</th><th className="p-4">Status</th><th className="p-4">Price</th><th className="p-4">Created</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td className="p-4 text-muted-foreground" colSpan={5}>Nothing here yet.</td></tr>}
            {rows.map((r: any) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium">{r.title}</td>
                <td className="p-4 text-muted-foreground">{r.categories?.name ?? "—"}</td>
                <td className="p-4 capitalize">{r.status}</td>
                <td className="p-4">{formatPrice(r.price_minor, r.currency)}</td>
                <td className="p-4 text-muted-foreground">{formatDate(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Orders() {
  const { data: orders = [] } = useQuery({ queryKey: ["a-orders"], queryFn: () => getAdminOrders() });
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Orders</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Items</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Date</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td className="p-4 text-muted-foreground" colSpan={6}>No orders yet.</td></tr>}
            {orders.map((o: any) => (
              <tr key={o.id} className="border-b border-border last:border-0">
                <td className="p-4 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                <td className="p-4">{o.profiles?.email ?? "—"}</td>
                <td className="p-4 text-muted-foreground">{o.order_items?.map((i: any) => i.products?.title).filter(Boolean).join(", ") || "—"}</td>
                <td className="p-4 font-semibold">{formatPrice(o.total_minor, o.currency)}</td>
                <td className="p-4 capitalize">{o.status}</td>
                <td className="p-4 text-muted-foreground">{formatDate(o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Categories() {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground">Categories</h1>
      <form
        className="mt-6 flex flex-wrap gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await saveCategory({ data: { name, slug: slugify(name), description: description || undefined } });
            setName(""); setDescription("");
            qc.invalidateQueries({ queryKey: ["categories"] });
          } catch (err: any) { toast.error(err.message); }
        }}
      >
        <input className={`${inputCls} flex-1`} placeholder="Category name" required value={name} onChange={(e) => setName(e.target.value)} />
        <input className={`${inputCls} flex-1`} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit" className={btnPrimary}>Add</button>
      </form>
      <div className="mt-6 space-y-2">
        {cats.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
            <div>
              <p className="font-medium">{c.name}</p>
              {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
            </div>
            <button
              onClick={async () => {
                if (!confirm(`Delete ${c.name}?`)) return;
                await deleteCategory({ data: { id: c.id } });
                qc.invalidateQueries({ queryKey: ["categories"] });
              }}
              className="text-destructive" aria-label="Delete category"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
