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
    const business = await ctx.db.get(args.businessUserId);
    const businessProfile = await ctx.db
      .query("businessProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.businessUserId))
      .unique();
    const bizName = businessProfile?.companyName || business?.name || "A business";

    const modelSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.modelUserId))
      .unique();
    const autoAccept =
      modelSettings?.account?.autoAcceptVerifiedOnly === true &&
      businessProfile?.isVerified === true;

    const invId = await ctx.db.insert("invitations", {
      ...args,
      status: autoAccept ? "accepted" : "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.modelUserId))
      .unique();

    if ((!prefs || prefs.invitations) && (!prefs || prefs.inApp)) {
      await ctx.db.insert("notifications", {
        recipientUserId: args.modelUserId,
        actorUserId: args.businessUserId,
        type: "job_invitation",
        title: "You received a job invitation",
        message: `${bizName} invited you: "${args.title}"`,
        entityType: "invitation",
        entityId: invId,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    if (autoAccept) {
      const model = await ctx.db.get(args.modelUserId);
      const modelProfile = await ctx.db
        .query("modelProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", args.modelUserId))
        .unique();
      const modelName = modelProfile?.displayName || model?.name || "A model";
      const bizPrefs = await ctx.db
        .query("notificationPreferences")
        .withIndex("by_userId", (q) => q.eq("userId", args.businessUserId))
        .unique();
      if ((!bizPrefs || bizPrefs.invitations) && (!bizPrefs || bizPrefs.inApp)) {
        await ctx.db.insert("notifications", {
          recipientUserId: args.businessUserId,
          actorUserId: args.modelUserId,
          type: "invitation_accepted",
          title: "Invitation accepted automatically",
          message: `${modelName} auto-accepted your invitation: "${args.title}"`,
          entityType: "invitation",
          entityId: invId,
          isRead: false,
          createdAt: Date.now(),
        });
      }
      await ctx.db.insert("notifications", {
        recipientUserId: args.modelUserId,
        actorUserId: args.businessUserId,
        type: "system",
        title: "Invitation auto-accepted",
        message: `Invitation from ${bizName} was auto-accepted (verified brand). Review it in your dashboard.`,
        entityType: "invitation",
        entityId: invId,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return invId;
  },
});

export const listByModel = query({
  args: { modelUserId: v.id("users") },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_modelUserId", (q) => q.eq("modelUserId", args.modelUserId))
      .order("desc")
      .collect();

    return await Promise.all(
      invitations.map(async (inv) => {
        const business = await ctx.db.get(inv.businessUserId);
        const businessProfile = await ctx.db
          .query("businessProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", inv.businessUserId))
          .unique();
        return {
          ...inv,
          business: business ? { name: business.name, imageUrl: business.imageUrl } : null,
          businessProfile: businessProfile
            ? { companyName: businessProfile.companyName, logoUrl: businessProfile.logoUrl }
            : null,
        };
      })
    );
  },
});

export const listByBusiness = query({
  args: { businessUserId: v.id("users") },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_businessUserId", (q) => q.eq("businessUserId", args.businessUserId))
      .order("desc")
      .collect();

    return await Promise.all(
      invitations.map(async (inv) => {
        const model = await ctx.db.get(inv.modelUserId);
        const modelProfile = await ctx.db
          .query("modelProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", inv.modelUserId))
          .unique();
        return {
          ...inv,
          model: model ? { name: model.name, imageUrl: model.imageUrl } : null,
          modelProfile: modelProfile
            ? { displayName: modelProfile.displayName, imageUrl: modelProfile.imageUrl }
            : null,
        };
      })
    );
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
    const inv = await ctx.db.get(args.invitationId);
    if (!inv) throw new Error("Invitation not found");

    await ctx.db.patch(args.invitationId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    if (args.status === "accepted" || args.status === "declined") {
      const model = await ctx.db.get(inv.modelUserId);
      const modelProfile = await ctx.db
        .query("modelProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", inv.modelUserId))
        .unique();
      const modelName = modelProfile?.displayName || model?.name || "A model";

      const prefs = await ctx.db
        .query("notificationPreferences")
        .withIndex("by_userId", (q) => q.eq("userId", inv.businessUserId))
        .unique();

      if ((!prefs || prefs.invitations) && (!prefs || prefs.inApp)) {
        await ctx.db.insert("notifications", {
          recipientUserId: inv.businessUserId,
          actorUserId: inv.modelUserId,
          type: args.status === "accepted" ? "invitation_accepted" : "invitation_declined",
          title: args.status === "accepted" ? "Invitation accepted" : "Invitation declined",
          message: `${modelName} ${args.status === "accepted" ? "accepted" : "declined"} your invitation: "${inv.title}"`,
          entityType: "invitation",
          entityId: args.invitationId,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }
  },
});
