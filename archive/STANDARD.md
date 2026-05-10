# Archive Source Integrity Standard

**Status:** v1, 2026-05-04. Pilot text: `dhammapada-chapter-3`.

Atlas reads the Archive in a particular order: **primary text first, Atlas
interpretation second.** Commentary, summaries, and reading notes are
useful, but they are not source evidence. This document defines the
structure every Archive entry must follow so the interaction layer
(phrase grounding, structural grounding, sentence interactions) can
operate honestly and so a reader can always tell what is the source and
what is Atlas.

---

## 1. Required entry order

Every `workspace-hub/archive/texts/*.md` entry must be structured top to
bottom in this order:

1. **YAML frontmatter** — `id`, `title`, `summary`, `tradition`,
   `period`, `language`, `author`, `part_of`, `tags`, `library_id`,
   `library_chapter` (optional). Existing keys from older entries are
   preserved.
2. **`# H1 title`** — the canonical entry title.
3. **`## Primary Text`** — verses, passages, or lines from one
   identified source translation. See §3.
4. **`## Atlas notes`** — Atlas's introductory commentary about the
   chapter or passage.
5. **`## Context`** — historical, canonical, and editorial positioning.
6. **`## Reading note`** — practical guidance on how to read the text.
7. **`## Related`** — cross-references to other archive entries.
8. **`## Resources`** — translations, critical editions, commentaries,
   recommended upgrades.

Entries that lack particular sections (e.g. no Reading note) may omit
them, but the order of the remaining sections must be preserved.

---

## 2. Required visual distinction

The H2 heading **`## Primary Text`** (case-insensitive trimmed match) is
the runtime trigger. `entity.html`'s `groupPrimaryTextSection()` wraps
that H2 plus every following block sibling, up to the next H2, into a
`<section class="primary-text">`. The section gets a quiet left-border
accent so the reader sees, at a glance, which block is the source.

Atlas commentary lives outside that section and reads as ordinary
prose under its own H2 headings.

The wrap is performed in JS, not in markdown — the markdown source
stays pure. Authors must not embed `<section>` or other HTML tags in
the markdown source.

---

## 3. Source rule

The Primary Text section must:

- **Cite a specific source** in a single attribution paragraph
  immediately under `## Primary Text`. The attribution names the
  translator, work, edition, year, and license/provenance (e.g.
  Project Gutenberg, public domain).
- **Reproduce verses verbatim** from that source. No paraphrase, no
  invention, no editorial smoothing. Punctuation, parenthetical
  glosses, and capitalization stay as the source has them.
- **Stick to one translation per entry.** Other translations belong in
  `## Resources`, not in the primary block. (A second translation can
  live in its own archive entry — e.g. `dhammapada-sujato-3.md`.)
- **Preserve verse numbering** as the source has it. Use bold markdown
  prefixes for verse numbers (`**33.**`) so the renderer keeps them
  inside the verse paragraph rather than splitting them into their
  own block.

---

## 4. Evidence rule

Atlas's interaction layers prefer the Primary Text section when it
exists:

| Layer | Scope when `.primary-text` exists | Fallback |
|---|---|---|
| Sentence wrapping (`wrapSentencesInArticle`) | inside `.primary-text` | whole article |
| Structural-grounding evidence pool (`collectProseText`) | inside `.primary-text` | whole article |
| Phrase grounding (`wrapGroundings`) | inside `.primary-text` | whole article |
| Phrase-grounding gate (`nodeIdsWithPhraseGrounding`) | inside `.primary-text` | whole article |

Sentence-level interactions are additionally gated by a per-text
allowlist (`SENTENCE_TEXTS` in `entity.html`). New texts opt in
explicitly after they have been migrated and verified.

---

## 5. Commentary rule

Commentary explains a text. It does not serve as primary evidence:

- Atlas notes, Context, Reading note, Related, and Resources sections
  must not be sentence-wrapped, phrase-grounded, or harvested as
  evidence.
- Commentary stays readable; it never receives the `.primary-text`
  border, the phrase-grounding tint, or the sentence-active highlight.
- A reader who is uncertain whether a sentence is source or commentary
  can use the visible section boundary as the answer.

If at some future point commentary becomes a useful source for a
distinct interaction (e.g. "show me commentary about verse 37"), it
should ride on a separate wrapper class (e.g.
`<section class="atlas-commentary">`) and a separate interaction
layer, never on the primary-text scope.

---

## 6. Fallback rule

Some entries do not yet have their primary text loaded. In that case
the entry must still declare the convention so the gap is visible:

```markdown
## Primary Text

*Primary text not yet loaded for this entry. The translation will
appear here once it is migrated.*
```

The wrapper still forms (a placeholder paragraph counts as content),
the reader sees the gap explicitly, and Atlas's evidence pool
correctly produces no evidence rather than silently harvesting
commentary.

---

## 7. Generalization rule

Migrate entries one at a time:

1. **Pick one entry.** Start from a chapter where the primary text
   exists in `01_library/.../passages_<translation>.json`.
2. **Restructure the markdown** to match §1, putting verses under
   `## Primary Text` and moving the existing introductory paragraph
   under `## Atlas notes`.
3. **Reproduce verses verbatim from the source JSON.** Verify that
   any verses split across page-break footnotes in the JSON are
   rejoined into single paragraphs.
4. **Run the validation tests** against the migrated entry:
   - `python tools/test_structural_grounding.py`
   - `python tools/test_sentence_mapping.py`
   The tests must pass with the new content. Update the gates if the
   migrated entry's contributors are different.
5. **Eyeball the rendered page** to confirm the section wrap, the
   verse formatting, and that the existing commentary is still
   readable in its new location.
6. **Stop after each migration**, write up what changed, and decide
   whether the next entry is ready.

Do not bulk-migrate until at least three controlled examples have
shipped without surprises. Automation may then read this standard
and apply it mechanically — but only after the manual pattern is
proven.

---

## 8. Hard prohibitions

- Do not paraphrase primary text.
- Do not invent verses.
- Do not delete commentary.
- Do not move commentary above primary text.
- Do not embed raw HTML in the markdown source.
- Do not rely on AI/LLM interpretation for the evidence layer.
- Do not introduce fuzzy matching for phrase or rule grounding.

---

## 9. Verification checklist

When migrating an entry, confirm before shipping:

- [ ] Frontmatter unchanged or only widened (no semantic loss).
- [ ] H1 title preserved.
- [ ] `## Primary Text` is the first H2 in document order.
- [ ] Attribution paragraph immediately under `## Primary Text` names
      translator, work, edition, year, and license.
- [ ] Verses appear verbatim from the cited source.
- [ ] `## Atlas notes` follows the verses; existing commentary is
      preserved.
- [ ] `## Context`, `## Reading note`, `## Related`, `## Resources`
      preserved in order.
- [ ] `tools/test_structural_grounding.py` passes.
- [ ] `tools/test_sentence_mapping.py` passes (if the entry is on the
      `SENTENCE_TEXTS` allowlist).
- [ ] Older archive entries (without `## Primary Text`) still render
      and behave as before.

---

## 10. Known limitations (recorded, not deferred)

These are limitations of the current implementation that the standard
inherits but does not yet fix. They are out of scope for v1; later
revisions should address them.

- **Locator alignment.** Graph corpus locators (`<corpus>:<n>`) do
  not yet correspond to verse numbers. With the section wrap,
  `?locator=...:1` may land on the H1 or on the whole primary-text
  section rather than a single verse. Re-keying locators is an
  upstream graph concern.
- **Attribution sentence splitting.** Translator initials like `F.`
  in "F. Max Müller" produce tiny sentence fragments under sentence
  wrapping. They are silent (no rule keywords match) and do not
  affect mapping, but they do create extra `<span class="sentence">`
  noise in the DOM.
- **Per-paragraph sentence boundary.** A sentence that runs across
  two paragraphs in the source — rare in verse, but possible in
  prose — becomes two sentences after wrapping.

---

## 11. Shelf status (lightweight metadata)

Each entry's frontmatter may carry a `status` field. The contract is
intentionally small: it tags an entry's relationship to the front-page
shelf, nothing more.

| Value       | Meaning                                                   |
|-------------|-----------------------------------------------------------|
| `shelf`     | Currently linked from the curated front shelf (`index.md`). |
| `deep-link` | Lives in the deeper shelves (`shelves.md`); reachable by URL or by tradition listing. |
| `draft`     | Prepared but not yet ready to surface.                     |
| `legacy`    | Pre-pivot entry, retained for historical continuity.       |

When `status` is absent, the entry is treated as `deep-link` — the
default for entries not currently surfaced on the front shelf.

`entity.html` reads the `status` field via a regex on the raw
markdown frontmatter and renders one quiet italic line under the H1
title for every state except `shelf`. The text is fixed; it is not
configured per-entry.

This is a metadata-layer convention only. It does not modify passage
content, commentary, or any other section. It can coexist with §1's
required entry order and §3's source rule without conflict.

---

## 12. See also

For authoring-surface direction, see `SYNC.md`.
