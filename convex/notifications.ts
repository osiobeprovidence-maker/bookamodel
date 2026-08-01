import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_recipientUserId", (q) => q.eq("recipientUserId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_recipientUserId", (q) => q.eq("recipientUserId", args.userId))
      .collect();
    return notifs.filter((n) => !n.isRead).length;
  },
});

export const create = mutation({
  args: {
    recipientUserId: v.id("users"),
    actorUserId: v.optional(v.id("users")),
    type: v.union(
      v.literal("new_job"),
      v.literal("job_invitation"),
      v.literal("new_application"),
      v.literal("application_status_changed"),
      v.literal("invitation_accepted"),
      v.literal("invitation_declined"),
      v.literal("new_message"),
      v.literal("payment_received"),
      v.literal("payment_status_changed"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    entityType: v.optional(v.union(v.literal("job"), v.literal("invitation"), v.literal("application"), v.literal("message"), v.literal("payment"), v.literal("system"))),
    entityId: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_recipientUserId", (q) => q.eq("recipientUserId", args.userId))
      .collect();
    for (const n of notifs) {
      if (!n.isRead) await ctx.db.patch(n._id, { isRead: true });
    }
  },
});

export const getPreferences = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const upsertPreferences = mutation({
  args: {
    userId: v.id("users"),
    inApp: v.optional(v.boolean()),
    push: v.optional(v.boolean()),
    email: v.optional(v.boolean()),
    sms: v.optional(v.boolean()),
    whatsapp: v.optional(v.boolean()),
    newJobs: v.optional(v.boolean()),
    applications: v.optional(v.boolean()),
    invitations: v.optional(v.boolean()),
    payments: v.optional(v.boolean()),
    messages: v.optional(v.boolean()),
    system: v.optional(v.boolean()),
    marketing: v.optional(v.boolean()),
    verificationUpdates: v.optional(v.boolean()),
    systemUpdates: v.optional(v.boolean()),
    weeklySummary: v.optional(v.boolean()),
    monthlyInsights: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...prefs } = args;
    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { ...prefs, updatedAt: Date.now() });
      return existing._id;
    }
    return await ctx.db.insert("notificationPreferences", {
      userId,
      inApp: true,
      push: false,
      email: false,
      sms: false,
      whatsapp: false,
      newJobs: true,
      applications: true,
      invitations: true,
      payments: true,
      messages: true,
      system: true,
      ...prefs,
      updatedAt: Date.now(),
    });
  },
});
