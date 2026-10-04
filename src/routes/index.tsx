import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Compass, Layers, TrendingUp } from "lucide-react";

import logoHorizontal from "@/assets/logo-horizontal.svg.asset.json";
import logoMarkWhite from "@/assets/logo-mark-white.svg.asset.json";
import ogImage from "@/assets/og-image.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CoreSkils — Practical skills. Real career growth." },
      {
        name: "description",
        content:
          "CoreSkils helps you build a strong foundation of practical skills and turn learning into measurable career progress.",
      },
      { property: "og:title", content: "CoreSkils — Practical skills. Real career growth." },
      {
        property: "og:description",
        content:
          "Build a strong foundation of practical skills and turn learning into measurable career progress.",
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
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <img src={logoHorizontal.url} alt="CoreSkils" className="h-9 w-auto" />
        <a
          href="#start"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Get started
        </a>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 text-center md:pt-24">
        <span className="inline-block rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
          Learn. Practice. Grow.
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold tracking-tight text-foreground md:text-6xl">
          Practical skills.{" "}
          <span className="text-primary">Real career growth.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          CoreSkils turns learning into momentum — a strong core of practical
          skills, clear pathways, and progress you can see.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            id="start"
            href="#pillars"
            className="inline-flex items-center gap-2 rounded-full bg-action px-7 py-3.5 text-base font-semibold text-action-foreground transition-transform hover:scale-[1.03]"
          >
            Start building <ArrowRight className="size-4" />
          </a>
          <a
            href="#pillars"
            className="rounded-full border border-border px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Explore pathways
          </a>
        </div>
      </section>

      {/* Pillars */}
      <section id="pillars" className="bg-secondary/60 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border bg-card p-8 shadow-sm"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <p.icon className="size-6 text-primary" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-card-foreground">
                {p.title}
              </h2>
              <p className="mt-2 text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
          <img src={logoMarkWhite.url} alt="CoreSkils mark" className="h-10 w-10" />
          <p className="text-sm text-background/70">
            © {new Date().getFullYear()} CoreSkils · coreskils.com
          </p>
        </div>
      </footer>
    </div>
  );
}
