import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { modelProfileId: v.id("modelProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("portfolio")
      .withIndex("by_modelProfileId", (q) =>
        q.eq("modelProfileId", args.modelProfileId)
      )
      .order("asc")
      .collect();
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("portfolio")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
  },
});

export const add = mutation({
  args: {
    modelProfileId: v.id("modelProfiles"),
    userId: v.id("users"),
    imageUrl: v.string(),
    imageStorageId: v.optional(v.string()),
    title: v.optional(v.string()),
    category: v.union(
      v.literal("portrait"), v.literal("fashion"), v.literal("commercial"),
      v.literal("editorial"), v.literal("fitness"), v.literal("runway"),
      v.literal("beauty"), v.literal("lifestyle"), v.literal("swimwear"),
      v.literal("product"), v.literal("other")
    ),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("hidden"))),
    albumId: v.optional(v.id("albums")),
  },
  handler: async (ctx, args) => {
    let imageUrl = args.imageUrl;
    if (args.imageStorageId) {
      const resolved = await ctx.storage.getUrl(args.imageStorageId);
      if (resolved) imageUrl = resolved;
    }
    const existing = await ctx.db
      .query("portfolio")
      .withIndex("by_modelProfileId", (q) =>
        q.eq("modelProfileId", args.modelProfileId)
      )
      .collect();
    const { imageStorageId, ...rest } = args;
    return await ctx.db.insert("portfolio", {
      ...rest,
      imageUrl,
      imageStorageId,
      type: "image",
      status: "ready" as const,
      order: existing.length,
      createdAt: Date.now(),
    });
  },
});

export const addVideo = mutation({
  args: {
    modelProfileId: v.id("modelProfiles"),
    userId: v.id("users"),
    muxUploadId: v.string(),
    title: v.optional(v.string()),
    category: v.union(
      v.literal("portrait"), v.literal("fashion"), v.literal("commercial"),
      v.literal("editorial"), v.literal("fitness"), v.literal("runway"),
      v.literal("beauty"), v.literal("lifestyle"), v.literal("swimwear"),
      v.literal("product"), v.literal("other")
    ),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("hidden"))),
    albumId: v.optional(v.id("albums")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("portfolio")
      .withIndex("by_modelProfileId", (q) =>
        q.eq("modelProfileId", args.modelProfileId)
      )
      .collect();
    return await ctx.db.insert("portfolio", {
      modelProfileId: args.modelProfileId,
      userId: args.userId,
      imageUrl: "",
      title: args.title,
      type: "video" as const,
      muxUploadId: args.muxUploadId,
      category: args.category,
      description: args.description,
      visibility: args.visibility || "public",
      albumId: args.albumId,
      status: "processing" as const,
      order: existing.length,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    portfolioId: v.id("portfolio"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("portrait"), v.literal("fashion"), v.literal("commercial"),
      v.literal("editorial"), v.literal("fitness"), v.literal("runway"),
      v.literal("beauty"), v.literal("lifestyle"), v.literal("swimwear"),
      v.literal("product"), v.literal("other")
    )),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("hidden"))),
    albumId: v.optional(v.id("albums")),
  },
  handler: async (ctx, args) => {
    const { portfolioId, ...fields } = args;
    await ctx.db.patch(portfolioId, fields);
  },
});

export const remove = mutation({
  args: {
    portfolioId: v.id("portfolio"),
    storageId: v.optional(v.string()),
    muxAssetId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.storageId) {
      await ctx.storage.delete(args.storageId);
    }
    await ctx.db.delete(args.portfolioId);
  },
});
