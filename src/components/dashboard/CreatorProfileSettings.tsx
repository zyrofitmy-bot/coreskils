import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getMyAccount } from "@/lib/account.functions";
import { upsertCreatorProfile } from "@/lib/creator.functions";

export function CreatorProfileSettings() {
  const { data: account, isLoading } = useQuery({ queryKey: ["my-account"], queryFn: () => getMyAccount() });
  const profile = account?.creatorProfile;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [form, setForm] = useState({ displayName: "", username: "", headline: "", bio: "", websiteUrl: "" });

  useEffect(() => {
    if (!profile) return;
    setForm({
      displayName: profile.display_name || "",
      username: profile.username || "",
      headline: profile.headline || "",
      bio: profile.bio || "",
      websiteUrl: profile.website_url || "",
    });
  }, [profile]);

  const setField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const save = async () => {
    setIsPending(true);
    try {
      await upsertCreatorProfile({ data: form });
      queryClient.invalidateQueries({ queryKey: ["my-account"] });
      toast({ title: "Creator profile updated." });
    } catch (error: any) {
      toast({ title: error?.message || "Could not update profile.", variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pt-4">
      <div>
        <h2 className="text-[32px] font-bold tracking-tight text-black md:text-[40px]">Creator Profile</h2>
        <p className="mt-1 text-[16px] text-[#4D4D4D]">Control the name and information buyers see on your products.</p>
      </div>

      <section className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 border-b border-[#E8E8E8] pb-8 sm:flex-row sm:items-center">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#E6F6ED] shadow-md">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Creator profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center"><UserRound className="h-12 w-12 text-[#70A88D]" /></div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-black">Profile photo</h3>
            {/* TODO(phase2): avatar upload requires storage integration; not wired up yet. */}
            <p className="mt-1 text-sm text-[#666]">Photo uploads are coming soon.</p>
          </div>
        </div>

        <div className="grid gap-6 pt-8 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" value={form.displayName} onChange={(event) => setField("displayName", event.target.value)} maxLength={80} placeholder="Your public name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex overflow-hidden rounded-md border border-input">
              <span className="flex items-center bg-[#F7F7F7] px-3 text-sm text-[#737373]">@</span>
              <Input id="username" value={form.username} onChange={(event) => setField("username", event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} maxLength={30} className="border-0 focus-visible:ring-0" placeholder="your_username" />
            </div>
            <p className="text-xs text-[#737373]">Lowercase letters, numbers and underscores only.</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="headline">Professional headline</Label>
            <Input id="headline" value={form.headline} onChange={(event) => setField("headline", event.target.value)} maxLength={140} placeholder="e.g. Wellness educator and business mentor" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bio">About you</Label>
            <Textarea id="bio" value={form.bio} onChange={(event) => setField("bio", event.target.value)} maxLength={1500} rows={6} placeholder="Tell learners about your experience and expertise." />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="websiteUrl">Website</Label>
            <Input id="websiteUrl" value={form.websiteUrl} onChange={(event) => setField("websiteUrl", event.target.value)} maxLength={500} placeholder="https://yourwebsite.com" />
          </div>
        </div>

        <div className="mt-8 flex justify-end border-t border-[#E8E8E8] pt-6">
          <Button onClick={save} disabled={isPending || form.displayName.trim().length < 2 || form.username.length < 3} className="h-11 bg-primary px-6 text-white hover:bg-[#10A364]">
            <Save className="mr-2 h-4 w-4" /> {isPending ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </section>
    </div>
  );
}
