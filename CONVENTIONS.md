# Conventions

A short policy for keeping the deployed surface coherent without
silently erasing the archive's history.

## Underscore-prefix convention

Top-level directories whose names begin with `_` are **private**: not
deployed, not foregrounded, not part of the public Reading Room. The
prefix signals intent. The corresponding `.gitignore` rules enforce
the deployment boundary.

Three private directories are conventional:

### `_legacy/`

For retired surfaces — pages, mini-apps, and assets that were once
public but are no longer maintained. Files moved into `_legacy/`
remain on disk for historical continuity but are excluded from
deployment.

When to move into `_legacy/`:
- The surface has been replaced by a current page and is no longer
  the canonical view.
- The surface has visible content but does not align with the
  archive's current standards.
- A reader stumbling on the surface would be confused about what kind
  of project they are looking at.

URL preservation note: moving a surface into `_legacy/` breaks any
external link to its previous URL. This is acceptable for surfaces
that were not announced or that have been silently superseded. For
surfaces with significant external linkage, consider leaving in place
with a small "superseded" footer instead.

### `_internal/`

For build scripts, sync tooling, local-use batch files, and other
artifacts that are part of the workspace's working life but have no
business in the deployed site. Files here exist to support the
steward's editing of the public surfaces; they are not themselves
public surfaces.

Examples: `_build_*.py`, one-off data-shaping scripts,
`*.bat` files for local convenience.

### `_admin/`

For dev/admin pages that aid the steward's inspection of the deployed
content but are not intended for public reader encounter. Examples:
integrity reports, metadata audits, issue dashboards.

These pages may exist as HTML and be locally served, but they should
not appear on a public-facing index, sidebar, or sitemap.

## Generated artifacts

Some files in this repo are **written by a script, not by hand**. Editing one
directly is silently pointless: the next run overwrites it, or — far more
common here — nobody ever runs it again and the file quietly rots.

That is not hypothetical. `nutrilens/foods.js` was compiled from `foods.json`
in April and never rebuilt, so the NutriLens page searched 1,270 foods while
Mirror searched 1,472 out of the same folder, for four months, with nothing
failing. A 2026-08-08 audit found four more of the same shape. This table is
the answer to "is this file generated, and can anyone rebuild it?"

| Artifact (in this repo) | Source | Generator | Fresh clone can rebuild? |
|---|---|---|---|
| `images/index.html`, `artists.html`, `timeline.html`, `all.html`, `works.json`, `regions/*.html`, `artists/*.html` (1,886) | `images/data/*.json` (11 files) | `images/build.py` | **YES** — both tracked. `python images/build.py` reproduces all of it byte-for-byte |
| `nutrilens/foods.json` | `nutrilens/foods-extra.json` + the USDA base already in the file | `nutrilens/merge_extra.py` (idempotent, folds by id) | **YES** — both tracked |
| `archive/series.json` | the front-matter titles in `archive/texts/*.md` | `archive/build_series.py` | **YES** — both tracked |
| `philosophy/index.html`'s `<script id="app-data">` block | `projects/culture/Philosophy/data.json` | `tools/embed_philosophy.py` | no — source and generator are outside the repo |
| `flags/index.html` | `projects/culture/flags/Countries_Flags_Facts.html` (189 MB) | `projects/culture/flags/_build_cdn.py` — **broken**: its `SRC` path predates the move into `culture/` | no — and not by anyone, until that path is fixed |
| `graph/atlas_graph.json`, `atlas/registry.json` | `Atlas/` | `Atlas/tools/sync_atlas_graph.py` — **guarded**: the hub is 22 nodes against the source's 14, so it refuses to run | no |
| `data/phonetics.js` | the pre-retirement `sound-map/index.html` — **gone** | `_internal/build_phonetics.py` (gitignored) | no — unrebuildable by anyone, including here. Live on the Sound Map doorway |
| `sound-map/corpus.json` | — | its generator was deleted; recoverable only from git history | no |
| `cosmos/index.html`, `emoji-games/{games,emojis}.js`, `language/**`, `masri/**`, `inventory/*` | their `projects/` originals | `tools/publish_worlds.py` (manifest `tools/worlds_manifest.json`), except inventory which uses its own allowlisting `deploy.py` | no — sources are outside the repo |

**`images/` is the only pipeline a fresh clone can fully rebuild.** Everything
else needs `projects/`, `Atlas/` or `tools/`, none of which are in this git
repo — the parent workspace is not a repo at all. Treat that asymmetry as the
standing risk: a clone of this repo is a *deployable* copy of the site, not a
*reproducible* one.

Rules that follow from the above:

1. **Never hand-edit a generated artifact.** Fix the source and re-run.
   If the generator is broken or gone, say so in the file's own header (see
   `_internal/build_soundmap.py` for the format) rather than editing around it.
2. **Never publish downward into a canonical hub copy.** Where the hub has
   become the source of truth — nutrilens' food data, `graph/`, `images/` —
   the publish entry is marked `mode: none` or the generator refuses. Read a
   dry run before using `--force`.
3. **One copy of a corpus, not two.** Two files holding the same data with no
   build step between them will drift; the fix is to delete one and fetch the
   other. `foods.js` and `philosophy/data.json` were both removed this way.
4. **A drift check exists** — `mirror/tests/validate_artifacts.py` regenerates
   what is rebuildable into a temp directory and diffs it, and asserts the
   invariants above. Run it (or `mirror/tests/run_all.py`) before a push that
   touches any row of this table.

`SOURCE_MAP.md` at the parent-workspace root is the fuller version of this
table, including the `projects/` side. It is **not in this repo**, which is
itself an instance of the asymmetry above.

## How to retire a surface

1. Move the file or directory into `_legacy/` (or `_internal/`,
   `_admin/` as appropriate).
2. Verify the relevant `.gitignore` includes the private directory.
3. If the surface was previously tracked in git, run
   `git rm --cached <old-path>` and commit. The file remains on disk
   in its new private location.
4. Note the move in the relevant project's stewardship or changelog
   if the surface was significant.

## What this policy is *not*

- It is not deletion. Files are retained on disk; only the deployment
  surface narrows.
- It is not secrecy. The intent is clarity of public vs private, not
  protection of sensitive content. Sensitive content has different
  handling rules (`.gitignore`, never-committed).
- It is not a refactoring program. Moving things into `_legacy/`
  is opportunistic; the steward retires what is currently confusing,
  not everything that could be retired.

## Currently in `_legacy/` and `_internal/`

`workspace-hub/`:
- `_legacy/legacy_home.html` — earlier homepage (titled *Steven Frye —
  Workspace*); superseded by the Atlas-style `index.html`.
- `_internal/build_phonetics.py`, `build_science.py`,
  `build_soundmap.py`, `strip_soundmap.py` — build scripts,
  **all four now orphaned (do not run):**
  - `build_science.py` — source `projects/class notes` was removed;
    `science/` is now a self-contained, hand-built rooms page with no
    generated-data dependency: `index.html` + `room.html` shells,
    `css/{base,lab,room}.css`, and ES modules under `js/` — one content
    file per room in `js/rooms/`, instruments in `js/widgets/`, shared
    tables in `js/data/`. `js/rooms/_manifest.js` is the only list of
    valid `?room=` keys; add a room there and in `js/rooms/`.
    `chemistry` is a **hub**: a room with a `hub:` array renders topic
    buttons instead of content, and the nine `chem-*` rooms hold the
    actual tools. A `WIDGETS` entry may be `{path, opts}` so one widget
    module (the calculators) serves several rooms with different tabs.
    `science/index.html` is the **home dashboard** — a 3x3 board with the
    periodic table at its centre. A room lists its `cards` as one
    click-to-open Reference list; there is no separate topic-chip array
    (topics with no card are parked in `science/CONTENT_BACKLOG.md`).
    The calculator and notepad live in `js/dock.js`, top-right on every
    page — rooms carry no notes box of their own.
- `math/` — **RETIRED as a separate app.** Its nine rooms moved into
  `science/js/rooms/` as `math-*` (its physics room replaced the old
  Science bridge room and kept the `physics` key). `math/index.html` and
  `math/room.html` are now forwarders that map each old `?room=` key to
  its new Science address. `graph-lab.html`, `math_symbols.js` and
  `calc.js` were deleted — graphing hands off to Desmos.
  - `build_phonetics.py` / `build_soundmap.py` / `strip_soundmap.py` —
    the IPA → Sound Map → phonetics pipeline; their `ipa/` and
    `sound-map/` sources are gone (sound-map retired to `_legacy/`).
    These three carry an ORPHANED header in-file.
  See `SOURCE_MAP.md` §2e.
- `_internal/open-mirror.bat` — local-use launcher.

`projects/culture/Digital Archive/03_web_app/`:
- `_legacy/old.html` — earlier-generation Reading Room (titled
  *Digital Library*); superseded by the current `index.html`.

`projects/culture/Digital Archive/06_workspace/_artifacts/`:
- `build_apparatus.py`, `build_stewardship_html.py`,
  `update_mundaka_web_data.py` — one-off scripts from the Mundaka
  stewardship and Reading Room cycles. Idempotent; retained for
  transparency about how the canonical artifacts were derived.
