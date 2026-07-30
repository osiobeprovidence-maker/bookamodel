import { httpRouter } from "convex/server";
import { handleMuxWebhook } from "./mux";
import { handlePaystackWebhook } from "./payments";

const http = httpRouter();

http.route({
  path: "/mux-webhook",
  method: "POST",
  handler: handleMuxWebhook,
});

http.route({
  path: "/paystack-webhook",
  method: "POST",
  handler: handlePaystackWebhook,
});

export default http;
