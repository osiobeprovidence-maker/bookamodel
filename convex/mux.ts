import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

export const handleMuxWebhook = httpAction(async (ctx, request) => {
  const body = await request.json();
  const event = body.type;

  if (event === "video.asset.ready") {
    const asset = body.data;
    const playbackId = asset.playback_ids?.[0]?.id;
    if (playbackId) {
      const modelProfileId = asset.meta?.model_profile_id;
      if (modelProfileId) {
        await ctx.runPatch(modelProfileId as any, {
          videoUrl: playbackId,
          updatedAt: Date.now(),
        });
      }
    }
  }

  if (event === "video.asset.deleted") {
    const asset = body.data;
    const modelProfileId = asset.meta?.model_profile_id;
    if (modelProfileId) {
      await ctx.runPatch(modelProfileId as any, {
        videoUrl: undefined,
        updatedAt: Date.now(),
      });
    }
  }

  return new Response("ok", { status: 200 });
});
