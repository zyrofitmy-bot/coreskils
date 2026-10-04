import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, lazy, Suspense } from "react";
import { 
  BookOpen, 
  Package, 
  ShoppingCart, 
  Heart, 
  Play, 
  Trophy, 
  AlertCircle,
  Video,
  Clock,
  Calendar
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UpgradeCreatorButton } from "@/components/auth/UpgradeCreatorButton";
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";
import { StudentProductView } from "@/components/dashboard/digital-products/StudentProductView";
import { StudentCoursePlayer } from "@/components/dashboard/StudentCoursePlayer";
import { 
  getMyAccount, 
  getMyLibrary, 
  getMyOrders, 
  getMyWishlist, 
  getMyProducts,
  toggleWishlist
} from "@/lib/account.functions";
import { listCourses } from "@/lib/marketplace.functions";
import { formatPrice, formatDate } from "@/lib/format";
import { StudentLiveClasses } from "@/components/dashboard/StudentLiveClasses";
import { LiveClassroom } from "@/components/dashboard/LiveClassroom";

export const Route = createFileRoute("/_authenticated/dashboard/student")({
  component: StudentDashboard,
});

function SectionLoading() {
  return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
}

function StudentDashboard() {
  const [section, setSection] = useState("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { data: account, isLoading: accountLoading } = useQuery({ queryKey: ["my-account"], queryFn: () => getMyAccount() });

  const handleNavigate = (newSection: string) => {
    setSection(newSection);
    setSelectedId(null);
    setAction(null);
  };

  const openCourse = (id: string) => {
    setSection("courses");
    setSelectedId(id);
    setAction(null);
  };

  const openProduct = (id: string) => {
    setSection("products");
    setSelectedId(id);
    setAction(null);
  };

  const openClassroom = (id: string) => {
    setSection("live-classes");
    setSelectedId(id);
    setAction("classroom");
  };

  if (accountLoading) return <SectionLoading />;

  // View logic matches the original's conditional rendering based on section, id, action
  if (section === "live-classes" && selectedId && action === "classroom") {
    return (
      <DashboardLayout role="student" active="live-classes" onNavigate={handleNavigate}>
        <Suspense fallback={<SectionLoading />}>
          <LiveClassroom id={Number(selectedId)} backUrl="/dashboard/student/live-classes" />
        </Suspense>
      </DashboardLayout>
    );
  }

  if (section === "courses" && selectedId) {
    return (
      <DashboardLayout role="student" active="library" onNavigate={handleNavigate}>
        <Suspense fallback={<SectionLoading />}>
          <StudentCoursePlayer courseId={selectedId} />
        </Suspense>
      </DashboardLayout>
    );
  }
  
  if (section === "products" && selectedId) {
    return (
      <DashboardLayout role="student" active="products" onNavigate={handleNavigate}>
        <Suspense fallback={<SectionLoading />}>
          <StudentProductView productId={selectedId} />
        </Suspense>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" active={section} onNavigate={handleNavigate}>
      {section === "overview" && <Overview name={account?.profile?.name || "Student"} onOpenCourse={openCourse} />}
      {section === "library" && <Library onOpenCourse={openCourse} />}
      {section === "products" && !selectedId && <Products onOpenProduct={openProduct} />}
      {section === "live-classes" && !selectedId && (
        <Suspense fallback={<SectionLoading />}>
           {/* In this port, we render StudentLiveClasses directly since it's now imported normally. 
               The original used lazy loading for StudentLiveClasses. */}
           <StudentLiveClasses />
        </Suspense>
      )}
      {section === "orders" && <Orders />}
      {section === "wishlist" && <Wishlist onOpenProduct={openProduct} />}
    </DashboardLayout>
  );
}

function Overview({ name, onOpenCourse }: { name: string, onOpenCourse: (id: string) => void }) {
  const { data: library } = useQuery({ queryKey: ["my-library"], queryFn: () => getMyLibrary() });
  const { data: products } = useQuery({ queryKey: ["my-products"], queryFn: () => getMyProducts() });
  const { data: availableCourses, isLoading: coursesLoading } = useQuery({ queryKey: ["marketplace-courses"], queryFn: () => listCourses({ data: {} }) });

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">Welcome back, {name.split(' ')[0]}!</h2>
          <p className="text-[16px] text-[#4D4D4D] mt-1">Ready to learn something new today?</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#515151] rounded-xl p-8 flex flex-col justify-center shadow-sm">
          <h3 className="text-white text-[18px] font-bold mb-6">Learning Stats</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 text-white rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white font-medium">Courses Enrolled</p>
                  <p className="text-[#A3A3A3] text-[13px]">All time</p>
                </div>
              </div>
              <span className="text-primary text-[32px] font-bold">{library?.length ?? "--"}</span>
            </div>
            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 text-white rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white font-medium">Products Acquired</p>
                  <p className="text-[#A3A3A3] text-[13px]">All time</p>
                </div>
              </div>
              <span className="text-primary text-[32px] font-bold">{products?.length ?? "--"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 shadow-sm flex items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 bg-[#E3F9EF] w-40 h-40 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <Trophy className="w-14 h-14 text-primary mx-auto mb-5" />
            <h3 className="font-bold text-[24px] text-black mb-3">Ready to share your knowledge?</h3>
            <p className="text-[14px] text-[#4D4D4D] mb-6 max-w-sm mx-auto leading-relaxed">Upgrade your account to become a creator. Start building courses and digital products today.</p>
            <UpgradeCreatorButton />
          </div>
        </div>
      </div>

      <section className="space-y-8 pt-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-[28px] font-bold text-black tracking-tight">Available Courses</h3>
            <p className="text-[14px] text-[#4D4D4D]">New courses published by our creators.</p>
          </div>
          <button onClick={() => {}} className="border border-[#DADADA] text-[#394649] hover:bg-gray-50 h-10 px-6 rounded-md font-medium inline-flex items-center justify-center">View All</button>
        </div>

        {coursesLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-[320px] animate-pulse rounded-lg border border-[#E5E5E5] bg-white">
                <div className="h-[180px] bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 w-3/4 rounded" />
                  <div className="h-4 bg-gray-200 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : !availableCourses?.length ? (
          <div className="rounded-xl border border-dashed border-[#E5E5E5] bg-[#FAFAFA] p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-[#9794AA]" />
            <p className="font-bold text-[18px] text-black">No published courses yet</p>
            <p className="mt-2 text-[14px] text-[#4D4D4D]">Creator courses will appear here after publishing.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {availableCourses.slice(0, 6).map((course: any) => (
              <div key={course.id} onClick={() => onOpenCourse(course.id)} className="group rounded-lg border border-[#E5E5E5] bg-white hover:shadow-lg transition-shadow duration-300 flex flex-col h-full cursor-pointer overflow-hidden">
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                  <CourseThumbnail src={course.thumbnail_url} title={course.title} className="transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-primary text-white hover:bg-primary font-bold shadow-sm rounded-full px-3 py-1 text-[12px]">
                      {course.price_minor === 0 ? "Free" : formatPrice(course.price_minor, course.currency)}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-center text-[13px] text-[#394649] mb-3">
                    <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{course.lesson_count || 0} lessons</span>
                    <span className="capitalize">{course.level || "Beginner"}</span>
                  </div>
                  <h3 className="text-[16px] font-bold text-black leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <div className="mt-auto flex items-center justify-between text-[13px] text-[#394649]">
                    <span>{course.profiles?.name || "Unknown Author"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Library({ onOpenCourse }: { onOpenCourse: (id: string) => void }) {
  const { data: library, isLoading } = useQuery({ queryKey: ["my-library"], queryFn: () => getMyLibrary() });
  
  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-4">
      <div>
        <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">My Learning</h2>
        <p className="text-[16px] text-[#4D4D4D] mt-1">Courses you are currently enrolled in.</p>
      </div>
      
      {isLoading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : !library || library.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E5E5E5] rounded-xl">
          <BookOpen className="w-12 h-12 text-[#9794AA] mx-auto mb-4" />
          <h3 className="font-bold text-[18px] text-black mb-2">No courses yet</h3>
          <p className="text-[14px] text-[#4D4D4D] mb-6">You haven't enrolled in any courses.</p>
          <button onClick={() => {}} className="h-[44px] px-8 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[14px] shadow-[0_4px_14px_rgba(21,207,116,0.25)] inline-flex items-center justify-center">Explore Courses</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {library.map((item: any) => {
             const course = item.courses || item;
             return (
               <div key={item.id} className="group rounded-lg border border-[#E5E5E5] bg-white hover:shadow-lg transition-shadow duration-300 flex flex-col h-full overflow-hidden">
                  <div className="relative aspect-[16/10] bg-gray-100 flex items-center justify-center overflow-hidden">
                     <CourseThumbnail src={course.thumbnail_url} title={course.title} className="transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Play className="w-12 h-12 text-white fill-white drop-shadow-md" />
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-center text-[13px] text-[#394649] mb-3">
                      <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{course.lesson_count || 0} lessons</span>
                      <span className="capitalize">{course.level || "Beginner"}</span>
                    </div>
                    <h3 className="text-[16px] font-bold text-black leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-[13px] text-[#394649]">{course.profiles?.name || "Unknown Author"}</span>
                      <button onClick={() => onOpenCourse(course.id)} className="h-[36px] px-4 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[13px] inline-flex items-center justify-center">Continue</button>
                    </div>
                  </div>
               </div>
             );
          })}
        </div>
      )}
    </div>
  );
}

function Products({ onOpenProduct }: { onOpenProduct: (id: string) => void }) {
  const { data: products, isLoading, isError, isFetching, refetch } = useQuery({ queryKey: ["my-products"], queryFn: () => getMyProducts() });
  
  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-4">
      <div>
        <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">Digital Products</h2>
        <p className="text-[16px] text-[#4D4D4D] mt-1">Digital products you have acquired.</p>
      </div>
      
      {isLoading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 py-16 text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h3 className="mb-2 text-[18px] font-bold text-black">Products couldn't load</h3>
          <p className="mb-6 text-[14px] text-[#4D4D4D]">The server took too long to respond. Please try again.</p>
          <Button onClick={() => refetch()} disabled={isFetching} className="h-11 bg-primary px-7 text-white hover:bg-[#10A364]">
            {isFetching ? "Trying again..." : "Retry"}
          </Button>
        </div>
      ) : !products || products.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E5E5E5] rounded-xl">
          <Package className="w-12 h-12 text-[#9794AA] mx-auto mb-4" />
          <h3 className="font-bold text-[18px] text-black mb-2">No products yet</h3>
          <p className="text-[14px] text-[#4D4D4D] mb-6">You haven't acquired any digital products.</p>
          <button onClick={() => {}} className="h-[44px] px-8 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[14px] shadow-[0_4px_14px_rgba(21,207,116,0.25)] inline-flex items-center justify-center">Explore Products</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((item: any) => (
             <div key={item.id} className="bg-white border border-[#E5E5E5] rounded-lg p-5 shadow-sm flex flex-col group hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] bg-[#FAFAFA] border border-[#E5E5E5] rounded-md mb-4 flex items-center justify-center relative overflow-hidden">
                  <Package className="w-10 h-10 text-primary/40 group-hover:scale-110 transition-transform duration-300" />
                  <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-md border border-[#E5E5E5] text-black font-bold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded">
                    {item.products?.type || "Product"}
                  </span>
                </div>
                 <h3 className="font-bold text-[16px] text-black leading-snug line-clamp-2">{item.products?.title}</h3>
                <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                   <button onClick={() => onOpenProduct(item.products?.id)} className="w-full border border-[#DADADA] text-[#394649] bg-white hover:bg-gray-50 h-10 rounded-md font-medium text-[14px] inline-flex items-center justify-center">View Content</button>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Orders() {
  const { data: orders, isLoading } = useQuery({ queryKey: ["my-orders"], queryFn: () => getMyOrders() });
  
  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-4">
      <div>
        <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">Order History</h2>
        <p className="text-[16px] text-[#4D4D4D] mt-1">View your past transactions and receipts.</p>
      </div>
      
      {isLoading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E5E5E5] rounded-xl">
          <ShoppingCart className="w-12 h-12 text-[#9794AA] mx-auto mb-4" />
          <h3 className="font-bold text-[18px] text-black mb-2">No orders</h3>
          <p className="text-[14px] text-[#4D4D4D]">You haven't made any purchases yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                <tr>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider">Date</th>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider">Status</th>
                  <th className="p-4 text-[13px] font-bold text-[#394649] uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {orders.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-[14px] text-[#4D4D4D]">{item.id.slice(0, 8)}</td>
                    <td className="p-4 text-[14px] text-[#4D4D4D]">{formatDate(item.created_at)}</td>
                    <td className="p-4 text-[14px]">
                      <Badge className={item.status === 'paid' ? 'bg-[#E3F9EF] text-primary border-none shadow-none font-bold uppercase text-[10px]' : 'bg-gray-100 text-[#9794AA] border-none shadow-none font-bold uppercase text-[10px]'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-[14px] font-bold text-black text-right">{formatPrice(item.total_minor, item.currency)}</td>
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

function Wishlist({ onOpenProduct }: { onOpenProduct: (id: string) => void }) {
  const queryClient = useQueryClient();
  const { data: wishlist, isLoading } = useQuery({ queryKey: ["my-wishlist"], queryFn: () => getMyWishlist() });
  
  const handleRemove = async (productId: string) => {
    await toggleWishlist({ data: { productId } });
    queryClient.invalidateQueries({ queryKey: ["my-wishlist"] });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-4">
      <div>
        <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">My Wishlist</h2>
        <p className="text-[16px] text-[#4D4D4D] mt-1">Products you've saved for later.</p>
      </div>
      
      {isLoading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : !wishlist || wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E5E5E5] rounded-xl">
          <Heart className="w-12 h-12 text-[#9794AA] mx-auto mb-4" />
          <h3 className="font-bold text-[18px] text-black mb-2">Your wishlist is empty</h3>
          <p className="text-[14px] text-[#4D4D4D] mb-6">Save products you're interested in to see them here.</p>
          <button onClick={() => {}} className="h-[44px] px-8 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[14px] shadow-[0_4px_14px_rgba(21,207,116,0.25)] inline-flex items-center justify-center">Browse Marketplace</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item: any) => (
             <div key={item.id} className="bg-white border border-[#E5E5E5] rounded-lg p-5 shadow-sm flex flex-col group hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] bg-[#FAFAFA] border border-[#E5E5E5] rounded-md mb-4 flex items-center justify-center relative overflow-hidden">
                  <Package className="w-10 h-10 text-primary/40 group-hover:scale-110 transition-transform duration-300" />
                  <button onClick={() => handleRemove(item.product_id)} className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-red-500 hover:text-red-700 shadow-sm"><Heart className="w-4 h-4 fill-current" /></button>
                </div>
                 <h3 className="font-bold text-[16px] text-black leading-snug line-clamp-2">{item.products?.title}</h3>
                 <p className="mt-1 text-[14px] font-bold text-primary">{formatPrice(item.products?.price_minor, item.products?.currency)}</p>
                <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                   <button onClick={() => onOpenProduct(item.product_id)} className="w-full border border-[#DADADA] text-[#394649] bg-white hover:bg-gray-50 h-10 rounded-md font-medium text-[14px] inline-flex items-center justify-center">View Details</button>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
