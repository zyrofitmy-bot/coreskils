import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, lazy, Suspense, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Settings, Users, ShieldAlert, Activity, Globe, Paintbrush, 
  BookOpen, Package, ShoppingCart, Award, Plus, Search, X,
  ShieldCheck, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryFormDialog } from "@/components/dashboard/CategoryFormDialog";
import { SettingFormDialog } from "@/components/dashboard/SettingFormDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  getAdminOverview, 
  getAdminUsers, 
  getAdminApplications, 
  getAdminCourses, 
  getAdminProducts, 
  getAdminOrders,
  reviewApplication,
  setUserRole,
  saveCategory,
  deleteCategory
} from "@/lib/admin.functions";
import { getMyAccount } from "@/lib/account.functions";
import { listCategories } from "@/lib/marketplace.functions";
import { formatPrice, formatDate } from "@/lib/format";

// Lazy load complex sub-views
const AdminCourseStudioList = lazy(() => import("@/components/dashboard/admin/AdminCourseStudioList").then(m => ({ default: m.AdminCourseStudioList })));
const AdminCourseStudio = lazy(() => import("@/components/dashboard/admin/AdminCourseStudio").then(m => ({ default: m.AdminCourseStudio })));
const AdminLiveClassesStandalone = lazy(() => import("@/components/dashboard/LiveClassesStandalone").then(m => ({ default: m.AdminLiveClassesStandalone })));
const LiveClassroom = lazy(() => import("@/components/dashboard/LiveClassroom").then(m => ({ default: m.LiveClassroom })));

export const Route = createFileRoute("/_authenticated/dashboard/admin")({
  component: AdminDashboard,
});

function SectionFallback() {
  return <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#737373]">Loading workspace…</div>;
}

function AdminDashboard() {
  const [section, setSection] = useState("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);

  const { data: account, isLoading: accountLoading } = useQuery({ queryKey: ["my-account"], queryFn: () => getMyAccount() });

  const handleNavigate = (newSection: string) => {
    setSection(newSection);
    setSelectedId(null);
    setAction(null);
  };

  const openCourseStudio = (id: string) => {
    setSection("courses");
    setSelectedId(id);
    setAction("studio");
  };

  const openClassroom = (id: string) => {
    setSection("live-classes");
    setSelectedId(id);
    setAction("classroom");
  };

  if (accountLoading) return <SectionFallback />;
  if (!account?.roles.includes("admin")) return <div className="p-10">Admin access required.</div>;

  if (section === "courses" && selectedId && action === "studio") {
    return (
      <DashboardLayout role="admin" active="courses" onNavigate={handleNavigate}>
        <Suspense fallback={<SectionFallback />}><AdminCourseStudio productId={Number(selectedId)} /></Suspense>
      </DashboardLayout>
    );
  }

  if (section === "live-classes" && selectedId && action === "classroom") {
    return (
      <DashboardLayout role="admin" active="live-classes" onNavigate={handleNavigate}>
        <Suspense fallback={<SectionFallback />}><LiveClassroom id={Number(selectedId)} backUrl="/dashboard/admin/courses" /></Suspense>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" active={section} onNavigate={handleNavigate}>
      {section === "overview" && <Overview />}
      {section === "users" && <UsersList />}
      {section === "creators" && <CreatorsList />}
      {section === "applications" && <ApplicationsList />}
      {section === "courses" && !selectedId && <Suspense fallback={<SectionFallback />}><AdminCourseStudioList /></Suspense>}
      {section === "products" && <ProductsList />}
      {section === "live-classes" && !selectedId && <Suspense fallback={<SectionFallback />}><AdminLiveClassesStandalone /></Suspense>}
      {section === "orders" && <OrdersList />}
      {section === "categories" && <CategoriesList />}
      {section === "settings" && <SettingsView />}
    </DashboardLayout>
  );
}

function Overview() {
  const { data } = useQuery({ queryKey: ["admin-overview"], queryFn: () => getAdminOverview() });
  
  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-4">
      <div>
        <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">Platform Administration</h2>
        <p className="text-[16px] text-[#4D4D4D] mt-1">Manage global settings, users, and infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E5E5E5] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
          <div className="w-12 h-12 bg-[#EAEFF8] text-[#224EA1] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-[18px] font-bold text-black mb-2">User Management</h3>
          <p className="text-[14px] text-[#4D4D4D] mb-4">View and manage all students and creators on the platform.</p>
        </div>

        <div className="bg-white border border-[#E5E5E5] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
          <div className="w-12 h-12 bg-[#F1EEFC] text-[#704FE6] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-[18px] font-bold text-black mb-2">Content Moderation</h3>
          <p className="text-[14px] text-[#4D4D4D] mb-4">Review published courses and digital products.</p>
        </div>

        <div className="bg-white border border-[#E5E5E5] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
          <div className="w-12 h-12 bg-[#E3F9EF] text-primary rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
            <Settings className="w-6 h-6" />
          </div>
          <h3 className="text-[18px] font-bold text-black mb-2">Platform Settings</h3>
          <p className="text-[14px] text-[#4D4D4D] mb-4">Configure global settings, payments, and integrations.</p>
        </div>
      </div>
    </div>
  );
}

function UsersList() {
  const { data: users, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => getAdminUsers() });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const filteredUsers = useMemo(() => (users ?? []).filter((user: any) => {
    const matchesSearch = !search
      || user.name?.toLowerCase().includes(search.toLowerCase())
      || user.email?.toLowerCase().includes(search.toLowerCase())
      || String(user.id).includes(search);
    return matchesSearch && (roleFilter === "all" || user.roles.includes(roleFilter));
  }), [users, search, roleFilter]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pt-4">
      <div>
        <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">All Users</h2>
        <p className="text-[16px] text-[#4D4D4D] mt-1">Manage all accounts across the platform.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[#E5E5E5] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8490]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email or ID…"
            className="h-11 w-full rounded-lg border border-[#D9DEE5] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="h-11 rounded-lg border border-[#D9DEE5] bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-44"
        >
          <option value="all">All roles</option>
          <option value="student">Students</option>
          <option value="creator">Creators</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      
      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                <tr>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider">ID</th>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider">Name</th>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider">Email</th>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider">Role</th>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-[14px] text-[#4D4D4D]">{user.id.slice(0, 8)}</td>
                    <td className="p-4 font-bold text-[14px] text-black">{user.name}</td>
                    <td className="p-4 text-[14px] text-[#4D4D4D]">{user.email}</td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map((r: string) => (
                          <Badge key={r} className="bg-gray-100 text-[#394649] hover:bg-gray-100 border-none shadow-none uppercase text-[10px] font-bold">{r}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <UserActions user={user} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function UserActions({ user }: { user: any }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const mutation = useMutation({
        mutationFn: ({ role, grant }: { role: any, grant: boolean }) => setUserRole({ data: { userId: user.id, role, grant } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast({ title: "User role updated" });
        }
    });

    const isCreator = user.roles.includes("creator");

    return (
        <div className="flex gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                disabled={mutation.isPending} 
                onClick={() => mutation.mutate({ role: "creator", grant: !isCreator })}
            >
                {isCreator ? "Revoke Creator" : "Grant Creator"}
            </Button>
        </div>
    );
}

function CreatorsList() {
    const { data: creators, isLoading } = useQuery({ queryKey: ["admin-creators"], queryFn: () => getAdminUsers() });
    const filtered = creators?.filter((u: any) => u.roles.includes("creator"));
    
    return (
        <div className="space-y-6 max-w-6xl mx-auto pt-4">
            <div>
                <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">Creators</h2>
                <p className="text-[16px] text-[#4D4D4D] mt-1">Manage active content creators.</p>
            </div>
            {isLoading ? <SectionFallback /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered?.map((c: any) => (
                        <div key={c.id} className="bg-white border border-[#E5E5E5] p-6 rounded-xl shadow-sm">
                            <h3 className="font-bold text-lg mb-1">{c.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{c.email}</p>
                            <Badge className="bg-[#E3F9EF] text-primary border-none shadow-none uppercase text-[10px] font-bold">Creator</Badge>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ApplicationsList() {
  const { data: applications, isLoading } = useQuery({ queryKey: ["admin-applications"], queryFn: () => getAdminApplications() });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const review = useMutation({
    mutationFn: ({ id, approve, reason }: { id: string, approve: boolean, reason?: string }) => 
        reviewApplication({ data: { applicationId: id, approve, reason } }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        toast({ title: "Application reviewed" });
    }
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-4">
      <div>
          <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">Creator Applications</h2>
          <p className="text-[16px] text-[#4D4D4D] mt-1">Review detailed teaching profiles.</p>
      </div>
      
      {isLoading ? <SectionFallback /> : !applications?.length ? (
          <div className="bg-white border rounded-xl p-10 text-center text-[#69737D]">No pending applications.</div>
      ) : (
          <div className="space-y-5">
              {applications.map((app: any) => (
                  <article key={app.id} className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
                      <div className="flex flex-wrap justify-between gap-4">
                          <div>
                              <h3 className="text-xl font-bold text-black">{app.display_name}</h3>
                              <p className="text-primary">{app.headline}</p>
                              <p className="text-sm text-[#69737D]">{app.profiles?.email} · {app.experience_years} years experience</p>
                          </div>
                          {app.status === "pending" && (
                              <div className="flex gap-2">
                                  <Button disabled={review.isPending} onClick={() => review.mutate({ id: app.id, approve: true })}>Approve</Button>
                                  <Button variant="outline" disabled={review.isPending} onClick={() => {
                                      const reason = window.prompt("Rejection reason");
                                      if (reason) review.mutate({ id: app.id, approve: false, reason });
                                  }}>Reject</Button>
                              </div>
                          )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-5 mt-5 text-sm">
                          <div><p className="font-bold mb-1">Expertise</p><p className="text-[#4D4D4D]">{app.expertise}</p></div>
                          <div><p className="font-bold mb-1">Teaching topics</p><p className="text-[#4D4D4D]">{app.teaching_topics?.join(", ")}</p></div>
                          <div className="md:col-span-2"><p className="font-bold mb-1">Course proposal</p><p className="text-[#4D4D4D] whitespace-pre-wrap">{app.course_proposal}</p></div>
                      </div>
                  </article>
              ))}
          </div>
      )}
    </div>
  );
}

function ProductsList() {
    const { data: products, isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: () => getAdminProducts() });
    return (
        <div className="space-y-6 max-w-6xl mx-auto pt-4">
            <div>
                <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">All Products</h2>
                <p className="text-[16px] text-[#4D4D4D] mt-1">Monitor all digital products on the platform.</p>
            </div>
            {isLoading ? <SectionFallback /> : (
                <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#FAFAFA] border-b">
                            <tr>
                                <th className="p-4 text-[13px] font-bold text-[#394649] uppercase">Product</th>
                                <th className="p-4 text-[13px] font-bold text-[#394649] uppercase">Creator</th>
                                <th className="p-4 text-[13px] font-bold text-[#394649] uppercase">Status</th>
                                <th className="p-4 text-[13px] font-bold text-[#394649] uppercase text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products?.map((p: any) => (
                                <tr key={p.id}>
                                    <td className="p-4 font-bold text-[14px]">{p.title}</td>
                                    <td className="p-4 text-[14px] text-[#4D4D4D]">{p.profiles?.name}</td>
                                    <td className="p-4"><Badge variant="outline">{p.status}</Badge></td>
                                    <td className="p-4 text-right font-bold">{formatPrice(p.price_minor, p.currency)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function OrdersList() {
    const { data: orders, isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: () => getAdminOrders() });
    return (
        <div className="space-y-6 max-w-6xl mx-auto pt-4">
            <div>
                <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">Order History</h2>
                <p className="text-[16px] text-[#4D4D4D] mt-1">Platform-wide transaction log.</p>
            </div>
            {isLoading ? <SectionFallback /> : (
                <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#FAFAFA] border-b">
                            <tr>
                                <th className="p-4 text-[13px] font-bold text-[#394649] uppercase">Order ID</th>
                                <th className="p-4 text-[13px] font-bold text-[#394649] uppercase">User</th>
                                <th className="p-4 text-[13px] font-bold text-[#394649] uppercase">Status</th>
                                <th className="p-4 text-[13px] font-bold text-[#394649] uppercase text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders?.map((o: any) => (
                                <tr key={o.id}>
                                    <td className="p-4 font-mono text-[14px]">{o.id.slice(0, 8)}</td>
                                    <td className="p-4 text-[14px] text-[#4D4D4D]">{o.profiles?.email}</td>
                                    <td className="p-4"><Badge>{o.status}</Badge></td>
                                    <td className="p-4 text-right font-bold">{formatPrice(o.total_minor, o.currency)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function CategoriesList() {
    const { data: cats, isLoading } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
    const queryClient = useQueryClient();
    const { toast } = useToast();
    
    const del = useMutation({
        mutationFn: (id: string) => deleteCategory({ data: { id } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast({ title: "Category deleted" });
        }
    });

    return (
        <div className="space-y-8 max-w-6xl mx-auto pt-4">
            <div className="flex justify-between items-end gap-4">
                <div>
                    <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">Categories</h2>
                    <p className="text-[16px] text-[#4D4D4D] mt-1">Manage marketplace taxonomy.</p>
                </div>
                <CategoryFormDialog>
                    <Button className="h-11 px-6 bg-primary text-white hover:bg-[#10A364]"><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
                </CategoryFormDialog>
            </div>
            
            {isLoading ? <SectionFallback /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cats?.map((c: any) => (
                        <div key={c.id} className="bg-white border p-6 rounded-xl flex justify-between items-start group shadow-sm">
                            <div>
                                <h3 className="font-bold text-lg">{c.name}</h3>
                                <p className="text-sm text-muted-foreground">slug: {c.slug}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100" onClick={() => {
                                if (confirm("Delete this category?")) del.mutate(c.id);
                            }}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SettingsView() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto pt-4">
            <div>
                <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">Platform Settings</h2>
                <p className="text-[16px] text-[#4D4D4D] mt-1">Configure global platform behavior.</p>
            </div>
            
            <div className="bg-white border rounded-xl p-8 text-center text-muted-foreground">
                <p>Global platform settings are coming soon (Phase 2).</p>
                <div className="mt-6 flex justify-center">
                    <SettingFormDialog>
                        <Button variant="outline">Open Settings Manager</Button>
                    </SettingFormDialog>
                </div>
            </div>
        </div>
    );
}
