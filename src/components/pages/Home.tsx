import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Download,
  FileText,
  Headphones,
  Infinity as InfinityIcon,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { listCourses, listProducts } from "@/lib/marketplace.functions";

function productPrice(priceMinor: number, currency: string) {
  if (priceMinor === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(priceMinor / 100);
}

function ProductCard({ product }: { product: any }) {
  return (
    <Link
      to="/products/$productId"
      params={{ productId: product.public_slug || product.id }}
      className="group overflow-hidden rounded-2xl border border-[#DCE8E1] bg-white shadow-[0_14px_42px_rgba(20,80,55,.08)] transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5"
    >
      <div className="aspect-[4/3] overflow-hidden bg-[#FAFAFA] relative">
        {product.cover_image_url ? (
          <>
            <img
              src={product.cover_image_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-20 blur-xl scale-110 pointer-events-none"
              aria-hidden="true"
            />
            <img
              src={product.cover_image_url}
              alt={product.title}
              className="relative z-10 h-full w-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0B3027] to-[#146047]">
            <Package className="h-16 w-16 text-white/30" />
          </div>
        )}
        <span className="absolute left-4 top-4 z-20 rounded-full bg-[#101614]/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
          {product.type || "Digital product"}
        </span>
      </div>
      <div className="p-6">
        <span className="text-xs font-bold uppercase tracking-wide text-[#087B46]">
          {product.categories?.name || "Digital"}
        </span>
        <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {product.short_summary || product.description}
        </p>
        <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#E4ECE8] pt-4">
          <span className="text-xl font-bold">{productPrice(product.price_minor, product.currency)}</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#087B46]">
            View <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
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

  const productCategories = Array.from(
    new Set((products || []).map((p: any) => p.categories?.name).filter(Boolean)),
  ) as string[];
  const featured = (products || []).slice(0, 6);
  const heroProduct = featured[0];

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white overflow-hidden text-[#101614]">
        {/* HERO — digital products first */}
        <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div
            className="absolute -top-24 -right-32 w-[34rem] h-[34rem] rounded-full bg-primary/10 blur-[120px] pointer-events-none"
            aria-hidden="true"
          />
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center relative">
            <div className="lg:col-span-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8 animate-fade-in-up">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                  Premium digital products, instant access
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.95] mb-7 animate-fade-in-up delay-100">
                Digital products that <span className="text-primary">level up</span> your skills.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-lg mb-9 leading-relaxed animate-fade-in-up delay-200">
                E-books, toolkits, templates, and practical guides — crafted by verified experts,
                delivered instantly, yours for a lifetime. Pay once, download forever.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
                <Link
                  to="/products"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-semibold text-white transition-all duration-300 hover:bg-[#15CF74] hover:text-[#101614] shadow-xl shadow-primary/20 group"
                >
                  Browse all products <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/creator-application"
                  className="inline-flex h-14 items-center justify-center rounded-xl border-2 border-[#101614] px-8 font-semibold text-[#101614] transition-all duration-300 hover:bg-[#101614] hover:text-white"
                >
                  Sell your expertise
                </Link>
              </div>

              <div className="mt-11 pt-7 border-t border-slate-200/60 grid grid-cols-3 gap-6 animate-fade-in-up delay-400">
                {[
                  [Download, "Instant download", "Access right after purchase"],
                  [InfinityIcon, "Lifetime access", "Pay once, keep forever"],
                  [BadgeCheck, "Verified creators", "Quality-reviewed listings"],
                ].map(([Icon, title, sub]) => {
                  const I = Icon as typeof Download;
                  return (
                    <div key={title as string} className="flex flex-col gap-1.5">
                      <I className="w-5 h-5 text-primary mb-1" />
                      <span className="text-sm font-bold">{title as string}</span>
                      <span className="text-xs text-slate-500 leading-relaxed">{sub as string}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hero visual — featured product showcase */}
            <div className="lg:col-span-6 relative animate-slide-in-right delay-300">
              <div className="relative rounded-[2rem] bg-gradient-to-br from-[#0B3027] via-[#101614] to-[#146047] p-8 sm:p-10 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#15CF74] blur-[140px] opacity-25 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#15CF74]">
                      Featured this week
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-white/70">
                      <Star className="w-3.5 h-3.5 fill-[#15CF74] text-[#15CF74]" /> Editor's pick
                    </span>
                  </div>
                  {heroProduct ? (
                    <Link
                      to="/products/$productId"
                      params={{ productId: heroProduct.public_slug || heroProduct.id }}
                      className="group block"
                    >
                      <div className="rounded-2xl bg-white/95 p-5 shadow-xl transition-transform duration-500 group-hover:-translate-y-1">
                        {heroProduct.cover_image_url && (
                          <img
                            src={heroProduct.cover_image_url}
                            alt={heroProduct.title}
                            className="w-full aspect-[16/10] object-contain"
                            fetchPriority="high"
                          />
                        )}
                        <div className="mt-4 flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-lg leading-snug">{heroProduct.title}</h3>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                              {heroProduct.short_summary || heroProduct.description}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-white">
                            {productPrice(heroProduct.price_minor, heroProduct.currency)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="rounded-2xl bg-white/10 p-10 text-center text-white/60 text-sm">
                      New products dropping soon
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {productCategories.slice(0, 4).map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY STRIP */}
        {productCategories.length > 0 && (
          <section className="border-y border-[#E2EBE6] bg-[#F8FAF9] py-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mr-2">
                Shop by category
              </span>
              {productCategories.map((c) => (
                <Link
                  key={c}
                  to="/products"
                  className="rounded-full border border-[#DCE8E1] bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition-all hover:border-primary hover:text-primary hover:shadow-md"
                >
                  {c}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FEATURED PRODUCTS GRID */}
        {featured.length > 0 && (
          <section className="bg-white py-20 lg:py-24">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                    The catalogue
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    Bestselling digital products
                  </h2>
                  <p className="mt-3 text-lg text-slate-500 max-w-xl">
                    Practical e-books, templates, and toolkits — each one reviewed for quality before it goes live.
                  </p>
                </div>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 font-semibold text-[#087B46] hover:underline shrink-0"
                >
                  View all {products?.length || ""} products <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        <section className="py-20 lg:py-24 bg-[#F8FAF9] border-y border-[#E2EBE6]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mx-auto max-w-2xl text-center mb-14">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">
                Simple by design
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                From checkout to download in minutes
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                ["01", FileText, "Pick your product", "Browse the catalogue, read the full contents, sample pages, and FAQs before you buy — no surprises."],
                ["02", Zap, "Instant, secure delivery", "After confirmed payment, your download links and access are unlocked immediately in your account."],
                ["03", InfinityIcon, "Keep it for life", "Every purchase includes lifetime access. Re-download anytime, from any device, forever."],
              ].map(([step, Icon, title, body]) => {
                const I = Icon as typeof FileText;
                return (
                  <article
                    key={step as string}
                    className="relative rounded-3xl border border-[#E2EBE6] bg-white p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
                  >
                    <span className="absolute right-7 top-6 text-5xl font-black text-primary/10">
                      {step as string}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <I className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{title as string}</h3>
                    <p className="text-slate-600 leading-relaxed">{body as string}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* COURSES — secondary */}
        {courses && courses.length > 0 && (
          <section className="bg-white py-20 lg:py-24">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                    Beyond downloads
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    Structured courses, too
                  </h2>
                </div>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 font-semibold text-[#087B46] hover:underline shrink-0"
                >
                  View all courses <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.slice(0, 3).map((course: any) => (
                  <Link
                    key={course.id}
                    to="/courses/$courseId"
                    params={{ courseId: course.slug || course.id }}
                    className="group flex items-start gap-4 rounded-2xl border border-[#DCE8E1] bg-white p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
                  >
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold uppercase tracking-wide text-[#087B46]">
                        {course.categories?.name || course.level || "Course"}
                      </span>
                      <h3 className="mt-1 line-clamp-2 font-bold leading-snug group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <span className="mt-2 inline-block text-sm font-bold">
                        {productPrice(course.price_minor || 0, course.currency || "INR")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TRUST / TRANSPARENCY */}
        <section className="py-20 lg:py-24 bg-[#F8FAF9] border-t border-[#E2EBE6]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mx-auto max-w-3xl text-center mb-14">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">
                Transparent experience
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Clear information before payment
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Every CoreSkils product clearly explains what you receive, how delivery works, and
                which policies apply. Trust is built on clarity.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                [FileText, "Review exact deliverables", "Check the contents, format, intended audience, price, licence, and available sample before purchase."],
                [ShieldCheck, "Verified processing", "Access is granted only after server-side confirmation from the authorised payment gateway."],
                [Headphones, "Delivery and support", "Digital access is provided electronically. Product, access, refund, and privacy questions are handled by dedicated support."],
              ].map(([Icon, title, body]) => {
                const I = Icon as typeof FileText;
                return (
                  <article
                    key={title as string}
                    className="group rounded-3xl border border-[#E2EBE6] bg-white p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                      <I className="h-6 w-6 text-primary group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{title as string}</h3>
                    <p className="text-slate-600 leading-relaxed">{body as string}</p>
                  </article>
                );
              })}
            </div>
            <div className="mt-14 flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-500">
              <Link to="/shipping-delivery" className="hover:text-primary transition-colors">Digital delivery policy</Link>
              <Link to="/refund-policy" className="hover:text-primary transition-colors">Refund policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms and conditions</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Customer support</Link>
            </div>
          </div>
        </section>

        {/* FINAL CTA — dark */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-16 lg:my-24">
          <div className="bg-[#101614] text-white rounded-[2.5rem] px-8 sm:px-12 lg:px-16 py-16 lg:py-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary blur-[160px] opacity-20 pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#15CF74] mb-6">
                Start today
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-tight tracking-tight">
                Practical knowledge, packaged professionally —{" "}
                <span className="text-gray-500">ready to download the moment you are.</span>
              </h2>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#15CF74] px-8 font-semibold text-[#101614] transition-all duration-300 hover:bg-white group"
                >
                  Explore the catalogue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/creator-application"
                  className="inline-flex h-14 items-center justify-center rounded-xl border-2 border-white/25 px-8 font-semibold text-white transition-all duration-300 hover:bg-white/10"
                >
                  Become a creator
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
