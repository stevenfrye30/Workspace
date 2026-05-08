# Atlas Re-homing Protocol

**Status:** v1, 2026-05-04. Validated by three controlled re-homings on the
Dhammapada Müller corpus. Companion to the Archive Source Integrity
Standard (`STANDARD.md`); read that first.

A *re-homing* attaches an existing graph node to an Archive primary-text
section because the node's phrase or rule set produces verbatim,
doctrinally-aligned evidence in that text. Re-homings are **strictly
additive**: a new attachment is authored, all existing attachments are
preserved. Detachment is a separate operation, out of scope for this
protocol.

This document governs the per-node-text attachment operation only. It
does not govern graph-level changes (new nodes / axes / subtypes /
edges) or pipeline-level changes (rule rewrites, fixture changes,
sync). Those have their own gates.

---

## 1. The three validated cases

| # | Node | Target | Locator | Calibration before? | Live phrase fires |
|---|---|---|---|---|---|
| 1 | `OM-e1f9907b` non-self | `dhammapada-chapter-20` | `buddhist/dhammapada-20:3` | none — phrase set already matched Müller | 3 phrases × 3 verses (277, 278, 279) |
| 2 | `CS-1ad1dc09` renunciation | `dhammapada-chapter-24` | `buddhist/dhammapada-24:353` | none — single Müller-verbatim phrase already present | 1 phrase × 1 verse (353) |
| 3 | `CM-fe58aea2` conditioned-arising | `dhammapada-chapter-11` | `buddhist/dhammapada-11:154` | **yes** — added 3 Müller-register `symbolic_phrases` | 3 phrases × 2 verses (153–154) |

Cases 1 and 2 establish the no-calibration path. Case 3 establishes the
phrase-calibration-before-re-homing path. All three followed the same
three-line execution and the same verification flow.

---

## 2. Required preconditions

A node MAY be re-homed to a target archive text only when **all**:

- **C1.** The target archive entry has been migrated to the Archive
  Source Integrity Standard — its markdown contains a `## Primary Text`
  block with a verbatim source attribution and verse content.
- **C2.** At least one phrase trigger from the node's `node_phrases.json`
  entry fires as a verbatim case-insensitive substring inside the target's
  `## Primary Text` body.
- **C3.** The verse where the firing phrase appears doctrinally argues
  the node's claim. Substring coincidence does not count.
- **C4.** No spurious phrase fires in the same primary text — neither
  this node's other phrases nor any other contributing node's phrases
  produce false positives in unrelated verses.
- **C5.** The node's axes / operation / subtype are honestly applicable
  to the target text.
- **C6.** Multi-text validity (Axiom 1 — ≥ 2 distinct corpus locators)
  is preserved by adding the new locator. For purely additive re-homing
  this is automatic.

If any condition fails, re-homing must **STOP**. Phrase calibration (§5)
may bring a failing C2 to PASS; the other conditions are not dispatchable
by phrase edits.

---

## 3. Pre-flight (analysis only — no file changes)

```
P1. Identify candidate target text(s) using doctrinal knowledge plus
    the contribution-validity policy (Tier framework).

P2. Confirm migration status of each candidate. Un-migrated targets
    must be migrated first as a separate operation.

P3. Substring-scan the candidate's `## Primary Text` against the
    node's full phrase set. Record EVERY phrase that fires and the
    verse(s) it fires on. Use a script — not doctrinal recall.

P4. Read each firing verse in full. Confirm the verse structurally
    argues the node's claim, not coincidentally containing the
    substring.

P5. Choose the anchor verse — the verse with the strongest verbatim
    phrase fire on the node's defining axis.

P6. Audit for false-positive surface across ALL contributing nodes'
    phrase sets against the target text.

P7. Verdict:
      PASS         — at least one phrase fires on a doctrinally-aligned
                     verse, no false-positive surface. Proceed to §4.
      DEFER        — target not yet migrated, or out of scope. Stop.
      RECALIBRATE  — phrase set needs widening (§5). Stop, calibrate,
                     re-run pre-flight.
      FAIL         — ontology mismatch, doctrinal misalignment, or
                     false-positive surface. Do not re-home.
```

---

## 4. Execution (additive, three lines)

Execute only when P7 returns **PASS**.

### 4.1 `node_to_archive.json` mapping

```json
"buddhist/<chapter-base>": "<archive-text-id>"
```

Insert alphabetically. Preserve existing entries.

### 4.2 `atlas_graph.json` corpus_locator

Append one new locator to the node's `corpus_locators` array:

```json
"<corpus-base>:<verse-N>"
```

The verse number is the anchor from P5. Preserve all existing locators
(§9).

### 4.3 `entity.html` SENTENCE_TEXTS allowlist (optional)

If sentence-level interaction (sentence wrapping + click-to-highlight)
is desired:

```javascript
"<archive-text-id>": true
```

Skip if not needed — phrase grounding works without sentence interaction.

**No other graph or pipeline files are touched. No sync runs.**

---

## 5. Phrase calibration

When P3 returns zero fires on a target text whose verses doctrinally
argue the node's claim, calibration adds register-specific phrases to
the node's `node_phrases.json` entry.

### 5.1 Acceptable additions

- **Verbatim translation phrases** — exact substrings of the target
  translation's actual wording, on doctrinally-correct verses. Case 3
  added `"maker of the tabernacle"`, `"thy rafters are broken"`,
  `"ridge-pole is sundered"` — all verbatim Müller, all on verses 153–154.
- **Tier classification:**
  - `technical_terms` — doctrinal Sanskrit / Pali names only.
  - `modern_terms` — contemporary academic English only.
  - `translation_phrases` — register-specific verbatim wording.
  - `symbolic_phrases` — image-bearing phrases (the *gahakāraka*, the
    rafters-and-ridgepole, the wheel-and-ox).
- **Confidence:**
  - `high` — substring so specific it cannot occur outside doctrinal
    context (e.g. `"ridge-pole is sundered"`).
  - `medium` — doctrinally specific; could in principle occur elsewhere.
  - `low` — bridges traditions or registers and may carry interpretive
    weight; use sparingly.

### 5.2 Unacceptable additions

- **Single-word substrings** (`"evil"`, `"action"`, `"follow"`) — too
  generic; substring-matching cannot disambiguate them.
- **Phrases another node already claims** — substring overlap that
  would cause two nodes to fire on the same passage with conflicting
  concepts. Audit cross-node phrase sets before adding.
- **Phrases that fire on non-doctrinal context elsewhere** — even when
  the target verse fires correctly, false fires elsewhere are noise.
- **Replacing or removing existing phrases.** Calibration is strictly
  additive. Existing phrases stay in place — they may match other
  translations not yet in the archive.

### 5.3 Translation-specific handling

The Archive grows across translations. The same node may be supported
by phrasings from Müller 1881 (Victorian Sanskritology), Bhikkhu Sujato
2022 (modern colloquial), Edwin Arnold 1885 (Victorian verse), etc.
The phrase set must accommodate all currently-supported registers in
parallel. Do not assume a single register; test each translation's
verbatim wording against the existing phrase set as a routine check
when a new translation enters the corpus.

### 5.4 When calibration must happen *before* re-homing

| P3 result | Required action |
|---|---|
| Zero phrase fires on target | RECALIBRATE first; re-run pre-flight after additions |
| ≥ 1 fire on a doctrinally-aligned verse | PASS — re-home now; further phrase additions can be deferred |
| ≥ 1 fire on a doctrinally-misaligned verse | FAIL — do not re-home; calibration won't fix doctrinal mismatch |

---

## 6. Locator strategy

- **One locator per re-homing.** A single anchor authorises the
  attachment; phrase grounding then naturally fires across the entire
  `## Primary Text` section because the runtime separates "is the node
  attached?" (locator) from "where does evidence appear?" (phrase fires).
- **Choose the anchor from P5** — strongest doctrinal phrase fire. For
  multi-verse phrase clusters (case 3's verses 153–154), prefer the
  verse with multiple fires.
- **Verse-numbered locators** — `<corpus-base>:<verse-N>` — match the
  per-verse-paragraph convention established by chapter migrations.
- **Do not add multiple locators in a single operation.** A second
  locator is a separate authorisation.

---

## 7. Verification

After execution, run:

### V1. JSON integrity
- `atlas_graph.json` parses; node count unchanged; edge count unchanged;
  all node ids unique.
- The affected node's `corpus_locators` count grew by exactly 1; all
  locators distinct.
- `node_to_archive.json` parses; all keys distinct.

### V2. Target-text simulation (Tier-B promotion)
Run the contribution-validity tier simulator against the target archive
entry. Confirm:
- The node appears in the contributors list.
- At least one phrase fires verbatim on a doctrinally-aligned verse.
- Stage-1 tiering classifies the node as **Tier B** (Contributes to).
- No other node spuriously promotes from Tier E to Tier B.

### V3. Cross-text regression
Run the simulator against every previously-attached text for this node.
Confirm:
- Existing Tier-B attachments remain Tier B with the same evidence.
- Existing Tier-E attachments (typically the synthetic-fixture-derived
  chapter 3 attachment) remain Tier E. The pre-existing demotion is
  the *correct* behaviour and must hold.

### V4. Existing test gates
`tools/test_structural_grounding.py` and `tools/test_sentence_mapping.py`
both green. Gate count unchanged from pre-execution.

If any verification step fails, roll back per §10.

---

## 8. Stop conditions

Re-homing must STOP, with no graph changes, when any of:

| Code | Condition | Path |
|---|---|---|
| F1 | Zero phrase fires on the target text | RECALIBRATE → re-run pre-flight |
| F2 | Phrase fires but verse is doctrinally misaligned | FAIL — substring coincidence is not evidence |
| F3 | Translation-register mismatch contested across translations | DEFER pending tradition-by-tradition phrase audit |
| F4 | Pronoun / voice mismatch (e.g. first-person phrases vs. third-person target) | RECALIBRATE with target-register-specific phrases |
| F5 | False-positive surface in target — other nodes' phrases over-fire alongside | Audit and resolve before proceeding |
| F6 | Target text not yet migrated to the Archive Source Integrity Standard | Migrate first as a separate, minimal step |
| F7 | Ontology mismatch (axes / operation / subtype don't honestly fit) | Leave the node alone; consider new-node authoring as a separate decision |

---

## 9. Why additive

- **Multi-text validity (Axiom 1).** Each node requires ≥ 2 distinct
  corpus locators. Removing locators while adding others risks a
  transient state where the node falls below validity. Strict addition
  strictly grows the locator count.
- **Detachment is a separate operation.** Removing a locator from a
  node's existing attachment changes the published graph in ways that
  warrant their own audit (whether the synthetic predecessor's locator
  should be retired; whether removing it preserves the node at all).
  Re-homing focuses on *adding* a real-text attachment.
- **Reversibility.** Purely additive change is single-commit revertible.
  Combined add-and-remove is harder to undo cleanly.
- **Tier discipline already encodes the right reading-view behaviour.**
  Stage-1 frontend tiering correctly demotes synthetic-fixture-derived
  attachments to Tier E ("Related concepts") while real-text attachments
  promote to Tier B ("Contributes to"). The reader sees the correct
  hierarchy without needing the synthetic locator removed.

---

## 10. Rollback procedure

A re-homing's three-line execution is trivially revertible:

1. Remove the new line from `node_to_archive.json`.
2. Remove the new locator from the node's `corpus_locators` in
   `atlas_graph.json`.
3. Remove the new key from `entity.html`'s `SENTENCE_TEXTS` allowlist
   (if added).

No other state was touched, no sync ran, no rule changed. Single-commit
reversal restores the pre-re-homing state exactly.

---

## 11. Hard prohibitions

A re-homing operation MUST NOT:

- Modify `Atlas/pipeline/motif_extractor.py` (pipeline rule changes are
  a separate gate).
- Modify `Atlas/core/nodes.py` SUBTYPES, AXES, NODE_TYPES, OPERATIONS
  (closed enumerations are guarded).
- Modify `node_grounding_rules.json` (structural-rule changes are a
  separate gate; calibration of phrase set only).
- Run `tools/sync_atlas_graph.py` or `tools/sync_node_phrases.py`
  (sync runs against the pipeline source; re-homing is workspace-side).
- Add new nodes, edges, axes, subtypes, or operations.
- Remove existing locators, detach pre-existing attachments, or alter
  previously re-homed nodes.

---

## 12. Pre-ship verification checklist

Before considering a re-homing shipped:

- [ ] Target archive entry follows the Archive Source Integrity Standard
      (`## Primary Text` block present).
- [ ] At least one phrase fires verbatim on a doctrinally-aligned verse.
- [ ] The verse is the chosen anchor (P5).
- [ ] No false-positive surface in the target.
- [ ] Three-line execution complete: mapping + locator + (optional)
      SENTENCE_TEXTS allowlist.
- [ ] V1: JSON integrity preserved across all artifacts.
- [ ] V2: target-text simulator shows Tier-B promotion with correct
      evidence.
- [ ] V3: previously-attached texts unchanged in their tier
      classifications.
- [ ] V4: `tools/test_structural_grounding.py` and
      `tools/test_sentence_mapping.py` both green.
- [ ] No phrase grounding fires inside commentary sections.
- [ ] All hard prohibitions of §11 honoured.

---

## 13. Out of scope

This protocol does not address:

- **Detachment** — retiring synthetic-fixture-derived locators (e.g.
  `buddhist/dhammapada-3:1` for non-self after non-self has been
  re-homed to chapter 20). That is a separate operation governed by the
  broader source-of-truth migration plan.
- **Pipeline-side migration** — moving production graph generation from
  synthetic fixtures to archive-derived input. That is a §10 known-
  limitations item from `STANDARD.md`, with its own audit and staged plan.
- **Edge re-derivation** — when nodes gain new locators, the pipeline's
  axis-overlap edge logic might add or modify edges. Currently the
  workspace graph's edges are hand-curated; edges remain unchanged
  across re-homing operations.
- **Cross-tradition re-homing** — all three validated cases are within
  Buddhist Müller. The protocol's pre-flight P3 generalises to any
  tradition's phrase set, but cross-tradition test data is not yet
  established.

---

## 14. Known limitations (recorded, not deferred)

- **Tier-E demotion of the synthetic predecessor relies on Stage-1
  frontend tiering.** That tiering layer must remain in place for the
  reader-visible asymmetry to hold. If the tiering is ever disabled or
  rewritten, post-re-homing pages would show the same node under
  "Contributes to" on both the synthetic and real-text attachments,
  with evidence available only on the real one. The frontend's Tier-E
  panel is the user-facing safety net.
- **Hand-edited workspace artifacts will be overwritten by sync.**
  The mapping in `node_to_archive.json` and the rule definitions in
  `node_grounding_rules.json` are workspace-only and survive sync.
  However, `atlas_graph.json` and `node_phrases.json` are regenerated
  by `tools/sync_atlas_graph.py`. To make a re-homing sync-stable,
  either (a) the pipeline must produce the same locator from real-text
  fixtures (preferred long-term path), or (b) sync must be deferred
  until the source-of-truth migration completes. The current state
  is honest: re-homing changes are workspace-curated until the
  pipeline catches up.
- **Substring matching has known false-positive risks.** The runtime
  uses simple `String.indexOf` substring matching. Phrase choices in
  §5.1 are constrained to mitigate this, but the matcher itself is
  shallow. Word-boundary regex matching is a possible future hardening.
