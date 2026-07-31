import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

function refMatches(ref: string | undefined, name: string, slug: string) {
  if (!ref) return false;
  const r = ref.trim().toLowerCase();
  return r === slug.toLowerCase() || r === name.toLowerCase();
}

async function usageCounts(ctx: any, name: string, slug: string) {
  const [modelProfiles, jobRequests, businessProfiles] = await Promise.all([
    ctx.db.query("modelProfiles").collect(),
    ctx.db.query("jobRequests").collect(),
    ctx.db.query("businessProfiles").collect(),
  ]);
  return {
    models: modelProfiles.filter((p: any) =>
      (p.categories || []).some((c: string) => refMatches(c, name, slug))
    ).length,
    jobs: jobRequests.filter((j: any) => refMatches(j.category, name, slug)).length,
    businesses: businessProfiles.filter((p: any) =>
      refMatches(p.businessCategory, name, slug) || refMatches(p.industry, name, slug)
    ).length,
  };
}

export async function withCounts(ctx: any, categories: any[]) {
  const modelProfiles = await ctx.db.query("modelProfiles").collect();
  const jobRequests = await ctx.db.query("jobRequests").collect();
  const businessProfiles = await ctx.db.query("businessProfiles").collect();
  const modelCounts = new Map<string, number>();
  const jobCounts = new Map<string, number>();
  const businessCounts = new Map<string, number>();
  for (const c of categories) {
    modelCounts.set(c._id, 0);
    jobCounts.set(c._id, 0);
    businessCounts.set(c._id, 0);
  }
  for (const p of modelProfiles) {
    for (const ref of p.categories || []) {
      const cat = categories.find((c) => refMatches(ref, c.name, c.slug));
      if (cat) modelCounts.set(cat._id, (modelCounts.get(cat._id) || 0) + 1);
    }
  }
  for (const j of jobRequests) {
    const cat = categories.find((c) => refMatches(j.category, c.name, c.slug));
    if (cat) jobCounts.set(cat._id, (jobCounts.get(cat._id) || 0) + 1);
  }
  for (const p of businessProfiles) {
    const cat = categories.find(
      (c) => refMatches(p.businessCategory, c.name, c.slug) || refMatches(p.industry, c.name, c.slug)
    );
    if (cat) businessCounts.set(cat._id, (businessCounts.get(cat._id) || 0) + 1);
  }
  return Promise.all(
    categories.map(async (c) => ({
      _id: c._id,
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      icon: c.icon || "Tag",
      color: c.color || "",
      status: c.status || "active",
      isFeatured: c.isFeatured ?? false,
      order: c.order ?? 0,
      createdAt: c.createdAt ?? c._creationTime,
      count: modelCounts.get(c._id) || 0,
      modelCount: modelCounts.get(c._id) || 0,
      businessCount: businessCounts.get(c._id) || 0,
      jobCount: jobCounts.get(c._id) || 0,
      image: c.imageStorageId
        ? ((await ctx.storage.getUrl(c.imageStorageId)) ?? null)
        : c.imageUrl || null,
      imageUrl: c.imageStorageId
        ? ((await ctx.storage.getUrl(c.imageStorageId)) ?? null)
        : c.imageUrl || null,
      imageStorageId: c.imageStorageId || null,
    }))
  );
}

export const generateUploadUrl = action({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const list = query({
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .order("asc")
      .collect();
    return await withCounts(ctx, categories);
  },
});

export const listActive = query({
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    categories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return await withCounts(ctx, categories);
  },
});

export const listFeatured = query({
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    const featured = categories.filter((c) => c.isFeatured === true);
    featured.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return await withCounts(ctx, featured);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("hidden"), v.literal("archived"))),
    isFeatured: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) {
      throw new Error(`A category with the slug "${args.slug}" already exists`);
    }
    const all = await ctx.db.query("categories").collect();
    const maxOrder = all.reduce((max, c) => Math.max(max, c.order ?? 0), -1);
    return await ctx.db.insert("categories", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      imageUrl: args.imageUrl,
      imageStorageId: args.imageStorageId,
      color: args.color,
      status: args.status ?? "active",
      isFeatured: args.isFeatured ?? false,
      count: 0,
      order: args.order ?? maxOrder + 1,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("hidden"), v.literal("archived"))),
    isFeatured: v.optional(v.boolean()),
    count: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { categoryId, imageStorageId, imageUrl, ...rest } = args;
    const current = await ctx.db.get(categoryId);
    if (!current) throw new Error("Category not found");
    if (rest.slug) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", rest.slug))
        .first();
      if (existing && existing._id !== categoryId) {
        throw new Error(`A category with the slug "${rest.slug}" already exists`);
      }
    }
    const patch: Record<string, unknown> = { ...rest };
    if (imageStorageId !== undefined) {
      if (current.imageStorageId && current.imageStorageId !== imageStorageId) {
        await ctx.storage.delete(current.imageStorageId);
      }
      patch.imageStorageId = imageStorageId;
    }
    if (imageUrl !== undefined) patch.imageUrl = imageUrl;
    await ctx.db.patch(categoryId, patch);
  },
});

export const removeImage = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) return { ok: false, message: "Category not found" };
    if (category.imageStorageId) {
      await ctx.storage.delete(category.imageStorageId);
    }
    await ctx.db.patch(args.categoryId, {
      imageStorageId: undefined,
      imageUrl: undefined,
    });
    return { ok: true };
  },
});

export const remove = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) return { ok: false, message: "Category not found" };
    const counts = await usageCounts(ctx, category.name, category.slug);
    const totalInUse = counts.models + counts.jobs + counts.businesses;
    if (totalInUse > 0) {
      return {
        ok: false,
        message: `This category is currently assigned to ${counts.models} model${counts.models === 1 ? "" : "s"}, ${counts.jobs} job${counts.jobs === 1 ? "" : "s"} and ${counts.businesses} business${counts.businesses === 1 ? "" : "es"}. Archive it instead.`,
      };
    }
    if (category.imageStorageId) {
      await ctx.storage.delete(category.imageStorageId);
    }
    await ctx.db.delete(args.categoryId);
    return { ok: true };
  },
});

export const setStatus = mutation({
  args: {
    categoryId: v.id("categories"),
    status: v.union(v.literal("active"), v.literal("hidden"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.categoryId, { status: args.status });
  },
});

export const migrateRefs = mutation({
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    const byKey = new Map<string, string>();
    for (const c of categories) {
      byKey.set(c.name.toLowerCase(), c.slug);
      byKey.set(c.slug.toLowerCase(), c.slug);
    }
    const models = await ctx.db.query("modelProfiles").collect();
    for (const p of models) {
      const refs = p.categories || [];
      const migrated = refs.map((r) => byKey.get(r.toLowerCase()) || r);
      if (JSON.stringify(migrated) !== JSON.stringify(refs)) {
        await ctx.db.patch(p._id, { categories: migrated });
      }
    }
    const jobs = await ctx.db.query("jobRequests").collect();
    for (const j of jobs) {
      const migrated = byKey.get((j.category || "").toLowerCase());
      if (migrated && migrated !== j.category) {
        await ctx.db.patch(j._id, { category: migrated });
      }
    }
    const businesses = await ctx.db.query("businessProfiles").collect();
    for (const b of businesses) {
      const migrated = byKey.get((b.businessCategory || "").toLowerCase());
      if (migrated && migrated !== b.businessCategory) {
        await ctx.db.patch(b._id, { businessCategory: migrated });
      }
    }
    for (const c of categories) {
      const patch: Record<string, unknown> = {};
      if (c.status === undefined) patch.status = "active";
      if (c.isFeatured === undefined) patch.isFeatured = false;
      if (c.createdAt === undefined) patch.createdAt = c._creationTime;
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(c._id, patch);
      }
    }
    return { categories: categories.length, models: models.length, jobs: jobs.length, businesses: businesses.length };
  },
});
