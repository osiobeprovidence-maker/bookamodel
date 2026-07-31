import { query } from "./_generated/server";
import { v } from "convex/values";

async function toExploreModel(ctx: any, profile: any) {
  const user = await ctx.db.get(profile.userId);
  let imageUrl = profile.imageUrl;
  if (!imageUrl && profile.profilePhotoStorageId) {
    imageUrl = (await ctx.storage.getUrl(profile.profilePhotoStorageId)) ?? null;
  }
  return {
    _id: profile._id,
    userId: profile.userId,
    displayName: profile.displayName,
    imageUrl: imageUrl || undefined,
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
}

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
      const cat = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", category))
        .first();
      const validKeys = new Set([category.toLowerCase()]);
      if (cat) {
        validKeys.add(cat.name.toLowerCase());
        validKeys.add(cat.slug.toLowerCase());
      }
      profiles = profiles.filter((p) =>
        (p.categories || []).some((c) => validKeys.has(c.toLowerCase()))
      );
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

    const results = await Promise.all(page.map((profile) => toExploreModel(ctx, profile)));

    return { models: results, total };
  },
});

export const listAvailableToday = query({
  args: {
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { offset = 0, limit = 50 } = args;

    const profiles = await ctx.db
      .query("modelProfiles")
      .withIndex("by_isAvailable", (q) => q.eq("isAvailable", true))
      .collect();

    const filtered: any[] = [];
    for (const p of profiles) {
      if (!p.profileCompleted) continue;
      if (p.profileVisibility === "hidden" || p.profileVisibility === "private") continue;
      const user = await ctx.db.get(p.userId);
      if (!user) continue;
      if (user.accountStatus === "suspended" || user.accountStatus === "deactivated") continue;
      filtered.push(p);
    }

    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    const total = filtered.length;
    const page = filtered.slice(offset, offset + limit);

    const models = await Promise.all(page.map((profile) => toExploreModel(ctx, profile)));

    return { models, total };
  },
});
