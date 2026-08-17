# Mirror's tests

Browser-level acceptance suites. Every substantive change to Mirror since the
one-page dashboard has shipped against harnesses like these; this folder is
those harnesses, made portable and kept with the code they verify.

## Running them

```sh
pip install playwright
playwright install chromium
python mirror/tests/run_all.py        # from anywhere; paths are repo-relative
```

Each suite is self-contained: it serves the repo root on its own port with
`http.server`, drives a throwaway Chromium (Playwright), and seeds **synthetic
data only** — your real record is never read or written, because localStorage
lives inside the disposable browser profile. Suites run in a fixed timezone
(`America/Indiana/Indianapolis`) so local-date logic is deterministic.

## What each covers

| Suite | Covers |
|---|---|
| `validate_movement.py` | Movement card v3: the eight tiles, the hard-height fill slot (face byte-identical across every state × theme × density), accumulator exactness, one-Enter-one-record, moves/reps/edit machinery, workout replay + group undo, kcal estimate, v17→v19 migration, self.html round-trip, 390 px |
| `validate_v19_round.py` | Intake sub-forms (alcohol/nicotine forms, fixed heights across all tabs and steps), sleep wording ban, hygiene brush counter + merge union, column order, weekly review pickup |
| `validate_review_fixes.py` | One regression test per finding of the 2026-08 review pass: targets spread on self.html, canonical move casing, edit-survives-sync-pull, intensity clamp, session-counting week, gone-tombstones in the builder list, focus ring, and the rest |
| `validate_connections.py` | The Connections engine: exact group averages, the both-groups-3+ and 0.35 gates, direction tinting, hedge language on every row, substance signals, weekday card, empty state, derived-not-stored |
| `validate_archive_series.py` | The archive's series navigation: the contents list on a multi-part text, the current part marked and unlinked, previous/next at the head and foot boundaries, a standalone text getting nothing, click-through, and the reachability claim — all 166 series texts reachable from their work's entry |
| `validate_artifacts.py` | Generated-artifact drift: regenerates `images/`, `nutrilens/foods.json` and `archive/series.json` into a temp dir with the real generators and diffs, then asserts the CONVENTIONS invariants (one food corpus, no embedded graph, the four stemmers agreeing) |
| `validate_search.py` | Food search in both apps that read the library (Mirror's `tokenRank` + aliases and NutriLens' `filterSort` are separate implementations): the stemmer's rules, plural queries reaching singular rows and back, and guards that literal matches did not regress |
| `validate_v20_boxes.py` | The v20 spec's ten acceptance checks, one block each: the header's day chip and pop, the seven-chip rail, minimise/reopen-appends, drag with mouse + long-press + Alt+arrows with reload persistence, the all-closed grid, Blood glucose (Enter/Log/Tracker/forever-copy/undo, hard 128px slot), `mirror_layout_v1` absent from the forever-copy, v19→v20 migration, and the self.html glucose round-trip |
| `validate_v21_edit.py` | The v21 spec's thirteen acceptance checks, A1–A13: the `✎ Edit` toggle (position, `aria-pressed`, Escape's precedence behind a pop, no persistence), normal mode holding no rail/handle/`✕` at all, the routine box's hard 110px grid and permanently-reserved 34px number row, add/retire/rename with marks keeping the field names they always wrote, the Glucose tile and the Blood glucose card proving to be one record, meds (tab order, own hue, 88px slot, dose-set-once, own weekly line, not substances), hiding tabs/tiles/scales into `mirror_layout_v1` and never into the record, custom scales riding `checkins[].extra` while built-ins keep their fields, meals as tiles on the food face, the four new stores' merge behaviour (including the rename that `latestStamp` has to see), the self.html and records.html round-trips, and a geometry sweep asserting no card grows as data enters in either theme × density plus 390px |
| `validate_v22_checkups.py` | The v22 spec's fourteen acceptance checks, A1–A14: the Checkups box (closed on an upgraded profile / open on a fresh one, five seeds at `never · due`, tap = done today / tap again takes it back, derived-not-cached last-done proved by deleting a completion from Today, add at 2 yrs, retire keeps history, the Overview's `Checkups: N due` line), the Also log and Today renames with ids untouched, every header's day-total note empty-at-zero and unwrapped at 320px, the phone round (16px fields, tools folded to ✎ Edit + ⋯ with the SAME buttons moved into the pop, toast Undo, safe areas, 44px tiles under dense), first contact's three exits, the four structurally-identical add forms, the self.html and records.html round-trips, and the Connections hedge said exactly once |

## Conventions

- A suite prints `PASS`/`FAIL` per check and exits non-zero on any failure.
- Ports are per-suite (8130–8143) so suites can run back to back.
- Seeds are hand-built state blobs pinned to older schema versions on purpose —
  migration is part of what's under test. When `SCHEMA_VERSION` bumps, the
  version assertions here are expected to need the same one-line bump.
- The food library (`../nutrilens/foods.json`) is optional; suites treat its
  absence the way the app does.
