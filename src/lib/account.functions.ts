import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }, { data: creatorProfile }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase
          .from("creator_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);
    return {
      profile,
      roles: (roles ?? []).map((r) => r.role),
      creatorProfile,
    };
  });

export const enrollInCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ courseId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: course } = await supabase
      .from("courses")
      .select("id, title, price_minor")
      .eq("id", data.courseId)
      .eq("status", "published")
      .single();
    if (!course) throw new Error("Course not found");
    if (course.price_minor > 0) {
      // Record a paid order (payment gateway integration comes later)
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          status: "paid",
          total_minor: course.price_minor,
        })
        .select()
        .single();
      if (orderError) throw new Error(orderError.message);
    }
    const { error } = await supabase
      .from("enrollments")
      .upsert({ user_id: userId, course_id: data.courseId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyLibrary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("enrollments")
      .select("*, courses(*, categories(name, slug))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const getMyEnrolledCourse = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ courseId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", data.courseId)
      .maybeSingle();
    if (!enrollment) return null;
    const { data: course } = await supabase
      .from("courses")
      .select("*, categories(name, slug)")
      .eq("id", data.courseId)
      .single();
    const { data: modules } = await supabase
      .from("course_modules")
      .select("*, lessons(*)")
      .eq("course_id", data.courseId)
      .order("position");
    return { ...course, modules: modules ?? [] };
  });

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*, products(title, cover_image_url))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const getMyWishlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("wishlist")
      .select("*, products(*, categories(name, slug))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const toggleWishlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ productId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", data.productId)
      .maybeSingle();
    if (existing) {
      await supabase.from("wishlist").delete().eq("id", existing.id);
      return { wishlisted: false };
    }
    const { error } = await supabase
      .from("wishlist")
      .insert({ user_id: userId, product_id: data.productId });
    if (error) throw new Error(error.message);
    return { wishlisted: true };
  });

export const getMyProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("digital_product_entitlements")
      .select("*, products(*, categories(name, slug))")
      .eq("user_id", userId)
      .order("acquired_at", { ascending: false });
    return data ?? [];
  });

export const acquireProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ productId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: product } = await supabase
      .from("products")
      .select("id, title, price_minor, access_plan, access_days, trial_days")
      .eq("id", data.productId)
      .eq("status", "published")
      .single();
    if (!product) throw new Error("Product not found");

    let expiresAt: string | null = null;
    const days =
      product.trial_days > 0
        ? product.trial_days
        : product.access_plan === "fixed_days"
          ? product.access_days
          : product.access_plan === "monthly"
            ? 30
            : product.access_plan === "yearly"
              ? 365
              : null;
    if (days) {
      const d = new Date();
      d.setDate(d.getDate() + days);
      expiresAt = d.toISOString();
    }

    if (product.price_minor > 0) {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          status: "paid",
          total_minor: product.price_minor,
        })
        .select()
        .single();
      if (orderError) throw new Error(orderError.message);
      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: product.id,
        unit_price_minor: product.price_minor,
      });
    }
    const { error } = await supabase
      .from("digital_product_entitlements")
      .upsert({ user_id: userId, product_id: product.id, expires_at: expiresAt });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitCreatorApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        displayName: z.string().min(2),
        headline: z.string().optional(),
        bio: z.string().optional(),
        expertise: z.string().optional(),
        experienceYears: z.number().int().min(0).default(0),
        portfolioUrl: z.string().optional(),
        linkedinUrl: z.string().optional(),
        websiteUrl: z.string().optional(),
        teachingTopics: z.array(z.string()).default([]),
        courseProposal: z.string().optional(),
        targetAudience: z.string().optional(),
        motivation: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("creator_applications").upsert({
      user_id: userId,
      display_name: data.displayName,
      headline: data.headline,
      bio: data.bio,
      expertise: data.expertise,
      experience_years: data.experienceYears,
      portfolio_url: data.portfolioUrl,
      linkedin_url: data.linkedinUrl,
      website_url: data.websiteUrl,
      teaching_topics: data.teachingTopics,
      course_proposal: data.courseProposal,
      target_audience: data.targetAudience,
      motivation: data.motivation,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyApplication = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("creator_applications")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    return data;
  });

export const addReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        courseId: z.string(),
        rating: z.number().int().min(1).max(5),
        body: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("reviews").upsert({
      user_id: userId,
      course_id: data.courseId,
      rating: data.rating,
      body: data.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
