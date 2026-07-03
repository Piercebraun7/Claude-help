@AGENTS.md

# CLAUDE.md — wasteos-prototype

Context for Claude Code. Read this at the start of every session.

## What this is

A read-only UX/UI prototype of WasteOS (Kaizen Waste's platform for photo-verified
valet trash service documentation and waste expense intelligence), built to explore
mobile app design before Alexander does the full implementation. This is NOT the
production WasteOS app and is not meant to be merged into it directly, it exists so
Pierce can hand Alexander a working design reference.

## Hard rule: this app never writes to Supabase

This connects to Kaizen's real production Supabase project. Do not add any code path
that can alter data, ever:

- No `.insert`, `.update`, `.delete`, `.upsert`, or mutating RPC calls anywhere in
  this codebase. `lib/supabase.js` is the only place the client is constructed;
  every other file should only call `.select()` on it.
- Never use the service role key. Only the anon/publishable key belongs in this repo.
- If working via an agent with direct Supabase MCP access, only ever run SELECT
  statements. Never run apply_migration or any write/DDL statement against this
  project from this repo's context.

This matters because 19 tables in this project currently have Row Level Security
disabled (see below), so the anon key already has broader access than it should.
That's a pre-existing gap on Alexander's side to fix, this app just must never be
the thing that exploits it.

## Team

- Pierce Braun — CEO, product direction, final say on anything customer-facing
- JR Schneider — Operations, closest to how runners actually use this day to day
- Alexander Nethers — Technology lead, owns WasteOS infrastructure and Supabase.
  Full implementation of anything designed here is his call.
- Brittney Clarke — Development Director / Kaizen Academy

## Infrastructure

- Backend: Supabase (Postgres), project ref `etkqnhnpmuxntxdvnted` ("Kaizen" project)
- This prototype: Expo (React Native), blank template
- Connection: `@supabase/supabase-js` using `EXPO_PUBLIC_SUPABASE_URL` and
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` from `.env` (gitignored, see `.env.example`)

## Known issues to keep front of mind

- **19 tables currently have row-level security disabled**, including
  `properties`, `units`, `waste_invoices`, `waste_invoice_line_items`,
  `waste_vendors`, `waste_service_terms`, `user_roles`, `rpm_contract_targets`,
  `property_visits_archive`, and others. This is a live security gap on the
  Supabase project itself, not something introduced by this repo. Do not build
  features that assume these tables are protected. Flag it if it comes up again;
  don't try to fix it here, that's Alexander's call.
- Runner productivity data comes from scan events (first-to-last scan per property
  per night). Exclude inter-property drive time from any productivity calcs, that's
  the established methodology.

## Working style / standing rules

- No em dashes, anywhere, including in code comments or commit messages.
- Plain, direct language. No marketing language, no filler.
- When in doubt about a data model change, ask before writing migrations.
  Read-only exploration is fine without asking. (Moot here: this repo never writes.)
- Alexander owns final review on anything touching Supabase schema or security config.

## What "done" looks like

Before considering a task finished: run it, don't just write it. If tests exist, run
them. If there's no test coverage for what you touched, say so explicitly rather than
silently skipping it.
