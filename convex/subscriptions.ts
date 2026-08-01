import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

export const PLANS = {
  pro_monthly: { name: "Pro Monthly", price: 5000, currency: "NGN", durationMonths: 1 },
  pro_quarterly: { name: "Pro Quarterly", price: 13500, currency: "NGN", durationMonths: 3 },
  pro_yearly: { name: "Pro Yearly", price: 50000, currency: "NGN", durationMonths: 12 },
} as const;

export type PlanId = keyof typeof PLANS;

export const getUserSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();
  },
});

export const getUserPlan = query({
  args: { modelProfileId: v.id("modelProfiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.modelProfileId);
    if (!profile) return { isPro: false };

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_modelProfileId", (q) => q.eq("modelProfileId", args.modelProfileId))
      .order("desc")
      .first();

    if (!sub || sub.status !== "active") {
      return { isPro: profile.isPro ?? false };
    }

    const now = Date.now();
    if (sub.expiresAt && now > sub.expiresAt) {
      return { isPro: false, expired: true };
    }

    return {
      isPro: true,
      subscription: {
        planId: sub.planId,
        planName: sub.planName,
        status: sub.status,
        startedAt: sub.startedAt,
        expiresAt: sub.expiresAt,
      },
    };
  },
});

export const createPendingSubscription = mutation({
  args: {
    userId: v.id("users"),
    modelProfileId: v.id("modelProfiles"),
    planId: v.string(),
    paymentProvider: v.literal("paystack"),
    transactionReference: v.string(),
  },
  handler: async (ctx, args) => {
    const plan = PLANS[args.planId as PlanId];
    if (!plan) throw new Error("Invalid plan");

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_transactionReference", (q) => q.eq("transactionReference", args.transactionReference))
      .first();
    if (existing) throw new Error("Transaction reference already exists");

    return await ctx.db.insert("subscriptions", {
      userId: args.userId,
      modelProfileId: args.modelProfileId,
      planId: args.planId,
      planName: plan.name,
      status: "pending",
      paymentProvider: args.paymentProvider,
      transactionReference: args.transactionReference,
      amount: plan.price,
      currency: plan.currency,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const activateSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    transactionReference: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) throw new Error("Subscription not found");
    if (sub.status === "active") return sub;
    if (sub.status !== "pending") throw new Error(`Cannot activate subscription with status: ${sub.status}`);

    const plan = PLANS[sub.planId as PlanId];
    if (!plan) throw new Error("Invalid plan");

    const now = Date.now();
    const expiresAt = now + plan.durationMonths * 30 * 24 * 60 * 60 * 1000;

    await ctx.db.patch(sub._id, {
      status: "active",
      startedAt: now,
      expiresAt,
      updatedAt: now,
    });

    await ctx.db.patch(sub.modelProfileId, {
      isPro: true,
      updatedAt: now,
    });

    return { ...sub, status: "active" as const, startedAt: now, expiresAt };
  },
});

function generateReference(): string {
  return `BM_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const createPaymentSession = action({
  args: {
    userId: v.id("users"),
    modelProfileId: v.id("modelProfiles"),
    planId: v.string(),
    paymentProvider: v.literal("paystack"),
  },
  handler: async (ctx, args) => {
    const plan = PLANS[args.planId as PlanId];
    if (!plan) throw new Error("Invalid plan");

    const reference = generateReference();

    const subscriptionId = await ctx.runMutation(api.subscriptions.createPendingSubscription, {
      userId: args.userId,
      modelProfileId: args.modelProfileId,
      planId: args.planId,
      paymentProvider: args.paymentProvider,
      transactionReference: reference,
    });

    return {
      subscriptionId,
      reference,
      amount: plan.price,
      currency: plan.currency,
      planName: plan.name,
    };
  },
});

async function verifyWithPaystack(reference: string): Promise<{ verified: boolean; amount: number; currency: string }> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return { verified: false, amount: 0, currency: "NGN" };

  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const data = await res.json();
  if (!data.status || data.data.status !== "success") {
    return { verified: false, amount: 0, currency: "NGN" };
  }
  return { verified: true, amount: data.data.amount, currency: data.data.currency };
}

export const verifyAndActivate = action({
  args: {
    subscriptionId: v.id("subscriptions"),
    transactionReference: v.string(),
    paymentProvider: v.literal("paystack"),
  },
  handler: async (ctx, args) => {
    const verification = await verifyWithPaystack(args.transactionReference);

    if (!verification.verified) {
      throw new Error("Payment verification failed");
    }

    const result = await ctx.runMutation(api.subscriptions.activateSubscription, {
      subscriptionId: args.subscriptionId,
      transactionReference: args.transactionReference,
    });

    return { success: true, subscription: result };
  },
});

export const cancelSubscription = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();
    if (!sub || sub.status !== "active") {
      throw new Error("No active subscription to cancel");
    }
    await ctx.db.patch(sub._id, {
      status: "cancelled",
      updatedAt: Date.now(),
    });
    await ctx.db.patch(sub.modelProfileId, {
      isPro: false,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("notifications", {
      recipientUserId: args.userId,
      type: "system",
      title: "Subscription cancelled",
      message: `Your ${sub.planName} subscription has been cancelled. Pro benefits remain active until ${new Date(sub.expiresAt ?? Date.now()).toLocaleDateString("en-GB")}.`,
      entityType: "payment",
      entityId: sub._id,
      isRead: false,
      createdAt: Date.now(),
    });
    return true;
  },
});

export const handlePaystackWebhook = mutation({
  args: {
    event: v.string(),
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.event !== "charge.success") return;

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_transactionReference", (q) => q.eq("transactionReference", args.reference))
      .first();
    if (!sub || sub.status !== "pending") return;

    const now = Date.now();
    const plan = PLANS[sub.planId as PlanId];
    if (!plan) return;

    const expiresAt = now + plan.durationMonths * 30 * 24 * 60 * 60 * 1000;

    await ctx.db.patch(sub._id, {
      status: "active",
      startedAt: now,
      expiresAt,
      updatedAt: now,
    });

    await ctx.db.patch(sub.modelProfileId, {
      isPro: true,
      updatedAt: now,
    });
  },
});

export const expireStaleSubscriptions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const subs = await ctx.db.query("subscriptions").collect();
    let expired = 0;
    for (const sub of subs) {
      if (sub.status === "active" && sub.expiresAt && now > sub.expiresAt) {
        await ctx.db.patch(sub._id, { status: "expired", updatedAt: now });
        await ctx.db.patch(sub.modelProfileId, { isPro: false, updatedAt: now });
        expired++;
      }
    }
    return expired;
  },
});
