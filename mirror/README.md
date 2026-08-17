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

**The dashboard** is a set of **boxes you arrange**, and since v21 a set of boxes you
**define**. Everything that changes what the dashboard *is* now sits behind one switch:
`✎ Edit` in the header. Press it and a rail appears holding one chip per box — Food ·
Intake · Movement · Upkeep · How you are · Blood glucose · Log grid — in a fixed
catalogue order: click a chip (or a box's `−`) to minimise it, click again to reopen
(reopened boxes land at the end). Drag a box by its `⠿` to reorder — long-press on a phone,
`Alt+←/→` on a focused header — and the arrangement is remembered per device
(`mirror_layout_v1`, chrome not data: it never enters a backup or sync). Edit mode is also
where you rename the Upkeep box, add a mark or a measurement to it, add a 1–5 scale of your
own, and hide any control you never use — an Intake tab, a Log-grid tile, a scale. `Esc`
leaves it, and it is deliberately **not** remembered: you edit on purpose and log by habit,
so tomorrow's dashboard is the one you left. Nothing in edit mode deletes a record — the
worst a `✕` does is retire a definition or take a control off this screen. The day you are
logging for sits beside the title; below the boxes, a row of link pills, then the always-on
report band: the **Tracker** — every entry of the day in the order you made it — the week in
review, and **Connections**. Connections is the record talking back: differences in how you
felt on days with and without sleep, movement, protein, alcohol, a habit kept — drawn from
your last 90 days at read time, stored nowhere, and always worded as a gentle association,
never proof.

**The instruments never change shape as you log** — values move, geometry does not. Nothing
on a card grows or shifts a control because of something you recorded: entries land in the
Tracker rather than in the card you typed into, and every list that lives on a card face —
Movement's remembered moves, Upkeep's tiles, the scales, the meal tiles, the medication list,
the day's glucose readings — sits in a window of **fixed height that scrolls inside itself**,
so the thing you are aiming at is always where it was. Being able to add to those lists does
not weaken that rule; it is the reason the windows are hard-bounded, so the twentieth meal and
the ninth tile cost the card nothing. What else grows lives one layer in: the popovers, the
Tracker, Records and the Overview. It is written down at the top of `index.html` as the
invariant every card is audited against, together with the one licensed exception noted
there — **edit mode**, where cards may grow, because what appears is new furniture rather
than data arriving.

So each card is a set of controls with a door beside it. On the **food** card your meals are
the controls: each one is a tile you tap to log it, three rows deep and scrolling past that,
because a button labelled "Meals" that opened a list of meals was a door standing in front of
a door. **Build a meal** is still the recipe editor beside them (search, per-ingredient
`− n +`, or take today's eating wholesale), and in edit mode a tap on a tile opens the
builder instead of logging it. **Movement** is two rows of four tiles — Walk · Run · Bike · Lift · Stretch ·
Other, plus the 📋 Workouts and ＋ Build doors — over a fill slot whose height never changes.
Tap a category and log the session right on the card: chips *add* into a dashed running total
(tap the readout to zero it), cardio takes time and miles, Lift keeps your moves as chips in a
window that scrolls inside itself — tap one to pour reps into it — Stretch toggles areas,
Other asks what it was and remembers the answer, and a dim `≈ kcal` line guesses the cost
(MET-based, from the body weight set in **Data**) before one Enter writes the whole session as
one entry, one Tracker line. **Upkeep** is the box you define: a grid of tiles for the things
you keep track of doing. It ships with Brush, Shower, Floss and Haircut — Brush counts per
press (twice a day is two Tracker lines), the marks toggle, and tapping again takes one back —
and in edit mode you can rename the box, retire a tile, or add one of your own as a **mark**, a
**count**, or a **measurement** that takes a number in the row permanently reserved beneath the
tiles. **Intake** is seven tabs — water, coffee, other, **meds**, alcohol, nicotine, weed —
where one tap logs; a medication's dose is typed once, and after that taking it is a single tap
on its name, kept in its own store with its own weekly line, because a prescription is not a
substance. **How you are** is five 1–5 scales you can add to and switch off. One tap logs a
glass of water; sleep is two handles on a 24-hour track, so you say when you went down and got
up rather than doing the arithmetic; **Blood glucose** is one number and a Log button — mg/dL,
the day's readings dotted by range in a fixed window — because a reading is all it should ask
for. (Switch the Glucose tile on in Upkeep and it writes that *same* record, not a second
one.) `Undo` in the header takes back the last thing you did, including a deletion.

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
**schema v21**.

- [`SCHEMA.md`](./SCHEMA.md) — every store, the provenance fields (`_at`, `_up`, `_src`),
  tombstones, and the versioning contract. Read it before changing the data model; rule one is
  *never repurpose a field*.
- [`DASHBOARD_PLAN.md`](./DASHBOARD_PLAN.md) — why the dashboard is shaped the way it is.
- `sw.js` — network-first for the document (so a shipped fix is not shadowed by a cached
  page), cache-first for everything else, and it never intercepts the GitHub API.
- [`tests/`](./tests/) — browser-level acceptance suites (Playwright/Chromium, synthetic
  data only): `python mirror/tests/run_all.py`. Every substantive change ships against
  these; see the folder's README for what each suite covers.

Outside its original workspace hub the food library and the `← Workspace` link simply do not
resolve, and the app adapts. There are no hard external dependencies.
