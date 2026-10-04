import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Compass, Layers, TrendingUp } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { CourseCard } from "@/components/CourseCard";
import { ProductCard } from "@/components/ProductCard";
import { listCourses, listProducts } from "@/lib/marketplace.functions";
import ogImage from "@/assets/og-image.png.asset.json";

const featuredCoursesQuery = queryOptions({
  queryKey: ["home-courses"],
  queryFn: () => listCourses({ data: {} }),
});
const featuredProductsQuery = queryOptions({
  queryKey: ["home-products"],
  queryFn: () => listProducts({ data: {} }),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(featuredCoursesQuery);
    context.queryClient.ensureQueryData(featuredProductsQuery);
  },
  head: () => ({
    meta: [
      { title: "CoreSkils — Practical skills. Real career growth." },
      {
        name: "description",
        content:
          "Learn from practical courses and digital products built by real creators. CoreSkils turns learning into measurable career progress.",
      },
      { property: "og:title", content: "CoreSkils — Practical skills. Real career growth." },
      {
        property: "og:description",
        content:
          "Learn from practical courses and digital products built by real creators.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: ogImage.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: ogImage.url },
    ],
  }),
  component: Index,
});

const pillars = [
  {
    icon: Layers,
    title: "Strong foundations",
    text: "Start with the core skills every role is built on — structured, practical, and impossible to skip.",
  },
  {
    icon: Compass,
    title: "Guided pathways",
    text: "Follow clear learning paths that connect what you learn today to the role you want next.",
  },
  {
    icon: TrendingUp,
    title: "Visible progress",
    text: "Watch your skills compound into real momentum — portfolios, confidence, and career growth.",
  },
];

function Index() {
  const { data: courses } = useSuspenseQuery(featuredCoursesQuery);
  const { data: products } = useSuspenseQuery(featuredProductsQuery);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 text-center md:pt-24">
        <span className="inline-block rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
          Learn. Practice. Grow.
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold tracking-tight text-foreground md:text-6xl">
          Practical skills. <span className="text-primary">Real career growth.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Courses and digital products from creators who do the work — clear
          pathways, hands-on practice, and progress you can see.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-full bg-action px-7 py-3.5 text-base font-semibold text-action-foreground transition-transform hover:scale-[1.03]"
          >
            Browse courses <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/products"
            className="rounded-full border border-border px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Explore products
          </Link>
        </div>
      </section>

      {/* Featured courses */}
      {courses.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-foreground">Featured courses</h2>
            <Link to="/courses" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((c: any) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {products.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-foreground">Digital products</h2>
            <Link to="/products" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Pillars */}
      <section className="bg-secondary/60 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <p.icon className="size-6 text-primary" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-card-foreground">{p.title}</h2>
              <p className="mt-2 text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Creator CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-foreground">Teach on CoreSkils</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Turn your expertise into courses and digital products. Apply to become
          a creator and start earning.
        </p>
        <Link
          to="/creator-application"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Become a creator <ArrowRight className="size-4" />
        </Link>
      </section>
    </PublicLayout>
  );
}
