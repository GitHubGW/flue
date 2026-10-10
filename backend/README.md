# backend

A [Flue](https://flueframework.com) agent project.

## Setup

```sh
npm install
```

The Hello agent uses `cloudflare/@cf/zai-org/glm-5.3-flash` through the Workers AI binding in `wrangler.jsonc`. It does not need a model provider API key in `.env`.

Log in to Cloudflare before calling Workers AI locally:

```sh
npx wrangler login
```

## Talk to your agent

Start the development server with `npm run dev`, then send a message:

```sh
curl -X POST http://localhost:5173/agents/hello/my-first-chat \
  -H 'content-type: application/json' \
  -d '{"kind":"user","body":"Say hello!"}'
```

The POST admits the message. Read the conversation after processing:

```sh
curl 'http://localhost:5173/agents/hello/my-first-chat?view=history'
```

Reuse `my-first-chat` to continue the same conversation. Workers AI calls use your Cloudflare account and its usage allowance.

The smoke test reached Workers AI, but the account's Workers Free plan rejected this model with HTTP 403: `Model @cf/zai-org/glm-5.3-flash is not available on the Workers Free plan`. The model setting is kept as requested; an eligible Cloudflare plan is required for a successful response.

`npx flue run src/agents/hello.ts --message "Say hello!"` runs under Node.js and cannot use the `cloudflare/` binding provider. Use the development server for this starter.

## Develop

```sh
npm run dev
```

The Hello agent is served at `http://localhost:5173/agents/hello` — see `src/app.ts` for the route map and an example request.

## Deploy

```sh
npm run deploy
```

## Cloudflare Sandbox

`CustomerSupport` uses `@cloudflare/sandbox` through Flue's
`cloudflareSandbox(env.Sandbox.getByName(id))`. This requires the Cloudflare
Worker runtime; use `npm run dev`, not the Node-local `flue run` command.

The SDK and the `sandbox-shim` image are pinned to `1.0.0`. Update both together.
`src/sandbox.ts` owns the Durable Object and implements the methods required by
Flue 2.2's `cloudflareSandbox` adapter using `ctx.container` and the SDK's `Files`.
The Dockerfile supplies Node.js, Python, Git, Bash and GNU file utilities, and
copies `sandbox-files/` into `/workspace` for the sales-report example.
Each agent instance ID selects its own sandbox.

The container starts on demand with the `lite` instance size, Internet access
enabled (as on 0.x), and a 10-minute inactivity timeout. The timeout is restored
when the Durable Object restarts. State probes do not start a container.

Commands run through `bash -c` so pipes and redirects work. Each call explicitly
sets its working directory (default `/workspace`) and environment. Unlike 0.x
sessions, `cd` and `export` do not persist to another command; combine dependent
steps in one command or pass `cwd`/`env`. A positive command timeout uses GNU
`timeout`, terminates the process group and returns a nonzero exit code (usually
124). File calls preserve Flue's text/base64 interface and create missing parent
directories for writes.

Local container development requires Docker to be running. Local variables
can stay in `.env` (or use `.dev.vars` instead); the sandbox itself needs no
additional secrets. Authenticate with `npx wrangler login`.

```sh
npm run dev
```

Run the adapter regression tests with Node.js 24, then check types and build:

```sh
npm run test:sandbox
npm run check:types
npm run build
```

The regression tests mock the Cloudflare platform and file helper; they do not
replace a real Docker/Worker integration check. With Docker running, start the
app and ask it to read `brief.md` and `sales.csv`, write `report.md`, and read it
back. The supplied CSV totals 6600 (Keyboard 2000, Monitor 4000, Mouse 600).

### Deploying the 0.x to 1.x migration

Do not use a normal rollback as a recovery plan for this change. Moving the
existing `Sandbox` class to `scheduling_policy: "durable_object"` is a one-way
platform change. The class and binding names and the `v1`/`v2` Durable Object
migration history are preserved; the container application name changes to
`backend-sandbox-v1` to avoid colliding with the old application.

Before production deployment:

1. Follow Cloudflare's prerequisite: verify the existing application on SDK and
   image `0.12.10` first. This checkout contains the final 1.0 implementation,
   not a deployed intermediate 0.12 release.
2. Back up any files needed from old containers. They do not move into the new
   containers; the bundled sample files are recreated from the image.
3. Rehearse in staging with its own Worker **and container application names**.
   Verify command execution, file reads/writes, timeout handling, and restart.
4. After explicitly choosing the cutover, follow the official deployment steps.
   Then verify the new application before separately deleting the old container
   application. The old application may continue to run and incur charges.

The `alarm()` handler intentionally ignores leftover 0.x lifecycle alarms.
This project did not define its own sandbox alarm work.

The Cloudflare account must have Containers access. Container files are not
a durable backup; use external storage if results must survive container resets.

References: [Cloudflare migration guide](https://developers.cloudflare.com/sandbox/sdk/migrate/),
[deployment cutover](https://developers.cloudflare.com/sandbox/sdk/migrate/plan-the-move/),
and [Flue Cloudflare integration](https://flueframework.com/docs/ecosystem/deploy/cloudflare/#connecting-a-remote-sandbox).

## Learn more

- [Flue docs](https://flueframework.com/docs/) — or `npx flue docs` from the terminal.
