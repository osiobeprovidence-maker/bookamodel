import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const upsertUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("model"), v.literal("business"), v.literal("admin")),
    imageUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        lastActive: Date.now(),
        isOnline: true,
      });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      ...args,
      createdAt: Date.now(),
      lastActive: Date.now(),
      isOnline: true,
    });
  },
});
