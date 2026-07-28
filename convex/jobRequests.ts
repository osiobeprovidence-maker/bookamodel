import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByBusiness = query({
  args: { businessUserId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobRequests")
      .withIndex("by_businessUserId", (q) =>
        q.eq("businessUserId", args.businessUserId)
      )
      .order("desc")
      .collect();
  },
});

export const listOpen = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("jobRequests")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    businessUserId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    location: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    duration: v.optional(v.string()),
    budget: v.optional(v.string()),
    modelsNeeded: v.optional(v.number()),
    genderRequirement: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("jobRequests", {
      ...args,
      status: "open",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    jobRequestId: v.id("jobRequests"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("open"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { jobRequestId, ...updates } = args;
    await ctx.db.patch(jobRequestId, { ...updates, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { jobRequestId: v.id("jobRequests") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.jobRequestId);
  },
});
