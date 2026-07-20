# Mirror

A private, local-first record of your own life — body, mind, health, relationships, money,
and who you're becoming. One HTML file. No account, no server, no tracking. Your data lives in
your browser and never leaves your device unless *you* export it.

Mirror is built to be a record you keep for **decades**, and one you could honestly share as an
n-of-1 dataset if you ever chose to. The data format is documented, versioned, and never
silently repurposed — see [`SCHEMA.md`](./SCHEMA.md), the decoder-ring for your data.

---

## Running your own copy

Mirror is a single self-contained file, `index.html`. There are three ways to run it, easiest
first:

### 1. Host it (recommended) — GitHub Pages, or any static host
1. Put `index.html` somewhere a static web server can serve it (a GitHub Pages repo, Netlify,
   an S3 bucket, your own box — anything that serves files over `http(s)`).
2. Open the URL. That's it.

Hosting over `http(s)` is recommended because the optional food library (below) is loaded with
`fetch()`, which browsers **block** when a page is opened directly as a `file://` document.

### 2. Serve it locally
From the folder containing `index.html`:

```sh
python -m http.server 8080
# then open http://127.0.0.1:8080/index.html
```

Any static file server works. Serving locally gives you the food library too.

### 3. Just open the file
Double-click `index.html`. Everything works **except** the built-in food library (browsers
block its network fetch on `file://`). You can still log your own custom foods — the app tells
you so and points you here.

Your data is stored per-browser under `localStorage`, so it stays with whichever browser +
origin you open it from. Moving to a new browser, device, or URL? Use **Forever-copy** (below)
to carry it over.

---

## Keeping your data safe — the one habit that matters

Because everything is local, **you** are the backup. Two mechanisms, in order of permanence:

- **Back up** (top bar) — downloads a timestamped JSON of everything. Do this whenever.
- **Forever-copy** (top bar) — saves two fixed-name files:
  - `mirror-data.json` — lossless; this is what **Restore** reads.
  - `mirror-data.md` — a human-readable companion, openable in 50 years with no app at all.

  Keep both somewhere permanent — a private git repo, a cloud drive, an external disk. Mirror
  counts your edits since the last forever-copy and gently nudges you when they pile up.

**Restore always reads a file _you_ pick.** Mirror never loads data from the directory it's
served from, so a shared or public deployment can never serve one person's record to another.
Your data reaches a new browser only when you hand it the file.

To move to a new browser/device: open Mirror there → **Forever-copy → Restore from a file…** →
pick your `mirror-data.json`.

---

## Optional extras (off until you set them up)

Mirror works fully without either of these.

### Food-nutrition library
The Health area can search a food database for calorie/macro/micronutrient logging. To enable
it, place a `foods.json` at **`../nutrilens/foods.json`** relative to `index.html` (i.e. a
sibling `nutrilens/` folder one level up), served over `http(s)`. The file is a JSON object of
the shape `{ "foods": [ { "id", "name", "category", "portions": [...], ...per-100g nutrients } ] }`.
Without it, you can still create and log your own **custom foods** in "Your foods".

### Read-only Google Calendar
The Calendar view can show your Google Calendar events (read-only — Mirror can never create,
edit, or delete anything). It uses the browser Google Identity Services token flow: no server,
no client secret, and the access token lives only in memory (gone on refresh; never written to
disk or into any backup). You supply your own OAuth **Client ID**, stored only on your device.
Full step-by-step Google Cloud setup is in [`SCHEMA.md` → "Google Calendar setup"](./SCHEMA.md).

---

## Privacy summary

- No account, no server, no analytics, no third-party calls — except the optional Google
  Calendar integration, and only after you explicitly connect it.
- All data is in your browser's `localStorage`; exports and the forever-copy are files you
  save and control.
- Google access tokens and fetched events are **never** persisted — in-memory only, scrubbed
  before every save/export.
- The hosting directory holds only the app, never your data.

---

## For developers

`index.html` is the whole app — HTML, CSS, and JS in one file, no build step, no dependencies.
Data model and the schema-versioning contract are in `SCHEMA.md`. When Mirror runs outside its
original workspace hub, the shared "← Hub" navigation pill and the food library simply don't
load, and the app adapts — there are no hard external dependencies.
