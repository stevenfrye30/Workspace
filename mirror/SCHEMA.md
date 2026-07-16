# Mirror — data schema & durability contract

This file is the **decoder ring** for `mirror-data.json`. Its job is to let a person —
future-you, or anyone you share the data with — read a record written years ago and know
exactly what every field meant *at the time it was written*. A longitudinal record is only
trustworthy if its meaning is fixed and documented. That's what this file guarantees.

Current schema version: **9** (field `__v` in the data).

---

## 1. Where the data lives, and what's durable

Mirror is local-first. Your data has three homes, in increasing order of permanence:

| Home | Key / file | Durability |
|---|---|---|
| Browser localStorage | `mirror_v1` | Lost on cache clear / new device. The working copy. |
| In-browser snapshots | `mirror_backups` (last 12) | Undo safety only. Same browser. |
| **Forever-copy in git** | `mirror-data.json` + `mirror-data.md` | **The permanent record.** Survives everything once committed. |

**The forever-copy is the archive.** Everything else is scratch. The discipline that makes
Mirror a multi-decade dataset instead of an app is: *save the forever-copy and commit it.*
Mirror counts edits since the last forever-copy (`mirror_changes_since_repo`) and nags you
in the Repo dialog and the top banner when they pile up.

- `mirror-data.json` — **lossless.** Every record, every field. This is what **Restore** reads.
- `mirror-data.md` — **human-readable companion.** Openable in 50 years with no app at all.
  **Daily Cards** (the heartbeat) and durable/qualitative content (values, reflections,
  journal, books, quotes, people, birthdays, goals, net worth) are written in full;
  high-frequency logs (food, sleep, water, exercise, expenses) are summarised with a count +
  recent entries. The JSON holds the rest.

---

## 2. Provenance (added in v6)

Every record carries provenance so a measured value and a guessed one are never confused.
The keys are underscore-prefixed metadata (`_src`, `_at`) so they never collide with a
domain field — `mind.ideas` and `mind.quotes` already use their own `source` for the
idea's/quote's origin, which is left untouched.

| Field | Meaning |
|---|---|
| `_src` | How the record got here: `manual` (you typed it), `import` (from a backup file), `legacy` (existed before v6 — true origin unknown), `estimate` (reserved for values you flag as approximate). |
| `_at` | ISO-8601 timestamp of **when the record was entered** — distinct from the `date` it is *about*. Absent on `legacy` records, because inventing a timestamp would be a lie. |

Stamping is automatic: `saveState()` stamps any record lacking `_src` with
`manual` + a real `_at`, so no individual entry form has to remember to do it.

**The golden rule this enables: store raw, derive on read.** Records hold observations
(grams eaten, hours slept, dollars spent), never conclusions ("hit my protein goal").
Goals, targets, and formulas change; raw observations stay true forever. Display-time code
computes the rest.

---

## 3. Record reference

`date` is always the **local** day the record is *about* (`YYYY-MM-DD`, never UTC, to avoid
evening entries rolling onto tomorrow). `id` is a unique string. Every record also carries
`_src` / `_at` provenance per §2 (shown explicitly on a few types below; `...` implies them).

### daily — the heartbeat
- **cards[]** — one Daily Card per local `date` (saving **upserts**; it never creates a
  duplicate for a date already logged).
  `{ id, date, mood: 1–5?, energy: 1–5?, sleep_hours?, sleep_quality: 1–5?, body_note,
  food_note, money_note, social_note, one_sentence, tags: string[], _src, _at }`.
  Every field except `date` is optional. **Raw observations only** — no scores, streaks, or
  conclusions are ever stored in a card. This is the core longitudinal record of Mirror; the
  **Weekly Review** is *derived* live from the last 7 days of cards and is **never written
  back into the data** (a stored conclusion would rot as the data grows).

  > Daily Cards are intentionally simple. Their value comes from consistency over years, not
  > from richness on any single day.

### identity
- **values** — `string[]`. The handful you want to be measured by.
- **season** — `string`. Free text: what this chapter of life is about.
- **reflections[]** — `{ id, period: "week"|"month"|"year", date, prompt, answer, _src, _at }`
- **pulse[]** — `{ date, mood: 1–5, energy: 1–5, note, _src, _at }` (one per day)
- **journal[]** — `{ id, date, title, text, tags: string[], _src, _at }`

### body
> **UI note (v8):** the measurable logs below are surfaced in the **Health** category of the
> app; the **Body** category surfaces the subjective `checkins[]` plus `symptoms[]`. The
> storage namespace stays `body.*` for all of them so pre-v8 history is never moved or
> renamed — the split is a presentation choice, not a data migration.

- **targets** — `{ kcal, protein_g, water_oz }`. Config, not a record. Current goals only.
- **food[]** — `{ id, date, foodId, foodName, grams, _src, _at }`. Macros are *not*
  stored per-entry — they're looked up from the NutriLens library by `foodId` at read time,
  so a library correction retroactively fixes history. `grams` is the raw observation.
- **water[]** — `{ id, date, oz, t?, ... }`. `t` = optional `HH:MM` time of day; when absent
  the entry's `_at` supplies the timestamp shown in the Health timeline. Hydration keeps every
  timestamped entry (never a single daily total) so the sequence across the day is preserved.
- **sleep[]** — `{ id, date, hours, quality: 1–5, ... }`
- **exercise[]** — `{ id, date, type, minutes?, time?, distance?, intensity?, note?, ... }`.
  All fields except `type`/`date` optional. Shaped so a future fitness-tracker import (steps,
  heart rate, workouts, active minutes) can add fields without reshaping existing records.
- **symptoms[]** — `{ id, date, note, ... }`. Free-text, sparse, high-value context.
- **checkins[]** *(v8)* — `{ id, date, energy: 1–5?, fatigue: 1–5?, soreness: 1–5?,
  comfort: 1–5?, note, _src, _at }`. The subjective daily **Body** check-in — how the body
  *feels* (energy, fatigue, soreness/pain, physical comfort), distinct from the measurable
  Health logs. One record per local `date` (saving **upserts**).
- **customFoods[]** — `{ id, name, category, ...macros per 100 g }`. Definitions you authored.
- **meals[]** — `{ id, name, items: [{ foodId, foodName, grams }] }`. Reusable bundles.

### mind
- **books[]** — `{ id, title, author, status: "want"|"reading"|"finished"|"abandoned", ... }`
- **ideas[]** — `{ id, date, text, source, ... }`. Here `source` = the idea's **origin**
  (book / person / self) — a domain field, distinct from provenance `_src`.
- **questions[]** — `{ id, date, q, status, note, ... }`
- **quotes[]** — `{ id, date, text, source, why, ... }`. `source` = attribution (who said it).

### money
- **categories[]** — `{ id, name, planned }`. Budget lines.
- **expenses[]** — `{ id, date, amount, categoryId, note, ... }`. `categoryId` → `categories[].id`.
- **subscriptions[]** — `{ id, name, amount, cadence: "monthly"|"yearly", ... }`
- **netWorth[]** — `{ id, date, assets, liabilities, ... }`. Sparse, decades-valuable snapshots.
- **goals[]** — `{ id, name, target, by, saved, ... }`

### relationships
- **people[]** — `{ id, name, relation, tier: 1|2|3, ... }`. `id` is referenced by follow-ups & gifts.
- **followUps[]** — `{ id, personId, what, due, done, ... }`
- **giftIdeas[]** — `{ id, personId, idea, occasion, ... }`
- **birthdays[]** — `{ id, name, relation, month, day?, year?, deceased, passedYear?, note, ... }`.
  The standalone forever-register (also exportable on its own as `birthdays.json`/`.md`).

### completion *(v8)* — the daily doorway
The home screen is a hexagram: a central **Today** hexagon ringed by the six life areas
(Body, Mind, Health, Relationships, Money, Identity). Each area is confirmed complete for a
day from *inside* that area ("Complete for Today"). Opening an area, or entering data, never
completes it — completion is an explicit act meaning *"I've reviewed and recorded what
matters in this area today,"* not *"I had a perfect day."*

- **completion** — an object keyed by **local date**, each value a per-category state map:
  `{ "2026-07-15": { body: "complete", mind: "started", health: "complete", ... } }`.
  Per category the value is `"started"` or `"complete"`; **absent = not started**. Three
  states surface as: not started (muted, outlined), started (colored outline + dot/tint),
  complete (filled with the category color + ✓). When all six read `"complete"` for the
  current date, Today shows a subtle completed state (ring + glow + check). Completion is
  stored by the date it was confirmed on, persists across refreshes, and a new local date
  begins fresh while past dates are preserved (the Calendar renders that history as six
  colored dots per day). Editing an area's data later never clears its completion; a less
  prominent "Mark incomplete" is the only thing that does.

**Category colors** (permanent, used on the hexagon, heading accent, completion dots and
calendar markers; never the *only* signal): Body = terracotta, Mind = blue, Health = green,
Relationships = rose, Money = amber, Identity = violet. Defined as CSS variables
(`--cat-*`), re-toned for dark mode.

### calendar *(v9)* — Google Calendar integration config
- **calendar** — `{ events: [], integration: {...} }`. `events[]` stays an **empty reserved
  array** (Google events are never persisted here — see below). `integration` holds only
  **non-sensitive** settings, safe to include in a backup:
  - `provider` — `"google"`.
  - `connected` — always **runtime-only**; reset to `false` on every load. A saved `true`
    would be meaningless because the access token never survives a page refresh.
  - `lastSync` — epoch-ms of the last successful event fetch (display only).
  - `selectedCalendarIds` — `string[]` of Google calendar ids the user chose to show.
  - `showEvents` — `bool` display toggle.
  - `maxPerDay` — how many events to show per month-cell before "+N more".

  **What is deliberately NOT stored anywhere persistent** (in-memory only; gone on refresh):
  the OAuth **access token** + expiry, the fetched **calendar list**, the connected
  **account/email**, and the per-month **event cache**. `scrubCalendarSecrets()` runs before
  every `saveState()`/export/forever-copy write and strips any token-like field, so no token
  or event data can reach `localStorage`, an exported backup, or `mirror-data.json`.

  The **OAuth Client ID** is stored in its own device-local key `mirror_gcal_client_id`
  (outside `state`), so it is **not** included in exports or the forever-copy. Client IDs are
  public by design, but keeping it out of committed files keeps the archive clean.

#### Google Calendar setup (what you must configure in Google Cloud Console)
This is a **read-only** integration (scope `https://www.googleapis.com/auth/calendar.readonly`).
It uses the browser **Google Identity Services token client** — no client secret, no backend,
no redirect URI. To turn it on:

1. **Create or select a project** at <https://console.cloud.google.com>.
2. **Enable the Google Calendar API** (APIs & Services → Library → "Google Calendar API" →
   Enable).
3. **Configure the OAuth consent screen** (APIs & Services → OAuth consent screen). User type
   **External** is fine for personal use. Fill app name + your email.
4. While the app is in **Testing** mode, add your Google account under **Test users**. (Apps in
   testing are limited to test users and tokens expire after 7 days — fine for personal use.
   Publishing/verification is only needed to share it beyond test users.)
5. **Create an OAuth 2.0 Client ID** (APIs & Services → Credentials → Create credentials →
   OAuth client ID) with **Application type = Web application**.
6. Under **Authorized JavaScript origins** add:
   - `https://stevenfrye30.github.io` (the live site)
   - `http://localhost:<port>` and/or `http://127.0.0.1:<port>` for local development.
7. **Redirect URIs are not required** for the GIS token/popup flow used here — leave them
   blank. (Redirect URIs only matter for the older authorization-code/redirect flow.)
8. **Copy the Client ID** (looks like `xxxx.apps.googleusercontent.com`) and paste it into
   Mirror: Calendar view → Google Calendar panel → **Configure Client ID**. It is stored only
   on that device.
9. **Scope requested:** `calendar.readonly` only — Mirror can view events but can never create,
   edit, or delete anything. It does not request full calendar access.
10. **Verification implications:** for the owner + added test users, no Google verification is
    needed. Google verification is only required if the app leaves testing and is used by
    people who aren't listed test users.

**CSP note:** Mirror ships no Content-Security-Policy meta tag. The integration loads Google's
official sign-in script from `https://accounts.google.com/gsi/client` (only on demand, when the
user clicks Connect) and makes REST calls to `https://www.googleapis.com`. If a CSP is ever
added, it must allow `script-src https://accounts.google.com` and
`connect-src https://www.googleapis.com https://oauth2.googleapis.com`.

**Refresh honesty:** because the token lives only in memory, a page refresh disconnects the
session. The UI says so and offers Reconnect — no token is written to disk to avoid this.

### home
- **widgets** — `string[]`. Which Today-view cards are shown. UI config, not a record.

---

## 4. Schema versioning — the stability contract

The single most damaging thing to a longitudinal record is **silently changing what a field
means**. So:

1. **Never repurpose a field.** If a meaning must change, add a *new* field and leave the old
   one intact for historical records.
2. **Bump `SCHEMA_VERSION`** and add a `migrate()` case describing the change in plain words.
3. **Log it in the changelog below**, with the date, so a reader of old data can decode it.

### Changelog
- **v1** → baseline.
- **v2** → version stamping only.
- **v3** → added `relationships.birthdays[]` (forever register).
- **v4** → folded per-person birthdays into the standalone register.
- **v5** → added customizable Today home (`home.widgets`).
- **v6** → **provenance.** Every record gains `_src`; new records also get `_at`.
  Pre-v6 records stamped `legacy` with no `_at` (true entry time unknown).
  Added the `mirror-data.md` human-readable companion and change-since-forever-copy tracking.
- **v7** → **Daily Card** (`daily.cards[]`) — Mirror's heartbeat: one raw record per local
  day, one card per date (upsert). Added the **Weekly Review** (derived from the last 7 days,
  never stored). Daily Cards are written in full into `mirror-data.md`. Adds the section but
  reshapes/renames nothing existing.
- **v8** → **home-screen redesign.** The app's front door became a hexagram (central Today +
  six category hexagons + a calendar button). Three new stores, **nothing existing reshaped
  or renamed**: `completion` (per-local-date category start/complete states, drives the
  hexagons, the Today center and the Calendar history dots); `body.checkins[]` (subjective
  daily Body check-in — energy/fatigue/soreness/comfort/note, upsert per date); and
  `calendar` (`events[]` + `integration` — the monthly Calendar view and its Google Calendar
  boundary, **sync not implemented**). The measurable logs stay under `body.*`; the Health
  category surfaces them, the Body category surfaces `checkins`/`symptoms`. `exercise[]`
  gained optional `time`/`distance`/`intensity`/`note`; `water[]` gained optional `t`.
- **v9** → **Google Calendar read-only integration (Phase 1).** Extends
  `calendar.integration` with **non-sensitive** config only: `selectedCalendarIds`,
  `showEvents`, `maxPerDay` (plus existing `provider`/`connected`/`lastSync`). **No token,
  authorization code, refresh token, or event data is ever persisted** — those are in-memory
  only; `scrubCalendarSecrets()` strips any token-like field before every save/export. The
  OAuth Client ID lives in a device-local key (`mirror_gcal_client_id`), outside `state`, so
  it is excluded from backups and the forever-copy. `connected` is reset to `false` on load
  (runtime-only). Preserves all v8 data; reshapes/renames nothing. Google events are external
  display data, kept structurally separate from `completion`, category data, Daily Cards, and
  Health/Body logs. Not implemented in this phase (deferred): create/edit/delete, background
  sync, two-way sync, writing Mirror data into Google.

---

## 5. Sharing & anonymization (design intent)

The long-term aim is that this record could be **useful to others if shared** — an honest,
dense, multi-decade n-of-1 dataset is genuinely rare. To make that possible without
retrofitting privacy later, the schema keeps sensitive content *structurally separable* from
the measurement series:

- **Identifying / sensitive:** `relationships.*` (names), `identity.journal`, `identity.season`,
  `mind.quotes`/`ideas` free text, expense `note`s, `symptoms` notes.
- **Shareable measurement series:** dated numeric logs — `body.food` (by foodId + grams),
  `sleep`, `water`, `exercise`, `pulse` (mood/energy), `money.netWorth` & `expenses` amounts
  by category, reading counts.

A future anonymized export can therefore emit clean CSV of the measurement series with names
hashed to initials and free-text fields dropped, **without touching the numbers**. Because the
split is built into the data model now, sharing stays a one-step transform rather than a rewrite.

### Known cleanup (non-blocking)
- `mind.ideas[].source` (origin) and `mind.quotes[].source` (attribution) are domain fields.
  They no longer collide with provenance, which lives in `_src` — but the name is still a
  little ambiguous to a casual reader. A future version could rename them `origin` /
  `attribution` for clarity. Not urgent; nothing is broken.
