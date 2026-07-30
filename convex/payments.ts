import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

export const handlePaystackWebhook = httpAction(async (ctx, request) => {
  const body = await request.json();
  const event = body.event;
  const data = body.data;

  if (event === "charge.success") {
    await ctx.runMutation(api.subscriptions.handlePaystackWebhook, {
      event,
      reference: data.reference,
    });
  }

  return new Response("ok", { status: 200 });
});
