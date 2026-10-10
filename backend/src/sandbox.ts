import { Files, SandboxFileError } from "@cloudflare/sandbox";
import type { CloudflareSandboxStub } from "@flue/runtime/cloudflare";
import { DurableObject } from "cloudflare:workers";
import { Buffer } from "node:buffer";
import { posix } from "node:path";

const WORKSPACE = "/workspace";
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;

interface CommandOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
}

interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

interface FileOptions {
  encoding?: string;
}

// Flue 2.2's adapter expects these methods; the implementation uses the 1.x API.
export class Sandbox extends DurableObject<unknown> implements CloudflareSandboxStub {
  private readonly container: Container;
  private readonly files: Files;
  private setup: Promise<void> | null = null;

  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    if (!ctx.container) {
      throw new Error("Sandbox container binding is not configured");
    }
    this.container = ctx.container;
    this.files = new Files(this.container);

    // The timeout must be restored when only the Durable Object restarts.
    if (this.container.running) {
      void ctx.blockConcurrencyWhile(() =>
        this.container.setInactivityTimeout(INACTIVITY_TIMEOUT_MS),
      );
    }
  }

  private ensureRunning(): Promise<void> {
    if (this.setup === null || !this.container.running) {
      this.setup = this.startContainer().catch((error: unknown) => {
        this.setup = null;
        throw error;
      });
    }
    return this.setup;
  }

  private async startContainer(): Promise<void> {
    if (!this.container.running) {
      this.container.start({
        image: this.container.images.workspace,
        instance: "lite",
        enableInternet: true,
      });
    }
    try {
      await this.container.setInactivityTimeout(INACTIVITY_TIMEOUT_MS);
    } catch (error) {
      await this.container.destroy();
      throw error;
    }
  }

  async exec(command: string, options?: CommandOptions): Promise<CommandResult> {
    await this.ensureRunning();
    const timeout = options?.timeout;
    if (timeout !== undefined && (!Number.isFinite(timeout) || timeout < 0)) {
      throw new RangeError("Command timeout must be a non-negative number of milliseconds");
    }
    // Container.exec takes argv, so an explicit shell preserves pipes and redirects.
    // GNU timeout also terminates child processes when the deadline expires.
    const argv = timeout !== undefined && timeout > 0
      ? ["timeout", "--kill-after=5", `${timeout / 1000}s`, "bash", "-c", command]
      : ["bash", "-c", command];
    const process = await this.container.exec(argv, {
      cwd: options?.cwd ?? WORKSPACE,
      env: options?.env,
    });
    const result = await process.output();
    return {
      success: result.exitCode === 0,
      stdout: new TextDecoder().decode(result.stdout),
      stderr: new TextDecoder().decode(result.stderr),
      exitCode: result.exitCode,
    };
  }

  async readFile(path: string, options?: FileOptions): Promise<{ content: string }> {
    await this.ensureRunning();
    const response = await this.files.readFile(path, { cwd: WORKSPACE });
    return {
      content: options?.encoding === "base64"
        ? Buffer.from(await response.arrayBuffer()).toString("base64")
        : await response.text(),
    };
  }

  async writeFile(path: string, content: string, options?: FileOptions): Promise<void> {
    await this.ensureRunning();
    const absolutePath = posix.resolve(WORKSPACE, path);
    await this.files.mkdir(posix.dirname(absolutePath), { recursive: true });
    await this.files.writeFile(
      absolutePath,
      options?.encoding === "base64" ? Buffer.from(content, "base64") : content,
    );
  }

  async exists(path: string): Promise<{ exists: boolean }> {
    await this.ensureRunning();
    try {
      await this.files.stat(path, { cwd: WORKSPACE });
      return { exists: true };
    } catch (error) {
      if (SandboxFileError.is(error) && error.code === "ENOENT") {
        return { exists: false };
      }
      throw error;
    }
  }

  async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    await this.ensureRunning();
    await this.files.mkdir(path, { cwd: WORKSPACE, recursive: options?.recursive });
  }

  async deleteFile(path: string): Promise<void> {
    await this.ensureRunning();
    await this.files.remove(path, { cwd: WORKSPACE });
  }

  async getState(): Promise<{ status: string }> {
    return { status: this.container.running ? "running" : "stopped" };
  }

  // A 0.x alarm can still be pending after an in-place migration.
  async alarm(): Promise<void> {}
}
