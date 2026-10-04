import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/layout/PublicLayout";
import {
  submitCreatorApplication,
  getMyApplication,
} from "@/lib/account.functions";

export const Route = createFileRoute("/creator-application")({
  head: () => ({
    meta: [
      { title: "Become a Creator — CoreSkils" },
      { name: "description", content: "Apply to teach and sell on CoreSkils." },
      { property: "og:title", content: "Become a Creator — CoreSkils" },
      { property: "og:description", content: "Apply to teach and sell on CoreSkils." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreatorApplicationPage,
});

const inputCls =
  "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function CreatorApplicationPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [existing, setExisting] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    headline: "",
    bio: "",
    expertise: "",
    experienceYears: 0,
    portfolioUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
    teachingTopics: "",
    courseProposal: "",
    targetAudience: "",
    motivation: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        navigate({ to: "/auth" });
        return;
      }
      setUser(data.user);
      try {
        const app = await getMyApplication();
        setExisting(app);
      } catch {}
      setChecking(false);
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await submitCreatorApplication({
        data: {
          displayName: form.displayName,
          headline: form.headline || undefined,
          bio: form.bio || undefined,
          expertise: form.expertise || undefined,
          experienceYears: Number(form.experienceYears) || 0,
          portfolioUrl: form.portfolioUrl || undefined,
          linkedinUrl: form.linkedinUrl || undefined,
          websiteUrl: form.websiteUrl || undefined,
          teachingTopics: form.teachingTopics
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          courseProposal: form.courseProposal || undefined,
          targetAudience: form.targetAudience || undefined,
          motivation: form.motivation || undefined,
        },
      });
      toast.success("Application submitted! We'll review it shortly.");
      setExisting({ status: "pending" });
    } catch (err: any) {
      toast.error(err.message ?? "Could not submit application");
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <PublicLayout>
        <div className="py-24 text-center text-muted-foreground">Loading…</div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-4xl font-bold text-foreground">Become a creator</h1>
        <p className="mt-3 text-muted-foreground">
          Teach courses and sell digital products on CoreSkils. Tell us about
          yourself and what you want to teach.
        </p>
        {existing ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
            <span
              className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${
                existing.status === "approved"
                  ? "bg-primary/10 text-primary"
                  : existing.status === "rejected"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-secondary text-secondary-foreground"
              }`}
            >
              {existing.status}
            </span>
            <p className="mt-4 text-sm text-muted-foreground">
              {existing.status === "approved"
                ? "You're approved! Head to your creator dashboard to start building."
                : existing.status === "rejected"
                  ? (existing.review_reason ?? "Your application was not approved this time.")
                  : "Your application is under review. We'll notify you once it's decided."}
            </p>
            {existing.status === "approved" && (
              <button
                onClick={() => navigate({ to: "/dashboard/creator" })}
                className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Open creator dashboard
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="Display name *"
              required
              className={inputCls}
            />
            <input
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="Headline (e.g. Wellness business coach)"
              className={inputCls}
            />
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Short bio"
              rows={3}
              className={inputCls}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.expertise}
                onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                placeholder="Area of expertise"
                className={inputCls}
              />
              <input
                type="number"
                min={0}
                value={form.experienceYears}
                onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
                placeholder="Years of experience"
                className={inputCls}
              />
            </div>
            <input
              value={form.teachingTopics}
              onChange={(e) => setForm({ ...form, teachingTopics: e.target.value })}
              placeholder="Teaching topics (comma separated)"
              className={inputCls}
            />
            <textarea
              value={form.courseProposal}
              onChange={(e) => setForm({ ...form, courseProposal: e.target.value })}
              placeholder="What course or product would you create first?"
              rows={3}
              className={inputCls}
            />
            <textarea
              value={form.targetAudience}
              onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
              placeholder="Who is your target audience?"
              rows={2}
              className={inputCls}
            />
            <textarea
              value={form.motivation}
              onChange={(e) => setForm({ ...form, motivation: e.target.value })}
              placeholder="Why do you want to teach on CoreSkils?"
              rows={2}
              className={inputCls}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                value={form.portfolioUrl}
                onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                placeholder="Portfolio URL"
                className={inputCls}
              />
              <input
                value={form.linkedinUrl}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                placeholder="LinkedIn URL"
                className={inputCls}
              />
              <input
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                placeholder="Website URL"
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? "Submitting…" : "Submit application"}
            </button>
          </form>
        )}
      </section>
    </PublicLayout>
  );
}
