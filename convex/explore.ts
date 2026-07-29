import { query } from "./_generated/server";
import { v } from "convex/values";

export const listPublishedModels = query({
  args: {
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    gender: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
    isAvailable: v.optional(v.boolean()),
    searchQuery: v.optional(v.string()),
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { category, location, gender, isVerified, isAvailable, searchQuery, offset = 0, limit = 12 } = args;

    let profiles = await ctx.db
      .query("modelProfiles")
      .filter((q) =>
        q.and(
          q.eq(q.field("isAvailable"), true),
          q.eq(q.field("profileCompleted"), true)
        )
      )
      .collect();

    if (category) {
      profiles = profiles.filter((p) => p.categories?.includes(category));
    }
    if (location) {
      const loc = location.toLowerCase();
      profiles = profiles.filter(
        (p) => p.city?.toLowerCase().includes(loc) || p.state?.toLowerCase().includes(loc)
      );
    }
    if (gender) {
      profiles = profiles.filter((p) => p.gender === gender);
    }
    if (isVerified === true) {
      profiles = profiles.filter((p) => p.isVerified);
    }
    if (isAvailable === true) {
      profiles = profiles.filter((p) => p.isAvailable);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      profiles = profiles.filter((p) => {
        const displayName = p.displayName?.toLowerCase() || "";
        const city = p.city?.toLowerCase() || "";
        const categories = (p.categories || []).join(" ").toLowerCase();
        return displayName.includes(q) || city.includes(q) || categories.includes(q);
      });
    }

    profiles.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    const total = profiles.length;
    const page = profiles.slice(offset, offset + limit);

    const results = await Promise.all(
      page.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        return {
          _id: profile._id,
          userId: profile.userId,
          displayName: profile.displayName,
          imageUrl: profile.imageUrl,
          gender: profile.gender,
          city: profile.city,
          state: profile.state,
          country: profile.country,
          height: profile.height,
          categories: profile.categories || [],
          bio: profile.bio,
          tagline: profile.tagline,
          isVerified: profile.isVerified,
          isFeatured: profile.isFeatured,
          isPro: profile.isPro,
          isAvailable: profile.isAvailable,
          rating: profile.rating,
          reviewCount: profile.reviewCount,
          completedJobs: profile.completedJobs,
          hourlyRate: profile.hourlyRate,
          dailyRate: profile.dailyRate,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
              }
            : null,
        };
      })
    );

    return { models: results, total };
  },
});
