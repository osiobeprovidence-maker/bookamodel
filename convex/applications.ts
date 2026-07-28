import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByModel = query({
  args: { modelUserId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("applications")
      .withIndex("by_modelUserId", (q) =>
        q.eq("modelUserId", args.modelUserId)
      )
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    modelUserId: v.id("users"),
    jobRequestId: v.id("jobRequests"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("applications", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("withdrawn")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.applicationId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
