---
name: crm-api-typescript-sdk
description: "TypeScript SDK for CRM API. Use when writing TypeScript code that calls CRM API with the @trycomp/crm package: installing it, constructing and authenticating the client, and calling API operations."
---

# CRM API TypeScript SDK

Generated TypeScript client for CRM API, published as `@trycomp/crm`. Use the generated client instead of hand-writing HTTP requests.

## Install

```sh
npm install @trycomp/crm
```

## Client setup and authentication

```ts
import CrmAPI from '@trycomp/crm';

const client = new CrmAPI();
```

Provide credentials using the options below. Environment variables are read automatically when the target runtime supports them:

- `cookie` (env: `COOKIE`) — Credential for the cookie scheme.
- `apiKey` (env: `API_KEY`) — Credential for the apiKey scheme.

## Calling operations

```ts
import CrmAPI from '@trycomp/crm';

const client = new CrmAPI();

await client.auth.controllerGetMe();
```

Method names, parameter shapes, and response types are generated from the API description — do not guess them. Look up the exact call signature in [api.md](./api.md) before writing a call.

## Error handling

Non-success responses throw generated API errors. Error objects expose status, headers, response body, and request metadata where the target runtime supports it.

```ts
import { APIError } from '@trycomp/crm';

try {
  await client.auth.controllerGetMe();
} catch (err) {
  if (err instanceof APIError) {
    console.log(err.status, err.name, err.headers);
  }
  throw err;
}
```

## Requirements

- Node.js 20+, a modern browser, or any runtime with `fetch` support

## Reference files

- [README.md](./README.md) — full feature tour: client options, request options, retries and timeouts, logging.
- [api.md](./api.md) — complete catalogue of every operation with request and response types.
