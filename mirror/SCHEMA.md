# Mirror — data schema & durability contract

This file is the **decoder ring** for `mirror-data.json`. Its job is to let a person —
future-you, or anyone you share the data with — read a record written years ago and know
exactly what every field meant *at the time it was written*. A longitudinal record is only
trustworthy if its meaning is fixed and documented. That's what this file guarantees.

Current schema version: **13** (field `__v` in the data).

---

## 1. Where the data lives, and what's durable

Mirror is local-first. Your data has three homes, in increasing order of permanence:

| Home | Key / file | Durability |
|---|---|---|
| Browser localStorage | `mirror_v1` | Lost on cache clear / new device. The working copy. |
| In-browser snapshots | `mirror_backups` (last 12) | Undo safety only. Same browser. |
| **Forever-copy you keep** | `mirror-data.json` + `mirror-data.md` | **The permanent record.** Survives everything, once you keep it somewhere permanent. |

**The forever-copy is the archive.** Everything else is scratch. The discipline that makes
Mirror a multi-decade dataset instead of an app is: *save the forever-copy and keep it
somewhere permanent* — a private git repo, a cloud drive, an external disk; wherever you keep
things that must outlive a laptop. Mirror counts edits since the last forever-copy
(`mirror_changes_since_repo`) and nags you in the Forever-copy dialog and the top banner when
they pile up.

**Restore always reads a file _you_ pick.** Mirror never fetches data from the directory it's
served from. This matters for a self-hosted / shared deployment: the hosting directory holds
only the *app*, never anyone's data, so opening the page can never load one person's record
into another person's browser. Your data reaches a new browser only when *you* hand it the
file.

- `mirror-data.json` — **lossless.** Every record, every field. This is what **Restore** reads
  (from a file you choose).
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
| `_up` *(v13)* | ISO-8601 timestamp of the **last write** to this record. Equal to `_at` for anything only ever created; later on an edit. Absent on records written before v13. |

Stamping is automatic: `saveState()` stamps any record lacking `_src` with
`manual` + a real `_at`, so no individual entry form has to remember to do it.

**Why `_at` was not enough.** `_at` means *first entered* and must never move, or the
record stops saying when it was made. But two devices reconciling the same record need to
know which version is **newer**, and an upserted record — a Daily Card re-saved at
midnight, a habit ticked today but defined in March — has an `_at` far older than its last
change. `_up` answers that, and leaves `_at` telling the truth. It is also what orders the
dashboard's tracker, so a habit ticked at 9pm lands at 9pm rather than back in March.

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

### decisions — the judgment log *(v10)*
- **items[]** — one record per decision, written in **two phases**. Phase 1 (when you decide)
  captures the choice and, crucially, your **prediction**; Phase 2 (added later, **upserted**
  into the same item) captures how it actually turned out.
  `{ id, date, title, domain?, context?, options?, reasoning?, confidence: 1–5?, expected?,
  review_on?,  result?, same_again?, outcome?, lessons?, reviewed_on?,  _src, _at }`.
  Only `title` + `date` are required.
  - `date` — the local day the decision was made.
  - `domain` — one of the six areas (`body`/`mind`/`health`/`relationships`/`money`/`identity`)
    or empty. Ties the decision to that area for cross-room synthesis.
  - `confidence` — 1–5, how sure you were it was the right call *at decision time*.
  - `expected` — your **prediction** of what would happen. The field that makes review honest.
  - `review_on` — an optional date to be prompted to revisit it (in Reflect).
  - **Phase 2 (review):** `result` = `better` | `as_expected` | `worse` (outcome **vs. your
    prediction**); `same_again` = `yes` | `no` | `unsure` (would you make the same choice
    again — separates a lucky outcome from a good call); `outcome` (free text); `lessons`
    (free text); `reviewed_on` (the day reviewed). A decision counts as *reviewed* once any
    Phase-2 field is filled; clearing them all reopens it.
  - **No verdict is ever stored.** "Well/badly decided" is never written down. **Calibration**
    (does your confidence track how things actually turn out?) is *derived on read* in Reflect
    from `confidence` × `result`, in tentative, small-sample language — never a score.

### habits — recurring intentions *(v11)*
- **items[]** — one record per habit you're cultivating.
  `{ id, name, domain?, active, aim?, created, done: string[],  _src, _at }`.
  - `domain` — one of the six areas or empty (ties coverage to that area for synthesis).
  - `active` — `false` **archives** the habit: its history is kept, it just stops showing on
    Today. Habits are archived, never silently lost.
  - `aim` — optional **soft** target (times per week). Shown only as gentle context
    ("3 of ~4 this week") — **never** a pass/fail, a miss, or a streak.
  - `created` — the local date the habit was defined (coverage never counts days before it).
  - `done` — the **raw observation**: the set of local dates you kept the habit. That's all
    that is stored. "Didn't do" is simply an absent date. **Coverage** ("kept 18 of the last
    30 days") is *derived on read*; **no streak, chain, or miss is ever stored or shown** —
    this is deliberate, matching Mirror's no-shame stance. The coverage picture lives in Reflect.

### places — the geography of your life *(v12)*
- **items[]** — a durable register of the places your life happens.
  `{ id, name, kind, from?, to?, note?,  _src, _at }`. `kind` is `home` (a place you
  live/lived — a season), `trip` (travel/visits), or `spot` (a meaningful location; dates
  optional). The **current home** is *derived* (the most-recently-started `home` with no `to`,
  or a `to` in the future) and shown with a live duration — never stored.
- **days** — `{ "YYYY-MM-DD": placeName }`. The per-day "where," set on the Today view.
  **Absent = you were at your current home** (the default), so only travel/away days need a
  tag. Denormalised to the place *name* so it survives a register edit.

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
- **food[]** — `{ id, date, foodId, foodName, grams, portion?, qty?, t?,
  mealLogId?, mealName?, mealQty?, _src, _at, _up }`. Macros
  are *not* stored per-entry — they're looked up from the NutriLens library by `foodId` at
  read time, so a library correction retroactively fixes history. `grams` is the raw
  observation. `portion` *(v13)* records the **named** portion chosen ("1 cup", "1 large
  egg") purely so the entry can be read back the way it was entered; it is display text, and
  is cleared the moment grams is typed by hand, so it can never disagree with the number.
  `foodName` is denormalised so history stays readable if the library is ever unavailable.
  - `qty` — **how many** of that named portion the entry stands for ("2 × 1 large egg").
    Absent means one. Like `portion` it is read-back detail: **`grams` is always the total
    actually eaten**, so nothing derived ever multiplies by `qty` and no reader of this
    record can double-count. Written by `self.html` since before v13 and by the dashboard
    from v14; both compute `grams = unit × qty` and store the product.
  - `portionLabel` — `self.html`'s **older name for `portion`**. Same meaning, same use.
    Both are read wherever an entry is displayed; neither is rewritten into the other,
    because silently rewriting old records is the thing §4 exists to prevent.
  - `mealLogId` / `mealName` / `mealQty` *(v14)* — set on every entry a **meal** was
    replayed into (see `meals[]` below). `mealLogId` is shared by exactly the entries of one
    logging, so the Tracker can show the one meal you ate rather than the five rows it took
    to record it; `mealQty` is how many of the meal that logging was. Removing that Tracker
    line removes every entry it stood for, each with its own tombstone.
  - `n`, `category` — written by `self.html` only. `n` is a per-100 g nutrient **snapshot**
    taken at logging time; the dashboard ignores it and derives from `foodId` instead, so a
    library correction reaches dashboard-written history and not snapshot-carrying history.
    Documented because the field exists in real data, not because it is the pattern to copy.
- **water[]** — `{ id, date, oz, t?, ... }`. `t` = optional `HH:MM` time of day; when absent
  the entry's `_at` supplies the timestamp shown in the Health timeline. Hydration keeps every
  timestamped entry (never a single daily total) so the sequence across the day is preserved.
  Backdated entries carry **no** `t` rather than a fictional one.
- **drinks[]** *(v13)* — `{ id, date, kind, label, oz?, count, t?, _src, _at, _up }`.
  Everything drunk that isn't plain water. `kind` is `coffee` or `other`; `label` is what it
  was called ("Coffee", "green tea") and is the free-text half of `other`. `oz` is the raw
  amount; `count` is 1 per entry, so a day's coffees can be counted without summing volume.
  Water stays in its own `water[]` array rather than moving here — pre-v13 hydration history
  must not be relocated.
- **substances[]** *(v13)* — `{ id, date, kind, count, oz?, note?, t?, _src, _at, _up }`.
  `kind` is `alcohol`, `nicotine` or `weed`. `count` is how many (one tap = 1; the detail
  form can log several at once) and `note` is optional free text.
  `oz` appears only on alcohol entries written between v13's release and the move described
  below, when alcohol was entered by volume. Those records carry `count: 1` as well, so they
  count identically to newer ones; the volume is kept because it is what was observed, and
  the tracker still shows it.
  > **Alcohol is counted, not measured.** A 12 oz beer and a 1.5 oz shot are one standard
  > drink each, and that equivalence is the entire point of the measure — ounces throw it
  > away. It briefly sat among the drinks in the interface, which is why some entries have
  > `oz`; the store never moved, because counting beside nicotine and weed is what makes a
  > week's totals one query.
- **sleep[]** — `{ id, date, hours, quality: 1–5, ... }`
- **exercise[]** — `{ id, date, type, minutes?, time?, distance?, intensity?, note?, ... }`.
  All fields except `type`/`date` optional. Shaped so a future fitness-tracker import (steps,
  heart rate, workouts, active minutes) can add fields without reshaping existing records.
- **symptoms[]** — `{ id, date, note, ... }`. Free-text, sparse, high-value context.
- **checkins[]** *(v8)* — `{ id, date, energy: 1–5?, fatigue: 1–5?, soreness: 1–5?,
  comfort: 1–5?, note, _src, _at }`. The subjective daily **Body** check-in — how the body
  *feels* (energy, fatigue, soreness/pain, physical comfort), distinct from the measurable
  Health logs. One record per local `date` (saving **upserts**).
- **customFoods[]** — `{ id, name, category, portions: [{ label, grams }], n: {...per 100 g} }`.
  Definitions you authored. Entered per *serving* and stored per 100 g, so they divide the
  same way library foods do.
- **meals[]** — `{ id, name, items: [{ foodId, foodName, grams, portion?, qty? }], _src, _at, _up }`.
  Reusable bundles. Logging one **replays** its items into `food[]` as ordinary entries — a
  meal is a shortcut for typing, never a record of eating in its own right, so nothing is
  double-counted and a meal edited later cannot rewrite what you already ate.
  An item's `qty` *(v14)* is the same read-back detail it is on a food entry: how many of
  that ingredient's named portion the recipe calls for, with `grams` already the total.
  Logging a meal **n** times over multiplies each item's `grams` and `qty` by n and stamps
  the resulting entries with `mealLogId` / `mealName` / `mealQty` — so the Tracker can show
  one line while the data stays a list of ordinary foods that resolve their own nutrients.
- **favoriteFoods[]** — `string[]` / `number[]` of food ids. **Currently unused.** It has
  been declared since v1, briefly held pinned foods, and holds nothing now that the food card
  has no chip row. Left in place rather than removed: it costs nothing and dropping a declared
  field is the kind of churn §4 exists to prevent.

### mind
- **books[]** — `{ id, title, author, status: "want"|"reading"|"finished"|"abandoned", ... }`
- **ideas[]** — `{ id, date, text, source, ... }`. Here `source` = the idea's **origin**
  (book / person / self) — a domain field, distinct from provenance `_src`.
- **questions[]** — `{ id, date, q, status, note, ... }`
- **quotes[]** — `{ id, date, text, source, why, ... }`. `source` = attribution (who said it).

### money
- **categories[]** — `{ id, name, planned }`. Budget lines.
- **expenses[]** — `{ id, date, amount, categoryId, note, ... }`. `categoryId` → `categories[].id`.
- **income[]** — `{ id, date, amount, source, note, ... }`. Added in v13. `source` is a free
  string, not an id: income arrives from a handful of places that rarely need a record of their
  own, and the dashboard offers past sources back as chips.
- **subscriptions[]** — `{ id, name, amount, cadence: "monthly"|"yearly", categoryId?, ... }`
- **netWorth[]** — `{ id, date, assets, liabilities, ... }`. Sparse, decades-valuable snapshots.
- **goals[]** — `{ id, name, target, by, saved, ... }`

### relationships
- **people[]** — `{ id, name, relation, tier: 1|2|3, ... }`. `id` is referenced by follow-ups & gifts.
- **followUps[]** — `{ id, personId, what, due, done, ... }`
- **giftIdeas[]** — `{ id, personId, idea, occasion, ... }`
- **birthdays[]** — `{ id, name, relation, month, day?, year?, deceased, passedYear?, note, ... }`.
  The standalone forever-register (also exportable on its own as `birthdays.json`/`.md`).

### links *(v13)* — the doors you keep
- **links[]** — `{ id, label, url, icon?, _src, _at, _up }`. Top-level, not under a life
  area, because a shortcut belongs to none of them. `url` is stored exactly as typed and is
  sanitised **on render**, never on save: a bare domain gains `https://`, relative and
  `mailto:` pass, and `javascript:`/`data:` are refused and simply not drawn. Validating on
  the way out rather than the way in means an old record can never become unsafe because the
  rules changed.

### _deleted *(v13)* — tombstones
- **_deleted[]** — `{ id, at }`. The id of every record removed, and when. Without this, a
  second device that still holds a deleted record would re-add it on the next sync and
  deletion would be impossible to make stick. Tombstones age out after 90 days, by which
  point every device has seen them. This is the one place the data records an **absence**;
  it holds no content from the deleted record, only its id.

### completion *(v8)* — the daily doorway
> **UI note (v13):** the hexagram is gone — the dashboard has no completion ritual and
> writes nothing here. The store and all its history are preserved untouched, and `self.html`
> still renders it. Documented as-was, below, because that is what the existing dates mean.

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
- **v10** → **Decisions (the judgment log).** Adds a new store `decisions.items[]` — a
  two-phase record (choice + prediction, then how it turned out on review). Stores the raw
  prediction and outcome, never a verdict; **calibration is derived on read** in Reflect from
  `confidence` × `result`. Auto-provenance via `RECORD_ARRAYS`; written in full into
  `mirror-data.md`. Reshapes/renames nothing existing; the shallow-merge in `loadState` plus a
  `v<10` migration backfill `decisions` for older data.
- **v11** → **Habits (recurring intentions).** Adds a new store `habits.items[]`. Each habit
  stores only the raw **dates kept** (`done[]`) plus an optional soft weekly `aim`; **coverage
  is derived on read** and **no streak is ever stored or shown**. `active:false` archives a
  habit without losing history. Auto-provenance via `RECORD_ARRAYS`; summarised (definition +
  count + recent dates) in `mirror-data.md`. Reshapes/renames nothing; shallow-merge + a
  `v<11` migration backfill `habits` for older data.
- **v12** → **Places (life geography).** Adds a new store `places` = `{ items[], days }` —
  a durable register (home seasons / trips / meaningful spots) plus a per-day "where" map
  (`days`), defaulting to the derived current home when unset. `items` gets auto-provenance and
  is written in full into `mirror-data.md`. Reshapes/renames nothing; shallow-merge + a `v<12`
  migration backfill `places` for older data.
- **v13** → **The one-page dashboard.** The app's front door became a single page
  (`mirror/index.html`); the seven-room version is kept at `self.html` and still reads
  everything. Four new stores and one new provenance field, **nothing reshaped or renamed**:
  - `body.drinks[]` — coffee and anything else drunk that isn't plain water.
  - `body.substances[]` — alcohol, nicotine, weed, by count.
  - `links[]` — the shortcuts on the dashboard's launchpad.
  - `_deleted[]` — deletion tombstones, so a future two-device sync can't resurrect what
    you removed.
  - `_up` on every record — last-written time, distinct from `_at` (first entered). See §2.

  `body.food[]` gained optional `portion` (the named portion chosen) and `t`;
  `body.meals[].items[]` gained optional `portion`.

  **Alcohol moved from the drinks tab to the substances tab** shortly after release, and is
  now entered by count rather than volume. **No data moved** — it had always been stored in
  `body.substances[]`; only the interface changed. Entries written in that window carry an
  `oz` alongside their `count: 1` and still total correctly.

  **Retired from the interface, preserved in the data.** The dashboard stops writing
  `completion`, and shows nothing for `decisions`, `identity.journal`, `identity.reflections`,
  `identity.season`, `mind.questions`, `money.netWorth`, `money.goals`,
  `relationships.followUps` or `relationships.giftIdeas`. Every one keeps its records, its
  migrations and its place in this document; `self.html` still renders them all. A field
  falling out of a screen is a presentation choice, and §4 rule 1 does not care about screens.

  Two fields stopped being written and were deliberately **not** cleared, so a re-save cannot
  blank what is already there: `daily.cards[].one_sentence` and `.body_note`, and
  `body.checkins[].note` — the dashboard has no free-text field on its pulse card.
  `daily.cards[]` remains the heartbeat and still receives mood, energy and sleep.
- **v14** → **quantities, and a meal that reads as one thing.** No store is reshaped or
  renamed, and every field below is optional — an entry written before v14 reads exactly as
  it always did.
  - `body.food[].qty` and `body.meals[].items[].qty` — how many of a named portion. `grams`
    stays the total actually eaten, so **nothing derived multiplies by `qty`**; it exists so
    an entry reads back the way it was entered ("2 × 1 large egg"). `qty` is not new to the
    data — `self.html` has written it alongside `portionLabel` since before v13. v14 is
    where the dashboard started writing it too, and where it got written down here.
  - `body.food[].mealLogId` / `.mealName` / `.mealQty` — the tag a replayed meal leaves on
    its entries. **Meals still replay into `food[]` as ordinary entries**; the tag only lets
    the Tracker collapse them into the one line you actually ate, and lets removing that
    line remove all of them together. Keeping the replay is deliberate: it is what makes a
    meal's nutrients resolve per ingredient at read time, and what keeps editing a meal from
    rewriting what you already ate.
  - Also written down for the first time, unchanged: `body.food[].portionLabel` (`self.html`'s
    older name for `portion`), and `body.food[].n` / `.category` (`self.html`'s per-entry
    nutrient snapshot). Both predate this version; documenting them is not a change to them.

---

## 5. Sharing & anonymization (design intent)

The long-term aim is that this record could be **useful to others if shared** — an honest,
dense, multi-decade n-of-1 dataset is genuinely rare. To make that possible without
retrofitting privacy later, the schema keeps sensitive content *structurally separable* from
the measurement series:

- **Identifying / sensitive:** `relationships.*` (names), `identity.journal`, `identity.season`,
  `mind.quotes`/`ideas` free text, expense `note`s, `symptoms` notes, the free-text fields
  of a decision (`title`, `context`, `options`, `reasoning`, `outcome`, `lessons`), and
  `places` (locations are identifying). *(v13)* Add `links[]` — a list of the services
  someone uses is identifying — `body.drinks[].label`, and `body.substances[].note`.
- **Shareable measurement series:** dated numeric logs — `body.food` (by foodId + grams),
  `sleep`, `water`, `exercise`, `pulse` (mood/energy), `money.netWorth` & `expenses` amounts
  by category, reading counts, the **structured judgment signals** of a decision
  (`domain`, `confidence`, `result`, `same_again`, decide/review dates) — a rare calibration
  series with no private content once the free text is dropped — and **habit coverage**
  (`domain`, `aim`, and the kept-date series), clean adherence data with only the habit `name`
  needing to be dropped. *(v13)* Add `body.drinks` (`kind`, `oz`, `count`, drop `label`) and
  `body.substances` (`kind`, `count`, `oz`, drop `note`). Dated intake counts for caffeine,
  alcohol, nicotine and cannabis alongside sleep and mood, in one person, over years, is
  among the more genuinely scarce things this record could offer — and it anonymises to
  nothing but a kind and a number.

  > These are also the most sensitive rows in the file. Structural separability is what
  > makes them shareable *at all*; without the free text they are numbers, with it they are
  > a diary. Nothing here is ever shared by the app — it has no network path off the device
  > except a sync you configure yourself.

A future anonymized export can therefore emit clean CSV of the measurement series with names
hashed to initials and free-text fields dropped, **without touching the numbers**. Because the
split is built into the data model now, sharing stays a one-step transform rather than a rewrite.

### Known cleanup (non-blocking)
- `mind.ideas[].source` (origin) and `mind.quotes[].source` (attribution) are domain fields.
  They no longer collide with provenance, which lives in `_src` — but the name is still a
  little ambiguous to a casual reader. A future version could rename them `origin` /
  `attribution` for clarity. Not urgent; nothing is broken.
