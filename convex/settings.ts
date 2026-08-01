import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const DEFAULT_SETTINGS = {
  general: {
    username: "",
    language: "English",
    timezone: "WAT (UTC+1)",
    country: "",
    defaultCategory: "",
    theme: "light",
  },
  account: {
    profileVisibility: true,
    publicPortfolio: true,
    brandDiscovery: true,
    autoAcceptVerifiedOnly: false,
  },
  privacy: {
    showEmail: false,
    showPhone: false,
    allowBrandMessages: true,
    allowProfileSearch: true,
    hideMeasurements: false,
    hideAge: true,
    showSocialLinks: true,
  },
  appearance: {
    theme: "light",
    density: "comfortable",
    cardRadius: "default",
    animations: true,
  },
} as const;

async function getOrCreateSettings(ctx: any, userId: any) {
  let settings = await ctx.db
    .query("userSettings")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  if (!settings) {
    const id = await ctx.db.insert("userSettings", {
      userId,
      general: { ...DEFAULT_SETTINGS.general },
      account: { ...DEFAULT_SETTINGS.account },
      privacy: { ...DEFAULT_SETTINGS.privacy },
      appearance: { ...DEFAULT_SETTINGS.appearance },
      twoFactorEnabled: false,
      twoFactorMethod: "email",
      updatedAt: Date.now(),
    });
    settings = await ctx.db.get(id);
  }
  return settings;
}

function computeCompletion(profile: any, portfolioCount: number, verification: any) {
  const items = [
    { label: "Profile photo", done: !!(profile?.imageUrl || profile?.profilePhotoStorageId) },
    { label: "Bio", done: !!(profile?.bio || profile?.tagline) },
    {
      label: "Measurements",
      done: !!(profile?.height && (profile?.bust || profile?.waist || profile?.hips)),
    },
    { label: "Location", done: !!(profile?.city || profile?.state || profile?.country) },
    { label: "Category", done: (profile?.categories?.length ?? 0) > 0 },
    { label: "Portfolio", done: portfolioCount > 0 },
    {
      label: "Social links",
      done: !!(
        profile?.socials?.instagram ||
        profile?.socials?.twitter ||
        profile?.socials?.tiktok
      ),
    },
    { label: "Verification", done: !!profile?.isVerified || verification?.status === "approved" },
  ];
  const doneCount = items.filter((i) => i.done).length;
  return {
    percent: items.length === 0 ? 0 : Math.round((doneCount / items.length) * 100),
    items,
  };
}

export const getSettings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await getOrCreateSettings(ctx, args.userId);
    const user = await ctx.db.get(args.userId);
    const modelProfile = await ctx.db
      .query("modelProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    const portfolioItems = await ctx.db
      .query("portfolio")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    const verification = await ctx.db
      .query("verificationRequests")
      .withIndex("by_modelUserId", (q) => q.eq("modelUserId", args.userId))
      .order("desc")
      .first();
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    let plan: any = { isPro: false, planName: "Free", status: null, expiresAt: null, startedAt: null };
    const now = Date.now();
    if (subscription && subscription.status === "active") {
      if (subscription.expiresAt && now > subscription.expiresAt) {
        plan = {
          isPro: false,
          planName: subscription.planName,
          status: "expired",
          expiresAt: subscription.expiresAt,
          startedAt: subscription.startedAt,
          amount: subscription.amount,
          currency: subscription.currency,
        };
      } else {
        plan = {
          isPro: true,
          planName: subscription.planName,
          status: subscription.status,
          expiresAt: subscription.expiresAt,
          startedAt: subscription.startedAt,
          amount: subscription.amount,
          currency: subscription.currency,
        };
      }
    }

    return {
      settings: {
        general: { ...DEFAULT_SETTINGS.general, ...(settings.general || {}) },
        account: { ...DEFAULT_SETTINGS.account, ...(settings.account || {}) },
        privacy: { ...DEFAULT_SETTINGS.privacy, ...(settings.privacy || {}) },
        appearance: { ...DEFAULT_SETTINGS.appearance, ...(settings.appearance || {}) },
        twoFactorEnabled: settings.twoFactorEnabled ?? false,
        twoFactorMethod: settings.twoFactorMethod ?? "email",
        updatedAt: settings.updatedAt,
      },
      completion: computeCompletion(modelProfile, portfolioItems.length, verification),
      plan,
      user: user ? { name: user.name, email: user.email, phone: user.phone } : null,
      hasModelProfile: !!modelProfile,
    };
  },
});

export const getPrivacyForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    return {
      ...DEFAULT_SETTINGS.privacy,
      ...(settings?.privacy || {}),
    };
  },
});

export const isUsernameTaken = query({
  args: { userId: v.id("users"), username: v.string() },
  handler: async (ctx, args) => {
    const username = args.username.trim().toLowerCase();
    if (!username) return false;
    const profiles = await ctx.db.query("modelProfiles").collect();
    return profiles.some(
      (p) => p.userId !== args.userId && (p.username || "").trim().toLowerCase() === username
    );
  },
});

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const generateRecoveryCodes = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await getOrCreateSettings(ctx, args.userId);
    const codes: string[] = [];
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let i = 0; i < 8; i++) {
      let raw = "";
      for (let j = 0; j < 8; j++) {
        raw += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
    }
    const hashed = await Promise.all(codes.map((c) => sha256Hex(c.replace("-", ""))));
    await ctx.db.patch(settings._id, {
      twoFactorEnabled: true,
      twoFactorMethod: settings.twoFactorMethod ?? "email",
      recoveryCodes: hashed,
      updatedAt: Date.now(),
    });
    return { codes };
  },
});

export const updateSettings = mutation({
  args: {
    userId: v.id("users"),
    general: v.optional(
      v.object({
        username: v.optional(v.string()),
        language: v.optional(v.string()),
        timezone: v.optional(v.string()),
        country: v.optional(v.string()),
        defaultCategory: v.optional(v.string()),
        theme: v.optional(v.string()),
      })
    ),
    account: v.optional(
      v.object({
        profileVisibility: v.optional(v.boolean()),
        publicPortfolio: v.optional(v.boolean()),
        brandDiscovery: v.optional(v.boolean()),
        autoAcceptVerifiedOnly: v.optional(v.boolean()),
      })
    ),
    privacy: v.optional(
      v.object({
        showEmail: v.optional(v.boolean()),
        showPhone: v.optional(v.boolean()),
        allowBrandMessages: v.optional(v.boolean()),
        allowProfileSearch: v.optional(v.boolean()),
        hideMeasurements: v.optional(v.boolean()),
        hideAge: v.optional(v.boolean()),
        showSocialLinks: v.optional(v.boolean()),
      })
    ),
    appearance: v.optional(
      v.object({
        theme: v.optional(v.string()),
        density: v.optional(v.string()),
        cardRadius: v.optional(v.string()),
        animations: v.optional(v.boolean()),
      })
    ),
    twoFactorEnabled: v.optional(v.boolean()),
    twoFactorMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = args;
    const settings = await getOrCreateSettings(ctx, userId);

    const general = { ...settings.general, ...(args.general || {}) };
    const account = { ...settings.account, ...(args.account || {}) };
    const privacy = { ...settings.privacy, ...(args.privacy || {}) };
    const appearance = { ...settings.appearance, ...(args.appearance || {}) };
    const twoFactorEnabled = args.twoFactorEnabled ?? settings.twoFactorEnabled ?? false;
    const twoFactorMethod = args.twoFactorMethod ?? settings.twoFactorMethod ?? "email";

    await ctx.db.patch(settings._id, {
      general,
      account,
      privacy,
      appearance,
      twoFactorEnabled,
      twoFactorMethod,
      updatedAt: Date.now(),
    });

    const modelProfile = await ctx.db
      .query("modelProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (modelProfile) {
      const patches: any = {};
      if (args.account?.profileVisibility !== undefined) {
        patches.profileVisibility = args.account.profileVisibility ? "public" : "hidden";
      }
      if (args.account?.brandDiscovery !== undefined) {
        patches.discoverable = args.account.brandDiscovery;
      }
      if (args.privacy?.allowProfileSearch !== undefined) {
        patches.discoverable = args.privacy.allowProfileSearch;
      }
      if (Object.keys(patches).length > 0) {
        await ctx.db.patch(modelProfile._id, { ...patches, updatedAt: Date.now() });
      }
    }

    if (args.account?.publicPortfolio !== undefined) {
      const items = await ctx.db
        .query("portfolio")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
      for (const item of items) {
        await ctx.db.patch(item._id, {
          visibility: args.account.publicPortfolio ? "public" : "private",
        });
      }
      const albums = await ctx.db
        .query("albums")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
      for (const album of albums) {
        await ctx.db.patch(album._id, {
          visibility: args.account.publicPortfolio ? "public" : "private",
          updatedAt: Date.now(),
        });
      }
    }

    return true;
  },
});

export const recordLogin = mutation({
  args: {
    userId: v.id("users"),
    browser: v.optional(v.string()),
    device: v.optional(v.string()),
    os: v.optional(v.string()),
    platform: v.optional(v.string()),
    location: v.optional(v.string()),
    ip: v.optional(v.string()),
    success: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...rest } = args;
    await ctx.db.patch(userId, { lastActive: Date.now(), isOnline: true });
    await ctx.runMutation(api.subscriptions.expireStaleSubscriptions, {});
    return await ctx.db.insert("loginHistory", {
      userId,
      browser: rest.browser ?? "Unknown",
      device: rest.device ?? "Unknown",
      os: rest.os ?? "Unknown",
      platform: rest.platform ?? "Unknown",
      location: rest.location ?? "",
      ip: rest.ip,
      success: rest.success ?? true,
      createdAt: Date.now(),
    });
  },
});

export const getLoginHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("loginHistory")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(30);
    return rows;
  },
});

export const signOutAllSessions = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { sessionEpoch: Date.now() });
  },
});

export const deactivateAccount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId, { accountStatus: "deactivated", isOnline: false });
    const modelProfile = await ctx.db
      .query("modelProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (modelProfile) {
      await ctx.db.patch(modelProfile._id, { isAvailable: false, updatedAt: Date.now() });
    }
    await ctx.db.insert("loginHistory", {
      userId: args.userId,
      browser: "System",
      device: "Account deactivated",
      os: "—",
      platform: "—",
      success: false,
      createdAt: Date.now(),
    });
  },
});

export const deleteAccount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const { userId } = args;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (settings) await ctx.db.delete(settings._id);

    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (prefs) await ctx.db.delete(prefs._id);

    const modelProfile = await ctx.db
      .query("modelProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (modelProfile) {
      const items = await ctx.db
        .query("portfolio")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
      for (const item of items) await ctx.db.delete(item._id);
      const albums = await ctx.db
        .query("albums")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
      for (const album of albums) {
        const albumItems = await ctx.db
          .query("albumItems")
          .withIndex("by_albumId", (q) => q.eq("albumId", album._id))
          .collect();
        for (const ai of albumItems) await ctx.db.delete(ai._id);
        await ctx.db.delete(album._id);
      }
      const verifications = await ctx.db
        .query("verificationRequests")
        .withIndex("by_modelUserId", (q) => q.eq("modelUserId", userId))
        .collect();
      for (const vr of verifications) await ctx.db.delete(vr._id);
      await ctx.db.delete(modelProfile._id);
    }

    const businessProfile = await ctx.db
      .query("businessProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (businessProfile) await ctx.db.delete(businessProfile._id);

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (wallet) {
      const txs = await ctx.db
        .query("walletTransactions")
        .withIndex("by_walletId", (q) => q.eq("walletId", wallet._id))
        .collect();
      for (const tx of txs) await ctx.db.delete(tx._id);
      await ctx.db.delete(wallet._id);
    }

    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const sub of subscriptions) await ctx.db.delete(sub._id);

    const loginRows = await ctx.db
      .query("loginHistory")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const row of loginRows) await ctx.db.delete(row._id);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipientUserId", (q) => q.eq("recipientUserId", userId))
      .collect();
    for (const n of notifications) await ctx.db.delete(n._id);

    const tickets = await ctx.db
      .query("supportTickets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const t of tickets) await ctx.db.delete(t._id);

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_modelUserId", (q) => q.eq("modelUserId", userId))
      .collect();
    for (const a of applications) await ctx.db.delete(a._id);

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_modelUserId", (q) => q.eq("modelUserId", userId))
      .collect();
    for (const i of invitations) await ctx.db.delete(i._id);

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_reviewerId", (q) => q.eq("reviewerId", userId))
      .collect();
    for (const r of reviews) await ctx.db.delete(r._id);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_senderId", (q) => q.eq("senderId", userId))
      .collect();
    for (const m of messages) await ctx.db.delete(m._id);

    await ctx.db.delete(userId);
    return true;
  },
});

export const exportMyData = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const { userId } = args;
    const user = await ctx.db.get(userId);
    const modelProfile = await ctx.db
      .query("modelProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const portfolioItems = await ctx.db
      .query("portfolio")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const transactions = wallet
      ? await ctx.db
          .query("walletTransactions")
          .withIndex("by_walletId", (q) => q.eq("walletId", wallet._id))
          .order("desc")
          .take(100)
      : [];
    const loginRows = await ctx.db
      .query("loginHistory")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return {
      exportedAt: new Date().toISOString(),
      user: user
        ? { name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt, accountStatus: user.accountStatus }
        : null,
      settings: settings || null,
      modelProfile: modelProfile || null,
      portfolioItems: portfolioItems.map((i) => ({
        title: i.title,
        imageUrl: i.imageUrl,
        category: i.category,
        description: i.description,
        visibility: i.visibility,
        type: i.type,
        createdAt: i.createdAt,
      })),
      wallet: wallet ? { balance: wallet.balance, currency: wallet.currency } : null,
      transactions: transactions.map((t) => ({
        type: t.type,
        direction: t.direction,
        amount: t.amount,
        status: t.status,
        description: t.description,
        createdAt: t.createdAt,
      })),
      loginHistory: loginRows,
      subscriptions: subscriptions.map((s) => ({
        planName: s.planName,
        status: s.status,
        amount: s.amount,
        startedAt: s.startedAt,
        expiresAt: s.expiresAt,
      })),
    };
  },
});
