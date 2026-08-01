"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const sendToUser = action({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
    notificationType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (!publicKey || !privateKey) {
      return { sent: 0, total: 0, reason: "vapid-not-configured" };
    }

    const webpush = await import("web-push");
    webpush.setVapidDetails(
      "mailto:osiobeprovidence@gmail.com",
      publicKey,
      privateKey
    );

    const subscriptions = await ctx.runQuery(api.push.listForUser, {
      userId: args.userId,
    });

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      url: args.url || "/",
      type: args.notificationType,
    });

    let sent = 0;
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
          },
          payload,
          { TTL: 86400 }
        );
        sent++;
      } catch (err) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          await ctx.runMutation(api.push.removeSubscription, {
            endpoint: sub.endpoint,
          });
        }
      }
    }

    return { sent, total: subscriptions.length };
  },
});
