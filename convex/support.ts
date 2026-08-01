import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createTicket = mutation({
  args: {
    userId: v.id("users"),
    subject: v.string(),
    message: v.string(),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("supportTickets", {
      userId: args.userId,
      subject: args.subject,
      message: args.message,
      priority: args.priority ?? "medium",
      status: "open",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
