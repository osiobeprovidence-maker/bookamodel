import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

async function withLogo(ctx: any, t: any) {
  let companyLogoUrl = t.companyLogoUrl || null;
  if (t.companyLogoStorageId) {
    companyLogoUrl = (await ctx.storage.getUrl(t.companyLogoStorageId)) ?? companyLogoUrl;
  }
  return {
    _id: t._id,
    companyName: t.companyName,
    personName: t.personName || "",
    jobTitle: t.jobTitle || "",
    companyLogoStorageId: t.companyLogoStorageId || null,
    companyLogoUrl,
    testimonial: t.testimonial,
    rating: t.rating,
    displayOrder: t.displayOrder ?? 0,
    status: t.status || "active",
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export const list = query({
  handler: async (ctx) => {
    const rows = await ctx.db.query("testimonials").collect();
    rows.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    return Promise.all(rows.map((t) => withLogo(ctx, t)));
  },
});

export const listPublished = query({
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("testimonials")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    rows.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    return Promise.all(rows.map((t) => withLogo(ctx, t)));
  },
});

export const generateUploadUrl = action({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    companyName: v.string(),
    personName: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    companyLogoStorageId: v.optional(v.string()),
    testimonial: v.string(),
    rating: v.number(),
    displayOrder: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("hidden"), v.literal("pending"))),
  },
  handler: async (ctx, args) => {
    const { companyLogoStorageId, ...rest } = args;
    let companyLogoUrl: string | undefined;
    if (companyLogoStorageId) {
      companyLogoUrl = (await ctx.storage.getUrl(companyLogoStorageId)) ?? undefined;
    }
    const now = Date.now();
    const all = await ctx.db.query("testimonials").collect();
    const maxOrder = all.reduce((max, t) => Math.max(max, t.displayOrder ?? 0), 0);
    return await ctx.db.insert("testimonials", {
      ...rest,
      displayOrder: rest.displayOrder ?? maxOrder + 1,
      companyLogoStorageId,
      companyLogoUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    testimonialId: v.id("testimonials"),
    companyName: v.optional(v.string()),
    personName: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    companyLogoStorageId: v.optional(v.string()),
    testimonial: v.optional(v.string()),
    rating: v.optional(v.number()),
    displayOrder: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("hidden"), v.literal("pending"))),
  },
  handler: async (ctx, args) => {
    const { testimonialId, companyLogoStorageId, ...rest } = args;
    const current = await ctx.db.get(testimonialId);
    if (!current) throw new Error("Testimonial not found");
    const patch: Record<string, unknown> = { ...rest, updatedAt: Date.now() };
    if (companyLogoStorageId !== undefined) {
      if (current.companyLogoStorageId && current.companyLogoStorageId !== companyLogoStorageId) {
        await ctx.storage.delete(current.companyLogoStorageId);
      }
      patch.companyLogoStorageId = companyLogoStorageId;
      patch.companyLogoUrl = companyLogoStorageId
        ? ((await ctx.storage.getUrl(companyLogoStorageId)) ?? undefined)
        : undefined;
    }
    await ctx.db.patch(testimonialId, patch);
  },
});

export const remove = mutation({
  args: { testimonialId: v.id("testimonials") },
  handler: async (ctx, args) => {
    const t = await ctx.db.get(args.testimonialId);
    if (!t) return { ok: false, message: "Testimonial not found" };
    if (t.companyLogoStorageId) {
      await ctx.storage.delete(t.companyLogoStorageId);
    }
    await ctx.db.delete(args.testimonialId);
    return { ok: true };
  },
});

export const setStatus = mutation({
  args: {
    testimonialId: v.id("testimonials"),
    status: v.union(v.literal("active"), v.literal("hidden"), v.literal("pending")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.testimonialId, { status: args.status, updatedAt: Date.now() });
  },
});

export const removeLogo = mutation({
  args: { testimonialId: v.id("testimonials") },
  handler: async (ctx, args) => {
    const t = await ctx.db.get(args.testimonialId);
    if (!t) return { ok: false, message: "Testimonial not found" };
    if (t.companyLogoStorageId) {
      await ctx.storage.delete(t.companyLogoStorageId);
    }
    await ctx.db.patch(args.testimonialId, {
      companyLogoStorageId: undefined,
      companyLogoUrl: undefined,
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

export const duplicate = mutation({
  args: { testimonialId: v.id("testimonials") },
  handler: async (ctx, args) => {
    const t = await ctx.db.get(args.testimonialId);
    if (!t) return { ok: false, message: "Testimonial not found" };
    const now = Date.now();
    const all = await ctx.db.query("testimonials").collect();
    const maxOrder = all.reduce((max, row) => Math.max(max, row.displayOrder ?? 0), 0);
    return await ctx.db.insert("testimonials", {
      companyName: `${t.companyName} (Copy)`,
      personName: t.personName,
      jobTitle: t.jobTitle,
      companyLogoStorageId: t.companyLogoStorageId,
      companyLogoUrl: t.companyLogoUrl,
      testimonial: t.testimonial,
      rating: t.rating,
      displayOrder: maxOrder + 1,
      status: "hidden",
      createdAt: now,
      updatedAt: now,
    });
  },
});
