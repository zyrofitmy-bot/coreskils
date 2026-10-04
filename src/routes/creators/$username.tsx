import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Globe } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { CourseCard } from "@/components/CourseCard";
import { ProductCard } from "@/components/ProductCard";
import { getCreatorProfile } from "@/lib/marketplace.functions";

const creatorQuery = (username: string) =>
  queryOptions({
    queryKey: ["creator", username],
    queryFn: () => getCreatorProfile({ data: { username } }),
  });

export const Route = createFileRoute("/creators/$username")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(creatorQuery(params.username)),
  head: () => ({
    meta: [
      { title: "Creator — CoreSkils" },
      { name: "description", content: "Creator profile on CoreSkils." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreatorProfilePage,
});

function CreatorProfilePage() {
  const { username } = Route.useParams();
  const { data: creator } = useSuspenseQuery(creatorQuery(username));

  if (!creator) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-2xl font-bold">Creator not found</h1>
          <Link to="/creators" className="mt-4 inline-block text-primary hover:underline">
            Browse all creators
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="bg-secondary/50 py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 md:flex-row md:items-center">
          <div className="flex size-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt={creator.display_name} className="size-24 rounded-full object-cover" />
            ) : (
              creator.display_name?.[0] ?? "C"
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">{creator.display_name}</h1>
            {creator.headline && (
              <p className="mt-2 text-lg text-muted-foreground">{creator.headline}</p>
            )}
            {creator.website_url && (
              <a
                href={creator.website_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Globe className="size-4" /> Website
              </a>
            )}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-14">
        {creator.bio && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground">About</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{creator.bio}</p>
          </div>
        )}
        {creator.courses.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground">Courses</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {creator.courses.map((c: any) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        )}
        {creator.products.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground">Products</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {creator.products.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
