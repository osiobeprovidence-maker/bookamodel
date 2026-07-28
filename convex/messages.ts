import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  args: {
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const getConversation = query({
  args: {
    user1Id: v.id("users"),
    user2Id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const msgs1 = await ctx.db
      .query("messages")
      .withIndex("by_senderId", (q) => q.eq("senderId", args.user1Id))
      .collect();
    const msgs2 = await ctx.db
      .query("messages")
      .withIndex("by_senderId", (q) => q.eq("senderId", args.user2Id))
      .collect();

    const all = [...msgs1, ...msgs2].filter(
      (m) =>
        (m.senderId === args.user1Id && m.receiverId === args.user2Id) ||
        (m.senderId === args.user2Id && m.receiverId === args.user1Id)
    );
    return all.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const getConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sent = await ctx.db
      .query("messages")
      .withIndex("by_senderId", (q) => q.eq("senderId", args.userId))
      .collect();
    const received = await ctx.db
      .query("messages")
      .withIndex("by_receiverId", (q) => q.eq("receiverId", args.userId))
      .collect();

    const contactIds = new Set<string>();
    for (const m of sent) {
      if (m.receiverId !== args.userId) contactIds.add(m.receiverId);
    }
    for (const m of received) {
      if (m.senderId !== args.userId) contactIds.add(m.senderId);
    }

    const conversations = await Promise.all(
      Array.from(contactIds).map(async (contactId) => {
        const all = [...sent, ...received].filter(
          (m) =>
            (m.senderId === args.userId && m.receiverId === contactId) ||
            (m.senderId === contactId && m.receiverId === args.userId)
        );
        all.sort((a, b) => a.createdAt - b.createdAt);
        const last = all[all.length - 1];
        const unread = all.filter(
          (m) => m.receiverId === args.userId && !m.isRead
        ).length;
        const contact = await ctx.db.get(contactId as any);
        return { contact, lastMessage: last, unread };
      })
    );

    return conversations.sort(
      (a, b) =>
        (b.lastMessage?.createdAt || 0) - (a.lastMessage?.createdAt || 0)
    );
  },
});

export const markAsRead = mutation({
  args: {
    senderId: v.id("users"),
    receiverId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_senderId", (q) => q.eq("senderId", args.senderId))
      .collect();
    for (const m of msgs) {
      if (m.receiverId === args.receiverId && !m.isRead) {
        await ctx.db.patch(m._id, { isRead: true });
      }
    }
  },
});
