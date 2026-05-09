# Phonos

A small, personal study desk for sound, script, and language history.

The home page is an IPA chart. Click a symbol, open a phone page. From
the chart you can also reach two language journals — Arabic and Telugu —
kept as quiet reading notes.

This is an early public-facing version. It is meant to be stable enough
to use and return to, while still clearly being a personal scholarly
project. Empty areas are intentional.

---

## Run it locally

Requires Python 3 (any recent version).

**Windows:** double-click `Open Phonos.bat`.

**Anywhere:**

```
python -m http.server 8001
```

…from this directory, then open `http://localhost:8001/` in a browser.

Any static file server pointed at this directory will work. There is no
build step.

---

## Deploy on GitHub Pages

The project is fully static — every page is a plain HTML file with one
shared stylesheet and one JSON data file. Pushing this directory to the
root of a repo and turning on GitHub Pages is enough.

```
your-username/phonos/    →    https://your-username.github.io/phonos/
```

No special configuration, no build step, no JS bundler.

---

## Entry points

```
index.html      The IPA chart. The home page.
phones/         Phone pages, one per chart cell.
arabic/         Arabic reading notes.
telugu/         Telugu reading notes.
about/          A short page describing what this project is.
shared/         The phone catalogue and stylesheet.
```

The IPA chart is the spine. Languages and scripts are lenses on the
chart, not parallel hierarchies.

---

## What is currently usable

- Full IPA chart (consonants and vowels), rendered from `shared/phones.json`.
- Phone pages with articulation notes and nearest-neighbour links.
- Arabic and Telugu journal pages, with inline links from words back to
  the chart.

## What is experimental or thin

- Most phone articulation descriptions are a single sentence. They will
  be deepened one at a time.
- Audio is not yet recorded. The data file has a slot for it; the slot
  is empty.
- The Arabic and Telugu journals are intentionally short — a handful of
  notes each, not full grammars.

## What is deliberately not here

These were considered and set aside. Some may return later, possibly as
their own projects:

- A 2,000-language graph with family tree, timeline, and world map.
- Per-script stub pages indexed by ISO 15924.
- Unicode / digital-symbols explorer.
- English loanwords from 26 source languages.
- Indo-European cognate sets.
- Script-evolution trees.
- Historical sound change and diachronic phonology.
- Drills, scoring, spaced repetition.
- AI tutors or conversational interfaces.

The project's working scope is the chart and a couple of language
journals. New top-level surfaces are deliberately resisted.

---

## Long-term direction

The project grows slowly:

- Depth before breadth: a second sentence on an existing phone page
  beats a new phone page.
- A new studied language enters only when it is actually being read.
- Scripts grow through studied languages, not through ISO 15924 lists.
- Half-finished is the natural state. Empty cells are acceptable.

Possible later additions, in roughly the order they become plausible:
deeper articulation notes, audio samples, a third studied language,
light writing-system notes per language, simple historical sound-change
observations as they come up in reading. Most of these will be
additions to existing pages, not new modules.

---

## Known limitations

- The chart is wide. On narrow screens it scrolls horizontally inside
  its section.
- Phone pages have no audio yet.
- Some language-page links resolve to phones that are not yet on the
  chart; those appear dashed and grey.
- The project assumes a reader, not a learner. There is no progress
  tracking, no streaks, no quizzes.

---

## Files at a glance

```
.
├── README.md             this file
├── STATUS.md             a short public status note
├── Open Phonos.bat       local launcher (Windows)
├── index.html            the chart (home page)
├── about/                "what this is" page
├── phones/               phone-page renderer
├── arabic/               Arabic reading notes
├── telugu/               Telugu reading notes
└── shared/               phones.json + stylesheet
```

The project is self-contained. There is no build step. There are no
runtime dependencies beyond the browser.
