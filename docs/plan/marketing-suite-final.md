# Marketing suite — what is left

The single list to work from. The design reasoning is in
[`marketing-suite.md`](./marketing-suite.md), the original phasing in
[`marketing-suite-build.md`](./marketing-suite-build.md), and the operating
rules a future change must read first in [`../marketing.md`](../marketing.md).

Written 12 August 2026, after reading the tree rather than from memory.

**Where it stands:** 31 commits on `lewis/marketing-suite`. A real email has gone
out through Resend. The engine walks a branching drip and the agent can build
one. 228 specs pass. What follows is everything that is not done, ordered so
that doing it top to bottom never leaves the product in a worse state than it is
now.

---

## Done since this list was written

- **The drain cron is registered** at `* * * * *` in `apps/api/vercel.json`.
- **`RESEND_WEBHOOK_SECRET` is in `.env.example`**, and the `CRON_SECRET` note
  now names the drain route.
- **Quiet hours and the daily cap are enforced** in the drain and editable on
  the settings page, along with the sends-a-minute rate.
- **The settings page no longer touches DNS.** It lists the domains Resend has
  verified; open and click tracking are switches that write to Resend.
- **Every editor shares one shell** — back link, inline-editable name, badges,
  actions, a meta line and the co-pilot on the right.
- **New campaign, segment and template create an Untitled record** and open it.
  The three create sheets are gone.
- **The co-pilot knows which record is open** and edits it rather than making a
  second one, its thread survives a refresh, and the canvas repaints when a run
  finishes.
- **Company sends and enrolments**, the hand-add panel and archive on a segment,
  Save as segment on the contacts list, duplicate / archive / send-a-test on a
  template, and `first_campaign_sent` as the ninth funnel step.
- **A `building-a-segment` skill** gives the agent every facet and the tool
  order.

---

## Found while using it

Reported 12 August 2026 from a real session with the co-pilot.

### 1. The co-pilot does not know how to build a segment

It took several turns to work out the tool sequence. The facets, the operator
names and the rule shape are all in the code and none of it is in the agent's
context.
Fix: done. `apps/agent/agent/skills/building-a-segment.md` lists every facet,
the tree shape and the order to call the tools in.

### 2. The co-pilot forgets the conversation on refresh

Reload the campaign page and the thread is empty. The chat product already
stores every message and replays it. Marketing must do the same.
Fix: done. `useSavedConversation` only ever sent `contactId`, `companyId` and
`dealId`, so the server refused a save with no record and nothing was stored.

### 3. The canvas does not repaint after the agent writes the graph

The agent reported twelve nodes. React Flow kept the old ones. The rows are in
the database, so this is a stale client cache, not a lost write.
Fix: done. `AgentPanel` takes eve's `onFinish`, and each editor invalidates its
own query on it.

### 4. The React Flow controls were invisible

Every `var(--color-*)` in `flow-tokens.css` named a variable that Tailwind
never emits, because `@theme inline` inlines those values instead. The zoom
buttons fell back to the library's light theme, so white icons sat on a white
button in dark mode, and the nodes had the library's 3px corners.
Fix: done. The file now names the base tokens (`--foreground`, `--card`), and
`--radius-sm/lg/xl` are real variables.

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

### Templates

- **No shell editor.** The locked rows say "edit it once in Templates" and
  Templates has no partial editor. The rows point at a door that is not there —
  either build it or change the copy.

### Segments

- **`excludeMember` has no button.** Adding and removing by hand both work; the
  hold-out mode is API only.

### Elsewhere

- **`EXIT` nodes** cannot be added from the canvas. Only the co-pilot or a seed
  can create one.
- **The campaigns board in Paper still has two-line name cells.** The app is
  single-line. Paper is behind the code on that one board.

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
- **228 specs**: 150 in `@crm/db` (engine, re-entry row by row, exit sweeps
  firing between touches, split stability across retries, blast idempotency,
  deliverability auto-pause, event retention, quiet hours, the daily cap, the
  graph validator), 61 telemetry,
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
