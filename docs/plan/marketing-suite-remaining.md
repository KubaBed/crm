# Remaining — Marketing suite

What is built, what is not, and the order to finish it. The decisions are in
[`marketing-suite.md`](./marketing-suite.md); the original phasing is in
[`marketing-suite-build.md`](./marketing-suite-build.md). This file is the
honest delta as of 12 August 2026.

---

## Built and working

| | |
| --- | --- |
| **Schema** | Twelve models, fourteen enums, two migrations applied |
| **`@crm/db/marketing`** | Segment compiler with `compile`/`matches` parity, graph validator, drip engine, send queue, settings |
| **`@crm/email`** | Document schema, renderer, merge, linter, theme. 9 specs |
| **`apps/api/src/marketing`** | Resend client, compose, drain, four routers, drain route, webhook, unsubscribe endpoint |
| **The section** | Sidebar, campaigns list, drip canvas, node sheet with live preview, segments list, templates list, settings, four-step wizard, unsubscribe page |
| **Tests** | 24 marketing specs, 12 of them against real Postgres |

Two bugs were found by building it: `dueAt` compared against `now()` across a
timezone boundary claimed nothing, and Prisma's recursive `JsonValue` blew tRPC's
inference depth in the client. Both are fixed.

---

## 1. The agent's half — Phase 9

**Why first:** the co-pilot rail renders and can hold a conversation, but the
agent has no marketing tool, so it can neither read a campaign nor write one.
Every screen in the section was designed around it. This is the largest single
gap between the plan and the product.

1. `apps/agent/agent/tools/marketing/` — the fourteen tools from §18. Every
   write goes through `@crm/db/marketing`; none holds a transport.
2. **Approval as an eve policy** (§13.6) — draft edits `not-applicable`, live
   edits `user-approval`, an autonomous principal `{ type: "denied" }` with a
   reason rather than a park nobody can answer.
3. `write_campaign_graph` returns `validateGraph`'s problems to the model rather
   than saving, exactly as `write_template` returns lint errors.
4. `send_email` pokes `POST /internal/marketing/drain`, fire and forget.
5. **No `activate_campaign`.** The absence is the control.
6. `lib/preamble.ts` and `agent-transcript.ts`'s `TOOL_VERBS`.
7. A marketing skill: tone, the linter's reasoning, and what a good drip looks
   like — how many touches, how far apart, what to branch on.

**Done when** a rep can type *"four touches over two weeks, branch after the
second on whether they opened"* into the canvas rail and watch the graph appear.

## 2. The two editors — Phases 2 and 3

**Why:** both have list pages that lead nowhere. A marketer cannot write an
email or define a segment without them, which makes the rest of the section
unusable from a cold start.

1. **Block editor** — `packages/ui`: `email-canvas`, `email-block-toolbar`,
   `email-inspector`. The eight block types, reorder, add, delete. Consumed by
   the template page *and* the node sheet, which currently shows a read-only
   block list.
2. `/marketing/templates/[templateId]` — editor beside the live preview and the
   lint panel, dropping the sidebar (editor, not list — §2).
3. **Rule builder** — `packages/ui`: `rule-tree`, over the facet whitelist, with
   the live count in the header. Facets come from the API so a new
   `FieldDefinition` appears with no client change.
4. `/marketing/segments/[segmentId]` — the builder, the sample, and the by-rule
   / by-hand split.
5. **Create sheets** for both, matching the campaign one.
6. Contacts list gains **Save as segment** from the existing filter bar.

## 3. The blast, end to end — Phase 4 remainder

1. The composer sheet for `kind: BLAST` — subject, preheader, template picker,
   from and reply-to, and the audience footer with the exclusion breakdown the
   API already returns.
2. **Send email** on the contact and company sheets, through `sendDirect`.
3. Attachments — `@crm/db/blob`, 40 MB at upload and at compose, absent entirely
   without `BLOB_READ_WRITE_TOKEN`.
4. **Enrol in drip** on the contact sheet, and the enrolments it is on.

## 4. Numbers people act on — Phase 8 remainder

1. The Results tab: per-node stats, the deliverability panel, and §14's two
   caveats beside any open rate.
2. **The 5% hard-bounce auto-pause.** A service rule with its own spec — the one
   place the product overrules the marketer, because the damage outlives the
   campaign.
3. Split reporting, **Declare winner**, and **Promote to template** (§13.4),
   including the line saying how many people stay on the losing arm.
4. Pipeline counts on the canvas edges, from `currentNodeId`.

## 5. Lifecycle in the UI — Phase 6 remainder

The service does all of this; nothing calls it.

1. **Resume asks about the clocks** — restart (default) or send the backlog,
   with the count shown first.
2. **Draining** as a first-class action, and the archive dialog that refuses
   with the active count and offers the two real answers.
3. `reentryCooldownDays` and `maxPasses` in a drip settings panel. They exist
   only in the schema and §13.8 today.

## 6. Telemetry and docs — Phase 10

1. `packages/telemetry/src/allowlist.ts` — the twenty-five properties **first**,
   or they are dropped.
2. The rollup query and `first_campaign_sent`.
3. `docs/telemetry.md` rows, and the marketing entries under *what is never
   sent*.
4. `docs/marketing.md`, added to the table at the top of `AGENTS.md`.

## 7. The brand pass — Phase 5 remainder

`apps/agent/agent/lib/marketing-brand.ts`, a new `DIRECT_KIND` beside `brand`:
Context.dev on the workspace's own domain, `mirror()` the logo, reject an
SVG-only logo for email, contrast-check the colour and darken until it clears
4.5:1, then write the two default partials. Every step optional, nothing throws.

Also: `MarketingEvent` joins the tracking retention sweep at 90 days, with
`BOUNCED` / `COMPLAINED` / `UNSUBSCRIBED` exempt.

---

## Known risks, carried

- **Nothing has sent a real email.** The Resend path, the webhook signature
  check and the batch endpoint are untested against the live service. The first
  real send is the test, and it should be a one-recipient blast to a colleague.
- **The canvas is untested in a browser.** It builds and typechecks; no drip
  with a branch has been rendered on screen.
- **The wizard's Test step sends nothing.** It stamps `marketingOnboardedAt` and
  calls that finished, which is a lie the moment somebody trusts it.
- **`docs/marketing.md` does not exist**, so a future change has no operating
  doc to read first — only these plans.
