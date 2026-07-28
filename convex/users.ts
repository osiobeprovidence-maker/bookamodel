import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByFirebaseUid = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const createUser = mutation({
  args: {
    firebaseUid: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      firebaseUid: args.firebaseUid,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      role: undefined,
      profileCompleted: false,
      onboardingStep: 0,
      createdAt: Date.now(),
      lastActive: Date.now(),
      isOnline: true,
    });
  },
});

export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("model"), v.literal("business")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const updateOnboardingStep = mutation({
  args: {
    userId: v.id("users"),
    onboardingStep: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { onboardingStep: args.onboardingStep });
  },
});

export const completeOnboarding = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { profileCompleted: true, onboardingStep: 0 });
  },
});

export const setProfileCompleted = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { profileCompleted: true });
  },
});

export const getModelProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("modelProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const getBusinessProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("businessProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const saveModelProfile = mutation({
  args: {
    userId: v.id("users"),
    displayName: v.string(),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    tagline: v.optional(v.string()),
    gender: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    country: v.optional(v.string()),
    state: v.optional(v.string()),
    city: v.optional(v.string()),
    height: v.optional(v.string()),
    weight: v.optional(v.string()),
    bust: v.optional(v.string()),
    waist: v.optional(v.string()),
    hips: v.optional(v.string()),
    shoeSize: v.optional(v.string()),
    eyeColor: v.optional(v.string()),
    skinTone: v.optional(v.string()),
    hairColor: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    hourlyRate: v.optional(v.string()),
    dailyRate: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()),
    socials: v.optional(
      v.object({
        instagram: v.optional(v.string()),
        twitter: v.optional(v.string()),
        tiktok: v.optional(v.string()),
      })
    ),
    imageUrl: v.optional(v.string()),
    profilePhotoStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, phone, ...profile } = args;
    const existing = await ctx.db
      .query("modelProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    await ctx.db.patch(userId, { phone, imageUrl: profile.imageUrl });
    if (existing) {
      await ctx.db.patch(existing._id, { ...profile, updatedAt: Date.now() });
      return existing._id;
    }
    return await ctx.db.insert("modelProfiles", {
      userId,
      isVerified: false,
      isAvailable: true,
      profileCompleted: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...profile,
    });
  },
});

export const saveBusinessProfile = mutation({
  args: {
    userId: v.id("users"),
    businessName: v.string(),
    contactPerson: v.string(),
    phone: v.optional(v.string()),
    country: v.optional(v.string()),
    state: v.optional(v.string()),
    businessCategory: v.optional(v.string()),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    logoStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...profile } = args;
    const existing = await ctx.db
      .query("businessProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { ...profile, updatedAt: Date.now() });
      return existing._id;
    }
    return await ctx.db.insert("businessProfiles", {
      userId,
      companyName: args.businessName,
      ...profile,
      profileCompleted: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
