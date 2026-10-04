import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, lazy, Suspense } from "react";
import { 
  BookOpen, 
  Package, 
  DollarSign, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Plus 
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductFormDialog } from "@/components/dashboard/ProductFormDialog";
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";
import { CreatorProfileSettings } from "@/components/dashboard/CreatorProfileSettings";
import { 
  getMyCreatorCourses, 
  getMyCreatorProducts, 
  getMySalesSummary, 
  saveProduct 
} from "@/lib/creator.functions";
import { getMyAccount } from "@/lib/account.functions";
import { formatPrice } from "@/lib/format";

// Lazy load complex sub-views
const CourseBuilder = lazy(() => import("@/components/dashboard/creator/CourseBuilder").then(m => ({ default: m.CourseBuilder })));
const CreatorLiveClassesStandalone = lazy(() => import("@/components/dashboard/LiveClassesStandalone").then(m => ({ default: m.CreatorLiveClassesStandalone })));
const LiveClassroom = lazy(() => import("@/components/dashboard/LiveClassroom").then(m => ({ default: m.LiveClassroom })));
const CreatorProductManage = lazy(() => import("@/components/dashboard/digital-products/CreatorProductManage").then(m => ({ default: m.CreatorProductManage })));

export const Route = createFileRoute("/_authenticated/dashboard/creator")({
  component: CreatorDashboard,
});

function SectionFallback() {
  return <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#737373]">Loading workspace…</div>;
}

function CreatorDashboard() {
  const [section, setSection] = useState("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);

  const { data: account, isLoading: accountLoading } = useQuery({ queryKey: ["my-account"], queryFn: () => getMyAccount() });

  const handleNavigate = (newSection: string) => {
    setSection(newSection);
    setSelectedId(null);
    setAction(null);
  };

  const openCourseBuilder = (id: string) => {
    setSection("courses");
    setSelectedId(id);
    setAction("builder");
  };

  const openProductManage = (id: string) => {
    setSection("products");
    setSelectedId(id);
    setAction("manage");
  };

  const openClassroom = (id: string) => {
    setSection("live-classes");
    setSelectedId(id);
    setAction("classroom");
  };

  if (accountLoading) return <SectionFallback />;
  if (!account?.roles.includes("creator")) return <div className="p-10">Creator access required.</div>;

  if (section === "courses" && selectedId && action === "builder") {
    return <Suspense fallback={<SectionFallback />}><CourseBuilder productId={Number(selectedId)} backRoute="/dashboard/creator" backLabel="Creator Dashboard" role="creator" /></Suspense>;
  }

  if (section === "products" && selectedId && action === "manage") {
    return (
      <DashboardLayout role="creator" active="products" onNavigate={handleNavigate}>
        <Suspense fallback={<SectionFallback />}><CreatorProductManage productId={selectedId} /></Suspense>
      </DashboardLayout>
    );
  }

  if (section === "live-classes" && selectedId && action === "classroom") {
    return (
      <DashboardLayout role="creator" active="live-classes" onNavigate={handleNavigate}>
        <Suspense fallback={<SectionFallback />}><LiveClassroom id={Number(selectedId)} backUrl="/dashboard/creator/courses" /></Suspense>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="creator" active={section} onNavigate={handleNavigate}>
      {section === "overview" && <Overview onOpenCourse={openCourseBuilder} onOpenSales={() => setSection("sales")} />}
      {section === "courses" && !selectedId && <Courses onOpenCourse={openCourseBuilder} />}
      {section === "products" && !selectedId && <Products onOpenProduct={openProductManage} />}
      {section === "live-classes" && !selectedId && <Suspense fallback={<SectionFallback />}><CreatorLiveClassesStandalone /></Suspense>}
      {section === "sales" && <Sales />}
      {section === "profile" && <CreatorProfileSettings />}
    </DashboardLayout>
  );
}

function Overview({ onOpenCourse, onOpenSales }: { onOpenCourse: (id: string) => void, onOpenSales: () => void }) {
  const { data: account } = useQuery({ queryKey: ["my-account"], queryFn: () => getMyAccount() });
  const { data: sales, isLoading: salesLoading } = useQuery({ queryKey: ["creator-sales"], queryFn: () => getMySalesSummary() });
  const { data: products, isLoading: productsLoading } = useQuery({ queryKey: ["creator-products"], queryFn: () => getMyCreatorProducts() });
  
  const queryClient = useQueryClient();
  const createProduct = useMutation({
    mutationFn: (data: any) => saveProduct({ data }),
    onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: ["creator-products"] });
        onOpenCourse(res.id);
    }
  });

  const courseCount = products?.filter((p: any) => p.type === 'course').length || 0;

  const handleCreateCourse = () => {
    createProduct.mutate({
      title: "Untitled Course",
      type: "course",
      priceMinor: 0,
      accessPlan: "lifetime"
    });
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">Creator Dashboard</h2>
          <p className="text-[16px] text-[#4D4D4D] mt-1">Welcome back, {account?.profile?.name || "Creator"}. Here's what's happening.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <ProductFormDialog type="digital">
            <Button className="w-full border border-[#DADADA] text-[#394649] bg-white hover:bg-gray-50 h-11 px-6 rounded-md font-medium text-[14px] sm:w-auto">
              New Product
            </Button>
          </ProductFormDialog>
          <Button onClick={handleCreateCourse} disabled={createProduct.isPending} className="h-11 w-full px-6 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[14px] shadow-[0_4px_14px_rgba(21,207,116,0.25)] sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: salesLoading ? "..." : formatPrice(sales?.totalMinor || 0), icon: DollarSign, color: "text-[#15CF74]", bg: "bg-[#E3F9EF]" },
          { label: "Total Orders", value: salesLoading ? "..." : (sales?.salesCount || 0).toString(), icon: Package, color: "text-[#224EA1]", bg: "bg-[#EAEFF8]" },
          { label: "Active Courses", value: productsLoading ? "..." : courseCount.toString(), icon: BookOpen, color: "text-[#704FE6]", bg: "bg-[#F1EEFC]" },
          { label: "Products", value: productsLoading ? "..." : (products?.length || 0).toString(), icon: Package, color: "text-[#FE543D]", bg: "bg-[#FFEFEB]" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-[#E5E5E5] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-[14px] text-[#4D4D4D] font-medium mb-1">{stat.label}</p>
            <h4 className="text-[28px] font-bold text-black">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="min-h-[400px] rounded-xl border border-[#E5E5E5] bg-white p-4 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 sm:mb-8">
            <h3 className="text-[20px] font-bold text-black">Recent Orders</h3>
            <button onClick={onOpenSales} className="text-primary hover:bg-[#E3F9EF] hover:text-primary h-10 px-4 py-2 inline-flex items-center justify-center rounded-md font-medium">View All</button>
          </div>
          
          <div className="space-y-2">
            {salesLoading ? (
              <div className="py-10 flex justify-center"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
            ) : !sales?.items || sales.items.length === 0 ? (
              <p className="text-[#9794AA] text-center py-10">No orders yet.</p>
            ) : (
              sales.items.slice(0, 5).map((item: any, i: number) => (
                <div key={i} className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-[#E5E5E5] hover:bg-gray-50 sm:p-4">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 bg-[#FAFAFA] border border-[#E5E5E5] rounded-full flex items-center justify-center font-bold text-[#394649]">
                      U
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[14px] text-black">Student</p>
                      <p className="line-clamp-2 break-words text-[13px] text-[#4D4D4D]">{item.products?.title}</p>
                    </div>
                  </div>
                  <span className="text-[14px] font-bold text-primary">+{formatPrice(item.unit_price_minor * item.quantity)}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="flex min-h-[360px] flex-col rounded-xl bg-[#515151] p-5 shadow-sm sm:min-h-[400px] sm:p-8">
          <h3 className="text-[20px] font-bold text-white mb-8">Quick Actions</h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <button onClick={() => onOpenCourse("")} className="w-full justify-start h-14 bg-white/10 hover:bg-white/20 text-white border-none rounded-lg text-[15px] transition-colors inline-flex items-center px-4 text-left">
                <BookOpen className="w-5 h-5 mr-4" />
                Manage Courses
            </button>
            <button onClick={() => setSection("products")} className="w-full justify-start h-14 bg-white/10 hover:bg-white/20 text-white border-none rounded-lg text-[15px] transition-colors inline-flex items-center px-4 text-left">
                <Package className="w-5 h-5 mr-4" />
                Manage Products
            </button>
            <button onClick={onOpenSales} className="w-full justify-start h-14 bg-white/10 hover:bg-white/20 text-white border-none rounded-lg text-[15px] transition-colors inline-flex items-center px-4 text-left">
                <DollarSign className="w-5 h-5 mr-4" />
                View Payouts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Courses({ onOpenCourse }: { onOpenCourse: (id: string) => void }) {
  const { data: allProducts, isLoading } = useQuery({ queryKey: ["creator-products"], queryFn: () => getMyCreatorProducts() });
  const queryClient = useQueryClient();
  const createProduct = useMutation({
    mutationFn: (data: any) => saveProduct({ data }),
    onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: ["creator-products"] });
        onOpenCourse(res.id);
    }
  });

  const courses = allProducts?.filter((p: any) => p.type === 'course');
  
  const handleCreateCourse = () => {
    createProduct.mutate({
      title: "Untitled Course",
      type: "course",
      priceMinor: 0,
      accessPlan: "lifetime"
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">Courses</h2>
          <p className="text-[16px] text-[#4D4D4D] mt-1">Manage your educational content.</p>
        </div>
        <Button onClick={handleCreateCourse} disabled={createProduct.isPending} className="h-11 px-6 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[14px] shadow-[0_4px_14px_rgba(21,207,116,0.25)]">
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>
      
      {isLoading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : !courses || courses.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E5E5E5] rounded-xl shadow-sm">
          <BookOpen className="w-12 h-12 text-[#9794AA] mx-auto mb-4" />
          <h3 className="font-bold text-[18px] text-black mb-2">No courses found</h3>
          <p className="text-[14px] text-[#4D4D4D] mb-6">You haven't created any courses yet.</p>
          <Button onClick={handleCreateCourse} disabled={createProduct.isPending} className="h-[44px] px-8 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[14px]">Create Your First Course</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map((course: any) => (
             <div key={course.id} className="bg-white border border-[#E5E5E5] rounded-lg p-5 shadow-sm group hover:shadow-md transition-shadow">
                 <div className="aspect-[16/10] bg-gradient-to-br from-green-50 to-blue-50 rounded-md mb-4 flex items-center justify-center relative overflow-hidden">
                   <CourseThumbnail src={course.cover_image_url} title={course.title} className="transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="font-bold text-[16px] text-black line-clamp-1">{course.title}</h3>
                <p className="text-[14px] text-primary font-bold mt-1">{course.price_minor === 0 ? "Free" : formatPrice(course.price_minor)}</p>
                <div className="mt-4 pt-4 border-t border-[#E5E5E5] flex justify-between items-center">
                  <Badge className={course.status === 'published' ? 'bg-[#E3F9EF] text-primary hover:bg-[#E3F9EF] border-none shadow-none font-medium' : 'bg-gray-100 text-[#9794AA] hover:bg-gray-100 border-none shadow-none font-medium'}>
                    {course.status}
                  </Badge>
                  <Button onClick={() => onOpenCourse(course.id)} variant="outline" size="sm" className="h-[36px] px-4 border border-[#DADADA] text-[#394649] bg-white hover:bg-gray-50 rounded-md text-[13px] font-medium">Edit Course</Button>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Products({ onOpenProduct }: { onOpenProduct: (id: string) => void }) {
  const { data: allProducts, isLoading } = useQuery({ queryKey: ["creator-products"], queryFn: () => getMyCreatorProducts() });
  const products = allProducts?.filter((p: any) => p.type === 'digital');
  
  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">Digital Products</h2>
          <p className="text-[16px] text-[#4D4D4D] mt-1">Manage your downloadable content.</p>
        </div>
        <ProductFormDialog type="digital">
          <Button className="h-11 px-6 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[14px] shadow-[0_4px_14px_rgba(21,207,116,0.25)]">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </ProductFormDialog>
      </div>
      
      {isLoading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : !products || products.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E5E5E5] rounded-xl shadow-sm">
          <Package className="w-12 h-12 text-[#9794AA] mx-auto mb-4" />
          <h3 className="font-bold text-[18px] text-black mb-2">No products found</h3>
          <p className="text-[14px] text-[#4D4D4D] mb-6">You haven't added any digital products yet.</p>
          <ProductFormDialog type="digital">
            <Button className="h-[44px] px-8 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[14px]">Add Your First Product</Button>
          </ProductFormDialog>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
          <div className="grid gap-3 p-3 sm:hidden">
            {products.map((item: any) => (
              <div key={item.id} className="min-w-0 rounded-lg border border-[#E5E5E5] p-4">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-[15px] font-bold text-black">{item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-[#607269]">{item.type}</p>
                  </div>
                  <Badge className={item.status === 'published' ? 'shrink-0 bg-[#E3F9EF] text-primary hover:bg-[#E3F9EF] border-none shadow-none font-medium' : 'shrink-0 bg-gray-100 text-[#9794AA] hover:bg-gray-100 border-none shadow-none font-medium'}>
                    {item.status}
                  </Badge>
                </div>
                <Button onClick={() => onOpenProduct(item.id)} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-[13px] font-medium text-white hover:bg-[#10A364]">Manage</Button>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                <tr>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider">Title</th>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider">Type</th>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider">Status</th>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {products.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-[14px] text-black">{item.title}</td>
                    <td className="p-4"><Badge className="bg-gray-100 text-[#4D4D4D] hover:bg-gray-100 border-none shadow-none uppercase text-[10px] font-bold">{item.type}</Badge></td>
                    <td className="p-4">
                      <Badge className={item.status === 'published' ? 'bg-[#E3F9EF] text-primary hover:bg-[#E3F9EF] border-none shadow-none font-medium' : 'bg-gray-100 text-[#9794AA] hover:bg-gray-100 border-none shadow-none font-medium'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button onClick={() => onOpenProduct(item.id)} className="h-[36px] px-4 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[13px] inline-flex items-center justify-center">Manage</Button>
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

function Sales() {
  const { data: sales } = useQuery({ queryKey: ["creator-sales"], queryFn: () => getMySalesSummary() });
  
  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-4">
      <div>
        <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">Sales & Analytics</h2>
        <p className="text-[16px] text-[#4D4D4D] mt-1">Track your performance and earnings.</p>
      </div>
      
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Earnings Overview</h3>
        <p className="text-3xl font-bold text-primary">{formatPrice(sales?.totalMinor || 0)}</p>
        <p className="text-sm text-muted-foreground mt-1">Total lifetime revenue</p>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                <tr>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider">Product</th>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider">Quantity</th>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {sales?.items?.map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-[14px] text-black font-medium">{item.products?.title}</td>
                    <td className="p-4 text-[14px] text-[#4D4D4D]">{item.quantity}</td>
                    <td className="p-4 text-[14px] font-bold text-black text-right">{formatPrice(item.unit_price_minor * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
