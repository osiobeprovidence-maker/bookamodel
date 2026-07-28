import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("modelProfiles").collect();
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("modelProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const get = query({
  args: { modelProfileId: v.id("modelProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.modelProfileId);
  },
});

export const upsert = mutation({
  args: {
    userId: v.id("users"),
    displayName: v.string(),
    tagline: v.optional(v.string()),
    bio: v.optional(v.string()),
    gender: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    height: v.optional(v.string()),
    bust: v.optional(v.string()),
    waist: v.optional(v.string()),
    hips: v.optional(v.string()),
    shoeSize: v.optional(v.string()),
    eyeColor: v.optional(v.string()),
    skinTone: v.optional(v.string()),
    languages: v.optional(v.array(v.string())),
    hourlyRate: v.optional(v.string()),
    dailyRate: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    socials: v.optional(
      v.object({
        instagram: v.optional(v.string()),
        twitter: v.optional(v.string()),
        tiktok: v.optional(v.string()),
      })
    ),
    imageUrl: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isAvailable: v.boolean(),
    availability: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("modelProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: Date.now() });
      return existing._id;
    }
    return await ctx.db.insert("modelProfiles", {
      ...args,
      isVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const incrementViews = mutation({
  args: { modelProfileId: v.id("modelProfiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.modelProfileId);
    if (profile) {
      await ctx.db.patch(args.modelProfileId, {
        profileViews: (profile.profileViews || 0) + 1,
      });
    }
  },
});

export const search = query({
  args: {
    searchText: v.optional(v.string()),
    category: v.optional(v.string()),
    city: v.optional(v.string()),
    gender: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let profiles = await ctx.db.query("modelProfiles").collect();

    if (args.searchText) {
      const search = args.searchText.toLowerCase();
      profiles = profiles.filter(
        (p) =>
          p.displayName.toLowerCase().includes(search) ||
          p.city?.toLowerCase().includes(search) ||
          p.tags?.some((t) => t.toLowerCase().includes(search))
      );
    }
    if (args.category) {
      profiles = profiles.filter((p) =>
        p.categories?.includes(args.category!)
      );
    }
    if (args.city) {
      profiles = profiles.filter((p) => p.city === args.city);
    }
    if (args.gender) {
      profiles = profiles.filter((p) => p.gender === args.gender);
    }
    if (args.isAvailable !== undefined) {
      profiles = profiles.filter((p) => p.isAvailable === args.isAvailable);
    }

    return profiles;
  },
});
