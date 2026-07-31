import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByBusiness = query({
  args: { businessUserId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobRequests")
      .withIndex("by_businessUserId", (q) => q.eq("businessUserId", args.businessUserId))
      .order("desc")
      .collect();
  },
});

export const listOpen = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("jobRequests")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .collect();
    return jobs.filter((j) => j.visibility !== "invitation_only");
  },
});

export const listByIds = query({
  args: { ids: v.array(v.id("jobRequests")) },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.ids) {
      const job = await ctx.db.get(id);
      if (job) results.push(job);
    }
    return results;
  },
});

export const getById = query({
  args: { jobRequestId: v.id("jobRequests") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobRequestId);
    if (!job) return null;
    const business = await ctx.db.get(job.businessUserId);
    return { ...job, business };
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
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
    experienceLevel: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"), v.literal("any"))),
    visibility: v.optional(v.union(v.literal("public"), v.literal("open_to_all"), v.literal("invitation_only"))),
    applicationDeadline: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"))),
  },
  handler: async (ctx, args) => {
    const { status, ...rest } = args;
    const jobId = await ctx.db.insert("jobRequests", {
      ...rest,
      status: status || "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    if ((status || "draft") === "active") {
      await dispatchJobNotifications(ctx, jobId, args);
    }

    return jobId;
  },
});

async function dispatchJobNotifications(ctx: any, jobId: any, jobArgs: any) {
  const business = await ctx.db.get(jobArgs.businessUserId);
  const bizProfile = await ctx.db
    .query("businessProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", jobArgs.businessUserId))
    .unique();
  const bizName = bizProfile?.companyName || business?.name || "A business";

  const models = await ctx.db.query("modelProfiles").collect();
  const eligibleModels = models.filter((m: any) => {
    if (!m.profileCompleted) return false;
    if (m.profileVisibility === "hidden" || m.profileVisibility === "private") return false;
    if (jobArgs.visibility === "open_to_all") return m.isAvailable !== false;
    if (jobArgs.visibility === "invitation_only") return false;
    if (jobArgs.genderRequirement && jobArgs.genderRequirement !== "Any") {
      if (m.gender?.toLowerCase() !== jobArgs.genderRequirement.toLowerCase()) return false;
    }
    if (jobArgs.location && jobArgs.location !== "Any") {
      const modelLoc = [m.city, m.state, m.country].filter(Boolean).join(", ");
      if (!modelLoc.toLowerCase().includes(jobArgs.location.toLowerCase())) return false;
    }
    if (jobArgs.category && jobArgs.category !== "All") {
      if (!m.categories?.some((c: string) => c.toLowerCase() === jobArgs.category.toLowerCase())) return false;
    }
    return true;
  });

  for (const model of eligibleModels) {
    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", model.userId))
      .unique();

    if (prefs && !prefs.newJobs) continue;
    if (prefs && !prefs.inApp) continue;

    await ctx.db.insert("notifications", {
      recipientUserId: model.userId,
      actorUserId: jobArgs.businessUserId,
      type: "new_job",
      title: "New modelling job available",
      message: `${bizName} posted "${jobArgs.title}" in ${jobArgs.location}`,
      entityType: "job",
      entityId: jobId,
      isRead: false,
      createdAt: Date.now(),
    });
  }
}

export const update = mutation({
  args: {
    jobRequestId: v.id("jobRequests"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    duration: v.optional(v.string()),
    budget: v.optional(v.string()),
    modelsNeeded: v.optional(v.number()),
    genderRequirement: v.optional(v.string()),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
    experienceLevel: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"), v.literal("any"))),
    visibility: v.optional(v.union(v.literal("public"), v.literal("open_to_all"), v.literal("invitation_only"))),
    applicationDeadline: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("completed"), v.literal("cancelled"), v.literal("expired"))),
  },
  handler: async (ctx, args) => {
    const { jobRequestId, ...fields } = args;
    const existing = await ctx.db.get(jobRequestId);
    if (!existing) throw new Error("Job not found");

    await ctx.db.patch(jobRequestId, { ...fields, updatedAt: Date.now() });

    if (fields.status === "active" && existing.status !== "active") {
      await dispatchJobNotifications(ctx, jobRequestId, {
        businessUserId: existing.businessUserId,
        title: fields.title || existing.title,
        description: fields.description || existing.description,
        category: fields.category || existing.category,
        location: fields.location || existing.location,
        genderRequirement: fields.genderRequirement || existing.genderRequirement,
        visibility: fields.visibility || existing.visibility,
      });
    }
  },
});

export const remove = mutation({
  args: { jobRequestId: v.id("jobRequests") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.jobRequestId);
  },
});
