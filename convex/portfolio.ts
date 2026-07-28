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
    title: v.optional(v.string()),
    category: v.union(
      v.literal("portrait"),
      v.literal("fashion"),
      v.literal("commercial"),
      v.literal("editorial"),
      v.literal("fitness"),
      v.literal("other")
    ),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("portfolio")
      .withIndex("by_modelProfileId", (q) =>
        q.eq("modelProfileId", args.modelProfileId)
      )
      .collect();
    return await ctx.db.insert("portfolio", {
      ...args,
      order: existing.length,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { portfolioId: v.id("portfolio") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.portfolioId);
  },
});
