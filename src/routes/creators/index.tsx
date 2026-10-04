import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { listCreators } from "@/lib/marketplace.functions";
import { Link } from "@tanstack/react-router";

const creatorsQuery = queryOptions({
  queryKey: ["creators"],
  queryFn: () => listCreators(),
});

export const Route = createFileRoute("/creators/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(creatorsQuery),
  head: () => ({
    meta: [
      { title: "Creators — CoreSkils" },
      { name: "description", content: "Meet the creators teaching on CoreSkils." },
      { property: "og:title", content: "Creators — CoreSkils" },
      { property: "og:description", content: "Meet the creators teaching on CoreSkils." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreatorsPage,
});

function CreatorsPage() {
  const { data: creators } = useSuspenseQuery(creatorsQuery);
  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="text-4xl font-bold text-foreground">Creators</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          The people behind the courses and products on CoreSkils.
        </p>
        {creators.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">
            No creators yet.{" "}
            <Link to="/creator-application" className="text-primary hover:underline">
              Become the first one.
            </Link>
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((c: any) => (
              <Link
                key={c.id}
                to="/creators/$username"
                params={{ username: c.username ?? c.id }}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt={c.display_name} className="size-14 rounded-full object-cover" />
                  ) : (
                    c.display_name?.[0] ?? "C"
                  )}
                </div>
                <h2 className="mt-4 text-lg font-semibold text-card-foreground">{c.display_name}</h2>
                {c.headline && <p className="mt-1 text-sm text-muted-foreground">{c.headline}</p>}
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
