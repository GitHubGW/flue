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
`cloudflareSandbox(getSandbox(env.Sandbox, id))`. This requires the Cloudflare
Worker runtime; use `npm run dev`, not the Node-local `flue run` command.

The SDK and Docker image are both pinned to `0.11.0`. Update both together.
The image copies `sandbox-files/` into `/workspace` to provide the existing
sales-report example. Each agent instance ID selects its own sandbox.

Local container development requires Docker to be running. Local variables
can stay in `.env` (or use `.dev.vars` instead); the sandbox itself needs no
additional secrets. Authenticate with `npx wrangler login`.

```sh
npm run dev
```

To deploy with secrets from the local environment file:

```sh
npm run build
npx wrangler deploy --secrets-file .env
```

The Cloudflare account must have Containers access. Container files are not
a durable backup; use external storage if results must survive container resets.

See the [Flue Cloudflare deployment guide](https://flueframework.com/docs/ecosystem/deploy/cloudflare/#connecting-a-remote-sandbox).

## Learn more

- [Flue docs](https://flueframework.com/docs/) — or `npx flue docs` from the terminal.
