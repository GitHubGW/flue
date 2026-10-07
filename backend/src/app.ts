import { createAgentRouter } from "@flue/runtime/routing";
import { Hono } from "hono";
import { CustomerSupport } from "./agents/customer-support";

const app = new Hono();

app.use("/agents/*", async (context, next) => {
  const token = context.req.header("Authorization");
  console.log("token", token);

  if (!token || !token.includes("TEST_TOKEN")) {
    return context.json({ error: "Authentication failed" }, 401);
  }

  await next();
});

app.route("/agents", createAgentRouter(CustomerSupport));

export default app;
