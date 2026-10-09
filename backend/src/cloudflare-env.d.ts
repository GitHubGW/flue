import type { Sandbox } from "@cloudflare/sandbox";

declare global {
  namespace Cloudflare {
    interface Env {
      Sandbox: DurableObjectNamespace<Sandbox>;
    }
  }
}
