import type { Sandbox } from "./sandbox";

declare global {
  namespace Cloudflare {
    interface Env {
      Sandbox: DurableObjectNamespace<Sandbox>;
    }
  }
}
