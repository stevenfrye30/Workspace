# Gods — map app

The single working view for the Gods world. A self-contained HTML app
backed by `data.json`.

**Live:** [stevenfrye30.github.io/Workspace/gods/map](https://stevenfrye30.github.io/Workspace/gods/map/)

## Tabs

- **Pantheons** — grid view, grouped or sorted by era / size /
  alphabetical. Click a pantheon to open its family tree.
- **Family Trees** — focus view: parents above, consorts and siblings
  to the sides, children below, cross-cultural parallels at the
  bottom. Any figure can become the focus.
- **Timeline** — when each tradition was active and at peak.
- **Archetypes** — cross-cultural groupings (sky-father, earth-mother,
  trickster, psychopomp, serpent-dragon, …).
- **Deified Humans** — figures elevated to godhood (emperors, saints,
  teachers).
- **Notable Mentions** — semi-divine and culturally significant figures
  outside the main rosters.
- **Browse All** — flat search across the catalogue.

## Data

All content lives in `data.json`. Schema and growth notes are in the
authoring README at `projects/culture/Gods/README.md`.

Coverage is intentionally uneven by tradition. Empty patches are
expected and will fill as reading continues.

## Requirements

The app fetches `data.json` and looks up Wikipedia images at runtime.
Open it via an HTTP server, not `file://`.
