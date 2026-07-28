import { httpAction } from "./_generated/server";

export const handlePaystackWebhook = httpAction(async (ctx, request) => {
  const body = await request.json();
  const event = body.event;
  const data = body.data;

  if (event === "charge.success") {
    const reference = data.reference;
    const metadata = data.metadata?.custom_fields || [];
    const bookingId = metadata.find((m: any) => m.variable_name === "booking_id")?.value;

    if (bookingId) {
      await ctx.runPatch(bookingId as any, {
        paymentStatus: "paid",
        updatedAt: Date.now(),
      });
    }
  }

  if (event === "refund.processed") {
    const reference = data.reference;
    const metadata = data.metadata?.custom_fields || [];
    const bookingId = metadata.find((m: any) => m.variable_name === "booking_id")?.value;

    if (bookingId) {
      await ctx.runPatch(bookingId as any, {
        paymentStatus: "refunded",
        updatedAt: Date.now(),
      });
    }
  }

  return new Response("ok", { status: 200 });
});
