import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getMyApplication, submitCreatorApplication } from "@/lib/account.functions";

export const Route = createFileRoute("/creator-application")({
  head: () => ({
    meta: [
      { title: "Apply to teach — CoreSkils" },
      { name: "description", content: "Apply to become a creator on CoreSkils." },
    ],
  }),
  component: CreatorApplication,
});

const fields = [
  ["displayName", "Public display name", "text"],
  ["headline", "Professional headline", "text"],
  ["expertise", "Core expertise", "text"],
  ["experienceYears", "Years of experience", "number"],
  ["portfolioUrl", "Portfolio URL (optional)", "url"],
  ["linkedinUrl", "LinkedIn URL (optional)", "url"],
  ["websiteUrl", "Website URL (optional)", "url"],
] as const;

function CreatorApplication() {
  const navigate = useNavigate();
  const { data: existing, isLoading } = useQuery({
    queryKey: ["my-application"],
    queryFn: () => getMyApplication(),
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initial = useMemo(() => existing ?? {
    displayName: "", headline: "", bio: "", expertise: "", experienceYears: 0,
    portfolioUrl: "", linkedinUrl: "", websiteUrl: "", teachingTopics: [],
    courseProposal: "", targetAudience: "", motivation: "",
  }, [existing]);
  const [form, setForm] = useState<any>(initial);
  const [topics, setTopics] = useState((((existing as any)?.teaching_topics ?? (initial as any).teachingTopics) ?? []).join(", "));
  const initialized = useRef(false);
  useEffect(() => {
    if (!isLoading && !initialized.current) {
      setForm(initial);
      setTopics((((existing as any)?.teaching_topics ?? (initial as any).teachingTopics) ?? []).join(", "));
      initialized.current = true;
    }
  }, [initial, isLoading]);
  const set = (key: string, value: unknown) => setForm((current: any) => ({ ...current, [key]: value }));

  if (isLoading) return <PublicLayout><div className="min-h-screen flex items-center justify-center">Loading application…</div></PublicLayout>;
  const status = existing?.status;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await submitCreatorApplication({
        data: {
          ...form,
          experienceYears: Number(form.experienceYears) || 0,
          teachingTopics: topics.split(",").map((topic: string) => topic.trim()).filter(Boolean),
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["my-application"] });
      toast({ title: "Application submitted", description: "The team will review your creator profile." });
    } catch (error: any) {
      toast({ title: "Could not submit application", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <main className="min-h-screen bg-[#FAFAFA] pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Creator review</p>
            <h1 className="text-4xl font-bold text-black mt-2">Apply to teach on CoreSkils</h1>
            <p className="text-[#5F6870] mt-3 max-w-2xl">Share your experience and the course you want to build. Creator access is enabled only after a review.</p>
          </div>
          {status && (
            <div className={`rounded-xl border p-5 mb-6 ${status === "rejected" ? "bg-red-50 border-red-200" : status === "approved" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
              <p className="font-bold capitalize">Application {status}</p>
              <p className="text-sm mt-1">{status === "pending" ? "Your details are in review." : status === "approved" ? "Creator tools are unlocked for your account." : `Please update your details and resubmit.${existing?.review_reason ? ` Review note: ${existing.review_reason}` : ""}`}</p>
            </div>
          )}
          {status !== "approved" && <form onSubmit={submit} className="bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-10 shadow-sm space-y-7">
            <div className="grid md:grid-cols-2 gap-5">
              {fields.map(([key, label, type]) => <label key={key} className="space-y-2 text-sm font-medium text-[#394649]">{label}<input required={key !== "portfolioUrl" && key !== "linkedinUrl" && key !== "websiteUrl"} type={type} value={form[key] ?? ""} onChange={(e) => set(key, type === "number" ? Number(e.target.value) : e.target.value)} className="w-full h-11 rounded-lg border border-[#D9DEE5] px-3 outline-none focus:ring-2 focus:ring-primary/20" /></label>)}
            </div>
            <label className="block space-y-2 text-sm font-medium text-[#394649]">Teaching topics <input required value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="React, AI fundamentals, product design" className="w-full h-11 rounded-lg border border-[#D9DEE5] px-3" /><span className="text-xs text-[#7A8490]">Separate topics with commas.</span></label>
            {[["bio", "Short professional bio", 4], ["courseProposal", "What course do you want to create?", 4], ["targetAudience", "Who will learn from it?", 3], ["motivation", "Why do you want to teach on CoreSkils?", 4]].map(([key, label, rows]) => <label key={key as string} className="block space-y-2 text-sm font-medium text-[#394649]">{label as string}<textarea required value={form[key as string] ?? ""} onChange={(e) => set(key as string, e.target.value)} rows={rows as number} className="w-full rounded-lg border border-[#D9DEE5] p-3 resize-y" /></label>)}
            <Button type="submit" disabled={isSubmitting} className="h-12 px-7">{isSubmitting ? "Submitting…" : status === "rejected" ? "Resubmit application" : "Submit for review"}</Button>
          </form>}
        </div>
      </main>
    </PublicLayout>
  );
}
