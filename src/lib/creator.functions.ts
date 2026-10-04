import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { slugify } from "./format";

async function requireCreator(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "creator",
  });
  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (!data && !isAdmin) throw new Error("Creator access required");
}

export const getMyCreatorCourses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireCreator(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("courses")
      .select("*, categories(name, slug)")
      .eq("creator_id", context.userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const saveCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().optional(),
        title: z.string().min(2),
        description: z.string().default(""),
        categoryId: z.string().nullable().optional(),
        level: z.string().default("all"),
        priceMinor: z.number().int().min(0).default(0),
        thumbnailUrl: z.string().nullable().optional(),
        outcomes: z.array(z.string()).default([]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireCreator(supabase, userId);
    if (data.id) {
      const { error } = await supabase
        .from("courses")
        .update({
          title: data.title,
          description: data.description,
          category_id: data.categoryId ?? null,
          level: data.level,
          price_minor: data.priceMinor,
          thumbnail_url: data.thumbnailUrl ?? null,
          outcomes: data.outcomes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id)
        .eq("creator_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const slug = `${slugify(data.title)}-${Math.random().toString(36).slice(2, 8)}`;
    const { data: created, error } = await supabase
      .from("courses")
      .insert({
        creator_id: userId,
        title: data.title,
        slug,
        description: data.description,
        category_id: data.categoryId ?? null,
        level: data.level,
        price_minor: data.priceMinor,
        thumbnail_url: data.thumbnailUrl ?? null,
        outcomes: data.outcomes,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id };
  });

export const setCourseStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string(),
        status: z.enum(["draft", "published", "archived"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireCreator(supabase, userId);
    const { error } = await supabase
      .from("courses")
      .update({
        status: data.status,
        published_at:
          data.status === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("creator_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getCourseBuilder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ courseId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireCreator(supabase, userId);
    const { data: course } = await supabase
      .from("courses")
      .select("*, categories(name, slug)")
      .eq("id", data.courseId)
      .eq("creator_id", userId)
      .single();
    if (!course) throw new Error("Course not found");
    const { data: modules } = await supabase
      .from("course_modules")
      .select("*, lessons(*)")
      .eq("course_id", data.courseId)
      .order("position");
    return { ...course, modules: modules ?? [] };
  });

export const addModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ courseId: z.string(), title: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireCreator(supabase, userId);
    const { data: max } = await supabase
      .from("course_modules")
      .select("position")
      .eq("course_id", data.courseId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await supabase.from("course_modules").insert({
      course_id: data.courseId,
      title: data.title,
      position: (max?.position ?? -1) + 1,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const renameModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ moduleId: z.string(), title: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireCreator(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("course_modules")
      .update({ title: data.title })
      .eq("id", data.moduleId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ moduleId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireCreator(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("course_modules")
      .delete()
      .eq("id", data.moduleId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        moduleId: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        isPreview: z.boolean().default(false),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await requireCreator(supabase, context.userId);
    const { data: max } = await supabase
      .from("lessons")
      .select("position")
      .eq("module_id", data.moduleId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await supabase.from("lessons").insert({
      module_id: data.moduleId,
      title: data.title,
      description: data.description,
      video_url: data.videoUrl,
      is_preview: data.isPreview,
      position: (max?.position ?? -1) + 1,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        lessonId: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        isPreview: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireCreator(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("lessons")
      .update({
        title: data.title,
        description: data.description,
        video_url: data.videoUrl,
        is_preview: data.isPreview,
      })
      .eq("id", data.lessonId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ lessonId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireCreator(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("lessons")
      .delete()
      .eq("id", data.lessonId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyCreatorProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireCreator(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("products")
      .select("*, categories(name, slug)")
      .eq("creator_id", context.userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().optional(),
        title: z.string().min(2),
        description: z.string().default(""),
        shortSummary: z.string().optional(),
        categoryId: z.string().nullable().optional(),
        type: z.enum(["course", "digital"]).default("digital"),
        priceMinor: z.number().int().min(0).default(0),
        coverImageUrl: z.string().nullable().optional(),
        accessPlan: z
          .enum(["lifetime", "fixed_days", "monthly", "yearly"])
          .default("lifetime"),
        accessDays: z.number().int().positive().nullable().optional(),
        courseId: z.string().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireCreator(supabase, userId);
    const payload = {
      title: data.title,
      description: data.description,
      short_summary: data.shortSummary,
      category_id: data.categoryId ?? null,
      type: data.type,
      price_minor: data.priceMinor,
      cover_image_url: data.coverImageUrl ?? null,
      access_plan: data.accessPlan,
      access_days: data.accessDays ?? null,
      course_id: data.courseId ?? null,
      updated_at: new Date().toISOString(),
    };
    if (data.id) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", data.id)
        .eq("creator_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: created, error } = await supabase
      .from("products")
      .insert({
        ...payload,
        creator_id: userId,
        public_slug: `${slugify(data.title)}-${Math.random().toString(36).slice(2, 8)}`,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id };
  });

export const setProductStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string(),
        status: z.enum(["draft", "published", "archived"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireCreator(supabase, userId);
    const { error } = await supabase
      .from("products")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("creator_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMySalesSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireCreator(supabase, userId);
    const { data: items } = await supabase
      .from("order_items")
      .select("quantity, unit_price_minor, products!inner(creator_id, title), orders!inner(status)")
      .eq("products.creator_id", userId)
      .eq("orders.status", "paid");
    const totalMinor = (items ?? []).reduce(
      (sum, i) => sum + i.unit_price_minor * i.quantity,
      0,
    );
    return {
      totalMinor,
      salesCount: items?.length ?? 0,
      items: items ?? [],
    };
  });

export const upsertCreatorProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        displayName: z.string().min(2),
        username: z.string().min(3),
        headline: z.string().default(""),
        bio: z.string().optional(),
        websiteUrl: z.string().optional(),
        avatarUrl: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireCreator(supabase, userId);
    const { error } = await supabase.from("creator_profiles").upsert({
      user_id: userId,
      display_name: data.displayName,
      username: slugify(data.username),
      headline: data.headline,
      bio: data.bio,
      website_url: data.websiteUrl,
      avatar_url: data.avatarUrl,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
