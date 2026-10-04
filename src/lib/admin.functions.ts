import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function requireAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (!data) throw new Error("Admin access required");
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const [users, courses, products, orders, applications] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id, total_minor, status"),
      supabase
        .from("creator_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);
    const paidOrders = (orders.data ?? []).filter((o) => o.status === "paid");
    return {
      userCount: users.count ?? 0,
      courseCount: courses.count ?? 0,
      productCount: products.count ?? 0,
      orderCount: paidOrders.length,
      revenueMinor: paidOrders.reduce((s, o) => s + o.total_minor, 0),
      pendingApplications: applications.count ?? 0,
    };
  });

export const getAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("*");
    return (profiles ?? []).map((p) => ({
      ...p,
      roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
    }));
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        userId: z.string(),
        role: z.enum(["student", "creator", "admin"]),
        grant: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    if (data.grant) {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const getAdminApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { data } = await supabase
      .from("creator_applications")
      .select("*, profiles(email, name)")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const reviewApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        applicationId: z.string(),
        approve: z.boolean(),
        reason: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { data: app } = await supabase
      .from("creator_applications")
      .select("user_id, display_name")
      .eq("id", data.applicationId)
      .single();
    if (!app) throw new Error("Application not found");
    const { error } = await supabase
      .from("creator_applications")
      .update({
        status: data.approve ? "approved" : "rejected",
        review_reason: data.reason ?? null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
      })
      .eq("id", data.applicationId);
    if (error) throw new Error(error.message);
    if (data.approve) {
      await supabase
        .from("user_roles")
        .upsert({ user_id: app.user_id, role: "creator" });
      await supabase.from("creator_profiles").upsert({
        user_id: app.user_id,
        display_name: app.display_name,
        username: `creator-${app.user_id.slice(0, 8)}`,
      });
    }
    return { ok: true };
  });

export const getAdminCourses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { data } = await supabase
      .from("courses")
      .select("*, categories(name), profiles(name, email)")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const getAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { data } = await supabase
      .from("products")
      .select("*, categories(name), profiles(name, email)")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const getAdminOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { data } = await supabase
      .from("orders")
      .select("*, profiles(email, name), order_items(*, products(title))")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().optional(),
        name: z.string().min(2),
        slug: z.string().min(2),
        description: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    if (data.id) {
      const { error } = await supabase
        .from("categories")
        .update({
          name: data.name,
          slug: data.slug,
          description: data.description ?? null,
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("categories")
        .insert({ name: data.name, slug: data.slug, description: data.description });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
