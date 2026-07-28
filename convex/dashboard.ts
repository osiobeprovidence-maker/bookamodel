import { query } from "./_generated/server";
import { v } from "convex/values";

const CALCULATE_PROFILE_COMPLETION = (profile: any) => {
  if (!profile) return 0;
  const checks = [
    !!(profile.tagline || profile.bio || profile.gender),
    !!(profile.country || profile.state || profile.city),
    !!(profile.height || profile.bust || profile.waist || profile.hips),
    !!(profile.hourlyRate || profile.dailyRate),
    !!(profile.categories && profile.categories.length > 0),
    !!(profile.imageUrl || profile.profilePhotoStorageId),
    !!(profile.socials?.instagram || profile.socials?.twitter || profile.socials?.tiktok),
    !!(profile.availability && profile.availability.length > 0),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

export const getModelDashboardData = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const profile = await ctx.db
      .query("modelProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const portfolioItems = await ctx.db
      .query("portfolio")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_modelUserId", (q) => q.eq("modelUserId", args.userId))
      .order("desc")
      .collect();

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_modelUserId", (q) => q.eq("modelUserId", args.userId))
      .order("desc")
      .collect();

    const profileCompletion = CALCULATE_PROFILE_COMPLETION(profile);

    const completedBookings = bookings.filter((b) => b.status === "completed");
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled");
    const totalFinished = completedBookings.length + cancelledBookings.length;
    const successRate =
      totalFinished > 0
        ? Math.round((completedBookings.length / totalFinished) * 100)
        : 0;

    return {
      user: {
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      },
      profile: profile
        ? {
            profileViews: profile.profileViews ?? 0,
            invitationCount: profile.invitationCount ?? 0,
            totalEarnings: profile.totalEarnings ?? 0,
            isVerified: profile.isVerified,
            isAvailable: profile.isAvailable,
            isPro: profile.isPro ?? false,
            profileCompleted: profile.profileCompleted,
            _id: profile._id,
          }
        : null,
      stats: {
        profileViews: profile?.profileViews ?? 0,
        pendingInvitations: invitations.filter((i) => i.status === "pending").length,
        successRate,
        totalEarnings: profile?.totalEarnings ?? 0,
        portfolioCount: portfolioItems.length,
        completedJobs: completedBookings.length,
      },
      recentInvitations: invitations.slice(0, 5).map((i) => ({
        _id: i._id,
        title: i.title,
        status: i.status,
        createdAt: i.createdAt,
      })),
      upcomingBookings: bookings
        .filter((b) => b.status !== "cancelled" && b.status !== "completed")
        .slice(0, 3)
        .map((b) => ({
          _id: b._id,
          title: b.title,
          date: b.date,
          time: b.time,
          location: b.location,
          status: b.status,
        })),
      profileCompletion,
    };
  },
});

export const getBusinessDashboardData = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const businessProfile = await ctx.db
      .query("businessProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_businessUserId", (q) => q.eq("businessUserId", args.userId))
      .order("desc")
      .collect();

    const savedModels = await ctx.db
      .query("savedModels")
      .withIndex("by_businessUserId", (q) => q.eq("businessUserId", args.userId))
      .collect();

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_businessUserId", (q) => q.eq("businessUserId", args.userId))
      .order("desc")
      .collect();

    const completedBookings = bookings.filter((b) => b.status === "completed");
    const totalSpent = completedBookings.reduce((sum, b) => {
      const amount = parseFloat(b.amount.replace(/[^0-9.]/g, ""));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    return {
      user: {
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      },
      businessProfile: businessProfile
        ? {
            companyName: businessProfile.companyName,
            profileCompleted: businessProfile.profileCompleted,
            _id: businessProfile._id,
          }
        : null,
      stats: {
        activeInvitations: invitations.filter((i) => i.status === "pending").length,
        savedModelsCount: savedModels.length,
        completedJobs: completedBookings.length,
        totalSpent,
      },
      recentInvitations: invitations.slice(0, 5).map((i) => ({
        _id: i._id,
        title: i.title,
        status: i.status,
        createdAt: i.createdAt,
        modelUserId: i.modelUserId,
      })),
      upcomingBookings: bookings
        .filter((b) => b.status !== "cancelled" && b.status !== "completed")
        .slice(0, 5)
        .map((b) => ({
          _id: b._id,
          title: b.title,
          date: b.date,
          location: b.location,
          status: b.status,
        })),
    };
  },
});
