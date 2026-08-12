# Marketing — read before touching campaigns, templates, segments or sending

The design record and the reasoning are in
[`docs/plan/marketing-suite.md`](./plan/marketing-suite.md). This file is the
short list of rules that hold, and what breaks when they do not.

## A blast is a campaign with exactly one node

There is one campaign table with a `kind`. Content lives on
`MarketingCampaignNode`, never on the campaign — so a blast has a single `EMAIL`
node and every number in the product is a group-by on `nodeId` with no special
case. Creating a campaign writes its first node in the same transaction, and no
code downstream handles a campaign with no nodes.

**`@@unique([nodeId, recipientId, pass])` is the idempotency of everything.**
`pass` is what lets somebody walk a drip a second time; without it the second
walk silently sends nothing, which looks exactly like success.

## One compiler, and it must stay one

`@crm/db/marketing/segments.ts` exports **two functions and no more**.
`matches()` is one line over `compile()`. Five things ask "who is in this list" —
the count, the blast, the entry sweep, the exit sweep and a `BRANCH` node — and
they must not get five answers.

**Do not write a per-contact tree walker.** It will be faster and it will drift
on the first facet that touches a relation, and the drift shows up as a branch
sending people down the wrong arm, which nothing alerts on because both arms
send something.

## Entry and exit are set operations

Two queries per drip per tick, whatever the population. `sweepEntries` and
`sweepExits` compile to one `where` and update in bulk. A per-enrolment check is
ten thousand queries a minute at ten thousand enrolments, and the spec asserts
the query count for that reason.

**Exit sweeps every tick, not before each step.** Somebody whose deal closes
between touch 4 and touch 5 leaves then, not in nine days.

## The shell is not the author's

The compiler appends the postal address and the unsubscribe link, and emits
`List-Unsubscribe` and `List-Unsubscribe-Post`. They are not blocks and no tool,
screen or agent can remove them. A template picks a header and footer; a node
picks a template and edits **body copy only**.

`renderEmail()` is called on the server for the preview and for the transport.
There is no second renderer, and there must not be — the day they drift is the
day somebody sends the drift to nine thousand people.

## Resend's answer beats ours

If Resend has an endpoint for it, read theirs: DNS records, verification status,
open and click tracking. **Never compose a DNS record** and never serve a
tracking pixel. There is no `/api/m/o/`, no click redirect and no link rewriter
in this codebase, and adding one is a mistake rather than a feature.

**We never onboard a domain to Resend.** The settings page and the wizard list
the domains Resend already holds and let a person pick a verified one. There is
no create-domain call and no DNS record rendered anywhere, because Resend's
dashboard does that job and does it better. Open and click tracking are two
switches that write straight to Resend's domain.

`marketingResendDomainId` is the handle. Tracking state is not mirrored into a
column, because a local copy goes stale the moment somebody changes it in
Resend's dashboard — which is where we tell them to change it.

## Two numbers lie, and the UI has to say so

- **Open rate is inflated.** Apple Mail Privacy Protection fetches the pixel
  before a human looks. Say it wherever an open rate appears, and never judge an
  A/B winner on opens.
- **A `BRANCH` on opened routes people, not just charts.** `validateGraph`
  refuses it outright when open tracking is off — that arm can never fire, so it
  is dead code — and warns when it is on.

## The unsubscribe page does not unsubscribe on load

Link scanners fetch every URL in a message before a human sees it. `GET /u/:token`
shows one button; the button writes. `POST /api/m/u/:token` — the
`List-Unsubscribe` target — writes immediately and returns an empty 200, because
scanners do not POST.

`MarketingRecipient` never cascades from a contact delete. The address stays
unsubscribed forever, which is the whole point.

## Sending lives in the API, and that is not a rule bending

`docs/api.md` names mail as the second documented exception to *no vendor client
in Nest*, beside the exchange-rate fetcher. A mail provider carries a message
somebody already wrote; a data vendor forms an opinion about somebody. What
would breach the rule is putting composition, segment reasoning or
"who should get this" in Nest — and none of that is there.

## The agent writes rows, never bytes

Fourteen tools in `apps/agent/agent/tools/`, all through `@crm/db/marketing`.
None holds a transport. `write_template` and `write_campaign_graph` **refuse and
hand the problems back** rather than saving — that loop is why the linter and
the validator are functions rather than screens.

**There is no `activate_campaign` tool, and there must not be.** An approval
prompt can be clicked through; a missing tool cannot. A campaign goes live when
a person clicks Activate on a graph they have looked at.

Approval is an eve policy, not a flag: a draft edit is silent, a live-drip edit
asks a person, and an autonomous principal is **denied with a reason** rather
than parked in a run nobody can answer.

## Quiet hours hold, the cap skips

`deferQuiet` pushes every due `CAMPAIGN` and `DRIP` send to the next open hour.
It never touches a `TEST` or a `DIRECT` send: a person is waiting on both, and a
test that silently does nothing at 3am is a broken first run.

`skipOverCap` counts what a recipient has already had in the last 24 hours and
marks the rest `SKIPPED` with `skipReason: "daily-cap"`. It runs after the claim,
so one place covers a blast, a drip touch and a one-off alike.

Both read `marketingQuietStart`, `marketingQuietEnd`, `marketingTimeZone` and
`marketingDailyCap`, and all four are editable on the settings page. A setting
that is stored, shown and ignored is worse than one that is absent.

## The drain, in order

Replies, exits, entries, advance, send. Replies land first so an exit rule can
see one that arrived thirty seconds ago. It runs in-process every 30 seconds and
on `POST /internal/marketing/drain` for serverless, which takes `CRON_SECRET`
**or** `AGENT_BRIDGE_SECRET` and refuses when neither is set.

`claimDueSends` binds the clock as a parameter rather than using `now()`.
`dueAt` is a naive timestamp, so `now()` compares against the session timezone
and claims nothing — that bug is why the specs exist.

## A campaign can pause itself

Over 5% hard bounces or 0.3% complaints, past fifty sends, `pauseUnhealthy`
stops it and writes why. This is the one place the product overrules the
marketer, because the damage lands on the domain every other campaign shares and
outlasts the campaign causing it.

## Telemetry

Counts and booleans. Never a subject, a segment name, a rule, a recipient, a
domain or a key — and never an open or click **rate**, only totals.
`docs/telemetry.md` has the table, and a property that ships before its row
there is a broken promise.
