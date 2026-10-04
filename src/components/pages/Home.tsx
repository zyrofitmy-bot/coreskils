import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  FileText,
  Headphones,
  ShieldCheck,
  PlaySquare,
  FileArchive,
  Video,
  ArrowRight,
  Package,
  BookOpen,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { listCourses, listProducts } from "@/lib/marketplace.functions";
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";

function productPrice(priceMinor: number, currency: string) {
  if (priceMinor === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(priceMinor / 100);
}

export default function Home() {
  const { data: products } = useQuery({
    queryKey: ["home-products"],
    queryFn: () => listProducts({ data: {} }),
  });
  const { data: courses } = useQuery({
    queryKey: ["home-courses"],
    queryFn: () => listCourses({ data: {} }),
  });
  const courseCategories = Array.from(
    new Set((courses || []).map((course: any) => course.categories?.name || "Other")),
  );

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white overflow-hidden text-[#101614]">
        {/* HERO SECTION */}
        <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8 animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#15CF74] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#15CF74]"></span>
                </span>
                <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                  Now accepting creator applications
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.25rem] font-bold tracking-tighter leading-[0.95] mb-8 animate-fade-in-up delay-100">
                The professional <span className="text-primary">platform</span> for digital knowledge.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-lg mb-10 leading-relaxed animate-fade-in-up delay-200">
                CoreSkils provides the infrastructure for experts to publish practical courses, downloadable files, and live learning experiences. No technical headache. Just your expertise, organized and delivered.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
                <Link to="/creator-application" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-semibold text-white transition-all duration-300 hover:bg-[#15CF74] hover:text-[#101614] shadow-xl shadow-primary/20 group">
                  Start as a Creator <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/products" className="inline-flex h-14 items-center justify-center rounded-xl border-2 border-[#101614] px-8 font-semibold text-[#101614] transition-all duration-300 hover:bg-[#101614] hover:text-white">
                  Explore Products
                </Link>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-200/60 flex flex-wrap gap-x-6 gap-y-3 items-center animate-fade-in-up delay-400">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">Supports</span>
                <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-700 items-center">
                  <span className="flex items-center gap-1.5"><PlaySquare className="w-4 h-4 text-primary" /> Video Courses</span>
                  <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1.5"><FileArchive className="w-4 h-4 text-primary" /> Digital Toolkits</span>
                  <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1.5"><Video className="w-4 h-4 text-primary" /> Live Classes</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative animate-slide-in-right delay-300">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                <img
                  src="/images/hero-abstract.png"
                  alt="CoreSkils platform abstract"
                  className="w-full h-auto object-cover"
                  fetchPriority="high"
                />
              </div>

              {/* Floating elements for depth */}
              <div className="absolute -left-6 top-10 glass-panel rounded-xl p-4 shadow-lg animate-fade-in-up delay-500 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">One Workspace</div>
                    <div className="text-xs text-slate-500">Create and deliver</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MANIFESTO SECTION — dark editorial block */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-16 lg:my-24">
          <div className="bg-[#101614] text-white rounded-[2.5rem] px-8 sm:px-12 lg:px-16 py-20 lg:py-28 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary blur-[160px] opacity-20 pointer-events-none" />
            <div className="relative z-10 max-w-4xl">
              <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#15CF74] mb-8 animate-fade-in-up">Why CoreSkils Exists</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-tight tracking-tight animate-fade-in-up delay-100">
                Every expert, teacher, and creator has unique knowledge, hard-won insights, and transformative experiences.{" "}
                <span className="text-gray-500">
                  The greatest risk isn't creating something meaningful — it's allowing valuable insights to stay unheard.
                </span>
              </h2>
              <p className="mt-8 text-lg text-gray-400 leading-relaxed max-w-2xl animate-fade-in-up delay-200">
                We provide the <span className="font-semibold text-white">professional infrastructure</span> to turn your expertise into real impact — and reach those who need it most.
              </p>
            </div>
          </div>
        </section>

        {/* CAPABILITIES SECTION */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex justify-between items-end mb-16">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">One Platform, Endless Possibilities</p>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Build your digital legacy.</h2>
                <p className="text-lg text-slate-500 max-w-md">We handle the heavy lifting of hosting, access control, and delivery so you can focus on what you do best — sharing knowledge.</p>
              </div>
              <div className="hidden md:block">
                <div className="flex gap-2">
                  <div className="w-12 h-[2px] bg-primary"></div>
                  <div className="w-4 h-[2px] bg-gray-200"></div>
                  <div className="w-4 h-[2px] bg-gray-200"></div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                [PlaySquare, "Publish Practical Courses", "Structure your knowledge into video lessons, documents, and resources with our intuitive course builder. Deliver high-quality learning experiences."],
                [FileArchive, "Publish Digital Toolkits", "Upload templates, guides, checklists, and ebooks with protected delivery, clear access durations, and controlled downloads."],
                [Video, "Host Live Classes", "Schedule live sessions, teach inside the CoreSkils classroom, and organize course resources alongside every learning experience."],
              ].map(([Icon, title, body]) => {
                const CardIcon = Icon as typeof PlaySquare;
                return (
                  <article key={title as string} className="group p-8 rounded-3xl border border-gray-100 bg-white hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-colors">
                      <CardIcon className="w-6 h-6 text-primary group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{title as string}</h3>
                    <p className="text-slate-500 leading-relaxed">{body as string}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {courses && courses.length > 0 && (
          <section className="bg-[#F8FAF9] py-24 border-y border-[#E2EBE6]">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Published courses</p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Learn by category</h2>
                </div>
                <Link to="/courses" className="inline-flex items-center gap-2 font-semibold text-[#087B46] hover:underline">View all courses <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="space-y-14">
                {courseCategories.map((categoryName) => (
                  <div key={categoryName}>
                    <div className="mb-5 flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h3 className="text-2xl font-bold">{categoryName}</h3>
                    </div>
                    <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                      {courses
                        .filter((course: any) => (course.categories?.name || "Other") === categoryName)
                        .slice(0, 3)
                        .map((course: any) => (
                          <article key={course.id} className="overflow-hidden rounded-2xl border border-[#DCE8E1] bg-white shadow-[0_14px_42px_rgba(20,80,55,.08)] transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                            <div className="aspect-[16/9] overflow-hidden bg-[#EEF5F1]">
                              <CourseThumbnail src={course.thumbnail_url} title={course.title} />
                            </div>
                            <div className="p-6">
                              {/* TODO(phase2): lesson count not available from listCourses */}
                              <span className="text-xs font-bold uppercase tracking-wide text-[#087B46]">{course.level || "Beginner"}</span>
                              <h4 className="mt-3 line-clamp-2 text-xl font-bold">{course.title}</h4>
                              <p className="mt-3 line-clamp-2 leading-6 text-slate-600">{course.description}</p>
                              <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#E4ECE8] pt-5">
                                <span className="text-xl font-bold">{productPrice(course.price_minor || 0, course.currency || "INR")}</span>
                                <Link to="/courses/$courseId" params={{ courseId: course.slug || course.id }} className="font-semibold text-[#087B46] hover:underline">View course</Link>
                              </div>
                            </div>
                          </article>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {products && products.length > 0 && (
          <section className="bg-white py-24">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Published catalogue</p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Latest digital products</h2>
                </div>
                <Link to="/products" className="inline-flex items-center gap-2 font-semibold text-[#087B46] hover:underline">
                  View all products <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {products.slice(0, 3).map((product: any) => (
                  <article key={product.id} className="overflow-hidden rounded-2xl border border-[#DCE8E1] bg-white shadow-[0_14px_42px_rgba(20,80,55,.08)] transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                    <div className="aspect-[16/9] overflow-hidden bg-[#FAFAFA] relative">
                      {product.cover_image_url ? (
                        <>
                          <img src={product.cover_image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 blur-xl scale-110 pointer-events-none" aria-hidden="true" />
                          <img src={product.cover_image_url} alt={product.title} className="relative z-10 h-full w-full object-contain drop-shadow-sm" loading="lazy" />
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0B3027] to-[#146047]">
                          <Package className="h-16 w-16 text-white/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-bold uppercase tracking-wide text-[#087B46]">{product.type || "Digital product"}</span>
                      <h3 className="mt-3 line-clamp-2 text-xl font-bold">{product.title}</h3>
                      <p className="mt-3 line-clamp-2 leading-6 text-slate-600">{product.short_summary || product.description}</p>
                      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#E4ECE8] pt-5">
                        <span className="text-xl font-bold">{productPrice(product.price_minor, product.currency)}</span>
                        <Link to="/products/$productId" params={{ productId: product.public_slug || product.id }} className="font-semibold text-[#087B46] hover:underline">View product</Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TRANSPARENT CUSTOMER EXPERIENCE */}
        <section className="py-24 bg-[#F8FAF9] border-t border-[#E2EBE6]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">Transparent Experience</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Clear information before payment</h2>
              <p className="mt-4 text-lg text-slate-600">Every CoreSkils product clearly explains what the customer receives, how delivery works, and which policies apply. Trust is built on clarity.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                [FileText, "Review exact deliverables", "Check the contents, format, intended audience, price, licence, and available sample before purchase."],
                [ShieldCheck, "Verified processing", "When checkout is active, access will be granted only after server-side confirmation from the authorised payment gateway."],
                [Headphones, "Delivery and support", "Digital access is provided electronically. Product, access, refund, and privacy questions are handled by dedicated support."],
              ].map(([Icon, title, body]) => {
                const CardIcon = Icon as typeof FileText;
                return (
                  <article key={title as string} className="group rounded-3xl border border-[#E2EBE6] bg-white p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                      <CardIcon className="h-6 w-6 text-primary group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{title as string}</h3>
                    <p className="text-slate-600 leading-relaxed">{body as string}</p>
                  </article>
                );
              })}
            </div>

            <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-500">
              <Link to="/shipping-delivery" className="hover:text-primary transition-colors">Digital delivery policy</Link>
              <Link to="/refund-policy" className="hover:text-primary transition-colors">Refund policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms and conditions</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Customer support</Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
