import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByModel = query({
  args: { modelUserId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_modelUserId", (q) =>
        q.eq("modelUserId", args.modelUserId)
      )
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    reviewerId: v.id("users"),
    modelUserId: v.id("users"),
    bookingId: v.optional(v.id("bookings")),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reviewId = await ctx.db.insert("reviews", {
      ...args,
      isApproved: true,
      createdAt: Date.now(),
    });

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_modelUserId", (q) =>
        q.eq("modelUserId", args.modelUserId)
      )
      .collect();

    const approved = reviews.filter((r) => r.isApproved);
    const avg = approved.length
      ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
      : 0;

    const profile = await ctx.db
      .query("modelProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.modelUserId))
      .unique();
    if (profile) {
      await ctx.db.patch(profile._id, {
        rating: Math.round(avg * 10) / 10,
        reviewCount: approved.length,
      });
    }

    return reviewId;
  },
});
