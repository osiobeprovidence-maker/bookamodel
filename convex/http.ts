import { httpRouter } from "convex/server";
import { handleMuxWebhook } from "./mux";

const http = httpRouter();

http.route({
  path: "/mux-webhook",
  method: "POST",
  handler: handleMuxWebhook,
});

export default http;
