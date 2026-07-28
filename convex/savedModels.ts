import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const toggle = mutation({
  args: {
    businessUserId: v.id("users"),
    modelUserId: v.id("users"),
    folder: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("savedModels")
      .withIndex("by_businessUserId", (q) =>
        q.eq("businessUserId", args.businessUserId)
      )
      .collect();
    const found = existing.find((s) => s.modelUserId === args.modelUserId);
    if (found) {
      await ctx.db.delete(found._id);
      return false;
    }
    await ctx.db.insert("savedModels", {
      businessUserId: args.businessUserId,
      modelUserId: args.modelUserId,
      folder: args.folder,
      createdAt: Date.now(),
    });
    return true;
  },
});

export const listByBusiness = query({
  args: { businessUserId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("savedModels")
      .withIndex("by_businessUserId", (q) =>
        q.eq("businessUserId", args.businessUserId)
      )
      .order("desc")
      .collect();
  },
});

export const isSaved = query({
  args: {
    businessUserId: v.id("users"),
    modelUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const saved = await ctx.db
      .query("savedModels")
      .withIndex("by_businessUserId", (q) =>
        q.eq("businessUserId", args.businessUserId)
      )
      .collect();
    return saved.some((s) => s.modelUserId === args.modelUserId);
  },
});
