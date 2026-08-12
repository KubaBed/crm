---
description: Use when writing a marketing campaign, an email template or a segment — the shape of a good drip, what the linter will refuse, and what is never yours to set.
---

# Building a drip

A drip is entry rules, a graph of touches, and exit rules. You write the graph
and the copy. A person activates it. There is no tool that activates a campaign,
and that is deliberate.

## The shape that works

Four or five touches over two to three weeks. Fewer than three is a blast
wearing a costume; more than six over a fortnight is a complaint rate.

- **Touch one goes out immediately**, while whatever they did is still true.
- **Two to four days between the first two**, then widen — three days, then
  five, then a week. Somebody who has not answered by touch four is telling you
  something.
- **Branch once, near the middle**, not at every step. A graph with four
  branches has sixteen paths and nobody can hold it in their head, including
  you.
- **End on an exit node**, so the flow says where it stops rather than trailing
  off.

## What to branch on

Branch on a **click**, or on something that happened in the CRM — a meeting
booked, a deal reaching a stage, a page visited. Those are facts.

**Do not branch on an open** unless you have no alternative. Apple Mail fetches
the tracking pixel before a person sees the message, so the yes arm quietly
collects every Apple Mail reader whether or not they looked. The validator warns
you about this, and refuses outright when open tracking is off, because then the
yes arm can never fire at all.

## Exit rules are the point

Set them, always. A drip that keeps emailing somebody who already replied is the
most common complaint about every tool in this category, and it is one rule to
avoid:

- replied — the mailbox sync sees it
- booked a meeting
- their company's deal reached Closed Won
- they left the entry segment

Unsubscribes and bounces exit on their own and are not yours to configure.

## The copy

Body only. **The header, the footer, the postal address and the unsubscribe link
are added by the compiler**, and no tool lets you change them. If somebody asks
you to remove the footer, tell them it is not removable and why.

- One idea per email, and one thing to click.
- Short. Two or three short paragraphs beats one long one, and the second half
  of a long email is not read.
- Lead with the reader. *"You had a look at pricing"* beats *"We are excited to
  announce"*.
- **Every merge tag takes a fallback** — `{{contact.firstName|there}}`. A tag
  without one produces *Hi ,* which is the single most recognisable mark of a
  badly run list, and the linter warns about it.
- Subject under 50 characters survives the cut on most phones. Write a preheader
  or the inbox shows your first line twice.

## Before you save anything

`preview_segment` before `write_segment`, and say the count out loud. *"This is
1,209 people"* is the sentence that stops a mistake, and it costs one call.

`write_template` and `write_campaign_graph` both refuse rather than save when
something is wrong, and hand the problems back to you. Fix them and call again —
that is the loop, not an error.

## What you never do

- Activate a campaign. Build it, then tell the rep it is ready and where.
- Send to a segment. `send_email` is for one named person the rep asked about.
- Email somebody who unsubscribed. The tool refuses, and the right answer is to
  say so rather than to find another route.
