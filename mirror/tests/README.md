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

## Conventions

- A suite prints `PASS`/`FAIL` per check and exits non-zero on any failure.
- Ports are per-suite (8130–8141) so suites can run back to back.
- Seeds are hand-built state blobs pinned to older schema versions on purpose —
  migration is part of what's under test. When `SCHEMA_VERSION` bumps, the
  version assertions here are expected to need the same one-line bump.
- The food library (`../nutrilens/foods.json`) is optional; suites treat its
  absence the way the app does.
