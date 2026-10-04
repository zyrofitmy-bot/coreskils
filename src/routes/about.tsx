import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CoreSkils" },
      { name: "description", content: "CoreSkils is a marketplace for practical digital products and courses with transparent terms." },
      { property: "og:title", content: "About — CoreSkils" },
      { property: "og:description", content: "CoreSkils is a marketplace for practical digital products and courses with transparent terms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold text-foreground">About CoreSkils</h1>
        <div className="mt-8 space-y-6 text-muted-foreground">
          <p className="text-lg">
            CoreSkils is a marketplace for practical digital products and online
            courses — built on transparent terms and real outcomes.
          </p>
          <p>
            We believe learning should be practical, affordable, and honest.
            Every product on CoreSkils comes with clear pricing, clear access
            terms, and a clear refund policy. No hidden fees, no vague promises.
          </p>
          <p>
            Our creators are practitioners — people who do the work they teach.
            From business guides to technical skills, everything on CoreSkils is
            designed to be applied, not just consumed.
          </p>
          <h2 className="pt-4 text-2xl font-bold text-foreground">Our principles</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Practical over theoretical — skills you can use immediately.</li>
            <li>Transparent terms — you always know what you're buying.</li>
            <li>Creator-first — fair earnings and full ownership of content.</li>
            <li>Learner protection — clear refund and access policies.</li>
          </ul>
        </div>
      </section>
    </PublicLayout>
  );
}
