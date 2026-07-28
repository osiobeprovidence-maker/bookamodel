import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    businessUserId: v.id("users"),
    modelUserId: v.id("users"),
    jobRequestId: v.optional(v.id("jobRequests")),
    title: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    location: v.string(),
    amount: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bookings", {
      ...args,
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const listByBusiness = query({
  args: { businessUserId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_businessUserId", (q) =>
        q.eq("businessUserId", args.businessUserId)
      )
      .order("desc")
      .collect();
  },
});

export const listByModel = query({
  args: { modelUserId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_modelUserId", (q) =>
        q.eq("modelUserId", args.modelUserId)
      )
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("disputed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
