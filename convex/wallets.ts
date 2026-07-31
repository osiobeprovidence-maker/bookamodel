import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

const MIN_FUNDING_AMOUNT = 1000;
const FUNDING_CREDIT_AMOUNT = 900;
const FUNDING_FEE_AMOUNT = MIN_FUNDING_AMOUNT - FUNDING_CREDIT_AMOUNT;
const MODEL_MIN_WITHDRAWAL = 5000;

function assertWalletRole(role: "model" | "business" | "admin" | undefined): "model" | "business" {
  if (role !== "model" && role !== "business") {
    throw new Error("Wallets are only available for model and business accounts");
  }
  return role;
}

function generateReference(): string {
  return `BMW_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const getWallet = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!wallet) return null;

    const transactions = await ctx.db
      .query("walletTransactions")
      .withIndex("by_walletId", (q) => q.eq("walletId", wallet._id))
      .order("desc")
      .take(25);

    return { wallet, transactions };
  },
});

export const ensureWallet = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (existing) return existing._id;

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("wallets", {
      userId: args.userId,
      role: assertWalletRole(user.role),
      balance: 0,
      currency: "NGN",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const createFundingSession = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    provider: v.literal("paystack"),
  },
  handler: async (ctx, args) => {
    if (args.amount < MIN_FUNDING_AMOUNT) {
      throw new Error(`Minimum wallet funding is NGN ${MIN_FUNDING_AMOUNT.toLocaleString()}`);
    }

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    assertWalletRole(user.role);

    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!wallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId: args.userId,
        role: assertWalletRole(user.role),
        balance: 0,
        currency: "NGN",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      wallet = await ctx.db.get(walletId);
    }
    if (!wallet) throw new Error("Unable to create wallet");

    const reference = generateReference();
    const creditAmount = args.amount === MIN_FUNDING_AMOUNT
      ? FUNDING_CREDIT_AMOUNT
      : Math.max(0, args.amount - FUNDING_FEE_AMOUNT);

    const transactionId = await ctx.db.insert("walletTransactions", {
      walletId: wallet._id,
      userId: args.userId,
      type: "funding",
      direction: "credit",
      amount: creditAmount,
      grossAmount: args.amount,
      feeAmount: args.amount - creditAmount,
      currency: "NGN",
      status: "pending",
      provider: args.provider,
      reference,
      description: "Wallet funding via Paystack",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      transactionId,
      reference,
      amount: args.amount,
      creditAmount,
      currency: "NGN",
    };
  },
});

export const creditVerifiedFunding = mutation({
  args: {
    transactionId: v.id("walletTransactions"),
    reference: v.string(),
    verifiedAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) throw new Error("Funding transaction not found");
    if (transaction.reference !== args.reference) throw new Error("Payment reference mismatch");
    if (transaction.status === "completed") return { success: true };
    if (transaction.status !== "pending") throw new Error("Funding transaction is not pending");
    if ((transaction.grossAmount ?? 0) !== args.verifiedAmount) {
      throw new Error("Verified amount does not match funding amount");
    }

    const wallet = await ctx.db.get(transaction.walletId);
    if (!wallet) throw new Error("Wallet not found");

    const now = Date.now();
    await ctx.db.patch(wallet._id, {
      balance: wallet.balance + transaction.amount,
      updatedAt: now,
    });
    await ctx.db.patch(transaction._id, {
      status: "completed",
      updatedAt: now,
    });

    return { success: true };
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
  return { verified: true, amount: data.data.amount / 100, currency: data.data.currency };
}

export const verifyAndCreditFunding = action({
  args: {
    transactionId: v.id("walletTransactions"),
    reference: v.string(),
    provider: v.literal("paystack"),
  },
  handler: async (ctx, args) => {
    const verification = await verifyWithPaystack(args.reference);
    if (!verification.verified || verification.currency !== "NGN") {
      throw new Error("Payment verification failed");
    }

    await ctx.runMutation(api.wallets.creditVerifiedFunding, {
      transactionId: args.transactionId,
      reference: args.reference,
      verifiedAmount: verification.amount,
    });

    return { success: true };
  },
});

export const requestWithdrawal = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    accountName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "model") throw new Error("Withdrawals are currently available for model accounts only");
    if (args.amount < MODEL_MIN_WITHDRAWAL) {
      throw new Error(`Minimum withdrawal is NGN ${MODEL_MIN_WITHDRAWAL.toLocaleString()}`);
    }

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!wallet) throw new Error("Wallet not found");
    if (wallet.balance < args.amount) throw new Error("Insufficient wallet balance");

    const now = Date.now();
    await ctx.db.patch(wallet._id, {
      balance: wallet.balance - args.amount,
      updatedAt: now,
    });

    return await ctx.db.insert("walletTransactions", {
      walletId: wallet._id,
      userId: args.userId,
      type: "withdrawal",
      direction: "debit",
      amount: args.amount,
      currency: "NGN",
      status: "pending",
      description: "Withdrawal request",
      metadata: JSON.stringify({
        bankName: args.bankName,
        accountNumber: args.accountNumber,
        accountName: args.accountName,
      }),
      createdAt: now,
      updatedAt: now,
    });
  },
});
