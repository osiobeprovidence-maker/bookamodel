import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByModelProfile = query({
  args: { modelProfileId: v.id("modelProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("albums")
      .withIndex("by_modelProfileId", (q) => q.eq("modelProfileId", args.modelProfileId))
      .order("asc")
      .collect();
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("albums")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
  },
});

export const listPublicByModelProfile = query({
  args: { modelProfileId: v.id("modelProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("albums")
      .withIndex("by_modelProfileId", (q) => q.eq("modelProfileId", args.modelProfileId))
      .filter((q) => q.eq(q.field("visibility"), "public"))
      .order("asc")
      .collect();
  },
});

export const get = query({
  args: { albumId: v.id("albums") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.albumId);
  },
});

export const create = mutation({
  args: {
    modelProfileId: v.id("modelProfiles"),
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    coverStorageId: v.optional(v.string()),
    category: v.union(
      v.literal("portrait"), v.literal("fashion"), v.literal("commercial"),
      v.literal("editorial"), v.literal("fitness"), v.literal("runway"),
      v.literal("beauty"), v.literal("lifestyle"), v.literal("swimwear"),
      v.literal("product"), v.literal("other")
    ),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("hidden"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("albums")
      .withIndex("by_modelProfileId", (q) => q.eq("modelProfileId", args.modelProfileId))
      .collect();
    return await ctx.db.insert("albums", {
      ...args,
      visibility: args.visibility || "public",
      order: existing.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    albumId: v.id("albums"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    coverStorageId: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("portrait"), v.literal("fashion"), v.literal("commercial"),
      v.literal("editorial"), v.literal("fitness"), v.literal("runway"),
      v.literal("beauty"), v.literal("lifestyle"), v.literal("swimwear"),
      v.literal("product"), v.literal("other")
    )),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("hidden"))),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { albumId, ...fields } = args;
    await ctx.db.patch(albumId, { ...fields, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { albumId: v.id("albums") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.albumId);
  },
});

export const getAlbumItems = query({
  args: { albumId: v.id("albums") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("albumItems")
      .withIndex("by_albumId", (q) => q.eq("albumId", args.albumId))
      .order("asc")
      .collect();
    const portfolioIds = items.map((i) => i.portfolioId);
    const portfolioItems = await Promise.all(
      portfolioIds.map((id) => ctx.db.get(id))
    );
    return portfolioItems.filter(Boolean).map((item, idx) => ({
      ...items[idx],
      portfolio: item,
    }));
  },
});

export const addMediaToAlbum = mutation({
  args: {
    albumId: v.id("albums"),
    portfolioId: v.id("portfolio"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("albumItems")
      .withIndex("by_albumId", (q) => q.eq("albumId", args.albumId))
      .collect();
    const alreadyExists = existing.some((i) => i.portfolioId === args.portfolioId);
    if (alreadyExists) return;
    await ctx.db.insert("albumItems", {
      albumId: args.albumId,
      portfolioId: args.portfolioId,
      order: existing.length,
      addedAt: Date.now(),
    });
    await ctx.db.patch(args.portfolioId, { albumId: args.albumId });
  },
});

export const removeMediaFromAlbum = mutation({
  args: {
    albumId: v.id("albums"),
    portfolioId: v.id("portfolio"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("albumItems")
      .withIndex("by_albumId", (q) => q.eq("albumId", args.albumId))
      .filter((q) => q.eq(q.field("portfolioId"), args.portfolioId))
      .first();
    if (item) {
      await ctx.db.delete(item._id);
    }
    await ctx.db.patch(args.portfolioId, { albumId: undefined });
  },
});

export const reorderItems = mutation({
  args: {
    items: v.array(v.object({
      id: v.id("albumItems"),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      await ctx.db.patch(item.id, { order: item.order });
    }
  },
});
