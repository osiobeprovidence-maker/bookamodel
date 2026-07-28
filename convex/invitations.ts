import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  args: {
    businessUserId: v.id("users"),
    modelUserId: v.id("users"),
    jobRequestId: v.optional(v.id("jobRequests")),
    title: v.string(),
    message: v.optional(v.string()),
    proposedDate: v.optional(v.string()),
    proposedRate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("invitations", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const listByModel = query({
  args: { modelUserId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invitations")
      .withIndex("by_modelUserId", (q) =>
        q.eq("modelUserId", args.modelUserId)
      )
      .order("desc")
      .collect();
  },
});

export const listByBusiness = query({
  args: { businessUserId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invitations")
      .withIndex("by_businessUserId", (q) =>
        q.eq("businessUserId", args.businessUserId)
      )
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    invitationId: v.id("invitations"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invitationId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
