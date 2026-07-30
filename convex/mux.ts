import { v } from "convex/values";
import { action, query, mutation, httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const MUX_BASE = "https://api.mux.com";

async function muxFetch(path: string, options: RequestInit = {}) {
  const tokenId = process.env.MUX_TOKEN_ID!;
  const tokenSecret = process.env.MUX_TOKEN_SECRET!;
  const auth = btoa(`${tokenId}:${tokenSecret}`);
  const res = await fetch(`${MUX_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mux API error ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

export const generateMuxUploadUrl = action({
  args: {
    corsOrigin: v.string(),
    playbackPolicy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const body = {
      new_asset_settings: {
        playback_policy: [args.playbackPolicy || "public"],
        advanced_playback: false,
      },
      cors_origin: args.corsOrigin,
    };
    const data = await muxFetch("/video/v1/uploads", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const upload = data.data;
    await ctx.runMutation(api.mux.saveUpload, {
      uploadId: upload.id,
      status: upload.status,
      assetId: upload.asset_id || null,
    });
    return { uploadUrl: upload.url, uploadId: upload.id, status: upload.status };
  },
});

export const getUploadStatus = action({
  args: { uploadId: v.string() },
  handler: async (_ctx, args) => {
    const data = await muxFetch(`/video/v1/uploads/${args.uploadId}`);
    const upload = data.data;
    let asset = null;
    if (upload.asset_id) {
      const assetData = await muxFetch(`/video/v1/assets/${upload.asset_id}`);
      asset = assetData.data;
    }
    return {
      status: upload.status,
      assetId: upload.asset_id || null,
      playbackId: asset?.playback_ids?.[0]?.id || null,
      duration: asset?.duration || null,
      aspectRatio: asset?.aspect_ratio || null,
      thumbnailUrl: asset?.playback_ids?.[0]?.id
        ? `https://image.mux.com/${asset.playback_ids[0].id}/thumbnail.jpg`
        : null,
    };
  },
});

export const checkAndUpdateStatus = action({
  args: {
    portfolioId: v.id("portfolio"),
    muxUploadId: v.string(),
  },
  handler: async (ctx, args) => {
    const uploadData = await muxFetch(`/video/v1/uploads/${args.muxUploadId}`);
    const upload = uploadData.data;
    if (!upload.asset_id) return { updated: false, reason: "no_asset_yet" };

    const assetData = await muxFetch(`/video/v1/assets/${upload.asset_id}`);
    const asset = assetData.data;
    const playbackId = asset.playback_ids?.[0]?.id;

    if (asset.status === "ready" && playbackId) {
      await ctx.runMutation(api.mux.onAssetReady, {
        assetId: upload.asset_id,
        playbackId,
        duration: asset.duration || null,
        aspectRatio: asset.aspect_ratio || null,
        status: "ready",
        uploadId: args.muxUploadId,
      });
      return { updated: true, status: "ready", playbackId };
    }

    if (asset.status === "errored") {
      await ctx.runMutation(api.mux.onAssetErrored, {
        assetId: upload.asset_id,
        status: "errored",
        uploadId: args.muxUploadId,
      });
      return { updated: true, status: "errored" };
    }

    return { updated: false, reason: "still_processing", status: asset.status };
  },
});

export const deleteAsset = action({
  args: { assetId: v.string() },
  handler: async (_ctx, args) => {
    await muxFetch(`/video/v1/assets/${args.assetId}`, { method: "DELETE" });
  },
});

export const saveUpload = mutation({
  args: {
    uploadId: v.string(),
    status: v.string(),
    assetId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("muxUploads", {
      uploadId: args.uploadId,
      status: args.status,
      assetId: args.assetId || undefined,
      createdAt: Date.now(),
    });
  },
});

export const getMuxUpload = query({
  args: { uploadId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("muxUploads")
      .filter((q) => q.eq(q.field("uploadId"), args.uploadId))
      .first();
  },
});

async function verifyMuxSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) return false;
  const secret = process.env.MUX_WEBHOOK_SIGNING_SECRET;
  if (!secret) return false;

  const parts = signatureHeader.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});
  const timestamp = parts['t'];
  const sig = parts['v1'];
  if (!timestamp || !sig) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > 300) return false;

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['verify']
  );
  const expected = await crypto.subtle.sign(
    'HMAC', key,
    new TextEncoder().encode(`${timestamp}.${rawBody}`)
  );
  const expectedHex = Array.from(new Uint8Array(expected)).map(b => b.toString(16).padStart(2, '0')).join('');
  return expectedHex === sig;
}

export const handleMuxWebhook = httpAction(async (ctx, request) => {
  const rawBody = await request.text();
  const signature = request.headers.get('Mux-Signature');
  const verified = await verifyMuxSignature(rawBody, signature);
  if (!verified) {
    console.warn("[Mux Webhook] Signature verification failed — check MUX_WEBHOOK_SIGNING_SECRET");
    return new Response("unauthorized", { status: 401 });
  }

  const body = JSON.parse(rawBody);
  console.log("[Mux Webhook]", body.type, JSON.stringify(body.data).slice(0, 500));

  const event = body.type as string;
  const data = body.data;

  if (event === "video.upload.asset_created" || event === "video.asset.created") {
    const uploadId = data.upload_id;
    const assetId = data.id;
    if (uploadId && assetId) {
      await ctx.runMutation(api.mux.updateUpload, {
        uploadId,
        assetId,
        status: "asset_created",
      });
    }
  }

  if (event === "video.asset.ready") {
    const assetId = data.id;
    const playbackId = data.playback_ids?.[0]?.id;
    if (assetId && playbackId) {
      await ctx.runMutation(api.mux.onAssetReady, {
        assetId,
        playbackId,
        duration: data.duration || null,
        aspectRatio: data.aspect_ratio || null,
        status: data.status,
        uploadId: data.upload_id || null,
      });
    }
  }

  if (event === "video.asset.errored") {
    const assetId = data.id;
    if (assetId) {
      await ctx.runMutation(api.mux.onAssetErrored, {
        assetId,
        status: data.status || "errored",
        uploadId: data.upload_id || null,
      });
    }
  }

  if (event === "video.asset.deleted") {
    const assetId = data.id;
    if (assetId) {
      await ctx.runMutation(api.mux.onAssetDeleted, { assetId });
    }
  }

  return new Response("ok", { status: 200 });
});

export const updateUpload = mutation({
  args: {
    uploadId: v.string(),
    assetId: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("muxUploads")
      .filter((q) => q.eq(q.field("uploadId"), args.uploadId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        assetId: args.assetId || existing.assetId,
        status: args.status,
      });
    }
    if (args.assetId) {
      const portfolio = await ctx.db
        .query("portfolio")
        .filter((q) => q.eq(q.field("muxUploadId"), args.uploadId))
        .first();
      if (portfolio) {
        await ctx.db.patch(portfolio._id, { muxAssetId: args.assetId });
      }
    }
  },
});

export const onAssetReady = mutation({
  args: {
    assetId: v.string(),
    playbackId: v.string(),
    duration: v.optional(v.union(v.number(), v.null())),
    aspectRatio: v.optional(v.union(v.string(), v.null())),
    status: v.string(),
    uploadId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    if (args.uploadId) {
      const upload = await ctx.db
        .query("muxUploads")
        .filter((q) => q.eq(q.field("uploadId"), args.uploadId))
        .first();
      if (upload) {
        await ctx.db.patch(upload._id, { status: "ready" });
      }
    }
    let portfolio = await ctx.db
      .query("portfolio")
      .filter((q) => q.eq(q.field("muxAssetId"), args.assetId))
      .first();
    if (!portfolio && args.uploadId) {
      portfolio = await ctx.db
        .query("portfolio")
        .filter((q) => q.eq(q.field("muxUploadId"), args.uploadId))
        .first();
    }
    if (portfolio) {
      await ctx.db.patch(portfolio._id, {
        muxAssetId: args.assetId,
        playbackId: args.playbackId,
        duration: args.duration ?? undefined,
        aspectRatio: args.aspectRatio ?? undefined,
        status: "ready",
        thumbnailUrl: `https://image.mux.com/${args.playbackId}/thumbnail.jpg`,
      });
    }
  },
});

export const onAssetErrored = mutation({
  args: {
    assetId: v.string(),
    status: v.string(),
    uploadId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    let portfolio = await ctx.db
      .query("portfolio")
      .filter((q) => q.eq(q.field("muxAssetId"), args.assetId))
      .first();
    if (!portfolio && args.uploadId) {
      portfolio = await ctx.db
        .query("portfolio")
        .filter((q) => q.eq(q.field("muxUploadId"), args.uploadId))
        .first();
    }
    if (portfolio) {
      await ctx.db.patch(portfolio._id, { status: "errored" });
    }
  },
});

export const onAssetDeleted = mutation({
  args: { assetId: v.string() },
  handler: async (ctx, args) => {
    const portfolio = await ctx.db
      .query("portfolio")
      .filter((q) => q.eq(q.field("muxAssetId"), args.assetId))
      .first();
    if (portfolio) {
      await ctx.db.patch(portfolio._id, {
        playbackId: undefined,
        muxAssetId: undefined,
        status: "deleted",
      });
    }
  },
});
