# Marketing suite — what is left

The single list to work from. The design reasoning is in
[`marketing-suite.md`](./marketing-suite.md), the original phasing in
[`marketing-suite-build.md`](./marketing-suite-build.md), and the operating
rules a future change must read first in [`../marketing.md`](../marketing.md).

Written 12 August 2026, after reading the tree rather than from memory.

**Where it stands:** 26 commits on `lewis/marketing-suite`. A real email has gone
out through Resend. The engine walks a branching drip and the agent can build
one. 222 specs pass. What follows is everything that is not done, ordered so
that doing it top to bottom never leaves the product in a worse state than it is
now.

---

## Before this can ship at all

Two lines. Without them a deployment queues mail and silently never sends it.

### 1. Register the drain cron

`apps/api/vercel.json` has cron entries for the other four internal routes and
none for `/internal/marketing/drain`. Add it at `* * * * *`. The in-process
30-second timer covers a long-running container; the cron is the serverless
half, and §3 specified both for exactly this reason.

### 2. Document `RESEND_WEBHOOK_SECRET`

It is read by `MarketingPublicController` and validated in
`env.validation.ts`, but it is not in `.env.example`. `AGENTS.md` requires every
new variable to be there with a note on what it does. Without it, a self-hoster
has no way to learn that delivery events need a secret, and the webhook refuses
every payload it receives.

---

## Settings that lie

Three columns are stored, returned in the settings payload, and never read by
the drain. Somebody who sets them will believe they took effect.

| Setting | §12 says | Reality |
| --- | --- | --- |
| `marketingQuietStart` / `QuietEnd` | Push `dueAt` forward rather than dropping the send | Ignored. Mail goes at 3am |
| `marketingDailyCap` | Skip a recipient over their cap, with the reason on the row | Ignored |
| `marketingSendsPerMinute` | Throttle the drain | Read by the drain, but **no UI** to change it |

Either enforce them in `drainSends` or take them off the payload. A setting that
lies is worse than one that is absent.

Note that the **Paper settings board originally had a rate control and a
reply-to picker** and the implementation dropped both. The design was ahead of
the code here; I have since made Paper match the code, so if the rate control is
wanted the fix is in the app.

---

## The unattended half of the agent

Twelve of the fourteen tools in §18 exist and work. The two that are missing are
the two that make an autonomous run useful.

- **`schedule_campaign`** — the tool that writes `PENDING_APPROVAL`.
- **`update_node`** — the narrow tool for *"make touch three shorter"*. Today the
  co-pilot must rewrite the whole graph to change one line, which is slow and
  loses hand-placed positions.
- **The review screen.** `PENDING_APPROVAL` is currently a label in a switch
  statement. Nothing sets it, nothing lists what is waiting, and there is
  nowhere for an overnight run to leave work. §18's whole two-lane design — a rep
  sends, an autonomous run stages — is half-built.

---

## Surfaces where the API is done and nothing calls it

### Segments

- **No way to add somebody by hand.** `addMember`, `excludeMember` and
  `removeMember` exist, and `segmentWhere` already unions them. §11's "rules and
  hands, on the same segment" is only half true in the product.
- **No *Save as segment*** on the contacts list. §11 calls this the cheapest good
  entry point in the product; it is one button over the existing filter bar.
- **No archive** from the UI.

### Templates

- **No duplicate, no archive** — both procedures exist.
- **No *Send me a test***. §9 lists it as one of four things the preview panel
  gives, and `marketing.sendTest` is already written; it is wired into the wizard
  only.
- **No shell editor.** The locked rows say "edit it once in Templates" and
  Templates has no partial editor. The rows point at a door that is not there —
  either build it or change the copy.

### Elsewhere

- **Company sheet** has no marketing action; the contact sheet does.
- **`EXIT` nodes** cannot be added from the canvas. Only the co-pilot or a seed
  can create one.
- **`first_campaign_sent`** — the single funnel step in §19, not implemented. The
  twenty-five daily properties all are.

---

## Verified, so nobody re-checks it

- **A real email sent** through Resend from `mail.trycomp.ai` (verified domain),
  composed by the same renderer the preview uses, carrying the postal address,
  the unsubscribe link, resolved merge tags and both `List-Unsubscribe` headers.
- **The drain route** was returning 401 to cron because it lacked
  `@AllowAnonymous()` — the global guard ran before the controller's own secret
  check. Fixed and exercised.
- **`claimDueSends` binds the clock** as a parameter. Using `now()` against a
  naive `timestamp` column resolved through the session timezone and claimed
  nothing. Found by a spec.
- **222 specs**: 144 in `@crm/db` (engine, re-entry row by row, exit sweeps
  firing between touches, split stability across retries, blast idempotency,
  deliverability auto-pause, event retention, the graph validator), 61 telemetry,
  9 email render and lint, 8 canvas node rendering.

## Known unknowns

- **The assembled canvas page has never been opened in a browser.** Every node
  component is asserted to render; React Flow's own layout of them is not.
- **The webhook has never received a real Resend event.** Signature verification
  is unexercised.
- **Two `react` copies** remain in `node_modules` (19.2.8 and 19.2.4). Harmless
  today, and the same class of duplicate resolution that broke the eve build and
  cost an afternoon.

## Deliberately not doing

Still deferred in §21, with the condition that brings each back: SMTP, double
opt-in, a preference centre with topics, campaign templates with drips built in,
automatic A/B winners, send-time optimisation, landing pages and a forms
builder. Nothing here is a gap.

---

## Two process notes worth keeping

**Paper drifts within a single session.** It went out of date three times while
this was being built, because the app kept changing after each sync. Syncing
Paper belongs in the definition of done for a change, not at the end of a batch.

**The design was ahead of the code twice.** The settings rate control and the
reply-to picker were both drawn and then not built. When Paper and the app
disagree, check which one is right before assuming it is Paper.
