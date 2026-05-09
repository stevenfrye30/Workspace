# Gods

A comparative archive of pantheons — an early personal study of how
gods of many traditions sit beside one another across time and place.

This is not a comprehensive mythology database, not a theology, and not
a comparative-religion course. It is a careful arrangement, growing
slowly, with deliberate empty patches.

---

## Run it locally

Requires Python 3 (any recent version).

**Windows:** double-click `Open Gods.bat`.

**Anywhere:**

```
python -m http.server 8002
```

…from this directory, then open `http://localhost:8002/` in a browser.

The app fetches `data.json` and looks up Wikipedia images at runtime,
so an HTTP server (not opening files via `file://`) is required.

---

## Deploy on GitHub Pages

The project is fully static. Pushing this directory to the root of a
repo and turning on GitHub Pages is enough.

```
your-username/gods/      →    https://your-username.github.io/gods/
```

No build step, no JS bundler. The single large app is a self-contained
HTML file in `map/`.

---

## Entry points

```
index.html             A calm landing page — what this is, where to start.
map/                   The single working app — all tabs.
  ├── index.html       The application shell + view code.
  └── data.json        The catalogue (pantheons, gods, archetypes,
                       notable mentions).
README.md              This file.
STATUS.md              A short public status note.
```

A visitor opens `index.html`, reads the orientation, and clicks
**Open the archive →** to enter the app.

---

## What is currently usable

The app has six tabs:

- **Pantheons** — grid view, grouped or sortable by era / size /
  alphabetical. Click a pantheon for its family tree.
- **Family Trees** — focus on any figure: parents above, consorts and
  siblings to the sides, children below, cross-cultural parallels at
  the bottom. Any figure can become the new focus.
- **Timeline** — when each tradition was active and at peak.
- **Archetypes** — cross-cultural groupings (sky-father, earth-mother,
  trickster, psychopomp, serpent-dragon, …).
- **Deified Humans** — figures elevated to godhood.
- **Notable Mentions** — semi-divine and culturally significant figures
  outside the main rosters.
- **Browse All** — a flat search across the catalogue.

Coverage by tradition is intentionally uneven. Well-documented
pantheons (Greek, Hindu/Vedic, Norse, Egyptian, Mesopotamian, Roman)
are heavier; smaller pantheons sit as sketches until more reading
happens.

## What is thin or uneven

- Smaller regional pantheons are deliberately thin.
- Wikipedia images are fetched live; some figures show a glyph instead
  of an image — that is expected.
- Source citations exist in the working data but are not surfaced in
  the view yet.

## What is deliberately not here

- Theology. The archive arranges figures; it does not argue about them.
- A claim that the traditions are "the same." Cross-cultural parallels
  are noted because reading often surfaces them, not as identity claims.
- A geographic map view (latitude / longitude per cultural centre).
  Planned later, not built.
- Spaced repetition, quizzes, completion trackers. Out of scope.
- An AI tutor or chatbot. Out of scope.

---

## Schema (data.json)

### Pantheon

```
{
  id, name, region, color,
  active_from, active_to, peak_from, peak_to,
  description,
  category?: 'abrahamic' | 'deified-human'
}
```

### God

```
{
  id, name, pantheon,
  category: major | minor | primordial | titan | hero | monster
          | deified-human | abrahamic,
  gender: 'M' | 'F' | 'N',
  domains: [],
  epithets?: [],
  parents: [ids],
  consorts: [ids],
  children: [ids],
  siblings?: [ids],
  archetype?: id,
  parallels?: [ids],
  description
}
```

### Archetype

```
{ id, name, description, examples: [god-ids] }
```

To add a god: append an entry to `data.json` with a unique `id`, link
by id in `parents` / `consorts` / `children` arrays, and the family-tree
view will render the relationships automatically.

---

## Long-term direction

The project grows by reading. New figures and relations are added when
something specific is being studied; coverage gaps stay until a tradition
is actually being read. Possible additions, in roughly the order they
become plausible:

- More depth on small pantheons that are currently sketches.
- Source citations surfaced in the figure view.
- A geographic map view, beside the timeline.
- Seasonal / agricultural cycles per pantheon.

None of these are promised. The actual order will follow whatever is
being read.

---

## Known limitations

- The app is one large self-contained HTML file. Fast to deploy, slow
  to refactor; expect inertia on big structural changes.
- Image fetches depend on Wikipedia being reachable.
- Mobile layout works, but family-tree view is more comfortable on a
  wide screen.
- The catalogue is one reader's compilation; it inherits that reader's
  blind spots.
