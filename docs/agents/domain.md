# Domain Docs

How the engineering skills consume this repo's domain documentation. This repo is
**single-context**: one `CONTEXT.md` at the root, and `docs/adr/` for decisions.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — the glossary of domain terms.
- **`docs/adr/`** — the ADRs touching the area you are about to work in.

If either is absent, **proceed silently**. Do not flag it and do not offer to
create it upfront. `domain-modeling` writes them lazily, when a term or a
decision actually gets resolved.

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-….md
│   └── 0002-….md
├── apps/       api · app · agent
└── packages/   auth · db · email · env · telemetry · ui · validation
```

## This is vocabulary, not routing

`AGENTS.md` already routes by area: its table sends you to `docs/api.md` for
`apps/api`, `docs/agent.md` for `apps/agent`, `docs/design.md` for UI, and so on.
That table stays the index. `CONTEXT.md` is the shared glossary underneath it —
what a term means across every package — and never a second copy of the map.

A term that belongs to one area only belongs in that area's doc, not here.

## Use the glossary's vocabulary

When your output names a domain concept — an issue title, a refactor proposal, a
hypothesis, a test name — use the term as `CONTEXT.md` defines it. Do not drift
to a synonym the glossary avoids.

A concept missing from the glossary is a signal: either you are inventing
language this project does not use, which is worth reconsidering, or there is a
real gap worth recording.

## Flag ADR conflicts

If your output contradicts an ADR, say so rather than silently overriding it:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
