import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data } = await publicClient()
      .from("categories")
      .select("*")
      .order("name");
    return data ?? [];
  },
);

export const listCourses = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z
      .object({ category: z.string().optional(), q: z.string().optional() })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    let query = publicClient()
      .from("courses")
      .select("*, categories(name, slug)")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (data.category) query = query.eq("categories.slug", data.category);
    if (data.q) query = query.ilike("title", `%${data.q}%`);
    const { data: rows } = await query;
    return rows ?? [];
  });

export const getCourse = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: course } = await sb
      .from("courses")
      .select("*, categories(name, slug)")
      .or(`id.eq.${data.id},slug.eq.${data.id}`)
      .eq("status", "published")
      .maybeSingle();
    if (!course) return null;
    const { data: modules } = await sb
      .from("course_modules")
      .select("*, lessons(*)")
      .eq("course_id", course.id)
      .order("position");
    const { data: reviews } = await sb
      .from("reviews")
      .select("*, profiles(name, avatar_url)")
      .eq("course_id", course.id)
      .order("created_at", { ascending: false });
    const { data: creator } = await sb
      .from("creator_profiles")
      .select("display_name, username, avatar_url, headline")
      .eq("user_id", course.creator_id)
      .maybeSingle();
    return { ...course, modules: modules ?? [], reviews: reviews ?? [], creator };
  });

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z
      .object({ category: z.string().optional(), q: z.string().optional() })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    let query = publicClient()
      .from("products")
      .select("*, categories(name, slug)")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (data.q) query = query.ilike("title", `%${data.q}%`);
    const { data: rows } = await query;
    return rows ?? [];
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id);
    let query = sb
      .from("products")
      .select("*, categories(name, slug)")
      .eq("status", "published");
    query = isUuid ? query.or(`id.eq.${data.id},public_slug.eq.${data.id}`) : query.eq("public_slug", data.id);
    const { data: product } = await query.maybeSingle();
    if (!product) return null;
    const { data: creator } = await sb
      .from("creator_profiles")
      .select("display_name, username, avatar_url, headline")
      .eq("user_id", product.creator_id)
      .maybeSingle();
    let course = null;
    if (product.course_id) {
      const { data: c } = await sb
        .from("courses")
        .select("id, title, slug")
        .eq("id", product.course_id)
        .maybeSingle();
      course = c;
    }
    return { ...product, creator, course };
  });

export const getCreatorProfile = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ username: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: creator } = await sb
      .from("creator_profiles")
      .select("*")
      .eq("username", data.username)
      .maybeSingle();
    if (!creator) return null;
    const { data: courses } = await sb
      .from("courses")
      .select("*, categories(name, slug)")
      .eq("creator_id", creator.user_id)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    const { data: products } = await sb
      .from("products")
      .select("*")
      .eq("creator_id", creator.user_id)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    return { ...creator, courses: courses ?? [], products: products ?? [] };
  });

export const listCreators = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data } = await publicClient()
      .from("creator_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  },
);
