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

    const visible = profiles.filter((p) => p.discoverable !== false);

    const total = visible.length;
    const page = visible.slice(offset, offset + limit);

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
      if (p.discoverable === false) continue;
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

export const listFeed = query({
  args: {
    gender: v.optional(v.string()),
    category: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { gender, category, searchQuery, offset = 0, limit = 24 } = args;

    let profiles = await ctx.db
      .query("modelProfiles")
      .order("desc")
      .collect();

    const visible: any[] = [];
    for (const p of profiles) {
      if (!p.profileCompleted) continue;
      if (p.profileVisibility === "hidden" || p.profileVisibility === "private") continue;
      if (p.discoverable === false) continue;
      const user = await ctx.db.get(p.userId);
      if (!user) continue;
      if (user.accountStatus === "suspended" || user.accountStatus === "deactivated") continue;
      visible.push(p);
    }

    visible.sort((a, b) => (b.rating || 0) - (a.rating || 0));

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
      const filtered = visible.filter((p) =>
        (p.categories || []).some((c: string) => validKeys.has(c.toLowerCase()))
      );
      const page = filtered.slice(offset, offset + limit);
      return {
        models: await Promise.all(page.map((p) => toExploreModel(ctx, p))),
        total: filtered.length,
      };
    }

    if (gender) {
      const g = gender.toLowerCase();
      const filtered = visible.filter((p) => (p.gender || "").toLowerCase() === g);
      const page = filtered.slice(offset, offset + limit);
      return {
        models: await Promise.all(page.map((p) => toExploreModel(ctx, p))),
        total: filtered.length,
      };
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const filtered = visible.filter((p) => {
        const displayName = p.displayName?.toLowerCase() || "";
        const city = p.city?.toLowerCase() || "";
        const state = p.state?.toLowerCase() || "";
        const categories = (p.categories || []).join(" ").toLowerCase();
        const tags = (p.tags || []).join(" ").toLowerCase();
        return (
          displayName.includes(q) ||
          city.includes(q) ||
          state.includes(q) ||
          categories.includes(q) ||
          tags.includes(q)
        );
      });
      const page = filtered.slice(offset, offset + limit);
      return {
        models: await Promise.all(page.map((p) => toExploreModel(ctx, p))),
        total: filtered.length,
      };
    }

    const total = visible.length;
    const page = visible.slice(offset, offset + limit);
    const models = await Promise.all(page.map((profile) => toExploreModel(ctx, profile)));

    return { models, total };
  },
});

export const listBusinesses = query({
  args: {
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { offset = 0, limit = 24 } = args;

    const profiles = await ctx.db.query("businessProfiles").collect();
    const visible: any[] = [];
    for (const p of profiles) {
      if (!p.profileCompleted) continue;
      const user = await ctx.db.get(p.userId);
      if (!user) continue;
      if (user.accountStatus === "suspended" || user.accountStatus === "deactivated") continue;
      visible.push(p);
    }

    visible.sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));

    const total = visible.length;
    const page = visible.slice(offset, offset + limit);

    const businesses = await Promise.all(
      page.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        let logoUrl = p.logoUrl;
        if (!logoUrl && p.logoStorageId) {
          logoUrl = (await ctx.storage.getUrl(p.logoStorageId)) ?? null;
        }
        return {
          _id: p._id,
          userId: p.userId,
          companyName: p.companyName,
          businessCategory: p.businessCategory,
          industry: p.industry,
          description: p.description,
          city: p.city,
          state: p.state,
          country: p.country,
          logoUrl: logoUrl || undefined,
          isVerified: p.isVerified ?? false,
          user: user ? { name: user.name } : null,
        };
      })
    );

    return { businesses, total };
  },
});

export const listContent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 60 } = args;
    const items = await ctx.db.query("portfolio").order("desc").collect();

    const out: any[] = [];
    for (const p of items) {
      if (p.status === "deleted") continue;
      if (p.visibility === "private" || p.visibility === "hidden") continue;
      const profile = await ctx.db.get(p.modelProfileId);
      if (!profile) continue;
      if (!profile.profileCompleted) continue;
      if (profile.discoverable === false) continue;
      if (profile.profileVisibility === "hidden" || profile.profileVisibility === "private") continue;
      const user = await ctx.db.get(profile.userId);
      if (!user) continue;
      if (user.accountStatus === "suspended" || user.accountStatus === "deactivated") continue;

      let imageUrl = p.imageUrl;
      if (!imageUrl && p.thumbnailUrl) imageUrl = p.thumbnailUrl;
      if (!imageUrl && profile.imageUrl) imageUrl = profile.imageUrl;

      let videoUrl: string | undefined;
      if (p.type === "video") {
        videoUrl = p.videoUrl || (p.playbackId ? `https://stream.mux.com/${p.playbackId}/high.mp4` : undefined);
      }

      out.push({
        _id: p._id,
        modelProfileId: p.modelProfileId,
        modelName: profile.displayName,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        gender: profile.gender,
        type: p.type === "video" ? "video" : "image",
        category: p.category,
        title: p.title || "",
        imageUrl: imageUrl || undefined,
        videoUrl,
        avatarUrl: profile.imageUrl || undefined,
        isVerified: profile.isVerified,
        isAvailable: profile.isAvailable,
      });
      if (out.length >= limit) break;
    }

    return out;
  },
});
