import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    firebaseUid: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.optional(v.union(v.literal("model"), v.literal("business"), v.literal("admin"))),
    imageUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    profileCompleted: v.boolean(),
    onboardingStep: v.optional(v.number()),
    createdAt: v.number(),
    lastActive: v.optional(v.number()),
    isOnline: v.optional(v.boolean()),
  })
    .index("by_firebaseUid", ["firebaseUid"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  modelProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    username: v.optional(v.string()),
    tagline: v.optional(v.string()),
    bio: v.optional(v.string()),
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
    dressSize: v.optional(v.string()),
    suitSize: v.optional(v.string()),
    collarSize: v.optional(v.string()),
    inseam: v.optional(v.string()),
    shoeSize: v.optional(v.string()),
    eyeColor: v.optional(v.string()),
    hairColor: v.optional(v.string()),
    skinTone: v.optional(v.string()),
    tattoos: v.optional(v.string()),
    piercings: v.optional(v.string()),
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
    profilePhotoStorageId: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    videoThumbnail: v.optional(v.string()),
    isVerified: v.boolean(),
    isFeatured: v.optional(v.boolean()),
    isPro: v.optional(v.boolean()),
    isAvailable: v.boolean(),
    profileCompleted: v.boolean(),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    profileViews: v.optional(v.number()),
    applicationCount: v.optional(v.number()),
    invitationCount: v.optional(v.number()),
    completedJobs: v.optional(v.number()),
    totalEarnings: v.optional(v.number()),
    availability: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_city", ["city"])
    .index("by_isVerified", ["isVerified"])
    .index("by_isFeatured", ["isFeatured"])
    .index("by_isAvailable", ["isAvailable"])
    .index("by_categories", ["categories"]),

  portfolio: defineTable({
    modelProfileId: v.id("modelProfiles"),
    userId: v.id("users"),
    imageUrl: v.string(),
    imageStorageId: v.optional(v.string()),
    title: v.optional(v.string()),
    type: v.optional(v.union(v.literal("image"), v.literal("video"))),
    videoUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    category: v.union(
      v.literal("portrait"),
      v.literal("fashion"),
      v.literal("commercial"),
      v.literal("editorial"),
      v.literal("fitness"),
      v.literal("runway"),
      v.literal("beauty"),
      v.literal("lifestyle"),
      v.literal("swimwear"),
      v.literal("product"),
      v.literal("other")
    ),
    description: v.optional(v.string()),
    muxUploadId: v.optional(v.string()),
    muxAssetId: v.optional(v.string()),
    playbackId: v.optional(v.string()),
    duration: v.optional(v.number()),
    aspectRatio: v.optional(v.string()),
    status: v.optional(v.union(v.literal("processing"), v.literal("ready"), v.literal("errored"), v.literal("deleted"))),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("hidden"))),
    albumId: v.optional(v.id("albums")),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_modelProfileId", ["modelProfileId"])
    .index("by_userId", ["userId"])
    .index("by_category", ["category"])
    .index("by_muxUploadId", ["muxUploadId"])
    .index("by_muxAssetId", ["muxAssetId"])
    .index("by_albumId", ["albumId"]),

  muxUploads: defineTable({
    uploadId: v.string(),
    assetId: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
  })
    .index("by_uploadId", ["uploadId"]),

  albums: defineTable({
    modelProfileId: v.id("modelProfiles"),
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    coverStorageId: v.optional(v.string()),
    category: v.union(
      v.literal("portrait"),
      v.literal("fashion"),
      v.literal("commercial"),
      v.literal("editorial"),
      v.literal("fitness"),
      v.literal("runway"),
      v.literal("beauty"),
      v.literal("lifestyle"),
      v.literal("swimwear"),
      v.literal("product"),
      v.literal("other")
    ),
    visibility: v.union(v.literal("public"), v.literal("private"), v.literal("hidden")),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_modelProfileId", ["modelProfileId"])
    .index("by_userId", ["userId"]),

  albumItems: defineTable({
    albumId: v.id("albums"),
    portfolioId: v.id("portfolio"),
    order: v.number(),
    addedAt: v.number(),
  })
    .index("by_albumId", ["albumId"])
    .index("by_portfolioId", ["portfolioId"]),

  businessProfiles: defineTable({
    userId: v.id("users"),
    companyName: v.string(),
    businessCategory: v.optional(v.string()),
    industry: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    logoStorageId: v.optional(v.string()),
    address: v.optional(v.string()),
    country: v.optional(v.string()),
    state: v.optional(v.string()),
    city: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    phone: v.optional(v.string()),
    profileCompleted: v.boolean(),
    isVerified: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  jobRequests: defineTable({
    businessUserId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    location: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    duration: v.optional(v.string()),
    budget: v.optional(v.string()),
    modelsNeeded: v.optional(v.number()),
    genderRequirement: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_businessUserId", ["businessUserId"])
    .index("by_status", ["status"]),

  invitations: defineTable({
    businessUserId: v.id("users"),
    modelUserId: v.id("users"),
    jobRequestId: v.optional(v.id("jobRequests")),
    title: v.string(),
    message: v.optional(v.string()),
    proposedDate: v.optional(v.string()),
    proposedRate: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_businessUserId", ["businessUserId"])
    .index("by_modelUserId", ["modelUserId"])
    .index("by_status", ["status"]),

  applications: defineTable({
    modelUserId: v.id("users"),
    jobRequestId: v.id("jobRequests"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("withdrawn")
    ),
    message: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_modelUserId", ["modelUserId"])
    .index("by_jobRequestId", ["jobRequestId"])
    .index("by_status", ["status"]),

  bookings: defineTable({
    businessUserId: v.id("users"),
    modelUserId: v.id("users"),
    jobRequestId: v.optional(v.id("jobRequests")),
    title: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    location: v.string(),
    amount: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("disputed")
    ),
    paymentStatus: v.optional(
      v.union(
        v.literal("unpaid"),
        v.literal("paid"),
        v.literal("refunded"),
        v.literal("disputed")
      )
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_businessUserId", ["businessUserId"])
    .index("by_modelUserId", ["modelUserId"])
    .index("by_status", ["status"]),

  messages: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_senderId", ["senderId"])
    .index("by_receiverId", ["receiverId"])
    .index("by_conversation", ["senderId", "receiverId"]),

  reviews: defineTable({
    reviewerId: v.id("users"),
    modelUserId: v.id("users"),
    bookingId: v.optional(v.id("bookings")),
    rating: v.number(),
    comment: v.optional(v.string()),
    isApproved: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_modelUserId", ["modelUserId"])
    .index("by_reviewerId", ["reviewerId"]),

  savedModels: defineTable({
    businessUserId: v.id("users"),
    modelUserId: v.id("users"),
    folder: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_businessUserId", ["businessUserId"])
    .index("by_modelUserId", ["modelUserId"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    isRead: v.boolean(),
    link: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_isRead", ["isRead"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    count: v.number(),
    order: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_order", ["order"]),

  verificationRequests: defineTable({
    modelUserId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("info_requested")
    ),
    documents: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    reviewedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_modelUserId", ["modelUserId"])
    .index("by_status", ["status"]),

  supportTickets: defineTable({
    userId: v.id("users"),
    subject: v.string(),
    message: v.string(),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    assignedTo: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  reports: defineTable({
    reporterId: v.id("users"),
    reportedUserId: v.id("users"),
    reason: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("warned"),
      v.literal("suspended"),
      v.literal("banned"),
      v.literal("dismissed")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_reportedUserId", ["reportedUserId"])
    .index("by_status", ["status"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    modelProfileId: v.id("modelProfiles"),
    planId: v.string(),
    planName: v.string(),
    status: v.union(v.literal("active"), v.literal("expired"), v.literal("cancelled"), v.literal("pending")),
    paymentProvider: v.literal("paystack"),
    transactionReference: v.string(),
    amount: v.number(),
    currency: v.string(),
    startedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_modelProfileId", ["modelProfileId"])
    .index("by_transactionReference", ["transactionReference"])
    .index("by_status", ["status"]),

  auditLogs: defineTable({
    adminId: v.id("users"),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    details: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_adminId", ["adminId"])
    .index("by_action", ["action"]),
});
