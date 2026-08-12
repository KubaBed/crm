# Remaining — Marketing suite

An audit of what is built against
[`marketing-suite.md`](./marketing-suite.md) and
[`marketing-suite-build.md`](./marketing-suite-build.md), done by reading the
code rather than from memory, on 12 August 2026.

The suite works end to end: a real email has gone out through Resend, the
engine walks a branching drip, and the agent can build one. What follows is the
honest gap list, ordered by what actually bites.

---

## 1. It will not send on Vercel — two lines missing

**This is the one that matters.** Everything below it is a feature; this is a
deployment that silently does nothing.

- **`/internal/marketing/drain` has no cron entry** in `apps/api/vercel.json`.
  The other four routes are there. On a serverless deployment nothing calls the
  drain, so nothing ever leaves — no error, no log, just a queue that grows.
  It needs `* * * * *`, and it is why §3 specified a cron *and* a timer.
- **`RESEND_WEBHOOK_SECRET` is not in `.env.example`.** `AGENTS.md` requires
  every new variable to be documented there with a note on what it does. Without
  it a self-hoster has no way to know delivery events need a secret, and the
  webhook refuses every payload.

Both are ten minutes. Do them first.

## 2. Settings that exist but do nothing

Three columns are stored, shown in the API's settings payload, and **never read
by the drain**. A marketer who sets them will believe they took effect.

| Setting | What §12 says it does | What happens |
| --- | --- | --- |
| `marketingQuietStart` / `QuietEnd` | Push `dueAt` forward rather than dropping the send | Ignored. Mail goes out at 3am |
| `marketingDailyCap` | Skip a recipient who has had their cap today, with a reason on the row | Ignored |
| `marketingSendsPerMinute` | Throttle the drain | **Partly done** — the drain sizes its claim from it, but there is no UI to change it |

Either enforce them in `drainSends` or take them off the settings payload. A
setting that lies is worse than a setting that is absent.

There is also **no UI for any of them** — no sending-rate control on the
settings page, so `saveSending` is an unreachable procedure.

## 3. The approval path the plan is built around does not exist

§18's whole design rests on a two-lane rule: a rep in a conversation sends, an
autonomous run stages. Half of it is missing.

- **`schedule_campaign` is not a tool.** The plan lists it, and it is the tool
  that writes `PENDING_APPROVAL`.
- **`update_node` is not a tool.** The plan lists it as the narrow one the
  co-pilot uses for *"make touch three shorter"*. Today the agent must rewrite
  the whole graph to change one line.
- **`PENDING_APPROVAL` is a label and nothing else.** No code sets it, nothing
  lists what is waiting, and there is no review screen. An autonomous run has
  nowhere to leave work.

Twelve of the fourteen tools exist and work. These two, plus the review screen,
are what make the *unattended* half of the agent real.

## 4. Segments are half-wired

The API is complete; the UI reaches about two thirds of it.

- **No way to add somebody to a segment by hand.** `addMember`,
  `excludeMember` and `removeMember` all exist and are covered by
  `segmentWhere`'s INCLUDE/EXCLUDE union — but no screen calls them. §11's
  "rules and hands, on the same segment" is only half true in the product.
- **No *Save as segment* on the contacts list.** §11 calls this the cheapest
  good entry point in the product, and it is one button over the existing filter
  bar.
- **No archive from the UI.**

## 5. Templates are half-wired

- **`duplicate` and `archive` have no UI.** Both procedures exist.
- **No *Send me a test*** from the template editor. §9 lists it as one of the
  four things the preview panel gives, and `marketing.sendTest` already exists —
  it is wired into the wizard only.
- **Partials cannot be edited.** The shell shows as two locked rows that say
  "edit it once in Templates", and then Templates has no shell editor. The rows
  point at a door that is not there.

## 6. Telemetry is one line short

`first_campaign_sent` is in §19 as the single funnel step and is not
implemented. The twenty-five daily properties all are.

## 7. Smaller, and honestly optional

- **Preference centre / pause for 90 days.** §15 offers it as a secondary
  action under the unsubscribe button. Not built.
- **Company sheet** has no marketing action; contacts do.
- **Pipeline counts** show on edges but there is no per-node "waiting" figure on
  the node itself.
- **`EXIT` nodes** cannot be added from the canvas — only the co-pilot or a seed
  can create one.
- **Double opt-in**, SMTP, campaign templates with drips built in, automatic A/B
  winners, and re-entry cooldown presets all remain deliberately deferred in
  §21. Nothing to do.

---

## What is verified, so nobody re-checks it

- **A real email sent** through Resend from `mail.trycomp.ai` (verified domain),
  composed by the same renderer the preview uses, with the postal address,
  unsubscribe link, resolved merge tags and both `List-Unsubscribe` headers.
- **The drain route** was returning 401 to cron because it lacked
  `@AllowAnonymous()`; fixed and exercised.
- **The engine** — 17 specs against Postgres covering re-entry row by row, exit
  sweeps firing between touches, split stability across retries, blast
  idempotency, deliverability auto-pause and event retention.
- **The graph validator** — 12 specs including the hard refusal of a branch on
  `opened` when tracking is off.
- **The canvas node components** — 8 specs server-rendering every node kind.
- **The renderer and linter** — 9 specs.

## Known unknowns

- **The assembled canvas page has never been opened in a browser.** The node
  components are asserted; React Flow's own layout of them is not.
- **The webhook has never received a real Resend delivery event.** Signature
  verification is unexercised.
- **Two `react` copies** remain in `node_modules` (19.2.8 and 19.2.4). Harmless
  today, and the same class of duplicate resolution that broke the agent build.
