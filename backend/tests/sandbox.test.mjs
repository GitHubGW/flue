import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";

// Exercise the real RPC class with controlled platform/file boundaries.
const modules = {
  "cloudflare:workers": `export class DurableObject {
    constructor(ctx, env) { this.ctx = ctx; this.env = env; }
  }`,
  "@cloudflare/sandbox": `
    export class Files {
      constructor(container) { return container.testFiles; }
    }
    export const SandboxFileError = {
      is: error => error?.name === "SandboxFileError"
    };
  `,
};
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier in modules) {
      return { url: `data:text/javascript,${encodeURIComponent(modules[specifier])}`, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
const { Sandbox } = await import("../src/sandbox.ts");

const createSandbox = ({ running = false, setupError = false } = {}) => {
  const calls = { starts: [], timeouts: [], commands: [], mkdir: [], writes: [] };
  const container = {
    running,
    images: { workspace: "test-image" },
    start(options) { calls.starts.push(options); this.running = true; },
    async setInactivityTimeout(timeout) {
      calls.timeouts.push(timeout);
      if (setupError) { setupError = false; throw new Error("setup failed"); }
    },
    async destroy() { this.running = false; },
    async exec(argv, options) {
      calls.commands.push({ argv, options });
      return { output: async () => ({
        stdout: new TextEncoder().encode("결과\n").buffer,
        stderr: new TextEncoder().encode("실패\n").buffer,
        exitCode: 7,
      }) };
    },
    testFiles: {
      async readFile() { return new Response(Uint8Array.from([0, 128, 255])); },
      async mkdir(...args) { calls.mkdir.push(args); },
      async writeFile(...args) { calls.writes.push(args); },
      async stat() {},
      async remove() {},
    },
  };
  const pending = [];
  const ctx = { container, blockConcurrencyWhile: fn => {
    const promise = fn(); pending.push(promise); return promise;
  } };
  return { sandbox: new Sandbox(ctx, {}), container, calls, pending };
};

test("concurrent first calls share startup; an idle container starts again", async () => {
  const { sandbox, container, calls } = createSandbox();
  await Promise.all([sandbox.exec("pwd"), sandbox.exec("ls")]);
  assert.equal(calls.starts.length, 1);
  assert.equal(calls.timeouts[0], 600_000);
  container.running = false;
  assert.deepEqual(await sandbox.getState(), { status: "stopped" });
  assert.equal(calls.starts.length, 1); // A liveness probe must not wake it.
  await sandbox.exec("pwd");
  assert.equal(calls.starts.length, 2);
});

test("Durable Object restart restores timeout without replacing the running container", async () => {
  const { calls, pending } = createSandbox({ running: true });
  await Promise.all(pending);
  assert.deepEqual(calls.timeouts, [600_000]);
  assert.equal(calls.starts.length, 0);
});

test("setup failure stops the container and a later call can retry", async () => {
  const { sandbox, container, calls } = createSandbox({ setupError: true });
  await assert.rejects(sandbox.exec("pwd"), /setup failed/);
  assert.equal(container.running, false);
  assert.equal(calls.commands.length, 0);
  await sandbox.exec("pwd");
  assert.equal(calls.starts.length, 2);
});

test("shell expressions, cwd, env, output bytes and nonzero exit codes reach Flue correctly", async () => {
  const { sandbox, calls } = createSandbox();
  const command = "printf '%s' \"$NAME\" | cat > result.txt";
  const result = await sandbox.exec(command, { cwd: "/workspace/reports", env: { NAME: "GW" } });
  assert.deepEqual(calls.commands[0], {
    argv: ["bash", "-c", command],
    options: { cwd: "/workspace/reports", env: { NAME: "GW" } },
  });
  assert.deepEqual(result, { success: false, stdout: "결과\n", stderr: "실패\n", exitCode: 7 });
  await sandbox.exec("pwd");
  assert.equal(calls.commands[1].options.cwd, "/workspace");
});

test("timeout milliseconds become a process-group timeout; invalid values cannot execute", async () => {
  const { sandbox, calls } = createSandbox();
  await sandbox.exec("sleep 10", { timeout: 1500 });
  assert.deepEqual(calls.commands[0].argv, ["timeout", "--kill-after=5", "1.5s", "bash", "-c", "sleep 10"]);
  await assert.rejects(sandbox.exec("sleep 10", { timeout: -1 }), RangeError);
  assert.equal(calls.commands.length, 1);
});

test("binary content round-trips as base64 and nested writes create parents", async () => {
  const { sandbox, calls } = createSandbox();
  const { content } = await sandbox.readFile("file.bin", { encoding: "base64" });
  await sandbox.writeFile("reports/file.bin", content, { encoding: "base64" });
  assert.deepEqual(calls.mkdir[0], ["/workspace/reports", { recursive: true }]);
  assert.equal(calls.writes[0][0], "/workspace/reports/file.bin");
  assert.deepEqual([...calls.writes[0][1]], [0, 128, 255]);
});

test("text files preserve Korean and missing files do not hide permission failures", async () => {
  const { sandbox, container, calls } = createSandbox();
  container.testFiles.readFile = async () => new Response("매출 보고서");
  assert.deepEqual(await sandbox.readFile("report.md"), { content: "매출 보고서" });
  await sandbox.writeFile("report.md", "매출 보고서");
  assert.equal(calls.writes[0][1], "매출 보고서");
  assert.deepEqual(await sandbox.exists("report.md"), { exists: true });
  const error = Object.assign(new Error("missing"), { name: "SandboxFileError", code: "ENOENT" });
  container.testFiles.stat = async () => { throw error; };
  assert.deepEqual(await sandbox.exists("missing.md"), { exists: false });
  error.code = "EACCES";
  await assert.rejects(sandbox.exists("private.md"), { code: "EACCES" });
});
