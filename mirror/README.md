# Mirror

A private, local-first record of your own life — how you slept, what you ate and drank, how
you felt, the people and books and money around it. No account, no server, no analytics, no
third-party scripts. Your record lives in your browser, and goes nowhere else unless you
switch on sync or save a copy yourself.

It is built to be kept for **decades**. The data format is documented, versioned, and never
silently repurposed — see [`SCHEMA.md`](./SCHEMA.md), the decoder ring for your own data.

---

## The three pages

| | |
|---|---|
| **`index.html`** | The dashboard. Where the day is logged. |
| **`records.html`** | Everything you have ever entered, searchable in one place. |
| **`self.html`** | The older seven-room version, on the same data. |

**The dashboard** is one page in four bands: fixed instruments at the top (how you are ·
intake · habits · movement · food · hygiene · sleep), a row of link pills over the six-tile **log grid**
(person · book · idea · place · money · values), then the **Tracker** — every entry of the day
in the order you made it — and the week in review beneath it.

The instruments never change shape as you log. Entries land in the Tracker, not in the card
you typed into, so the thing you are aiming at never moves. **Meals** is the food card's main
button: each saved meal has a `− n +` beside it, so two helpings is one tap and lands as one
Tracker line. **Hygiene** is five glyphs you tap on the days you did them, and tap again
if you didn't. One tap logs a glass of water;
sleep is two handles on a 24-hour track, so you say when you went down and got up rather than
doing the arithmetic; `Undo` in the header takes back the last thing you did, including a
deletion.

Clicking the title opens the **Overview** — what the record adds up to: days kept, sleep
average, this month's money, habits over the last seven days, the values you keep, and the last
ten things you entered. It is derived at open time and stored nowhere, so it cannot disagree
with the record. No scores and no streaks: a streak turns a record into something you can fail,
and then into something you stop keeping.

**Records** is the reading surface. One search runs across people, birthdays, books, quotes,
ideas, budget, expenses, subscriptions, places and habits at once. It deliberately cannot
create anything — one place to write, one place to browse, so the two can't drift.

**`self.html`** is kept because it still holds surfaces the dashboard dropped: Reflect,
the decisions log, the journal, questions, net worth and savings goals. It reads and writes
the same `mirror_v1` data, so nothing you enter there is stranded. Nothing essential lives
only there.

---

## Where your record lives

Three homes, in increasing order of permanence.

1. **`localStorage`, key `mirror_v1`** — the working copy. Per browser, per origin. Lost if
   you clear site data.
2. **Snapshots** — the last 12, taken automatically before anything destructive. Same browser,
   so undo safety only, not a backup.
3. **The forever-copy** — two files you keep somewhere permanent:
   - `mirror-data.json` — lossless, and what **Restore** reads.
   - `mirror-data.md` — human-readable, openable in fifty years with no app at all.

All of it is behind **Data** in the header: forever-copy, restore from a file, snapshots, a
dated backup, and erase. Mirror counts your edits since the last forever-copy and nudges you
when they pile up.

**Restore always reads a file _you_ pick.** Mirror never loads data from the directory it is
served from, so a public deployment can never hand one person's record to another. Your data
reaches a new browser only when you give it the file — or connect sync.

---

## Sync across devices (optional)

Off until you set it up. With it on, one record stays in step across phone and laptop through
a single `mirror-data.json` in a **private GitHub repo you own**.

Tap the **○** pill in the header:

1. **A private repo.** Make one — `mirror-data` is a good name — containing a
   `mirror-data.json` with `{}` in it. Mirror checks the repo really is private and
   **refuses to connect if it is public**.
2. **A fine-grained token**, scoped to that one repo, **Contents: read and write**, nothing
   else. It is stored on that device only and is never written into your data, a backup, or
   the repo. Fine-grained tokens expire — the pill turns amber when yours does, and you paste
   a new one into the same panel.

Not a Gist: a "secret" gist is unlisted, not private, and anyone with the URL can read it.
Not the repo that serves this page, either — that one is public, and Mirror refuses it by name.

**How it behaves.** Every write lands in `localStorage` first, so logging works with no signal
at all; pushes are debounced a few seconds, so a burst of logging is one write. It pulls on
load, on returning to the tab, and on coming back online. Conflicts are detected by blob sha —
a push carrying a stale one is refused, and Mirror re-pulls, re-merges and retries rather than
overwriting. Records union by id, the one-per-day rows (daily card, body check-in, pulse)
merge by date so two devices logging Tuesday collapse to one Tuesday, deletions leave
tombstones so they cannot resurrect, and habit dates union so neither device loses the days it
saw.

> **Sync is redundancy, not an archive.** Two copies in one account behind one expiring token
> is not a backup. Keep saving the forever-copy.

---

## Installing it

Open the page and use your browser's **Add to Home Screen** / **Install app**. You get an icon,
no browser chrome, and it opens with no signal — the shell and the food library are cached.

On iOS this is also a **data-safety** measure: a site you have *not* installed can have its
`localStorage` evicted after about seven days of disuse.

---

## Running your own copy

Serve the folder over `http(s)` — GitHub Pages, Netlify, any static host, or locally:

```sh
python -m http.server 8080
# then open http://127.0.0.1:8080/mirror/
```

Opening `index.html` straight off disk mostly works, but browsers block `fetch()` on
`file://`, so the food library will not load and neither will the service worker. Custom foods
still work, and the app says so rather than failing quietly.

### The food library (optional)

Food search reads `../nutrilens/foods.json` — a sibling `nutrilens/` folder one level up. It is
about 1.2 MB and fetched lazily, when the Food card first comes into view, so it never delays
a cold start. The shape is
`{ "foods": [ { id, name, category, portions: [{ label, grams }], ...per-100g nutrients } ] }`.

Without it you can still create and log **your own foods**, and saved **meals** replay whatever
they contain.

---

## Privacy

- No account, no server, no analytics, no third-party scripts of any kind.
- The only network calls are the optional food library, and — if you switch on sync — the
  GitHub contents API for your own private repo.
- Your sync token lives in its own `localStorage` key, never inside `state`. It therefore
  cannot reach `mirror-data.json`, a backup, or the forever-copy; a scrub runs before every
  push as a second line anyway.
- The hosting directory holds only the app, never anyone's data.

---

## For developers

`index.html` is one file — HTML, CSS and JS, no build step, no dependencies. So are
`records.html` and `self.html`. All three share `localStorage` key `mirror_v1` at
**schema v15**.

- [`SCHEMA.md`](./SCHEMA.md) — every store, the provenance fields (`_at`, `_up`, `_src`),
  tombstones, and the versioning contract. Read it before changing the data model; rule one is
  *never repurpose a field*.
- [`DASHBOARD_PLAN.md`](./DASHBOARD_PLAN.md) — why the dashboard is shaped the way it is.
- `sw.js` — network-first for the document (so a shipped fix is not shadowed by a cached
  page), cache-first for everything else, and it never intercepts the GitHub API.

Outside its original workspace hub the food library and the `← Workspace` link simply do not
resolve, and the app adapts. There are no hard external dependencies.
