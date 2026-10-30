import { createAgentRouter } from "@flue/runtime/routing";
import { Hono } from "hono";
import { CustomerSupport } from "./agents/customer-support";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "/agents/*",
  cors({
    origin: ["http://localhost:5174", "https://frontend.kowonp.workers.dev"],
    allowMethods: ["GET", "HEAD", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Location", "Stream-Next-Offset", "Stream-Up-To-Date"],
  }),
);

app.use("/agents/*", async (context, next) => {
  const token = context.req.header("Authorization");

  if (!token || !token.includes("TEST_TOKEN")) {
    return context.json({ error: "Authentication failed" }, 401);
  }

  await next();
});

app.route("/agents", createAgentRouter(CustomerSupport));

export default app;
