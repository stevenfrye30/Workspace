# Mirror · Self — the One-Page Dashboard

Plan drafted 2026-08-05. Supersedes the seven-room layout of `self.html`.

---

## The premise

You asked for a 5-minute-a-day app and then listed about twenty-five things to keep. That
sounds like a contradiction. It isn't.

**The cost was never the number of features. It was the doors.** Seven rooms meant seven
navigations, and each area could only be marked done from *inside* itself — so a "complete"
day literally required six separate trips. That is what made it a chore, not the fact that
budgets and books exist somewhere in the file.

So: keep almost everything you named, put it all on one page, and rank it by **how often you
actually touch it**. Daily things are open at the top. Occasional things are collapsed
drawers. Nothing is behind a door.

Measured against the real target, the daily surface costs roughly **90 seconds**:

| | taps | time |
|---|---|---|
| Pulse (mood, energy, body reads) | 5 | ~10s |
| Sleep | 2 | ~5s |
| Intake (water/coffee/etc.) | 1 each, as you go | ~1s each |
| Movement | 2 + a number | ~15s |
| Habits | 1 each | ~3s |
| Food (3–4 items, from favorites) | 3–4 | ~40s |
| Symptoms | usually skipped | 0 |

---

## Layout — one page, three bands

### Band 1 · TODAY — always open

A date strip sits at the very top (`Today` / `Yesterday` / pick-a-date), because you *will*
forget a day and need to backfill. Everything below writes to the selected date.

| Card | Covers | Interaction |
|---|---|---|
| **Today's pulse** | mood, energy, fatigue, soreness, comfort, note, "what happened today" | 1–5 dot rows |
| **Sleep** | hours + quality | chips (6.5 / 7 / 7.5 / 8) + dots |
| **Intake** | water · coffee · other drink · alcohol · nicotine · weed | **one-tap counters** |
| **Food** | NutriLens favorites + search, running kcal/protein | tap a favorite, or search |
| **Movement** | type + minutes | type chips + minutes |
| **Habits** | what you kept today | tap-to-mark chips |
| **Symptoms** | free text | a "＋ symptom" affordance, not a standing form |
| **Your day** | everything logged, timestamped | read-only payoff |

Three design calls worth naming:

**One pulse card replaces three overlapping forms.** Today's pulse, the body check-in, and
the Daily Card all asked for mood and energy separately — the same question, three times, in
three rooms. One form now asks once and writes to all three stores (`daily.cards[]`,
`body.checkins[]`, `identity.pulse[]`), so every existing record stays coherent and the
Weekly Review keeps working. This is the single biggest source of the old app's tedium.

**Intake is a strip of counter tiles**, each showing today's running count and a big `+`.
Tap to log with a timestamp; tap the number to correct or undo. It's the fastest possible
shape for this data, and it collapses six of your daily items into one widget.

**Habits stay as a chip row, not a room.** Tap what you kept. Per the existing schema, only
the dates you kept are stored — no streaks, no misses, nothing to feel bad about.

### Band 2 · LAUNCHPAD — one compact row

Plain tiles, no logic behind them.

- **Outside:** Gmail · Google Calendar · Google Drive
- **Workspace:** Inventory · Masri · NutriLens · Milwaukee · News
- **Yours:** a user-editable set — "＋ Add link" — for anywhere you traffic a lot

Upcoming birthdays surface as a thin line here, since they're the one time-sensitive item
that would otherwise stay buried in a drawer.

**Family Photos is retired** — it was never built, and the doorway card claiming it was
"in progress" goes away rather than pointing at nothing.

**Milwaukee and News both need publishing first** — see below. Their tiles get built in
phase 3 either way; they light up when the destinations exist.

### Band 3 · DRAWERS — collapsed `<details>`

Each shows a useful one-line summary while closed, so it earns its space without being opened.

| Drawer | Contents | Closed summary reads like |
|---|---|---|
| **People** | people, birthdays | "47 people · 2 birthdays this month" |
| **Mind** | books, quotes, ideas | "3 reading · 118 quotes" |
| **Money** | budget, expenses, subscriptions | "$412 spent this month · $88/mo subscriptions" |
| **Life** | values, places | "Milwaukee since March" |
| **This week** | derived 7-day review | "6 of 7 days logged" |

---

## What gets cut

Cut means **the interface goes; the records stay.** `SCHEMA.md` §4 rule 1 is never repurpose,
never drop — so every array stays in the state tree, and `self.html` remains on disk as a
full-fidelity reader for all of it. Nothing you have ever typed becomes unreachable.

| Cut | ~lines |
|---|---|
| Hexagram home + the `completion` ritual | ~160 |
| Calendar month view + the whole Google Calendar OAuth integration | ~630 |
| Reflect — insights, timeline, long view, calibration (**Weekly Review survives**) | ~670 |
| Decisions (judgment log) | ~192 |
| Journal · reflections · season | ~150 |
| Questions (mind) | ~60 |
| Net worth · savings goals | ~120 |
| Follow-ups · gift ideas | ~110 |
| Meal builder · saved meals | ~200 |

**~7,245 lines → roughly 2,200–2,700**, before the sync layer. The single biggest win is
Google Calendar: you asked for a *link*, and a link deletes an entire OAuth token flow, a
config modal, a REST layer, and the `scrubCalendarSecrets()` machinery that ran before every
single save.

---

## Schema v13

Additive only. Reshapes and renames nothing; the shallow-merge in `loadState()` backfills
all of it for old data, plus an explicit `v < 13` case.

```js
body.drinks[]     = { id, date, kind, label, oz?, count?, t?, _src, _at, _up }
                    // coffee, tea, soda, juice — anything not plain water
body.substances[] = { id, date, kind, count, unit?, note?, t?, _src, _at, _up }
                    // kind: 'alcohol' | 'nicotine' | 'weed'
links[]           = { id, label, url, group?, _up }
_deleted[]        = { id, at }          // tombstones — see sync
```

**Decision — alcohol goes in `substances`, not `drinks`.** What you'd ever want back from it
is standard drinks per night, not fluid ounces, and it belongs beside the other two things
you'd want an honest weekly count of. Say the word if you'd rather it sat with coffee.

**`_up` (last-updated) is new and exists only for sync.** `_at` means *when the record was
first entered* and must never change — so it can't decide which of two edits is newer. `_up`
is stamped on every write. Old records without it sort as oldest, which is correct.

Also noted: `body.favoriteFoods[]` has been declared in state since the beginning and is
never read by any code. The new food card is what finally uses it.

---

## Sync — one record across phone and laptop

A dedicated **private** repo holding one file, `mirror-data.json`. The dashboard pulls on
load, writes to `localStorage` immediately on every change, and pushes on a debounce a few
seconds later. Sync is never in your way: logging always lands locally first and works with
no signal at all.

Most of this ports from `inventory/store.js`, which already solved it in this repo —
UTF-8-safe base64, a `storagePersists()` probe for iOS private browsing, and the
GitHub contents API with **conflict detection by blob sha** (a push carrying a stale sha is
refused rather than silently overwriting).

**The merge.** Mirror's data is overwhelmingly append-only dated records with unique ids, so:

- **Record arrays** — union by `id`, newest `_up` wins.
- **Upsert-by-date records** (`daily.cards`, `body.checkins`, `identity.pulse`) — merged by
  **date**, not id. Without this, logging Tuesday's pulse on both devices yields two rows for
  Tuesday instead of one.
- **Deletions** — tombstones in `_deleted[]`, expired after 90 days. Without them, a bad
  water entry you delete on your phone comes back the next time the laptop syncs.
- **Config** (`values`, `targets`, `home`, `places.days`) — last writer wins.

> 🔒 **The private repo must be a new one — never the public `Workspace` repo.** A separate
> `mirror-data` repo, private, containing nothing but the JSON.
>
> **Not a Gist.** A "secret" gist is unlisted, not private: anyone with the URL can read it.
> That is not an acceptable home for sleep, health, and substance data.
>
> **The token:** a fine-grained PAT scoped to that one repo, contents read/write only,
> nothing else. You paste it once per device; it lives in that device's `localStorage` and is
> **never committed**. Acceptable because the page runs no third-party scripts — deleting the
> Google OAuth integration is what makes that true. Fine-grained PATs expire, so it will need
> rotating.

---

## The two tiles that need a destination

Both live in the local Workspace but were never published to `workspace-hub`, so neither has
a URL a phone can open. And they turn out to have **the same shape of problem**: a Python
script that fetches things, and a page that wants to show the result.

### Milwaukee — `projects/life/milwaukee` (316 KB)

Richer than the retired PWA fork in `_archive/milwaukee-hub-pwa`. It holds a **maplibre-gl
map** with real data (`places`, `neighborhoods`, `events`, `itineraries`), an events
**calendar**, and ~15 markdown docs across `logistics/`, `orientation/`, and `engagement/`.

- The map is static HTML/CSS/JS on a CDN library — **publishes as-is**, just copy it.
- The markdown docs need a small index page; there is no top-level `index.html` today.
- `calendar/upcoming.json` was generated **2026-04-20** — about three and a half months
  stale. `calendar/scrape.py` regenerates it, but only when run locally.

### News — `projects/culture/News Aggregator`

⚠️ **This one can't just be linked.** It's a **Streamlit app** (`streamlit run news_live.py`,
318 lines, needs Python + `feedparser` + `pandas`). It only exists while you've started it on
a machine, on `localhost` — which is nothing on a phone.

Three ways out, cheapest first:

1. **Link to `localhost:8501`** — zero work, works only on a laptop that's already running it.
   Dead tile on the phone, which is the device that matters.
2. **Fetch RSS in the browser** — no. Cross-origin RSS is blocked by CORS, and the only
   workaround is routing your reading through a third-party proxy.
3. **Pre-build it — recommended.** A scheduled **GitHub Action** runs the existing fetch
   logic every 30 minutes, writes `news.json` into the public repo, and a small static page
   renders it. Works on every device, needs no server, and costs nothing.

**Option 3 also fixes Milwaukee's stale calendar** — same Action, same pattern, second
output file. That's why they're worth doing together rather than as two separate chores.

> Note: some feeds in `sources.py` have likely rotted — Reuters retired its RSS, CNN moved
> theirs, and `rsshub.app` is a third-party mirror. Worth an audit when we build this.

---

## Build strategy — build alongside, don't rewrite in place

The dashboard is a **new file** sharing the storage key `mirror_v1`. Same origin means your
existing data simply appears in it — no export, no import, no migration risk. Both run side
by side for a week; `self.html` is untouched the whole time. Only once the dashboard has
earned it does `mirror/index.html` become the dashboard and the doorway retire.

One caveat while both exist: `self.html` stamps `__v: 12` on save and the dashboard stamps
`13`, so the version marker flip-flops. It's harmless — `migrate()` only runs forward and new
fields survive the shallow merge — but the clean fix is a three-line patch to `self.html`
(bump its `SCHEMA_VERSION`, add the new defaults).

### Phases

| # | What | Why here |
|---|---|---|
| **0** | **You:** open `self.html` → Forever-copy → save both files | No copy of your data exists outside your two browsers |
| ~~1~~ | ~~Daily band + PWA install~~ — **DONE** | **Usable on day one** — the habit starts while the rest is built |
| ~~2~~ | ~~Food card — favorites, search, named portions, totals~~ — **DONE** | Heaviest single card; earns its own pass |
| ~~3~~ | ~~Launchpad + the four drawers + Weekly Review~~ — **DONE** | The occasional-use surface |
| **4** | GitHub sync — private repo, merge layer, status pill | Phone data from phase 1–3 becomes the seed; no conflict to resolve |
| **5** | Publish Milwaukee + build News — one GitHub Action feeding both | Independent of the dashboard; the two tiles light up when it lands |
| **6** | Retire — flip `index.html`, patch `self.html`, update `README.md` + `SCHEMA.md` | Only after the dashboard has proven itself |

Phase 5 is genuinely separable — nothing in phases 1–4 waits on it, and it's really two
publishing jobs plus one scheduled workflow rather than dashboard work.

Phase 1 ships the PWA deliberately early: the point is a daily habit, and a habit starts on
an icon on your home screen, not at the end of a build. Installing is also a **data-safety**
measure — on iOS, a site you have *not* installed can have its `localStorage` evicted after
seven days of non-use.

### Built so far — notes for later

- **The service worker is network-first for the document, cache-first for everything else.**
  The obvious build (cache-first for all) means shipping a fix and having the installed app
  keep serving yesterday's HTML — the update only lands for the launch *after* next. This bit
  during phase 2 and is why `sw.js` reads the way it does. Don't "optimise" it back.
- **The food library is fetched lazily** (on an `IntersectionObserver` for the food card, or
  any interaction with it). 1.2 MB on page load would make the first launch feel broken on
  mobile data. It *is* runtime-cached once fetched, so food logging works offline afterwards.
- **USDA names are shortened for display only** (`shortName()`); the stored `foodName` keeps
  the library's real name so history stays faithful.
- **Picking a named portion sets grams; typing grams clears the portion label.** Otherwise a
  row could read "1 cup" next to a weight that isn't a cup.
- `body.favoriteFoods[]` — declared but unused since the beginning — now holds pinned food
  ids. Foods you create yourself are auto-pinned.
- **Custom links run through `safeUrl()`** — bare domains get `https://`, relative and
  `mailto:` pass, and `javascript:`/`data:` are refused and simply never rendered. They also
  carry `rel="noopener noreferrer"`. It's your own data, but a link store that will accept
  anything typed into it should still refuse to emit something it wouldn't click.
- **Milwaukee and News render as "soon" tiles, not links** — a 404 is worse than an honest
  wait. Phase 5 flips one `pending: true` flag each.
- **This week is derived on every render and never written back.** Descriptive only: counts
  and averages, no score, no streak, nothing you can fail — matching the no-shame stance the
  habits store was designed around.
