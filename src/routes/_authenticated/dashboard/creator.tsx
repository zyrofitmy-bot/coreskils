import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  getMyCreatorCourses,
  saveCourse,
  setCourseStatus,
  getCourseBuilder,
  addModule,
  deleteModule,
  addLesson,
  deleteLesson,
  getMyCreatorProducts,
  saveProduct,
  setProductStatus,
  getMySalesSummary,
  upsertCreatorProfile,
} from "@/lib/creator.functions";
import { getMyAccount } from "@/lib/account.functions";
import { listCategories } from "@/lib/marketplace.functions";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/creator")({
  head: () => ({
    meta: [
      { title: "Creator Studio — CoreSkils" },
      { name: "description", content: "Manage your CoreSkils courses and products." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CreatorDashboard,
});

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
const btnPrimary =
  "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60";
const btnOutline =
  "rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent";

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

function CreatorDashboard() {
  const [section, setSection] = useState("overview");
  const [builderId, setBuilderId] = useState<string | null>(null);
  const { data: account, isLoading } = useQuery({
    queryKey: ["my-account"],
    queryFn: () => getMyAccount(),
  });

  const isCreator = account?.roles.includes("creator") || account?.roles.includes("admin");

  if (isLoading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (!isCreator) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Creator access required</h1>
          <p className="mt-2 text-muted-foreground">Apply to become a creator to unlock the studio.</p>
          <a href="/creator-application" className={`${btnPrimary} mt-6 inline-block`}>
            Apply now
          </a>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      role="creator"
      active={section}
      onNavigate={(s) => {
        setSection(s);
        setBuilderId(null);
      }}
    >
      {section === "overview" && <Overview />}
      {section === "courses" &&
        (builderId ? (
          <CourseBuilder courseId={builderId} onBack={() => setBuilderId(null)} />
        ) : (
          <Courses onOpenBuilder={setBuilderId} />
        ))}
      {section === "products" && <Products />}
      {section === "sales" && <Sales />}
      {section === "profile" && <Profile account={account} />}
    </DashboardLayout>
  );
}

function Overview() {
  const { data: courses = [] } = useQuery({ queryKey: ["c-courses"], queryFn: () => getMyCreatorCourses() });
  const { data: products = [] } = useQuery({ queryKey: ["c-products"], queryFn: () => getMyCreatorProducts() });
  const { data: sales } = useQuery({ queryKey: ["c-sales"], queryFn: () => getMySalesSummary() });
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Creator Studio</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Courses", value: courses.length },
          { label: "Products", value: products.length },
          { label: "Sales", value: sales?.salesCount ?? 0 },
          { label: "Revenue", value: formatPrice(sales?.totalMinor ?? 0) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-6">
            <p className="text-3xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Courses({ onOpenBuilder }: { onOpenBuilder: (id: string) => void }) {
  const qc = useQueryClient();
  const { data: courses = [] } = useQuery({ queryKey: ["c-courses"], queryFn: () => getMyCreatorCourses() });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", categoryId: "", level: "all", price: 0, thumbnailUrl: "", outcomes: "" });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await saveCourse({
        data: {
          title: form.title,
          description: form.description,
          categoryId: form.categoryId || null,
          level: form.level,
          priceMinor: Math.round(Number(form.price) * 100),
          thumbnailUrl: form.thumbnailUrl || null,
          outcomes: form.outcomes.split("\n").map((s) => s.trim()).filter(Boolean),
        },
      });
      toast.success("Course created");
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["c-courses"] });
      onOpenBuilder(res.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function toggle(c: any) {
    try {
      await setCourseStatus({ data: { id: c.id, status: c.status === "published" ? "draft" : "published" } });
      qc.invalidateQueries({ queryKey: ["c-courses"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Courses</h1>
        <button onClick={() => setShowForm(!showForm)} className={btnPrimary}>
          <Plus className="mr-1 inline size-4" /> New course
        </button>
      </div>
      {showForm && (
        <form onSubmit={create} className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-6">
          <input className={inputCls} placeholder="Title *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className={inputCls} placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <select className={inputCls} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">No category</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className={inputCls} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="all">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <input className={inputCls} type="number" min={0} step="1" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <input className={inputCls} placeholder="Thumbnail image URL" value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} />
          <textarea className={inputCls} placeholder="Learning outcomes (one per line)" rows={3} value={form.outcomes} onChange={(e) => setForm({ ...form, outcomes: e.target.value })} />
          <button type="submit" className={btnPrimary}>Create & open builder</button>
        </form>
      )}
      <div className="mt-6 space-y-3">
        {courses.length === 0 && <p className="text-muted-foreground">No courses yet.</p>}
        {courses.map((c: any) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
            <div>
              <p className="font-semibold text-foreground">{c.title}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <StatusBadge status={c.status} /> {formatPrice(c.price_minor, c.currency)}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onOpenBuilder(c.id)} className={btnOutline}>Edit curriculum</button>
              <button onClick={() => toggle(c)} className={btnPrimary}>
                {c.status === "published" ? "Unpublish" : "Publish"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseBuilder({ courseId, onBack }: { courseId: string; onBack: () => void }) {
  const qc = useQueryClient();
  const key = ["builder", courseId];
  const { data: course } = useQuery({ queryKey: key, queryFn: () => getCourseBuilder({ data: { courseId } }) });
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonForms, setLessonForms] = useState<Record<string, { title: string; videoUrl: string; isPreview: boolean }>>({});
  const refresh = () => qc.invalidateQueries({ queryKey: key });

  if (!course) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to courses
      </button>
      <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Build your curriculum: add modules, then lessons inside each.</p>

      <div className="mt-6 space-y-4">
        {course.modules.map((m: any, i: number) => {
          const lf = lessonForms[m.id] ?? { title: "", videoUrl: "", isPreview: false };
          return (
            <div key={m.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{i + 1}. {m.title}</h3>
                <button
                  onClick={async () => { await deleteModule({ data: { moduleId: m.id } }); refresh(); }}
                  className="text-destructive" aria-label="Delete module"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {(m.lessons ?? []).sort((a: any, b: any) => a.position - b.position).map((l: any) => (
                  <li key={l.id} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                    <span>
                      {l.title}
                      {l.is_preview && <span className="ml-2 text-xs text-primary">Preview</span>}
                    </span>
                    <button onClick={async () => { await deleteLesson({ data: { lessonId: l.id } }); refresh(); }} className="text-destructive" aria-label="Delete lesson">
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <form
                className="mt-3 flex flex-wrap gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!lf.title) return;
                  try {
                    await addLesson({ data: { moduleId: m.id, title: lf.title, videoUrl: lf.videoUrl || undefined, isPreview: lf.isPreview } });
                    setLessonForms({ ...lessonForms, [m.id]: { title: "", videoUrl: "", isPreview: false } });
                    refresh();
                  } catch (err: any) { toast.error(err.message); }
                }}
              >
                <input className={`${inputCls} flex-1`} placeholder="Lesson title" value={lf.title} onChange={(e) => setLessonForms({ ...lessonForms, [m.id]: { ...lf, title: e.target.value } })} />
                <input className={`${inputCls} flex-1`} placeholder="Video URL (optional)" value={lf.videoUrl} onChange={(e) => setLessonForms({ ...lessonForms, [m.id]: { ...lf, videoUrl: e.target.value } })} />
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                  <input type="checkbox" checked={lf.isPreview} onChange={(e) => setLessonForms({ ...lessonForms, [m.id]: { ...lf, isPreview: e.target.checked } })} /> Free preview
                </label>
                <button type="submit" className={btnOutline}>Add lesson</button>
              </form>
            </div>
          );
        })}
      </div>

      <form
        className="mt-6 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!moduleTitle) return;
          try { await addModule({ data: { courseId, title: moduleTitle } }); setModuleTitle(""); refresh(); }
          catch (err: any) { toast.error(err.message); }
        }}
      >
        <input className={inputCls} placeholder="New module title" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} />
        <button type="submit" className={btnPrimary}>Add module</button>
      </form>
    </div>
  );
}

function Products() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({ queryKey: ["c-products"], queryFn: () => getMyCreatorProducts() });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", shortSummary: "", description: "", categoryId: "", price: 0, coverImageUrl: "", accessPlan: "lifetime" as "lifetime" | "fixed_days" | "monthly" | "yearly", accessDays: "" });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    try {
      await saveProduct({
        data: {
          title: form.title,
          shortSummary: form.shortSummary || undefined,
          description: form.description,
          categoryId: form.categoryId || null,
          priceMinor: Math.round(Number(form.price) * 100),
          coverImageUrl: form.coverImageUrl || null,
          accessPlan: form.accessPlan,
          accessDays: form.accessPlan === "fixed_days" && form.accessDays ? Number(form.accessDays) : null,
        },
      });
      toast.success("Product created");
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["c-products"] });
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <button onClick={() => setShowForm(!showForm)} className={btnPrimary}>
          <Plus className="mr-1 inline size-4" /> New product
        </button>
      </div>
      {showForm && (
        <form onSubmit={create} className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-6">
          <input className={inputCls} placeholder="Title *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={inputCls} placeholder="Short summary" value={form.shortSummary} onChange={(e) => setForm({ ...form, shortSummary: e.target.value })} />
          <textarea className={inputCls} placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <select className={inputCls} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">No category</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className={inputCls} type="number" min={0} placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            <select className={inputCls} value={form.accessPlan} onChange={(e) => setForm({ ...form, accessPlan: e.target.value as "lifetime" | "fixed_days" | "monthly" | "yearly" })}>
              <option value="lifetime">Lifetime access</option>
              <option value="fixed_days">Fixed days</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          {form.accessPlan === "fixed_days" && (
            <input className={inputCls} type="number" min={1} placeholder="Access days" value={form.accessDays} onChange={(e) => setForm({ ...form, accessDays: e.target.value })} />
          )}
          <input className={inputCls} placeholder="Cover image URL" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} />
          <button type="submit" className={btnPrimary}>Create product</button>
        </form>
      )}
      <div className="mt-6 space-y-3">
        {products.length === 0 && <p className="text-muted-foreground">No products yet.</p>}
        {products.map((p: any) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
            <div>
              <p className="font-semibold text-foreground">{p.title}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <StatusBadge status={p.status} /> {formatPrice(p.price_minor, p.currency)}
              </div>
            </div>
            <button
              onClick={async () => {
                await setProductStatus({ data: { id: p.id, status: p.status === "published" ? "draft" : "published" } });
                qc.invalidateQueries({ queryKey: ["c-products"] });
              }}
              className={btnPrimary}
            >
              {p.status === "published" ? "Unpublish" : "Publish"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sales() {
  const { data: sales } = useQuery({ queryKey: ["c-sales"], queryFn: () => getMySalesSummary() });
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Sales</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-3xl font-bold text-foreground">{formatPrice(sales?.totalMinor ?? 0)}</p>
          <p className="text-sm text-muted-foreground">Total revenue</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-3xl font-bold text-foreground">{sales?.salesCount ?? 0}</p>
          <p className="text-sm text-muted-foreground">Items sold</p>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        {(sales?.items ?? []).map((i: any, idx: number) => (
          <div key={idx} className="flex justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span>{i.products?.title}</span>
            <span className="font-semibold">{formatPrice(i.unit_price_minor * i.quantity)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Profile({ account }: { account: any }) {
  const qc = useQueryClient();
  const cp = account?.creatorProfile;
  const [form, setForm] = useState({ displayName: "", username: "", headline: "", bio: "", websiteUrl: "", avatarUrl: "" });
  useEffect(() => {
    setForm({
      displayName: cp?.display_name ?? account?.profile?.name ?? "",
      username: cp?.username ?? "",
      headline: cp?.headline ?? "",
      bio: cp?.bio ?? "",
      websiteUrl: cp?.website_url ?? "",
      avatarUrl: cp?.avatar_url ?? "",
    });
  }, [cp, account]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await upsertCreatorProfile({ data: { ...form, websiteUrl: form.websiteUrl || undefined, avatarUrl: form.avatarUrl || undefined, bio: form.bio || undefined } });
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["my-account"] });
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-foreground">Public profile</h1>
      <form onSubmit={save} className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-6">
        <input className={inputCls} placeholder="Display name" required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        <input className={inputCls} placeholder="Username (your profile URL)" required minLength={3} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input className={inputCls} placeholder="Headline" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
        <textarea className={inputCls} placeholder="Bio" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <input className={inputCls} placeholder="Website URL" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
        <input className={inputCls} placeholder="Avatar image URL" value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} />
        <button type="submit" className={btnPrimary}>Save profile</button>
      </form>
    </div>
  );
}
