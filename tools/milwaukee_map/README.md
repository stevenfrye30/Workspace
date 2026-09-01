# milwaukee_map — the editing toolchain for milwaukee.html

`milwaukee.html` (the CITY doorway) is a **bundler file**: the real app —
one HTML document with all its CSS and JS — is stored inside it as a
single JSON string in the `<script type="__bundler/template">` block,
with assets (Leaflet, fonts, images) as gzip+base64 blobs in the
manifest block. A text editor sees one enormous line; **never edit the
file directly.**

## The ritual

```
git pull                                   # ALWAYS — the weekly events
                                           # Action also commits this file
python tools/milwaukee_map/unpack.py       # -> _work/app_inner.html
# … edit _work/app_inner.html …
python tools/milwaukee_map/pack.py         # splice back, round-trip proven
python -m http.server 8877                 # from the repo root
# smoke-test at http://127.0.0.1:8877/milwaukee.html — the map, a popup,
# the key, one storage flow. Personal state is per-origin localStorage,
# so localhost testing never touches live-site data.
git add milwaukee.html && git commit && git push
```

Skipping the pull risks a merge conflict on a 2.7 MB single line, which
cannot be meaningfully resolved — only discarded.

## Rules

- `bundle.py` is the **only** code that knows the template encoding
  (`</` → `<\/`, round-trip proof on every write). All writers —
  `pack.py`, `geocode_pins.py`, `../milwaukee_events/refresh_map_events.py`,
  and the terminal-side `projects/life/milwaukee/bake_map_data.py` — go
  through it. Don't grow a fourth copy of the splice logic.
- Never hand-edit inside the `// MKE_HEADLINES:BEGIN…END` block (owned by
  the weekly Action) or `// MKE_SEED:BEGIN…END` (owned by the bake tool).
- A pack from a **stale** `_work/` copy silently reverts whatever other
  tools wrote into the live file since — that is what the pull + fresh
  unpack at the top of the ritual prevents.
- `_work/` and `geocode_results.json` are gitignored scratch.

## Tools

| Tool | Job |
|---|---|
| `unpack.py` / `pack.py` | extract / splice the inner app document |
| `geocode_pins.py` | re-place SCOUTED pins at Nominatim parcel coords (dry-run table → `--apply`) |
| `../milwaukee_events/refresh_map_events.py` | weekly headlines block (also run by the Action) |
| `projects/life/milwaukee/bake_map_data.py` | bake a personal export blob as seeded defaults — baked data is public |
