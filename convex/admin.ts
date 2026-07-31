/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const NGN = (n: number) => "₦" + n.toLocaleString("en-NG");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CATEGORY_ICONS: Record<string, string> = {
  Fashion: "Shirt",
  Makeup: "Sparkles",
  Commercial: "Camera",
  Runway: "Zap",
  Lash: "Eye",
  Hair: "Scissors",
  Product: "Package",
  Jewellery: "Gem",
  Skincare: "Droplets",
  "Native Wear": "MapPin",
  Fitness: "Dumbbell",
  Bridal: "Heart",
  Lifestyle: "Sun",
  Editorial: "Image",
  Beverage: "Coffee",
};

function categoryIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (lower.includes(key.toLowerCase())) return CATEGORY_ICONS[key];
  }
  return "Shirt";
}

function shortDate(ms: number | undefined): string {
  if (!ms) return "—";
  return new Date(ms).toISOString().slice(0, 10);
}

async function getUserMap(ctx: any, ids: string[]) {
  const map = new Map<string, any>();
  for (const id of new Set(ids)) {
    if (!id) continue;
    const user = await ctx.db.get(id);
    if (user) map.set(id, user);
  }
  return map;
}

export const stats = query({
  handler: async (ctx) => {
    const [users, profiles, bProfiles, bookings, walletTxns, vRequests, categories] =
      await Promise.all([
        ctx.db.query("users").collect(),
        ctx.db.query("modelProfiles").collect(),
        ctx.db.query("businessProfiles").collect(),
        ctx.db.query("bookings").collect(),
        ctx.db.query("walletTransactions").collect(),
        ctx.db.query("verificationRequests").collect(),
        ctx.db.query("categories").collect(),
      ]);

    const models = users.filter((u) => u.role === "model");
    const businesses = users.filter((u) => u.role === "business");
    const profileByUser = new Map(profiles.map((p) => [p.userId, p]));

    const verifiedModels = profiles.filter((p) => p.isVerified).length;
    const pendingVerification = vRequests.filter((r) => r.status === "pending").length;
    const availableToday = profiles.filter((p) => p.isAvailable).length;
    const suspendedModels = models.filter((u) => u.accountStatus === "suspended").length;
    const activeBusinesses = businesses.filter((u) => u.accountStatus !== "suspended").length;

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === "pending").length;
    const completedBookings = bookings.filter((b) => b.status === "completed").length;
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;

    const completedIn = walletTxns.filter((t) => t.status === "completed" && t.direction === "credit");
    const totalRevenue = completedIn.reduce((sum, t) => sum + t.amount, 0);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaySignups = users.filter((u) => u.createdAt >= startOfToday.getTime()).length;

    const monthly: { month: string; bookings: number; revenue: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const start = d.getTime();
      const end = next.getTime();
      monthly.push({
        month: MONTHS[d.getMonth()],
        bookings: bookings.filter((b) => b.createdAt >= start && b.createdAt < end).length,
        revenue: completedIn
          .filter((t) => t.createdAt >= start && t.createdAt < end)
          .reduce((s, t) => s + t.amount, 0),
      });
    }

    const cityCount = new Map<string, number>();
    for (const p of profiles) {
      const city = p.city || "Unknown";
      cityCount.set(city, (cityCount.get(city) || 0) + 1);
    }
    const topCities = [...cityCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([city, count]) => ({ city, count }));

    const catCount = new Map<string, number>();
    for (const p of profiles) {
      if (p.categories && p.categories.length > 0) {
        const cat = p.categories[0];
        catCount.set(cat, (catCount.get(cat) || 0) + 1);
      }
    }
    const totalWithCategory = [...catCount.values()].reduce((s, c) => s + c, 0) || 1;
    const categoryStats = [...catCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalWithCategory) * 1000) / 10,
      }));

    const activity: { id: string; action: string; target: string; admin: string; timestamp: string }[] = [];
    const audit = await ctx.db.query("auditLogs").order("desc").take(10);
    const adminMap = await getUserMap(ctx, audit.map((a) => a.adminId));
    for (const a of audit) {
      activity.push({
        id: a._id,
        action: a.action,
        target: a.resource,
        admin: adminMap.get(a.adminId)?.name || "Admin",
        timestamp: new Date(a.createdAt).toISOString(),
      });
    }
    const latestUsers = [...users].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
    for (const u of latestUsers) {
      activity.push({
        id: u._id,
        action: u.role === "business" ? "New business registered" : u.role === "admin" ? "New admin account" : "New model registered",
        target: u.name,
        admin: "System",
        timestamp: new Date(u.createdAt).toISOString(),
      });
    }
    const sortedActivity = activity
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);

    const latestModels = [...profiles]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((p) => ({
        id: p._id,
        name: p.displayName,
        city: p.city || "—",
        categories: p.categories || [],
        rating: p.rating ?? 0,
        image: p.imageUrl || p.profilePhotoStorageId || "",
      }));

    return {
      totalModels: models.length,
      verifiedModels,
      pendingVerification,
      availableToday,
      suspendedModels,
      totalBusinesses: businesses.length,
      activeBusinesses,
      totalBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue: NGN(totalRevenue),
      todaySignups,
      monthlyBookingData: monthly,
      topCities,
      categoryStats,
      recentActivity: sortedActivity,
      latestModels,
      totalCategories: categories.length,
    };
  },
});

export const listModels = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "model")).collect();
    const ids = users.map((u) => u._id);
    const profiles = await Promise.all(
      ids.map((id) => ctx.db.query("modelProfiles").withIndex("by_userId", (q) => q.eq("userId", id)).first())
    );
    const bookingCounts = new Map<string, number>();
    for (const p of profiles) {
      if (!p) continue;
      const count = (await ctx.db.query("bookings").withIndex("by_modelUserId", (q) => q.eq("modelUserId", p.userId)).collect()).length;
      bookingCounts.set(p.userId, count);
    }
    return users
      .map((u, i) => {
        const p = profiles[i];
        return {
          id: u._id,
          name: u.name,
          username: p?.username ? "@" + p.username : u.email,
          city: p?.city || "—",
          categories: p?.categories || [],
          isVerified: p?.isVerified ?? false,
          isAvailable: p?.isAvailable ?? true,
          isSuspended: u.accountStatus === "suspended",
          rating: p?.rating ?? 0,
          totalBookings: bookingCounts.get(u._id) ?? 0,
          image: p?.imageUrl || p?.profilePhotoStorageId || "",
          profileImage: p?.imageUrl || p?.profilePhotoStorageId || "",
          joinedDate: shortDate(u.createdAt),
          isFeatured: p?.isFeatured ?? false,
        };
      })
      .sort((a, b) => (a.joinedDate < b.joinedDate ? 1 : -1));
  },
});

export const listBusinesses = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "business")).collect();
    const ids = users.map((u) => u._id);
    const profiles = await Promise.all(
      ids.map((id) => ctx.db.query("businessProfiles").withIndex("by_userId", (q) => q.eq("userId", id)).first())
    );
    const bookingCounts = new Map<string, number>();
    const spendMap = new Map<string, number>();
    for (const p of profiles) {
      if (!p) continue;
      const [count, txns] = await Promise.all([
        (await ctx.db.query("bookings").withIndex("by_businessUserId", (q) => q.eq("businessUserId", p.userId)).collect()).length,
        ctx.db.query("walletTransactions").withIndex("by_userId", (q) => q.eq("userId", p.userId)).collect(),
      ]);
      bookingCounts.set(p.userId, count);
      spendMap.set(p.userId, txns.filter((t) => t.direction === "debit").reduce((s, t) => s + t.amount, 0));
    }
    return users
      .map((u, i) => {
        const p = profiles[i];
        const suspended = u.accountStatus === "suspended";
        return {
          id: u._id,
          name: p?.companyName || u.name,
          email: u.email,
          city: p?.city || p?.state || "—",
          industry: p?.industry || p?.businessCategory || "—",
          isActive: !suspended && p?.profileCompleted !== false,
          isSuspended: suspended,
          totalSpend: NGN(spendMap.get(u._id) ?? 0),
          totalBookings: bookingCounts.get(u._id) ?? 0,
          joinedDate: shortDate(u.createdAt),
          avatar: p?.logoUrl || "",
        };
      })
      .sort((a, b) => (a.joinedDate < b.joinedDate ? 1 : -1));
  },
});

export const listBookings = query({
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").order("desc").take(200);
    const userMap = await getUserMap(ctx, bookings.flatMap((b) => [b.modelUserId, b.businessUserId]));
    const statusMap: Record<string, string> = {
      pending: "Pending",
      confirmed: "Accepted",
      in_progress: "Accepted",
      completed: "Completed",
      cancelled: "Cancelled",
      disputed: "Refunded",
    };
    return bookings.map((b) => ({
      id: b._id,
      modelName: userMap.get(b.modelUserId)?.name || "—",
      businessName: userMap.get(b.businessUserId)?.name || "—",
      category: "—",
      date: shortDate(b.createdAt),
      amount: NGN(parseInt(b.amount || "0", 10) || 0),
      status: statusMap[b.status] || "Pending",
      location: b.location || "—",
    }));
  },
});

export const listVerificationRequests = query({
  handler: async (ctx) => {
    const requests = await ctx.db.query("verificationRequests").order("desc").take(100);
    const userMap = await getUserMap(ctx, requests.map((r) => r.modelUserId));
    return requests.map((r) => ({
      id: r._id,
      modelName: userMap.get(r.modelUserId)?.name || "—",
      modelImage: userMap.get(r.modelUserId)?.imageUrl || "",
      submittedDate: shortDate(r.createdAt),
      documents: {
        idDocument: (r.documents && r.documents.length > 0 ? r.documents.join(", ") : "Submitted").slice(0, 40),
        portfolio: `${(r.documents?.length || 0)} document(s) submitted`,
        facePhoto: r.status === "approved" ? "Verified" : r.status === "pending" ? "Pending review" : r.status === "rejected" ? "Rejected" : "Info requested",
        socialLinks: userMap.get(r.modelUserId)?.email || "—",
      },
      status: r.status,
    }));
  },
});

export const listReviews = query({
  handler: async (ctx) => {
    const reviews = await ctx.db.query("reviews").order("desc").take(200);
    const userMap = await getUserMap(ctx, reviews.flatMap((r) => [r.reviewerId, r.modelUserId]));
    return reviews.map((r) => ({
      id: r._id,
      modelName: userMap.get(r.modelUserId)?.name || "—",
      reviewerName: userMap.get(r.reviewerId)?.name || "—",
      rating: r.rating,
      comment: r.comment || "—",
      date: shortDate(r.createdAt),
      isVisible: r.isApproved,
    }));
  },
});

export const listTransactions = query({
  handler: async (ctx) => {
    const txns = await ctx.db.query("walletTransactions").order("desc").take(200);
    const userMap = await getUserMap(ctx, txns.map((t) => t.userId));
    const statusMap: Record<string, string> = {
      completed: "Completed",
      pending: "Pending",
      failed: "Failed",
      cancelled: "Cancelled",
    };
    return txns.map((t) => {
      const name = userMap.get(t.userId)?.name || "—";
      const type = t.type === "withdrawal" ? "withdrawal" : t.type === "funding" ? "booking_fee" : "refund";
      return {
        id: t._id,
        type,
        amount: NGN(t.amount),
        modelName: t.type === "withdrawal" ? name : "—",
        businessName: t.type === "funding" || t.type === "booking_credit" ? name : "—",
        date: shortDate(t.createdAt),
        status: statusMap[t.status] || "Completed",
      };
    });
  },
});

export const listReports = query({
  handler: async (ctx) => {
    const reports = await ctx.db.query("reports").order("desc").take(100);
    const userMap = await getUserMap(ctx, reports.flatMap((r) => [r.reporterId, r.reportedUserId]));
    const statusMap: Record<string, string> = {
      pending: "Open",
      reviewed: "Investigating",
      warned: "Closed",
      suspended: "Closed",
      banned: "Closed",
      dismissed: "Closed",
    };
    return reports.map((r) => ({
      id: r._id,
      reporterName: userMap.get(r.reporterId)?.name || "—",
      reportedUser: userMap.get(r.reportedUserId)?.name || "—",
      reason: r.reason,
      description: r.description || "—",
      date: shortDate(r.createdAt),
      status: statusMap[r.status] || "Open",
    }));
  },
});

export const listSupportTickets = query({
  handler: async (ctx) => {
    const tickets = await ctx.db.query("supportTickets").order("desc").take(100);
    const userMap = await getUserMap(ctx, tickets.map((t) => t.userId));
    const statusMap: Record<string, string> = {
      open: "Open",
      in_progress: "In Progress",
      resolved: "Resolved",
      closed: "Resolved",
    };
    const priorityMap: Record<string, string> = {
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "High",
    };
    return tickets.map((t) => ({
      id: t._id,
      userName: userMap.get(t.userId)?.name || "—",
      subject: t.subject,
      message: t.message,
      date: shortDate(t.createdAt),
      status: statusMap[t.status] || "Open",
      priority: priorityMap[t.priority] || "Medium",
    }));
  },
});

export const listAdmins = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "admin")).collect();
    return users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: "Admin",
      avatar: u.imageUrl || "",
      lastActive: u.lastActive ? new Date(u.lastActive).toISOString() : "—",
    }));
  },
});

export const listAuditLogs = query({
  handler: async (ctx) => {
    const logs = await ctx.db.query("auditLogs").order("desc").take(100);
    const adminMap = await getUserMap(ctx, logs.map((l) => l.adminId));
    return logs.map((l) => {
      const d = new Date(l.createdAt);
      return {
        id: l._id,
        adminName: adminMap.get(l.adminId)?.name || "System",
        action: l.action,
        target: l.resource,
        date: d.toISOString().slice(0, 10),
        time: d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }),
        device: "—",
        ip: "—",
      };
    });
  },
});

export const listNotifications = query({
  handler: async (ctx) => {
    const notifs = await ctx.db.query("notifications").order("desc").take(100);
    const userMap = await getUserMap(ctx, notifs.map((n) => n.recipientUserId));
    return notifs.map((n) => {
      const role = userMap.get(n.recipientUserId)?.role;
      return {
        id: n._id,
        title: n.title,
        message: n.message,
        recipients: role === "model" ? "Models" : role === "business" ? "Businesses" : role === "admin" ? "Admin" : "All",
        date: shortDate(n.createdAt),
        sent: true,
      };
    });
  },
});

export const listCategories = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").order("asc").collect();
    return categories.map((c) => ({
      id: c._id,
      name: c.name,
      icon: categoryIcon(c.name),
      count: c.count,
      order: c.order,
    }));
  },
});

export const setAccountStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("suspended")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { accountStatus: args.status });
  },
});

export const setModelVerified = mutation({
  args: {
    userId: v.id("users"),
    verified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("modelProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (profile) {
      await ctx.db.patch(profile._id, { isVerified: args.verified, updatedAt: Date.now() });
    }
  },
});

export const setFeatured = mutation({
  args: {
    userId: v.id("users"),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("modelProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (profile) {
      await ctx.db.patch(profile._id, { isFeatured: args.isFeatured, updatedAt: Date.now() });
    }
  },
});

export const setVerificationStatus = mutation({
  args: {
    requestId: v.id("verificationRequests"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("info_requested")
    ),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return;
    await ctx.db.patch(args.requestId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    if (args.status === "approved") {
      const profile = await ctx.db
        .query("modelProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", request.modelUserId))
        .first();
      if (profile) {
        await ctx.db.patch(profile._id, { isVerified: true, updatedAt: Date.now() });
      }
    }
  },
});

export const setReviewVisibility = mutation({
  args: {
    reviewId: v.id("reviews"),
    isApproved: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reviewId, { isApproved: args.isApproved });
  },
});

export const setReportStatus = mutation({
  args: {
    reportId: v.id("reports"),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("warned"),
      v.literal("suspended"),
      v.literal("banned"),
      v.literal("dismissed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reportId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const setTicketStatus = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const deleteModel = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const hasBookings = await ctx.db
      .query("bookings")
      .withIndex("by_modelUserId", (q) => q.eq("modelUserId", args.userId))
      .first();
    const hasApplications = await ctx.db
      .query("applications")
      .withIndex("by_modelUserId", (q) => q.eq("modelUserId", args.userId))
      .first();
    if (hasBookings || hasApplications) {
      return { ok: false, message: "This model has bookings or applications and cannot be deleted" };
    }
    const profile = await ctx.db
      .query("modelProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (profile) {
      const items = await ctx.db.query("portfolio").withIndex("by_modelProfileId", (q) => q.eq("modelProfileId", profile._id)).collect();
      for (const item of items) await ctx.db.delete(item._id);
      const albums = await ctx.db.query("albums").withIndex("by_modelProfileId", (q) => q.eq("modelProfileId", profile._id)).collect();
      for (const album of albums) {
        const albumItems = await ctx.db.query("albumItems").withIndex("by_albumId", (q) => q.eq("albumId", album._id)).collect();
        for (const ai of albumItems) await ctx.db.delete(ai._id);
        await ctx.db.delete(album._id);
      }
      await ctx.db.delete(profile._id);
    }
    await ctx.db.delete(args.userId);
    return { ok: true, message: "" };
  },
});

export const deleteBusiness = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const hasBookings = await ctx.db
      .query("bookings")
      .withIndex("by_businessUserId", (q) => q.eq("businessUserId", args.userId))
      .first();
    if (hasBookings) {
      return { ok: false, message: "This business has bookings and cannot be deleted" };
    }
    const profile = await ctx.db
      .query("businessProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (profile) await ctx.db.delete(profile._id);
    await ctx.db.delete(args.userId);
    return { ok: true, message: "" };
  },
});

export const broadcastNotification = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    recipients: v.union(v.literal("all"), v.literal("models"), v.literal("businesses")),
  },
  handler: async (ctx, args) => {
    let users;
    if (args.recipients === "models") {
      users = await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "model")).collect();
    } else if (args.recipients === "businesses") {
      users = await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "business")).collect();
    } else {
      users = await ctx.db.query("users").collect();
    }
    for (const u of users) {
      await ctx.db.insert("notifications", {
        recipientUserId: u._id,
        type: "system",
        title: args.title,
        message: args.message,
        isRead: false,
        createdAt: Date.now(),
      });
    }
    return users.length;
  },
});

export const logAudit = mutation({
  args: {
    adminId: v.id("users"),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLogs", {
      adminId: args.adminId,
      action: args.action,
      resource: args.resource,
      resourceId: args.resourceId,
      details: args.details,
      createdAt: Date.now(),
    });
  },
});
