import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByModel = query({
  args: { modelUserId: v.id("users") },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_modelUserId", (q) => q.eq("modelUserId", args.modelUserId))
      .order("desc")
      .collect();

    return await Promise.all(
      applications.map(async (app) => {
        const job = app.jobRequestId ? await ctx.db.get(app.jobRequestId) : null;
        return { ...app, job };
      })
    );
  },
});

export const listByJob = query({
  args: { jobRequestId: v.id("jobRequests") },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_jobRequestId", (q) => q.eq("jobRequestId", args.jobRequestId))
      .order("desc")
      .collect();

    return await Promise.all(
      applications.map(async (app) => {
        const model = await ctx.db.get(app.modelUserId);
        const modelProfile = await ctx.db
          .query("modelProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", app.modelUserId))
          .unique();
        return {
          ...app,
          model: model ? { name: model.name, imageUrl: model.imageUrl } : null,
          modelProfile: modelProfile
            ? { displayName: modelProfile.displayName, imageUrl: modelProfile.imageUrl, city: modelProfile.city, categories: modelProfile.categories }
            : null,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    modelUserId: v.id("users"),
    jobRequestId: v.id("jobRequests"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const appId = await ctx.db.insert("applications", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const job = await ctx.db.get(args.jobRequestId);
    if (job) {
      const model = await ctx.db.get(args.modelUserId);
      const modelProfile = await ctx.db
        .query("modelProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", args.modelUserId))
        .unique();
      const modelName = modelProfile?.displayName || model?.name || "A model";

      const prefs = await ctx.db
        .query("notificationPreferences")
        .withIndex("by_userId", (q) => q.eq("userId", job.businessUserId))
        .unique();

      if ((!prefs || prefs.applications) && (!prefs || prefs.inApp)) {
        await ctx.db.insert("notifications", {
          recipientUserId: job.businessUserId,
          actorUserId: args.modelUserId,
          type: "new_application",
          title: "New job application",
          message: `${modelName} applied for "${job.title}"`,
          entityType: "application",
          entityId: appId,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    return appId;
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
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new Error("Application not found");

    await ctx.db.patch(args.applicationId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    const job = app.jobRequestId ? await ctx.db.get(app.jobRequestId) : null;
    if (job) {
      const prefs = await ctx.db
        .query("notificationPreferences")
        .withIndex("by_userId", (q) => q.eq("userId", app.modelUserId))
        .unique();

      if ((!prefs || prefs.applications) && (!prefs || prefs.inApp)) {
        await ctx.db.insert("notifications", {
          recipientUserId: app.modelUserId,
          actorUserId: job.businessUserId,
          type: "application_status_changed",
          title: "Application status updated",
          message: `Your application for "${job.title}" was ${args.status}`,
          entityType: "application",
          entityId: args.applicationId,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }
  },
});
