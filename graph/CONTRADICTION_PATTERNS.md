# ATLAS Contradiction Patterns

This document records the structural patterns underlying hand-curated `contradiction` edges in the ATLAS graph. Each pattern is a **recognition aid** — a way to spot a reusable contradiction structure when adding new nodes, texts, or edges. Patterns are *not* auto-detection rules: contradiction-edge authoring remains manual, with patterns serving as guidance for human review.

A pattern earns a section here as soon as one curated edge instantiates it; single-instance patterns are documented with that limitation explicit, so the structure is available for recognition before further instances accumulate.

Axis names referenced below match `Atlas/core/nodes.py:AXES` exactly.

---

## P-1: Epistemic-Access Contradiction

### 1. Pattern Name

**P-1 — Epistemic-Access Contradiction.**

### 2. Core Definition

A P-1 contradiction obtains between an OM-layer node that **categorically denies cognitive/propositional access to the absolute** and an LM-layer node that **requires cognitive recognition of the absolute as its mechanism of liberation**. The two are mutually exclusive at the *epistemic-access layer*: one denies the access mode the other requires.

**Formal rule:**

```
IF  OM_node has axis "ineffability"
    (categorical denial of nominal/propositional capture of the absolute)
AND LM_node has axes ⊇ {"absolute", "knowledge"}
    (cognitive recognition of the absolute as liberation mechanism)
THEN OM_node ↔ LM_node is a true contradiction at the epistemic-access layer.
```

The contradiction obtains because if propositional capture of the absolute is structurally impossible, no proposition (including any mahavakya or analog) constitutes knowledge of the absolute, and the LM node's knowledge-mechanism of liberation is broken. If cognitive recognition of the absolute is possible and liberating, the OM node's categorical ineffability claim is false. The two cannot both be true within one framework.

### 3. Structural Conditions

**OM source side — necessary:**
- Node type: `OM`.
- Carries axis `ineffability` (categorical denial of nominal/propositional capture of the absolute).
- Targets the absolute (i.e. carries axis `absolute` so the denial scope and the contradicted domain match).

**LM target side — necessary:**
- Node type: `LM`.
- Carries axes ⊇ `{absolute, knowledge}` (cognitive recognition of the absolute as the liberation mechanism).

**Cross-cutting — necessary:**
- Both nodes share the `absolute` axis (this is the contradicted domain — see §7 Limitations).

**Operation pattern — incidental:**
- Operations of the two endpoints are **not** required to form a reversal pair. Across the three known instances, the OM-side operation is `produce` (Daoist generative-source) or `negate` (apophatic-absolute), and the LM-side operation is `align` (knowledge). Neither `produce↔align` nor `negate↔align` is a reversal pair (`produce↔regulate`, `negate↔assert`, `align↔dissolve` per `OPERATION_REVERSAL` in `core/nodes.py:107-116`). Consequently, the auto-emitter's rule 3 (intra-type contradiction by reversed-operation + shared axis) **does not** generate this edge, and even if axis-overlap were sufficient, rule 3 is intra-type-only — P-1 is cross-layer (OM ↔ LM). **P-1 contradictions are therefore invisible to the auto-emitter by design and must be hand-authored.**

**Other incidentals — not load-bearing:**
- Specific node IDs, subtypes, traditions, corpus texts. P-1 is type-level, not text-level.

### 4. Doctrinal Interpretation

What the contradiction represents philosophically:

A tradition that develops both *apophatic theology* (denial of cognitive access to the absolute) and *knowledge-based liberation theology* (cognitive recognition of the absolute as the soteriological mechanism) faces an internal tension: if the absolute resists all cognition, the cognitive recognition that liberation requires cannot in fact reach the absolute. The two doctrinal moves contradict at the level of what the cognitive subject can do with respect to the absolute.

P-1 surfaces this tension as a graph-level edge whenever the two doctrinal moves are textually present in distinct works (or distinct passages). It records, as data, that some traditions resolve the tension by giving up cognitive-liberation theology (Daoist, Vedic-apophatic, Christian-mystical), while others give up apophatic theology (Vedantic monism, classical knowledge-Vedanta).

Why the pattern appears across traditions:

The absolute (whatever it is called: Brahman, the Dao, God, the One) is the kind of object whose nature invites apophatic predication — it is by definition not a thing among things, and any predicate seems to limit it. *Independently*, every tradition that aims at liberation through correct knowledge of the absolute must claim that the absolute IS knowable. These two intuitions are intelligible separately but cannot coexist within a single doctrinal framework. Across traditions, three responses are observed:

1. **Apophatic-only** (Kena Upanishad): the absolute is categorically inaccessible; cognitive-liberation theology is rejected. Liberation, if mentioned, is framed differently (often as transformation rather than recognition).
2. **Apophatic-with-non-cognitive-substitute** (Daoist Daodejing, Christian Cloud of Unknowing): the absolute is categorically inaccessible to cognition, but an alternative non-cognitive access mode is affirmed. Daoism: the source produces multiplicity (generativity) and is reached by "without desire" disposition. Christian mysticism: God is reached "by love, not thought" — *"By love may He be gotten and holden; but by thought never"* (Cloud Ch 6).
3. **Kataphatic-cognitive** (Chandogya, Brihadaranyaka, classical Vedanta): the absolute is positively predicable, knowable, and identifiable; knowledge-of-absolute liberates. Apophatic register may appear pedagogically (*neti neti*) but is paired with positive substantive predication (*satyasya satyam*) and so does not constitute categorical denial.

P-1 is the typed edge that records the contradiction between camps 1+2 and camp 3.

### 5. Known Instances

The graph currently contains **three curated P-1 instances**, spanning three independent traditions:

| Edge | Tradition | OM source | OM subtype | LM target | Source corpus | Target corpus |
|---|---|---|---|---|---|---|
| **E-0017** | Daoist | OM-52056395 (`dao-generative-source`) | `generative-source` | LM-9ea458a9 | Daodejing Ch. 1 (Legge 1891) — `daoist/daodejing-1:1` | Chandogya — `upanishads/chandogya:6.8.7` |
| **E-0018** | Vedic | OM-0722c84e (`kena-apophatic-absolute`) | `apophatic-absolute` | LM-9ea458a9 | Kena Upanishad 1.3 (Müller 1879) — `upanishads/kena:1.3` | Chandogya — `upanishads/chandogya:6.8.7` |
| **E-0019** | Christian | OM-b7b1f8af (`cloud-apophatic-absolute`) | `apophatic-absolute` | LM-9ea458a9 | The Cloud of Unknowing Ch 6–7 (Underhill 1922) — `christian/cloud-of-unknowing:6` | Chandogya — `upanishads/chandogya:6.8.7` |

**Short descriptions:**

- **E-0017 (Daoist):** Daodejing §1 *"the name that can be named is not the enduring and unchanging name"* is the categorical denial of nominal access; §2 *"Originator of heaven and earth"* / *"Mother of all things"* names the source by what it produces, not by what it is. The Daoist apophasis is *paired with generativity* — a non-substantive functional co-claim — making this an apophatic-with-substitute instance (camp 2).
- **E-0018 (Vedic):** Kena Upanishad 1.3 *"the eye does not go thither, nor speech, nor mind"* is multi-modal categorical denial across perception, speech, and cognition; *"we do not understand, how any one can teach it"* forecloses even teachability. Pure apophasis with no positive substantive co-claim — apophatic-only instance (camp 1).
- **E-0019 (Christian):** Cloud of Unknowing Ch 6 *"of God Himself can no man think"* and *"He may well be loved, but not thought. By love may He be gotten and holden; but by thought never"* is categorical denial of cognitive access paired with affirmation of non-cognitive *love*-mediation. Apophatic-with-substitute instance (camp 2), structurally analogous to the Daoist case but with a different non-cognitive access mode (love rather than generativity).

**Activation pattern (uniform across all three):**

Each edge activates symmetrically once both endpoints are Tier-B grounded in their respective home texts:
- `LM-9ea458a9 × <OM home text>` → `FAIL_DOCTRINAL` via the P-1 edge (the OM node is the entrenched Tier-B contributor on its home text).
- `<OM node> × chandogya-upanishad-core` → `FAIL_DOCTRINAL` via the P-1 edge (LM-9ea458a9 is the entrenched Tier-B contributor on Chandogya).

E-0017 and E-0018 are confirmed active; E-0019's activation depends on the audit's `node_to_archive.json` mapping picking up the `christian/cloud-of-unknowing` prefix (a separate cycle).

### 6. Detection Criteria (Future Use)

P-1 remains a **manual recognition aid**, not auto-detection logic. Adding it to `Atlas/pipeline/builder.py:_candidate_edges` is deferred until three documented promotion criteria are all satisfied.

**Promotion criteria (all three required) — current status:**

| # | Criterion | Status |
|---|---|---|
| 1 | At least 2 additional curated edges instantiate P-1 (beyond E-0017). | **✅ Satisfied.** E-0018 (Vedic) and E-0019 (Christian) provide two additional curated instances. The pattern's cross-tradition robustness is empirically established across three independent traditions. |
| 2 | The axis vocabulary in `core/nodes.py` is extended to make denial/use pairing explicit (e.g., a `DENIAL_USE_AXIS_PAIRS` table) so auto-rules don't have to infer it from semantics. | **❌ Not yet implemented.** No formal denial/use axis pairing exists; the relationship between `ineffability` (denial-axis) and `knowledge` (use-axis) is currently encoded only in this document and in the hand-curated edge rationales. |
| 3 | The existing auto-emitter's rationale-quality issue is addressed first — E-0001 through E-0014 carry placeholder rationales; cross-layer auto-emission must not amplify that noise. | **🟡 Partially in progress.** The auto-emitter rule update added an `auto_generated: true` flag to distinguish auto-emitted from hand-curated edges in JSON, addressing the *distinguishability* aspect. Rule 3 was strengthened to ≥2 shared axes, suppressing the lowest-quality auto-emissions. The placeholder-rationale problem on the existing E-0001 through E-0014 in the live graph is unaddressed; those edges retain their pre-extension form unless and until a regen overwrites them. |

**Auto-detection rule sketch (for future implementation, not yet authorized):**

```
IF  axis-pair (denial="ineffability", use="knowledge") is declared
    in a DENIAL_USE_AXIS_PAIRS table in core/nodes.py
AND OM_node carries denial-axis
AND LM_node carries {use-axis, target-axis (= "absolute")}
AND both nodes are Tier-B grounded on their home texts
THEN emit contradiction edge with auto_generated=true,
     pattern reference "P-1" in rationale.
```

This is conceptual; no implementation is proposed. Implementation requires:
- Schema extension to add the denial/use pair table.
- Builder.py rule addition for cross-layer P-1.
- Audit-tool extension to recognize the pattern reference for diagnostic display.
- Regression testing across all existing graph state.

**Phrase-level indicators (optional, for future support):**

If phrase-tradition tagging (per the safeguards proposal) is introduced, P-1 detection could additionally cross-check that:
- The OM node's calibrated phrases include at least one categorical-form predicate (matching templates like *"X cannot be Y"*, *"the name that can be named is not X"*, *"of X can no man think"*).
- The LM node's calibrated phrases include at least one cognitive-recognition predicate (matching templates like *"freed by knowing"*, *"liberation through knowledge"*, *"thou art that"*).

These templates are not currently in the schema; they would constitute an additional safeguard layer if introduced.

### 7. Limitations

#### 7.1 False positives — three near-miss pairs explicitly do NOT trigger P-1

**`OM-028a568b` (Vedantic monism, Chandogya) × `LM-9ea458a9` (knowledge).**
- LM side qualifies — axes `{absolute, freedom, knowledge}`.
- OM side does NOT — OM-028a568b's axes are `{absolute, non-duality}`; no `ineffability`.
- Doctrinally correct: Chandogya's monism does not refuse naming. The text actively names and predicates the absolute (*"It is the True. It is the Self"*), and the pedagogy presumes the True is transmissible (*"there indeed it is"*, 6.13.2). The absolute is *contingently* not yet perceived by the unrealized self, not *structurally* unnameable. Adding `ineffability` to OM-028a568b post hoc to make P-1 trigger would falsify the corpus.

**`OM-0fe9235c` (Brihadaranyaka monism, 2.3) × `LM-9ea458a9` (knowledge).**
- LM side qualifies.
- OM side does NOT — OM-0fe9235c's axes are `{absolute, non-duality}`; no `ineffability`.
- This is the canonical pedagogical-negation exclusion case (Q2 of the Ineffability Decision Gate). Brihadaranyaka 2.3.6 contains *neti neti* but pairs it in immediate succession with *"the True of the True"* — kataphatic substantive predication of Brahman. The text is monism-with-apophatic-register, not categorical ineffability. The `ineffability` axis was correctly NOT assigned during integration.

**`OM-e1f9907b` (Buddhist non-self ontology) × any LM with `{absolute, knowledge}`.**
- OM side does NOT carry `ineffability`. Its axes are `{impermanence, non-self}`.
- Buddhist non-self ontology denies *substantive enduring entity*, which is a different claim from denying *nominal capture of the absolute*. The recent recalibration of OM-e1f9907b removed the cross-tradition risky phrases (*"neti neti"*, *"not this, not this"*) that had been in the phrase set, eliminating the false-positive surface that would have appeared once Brihadaranyaka 2.3 entered audit scope.

**`LM-36ebce29` (realization) × any OM with `ineffability`.**
- LM side does NOT carry `knowledge`. Its axes are `{absolute, freedom, non-duality}`.
- Realization aligns with `non-duality` (an identity-claim: *self IS absolute*), not with `knowledge` (an epistemic-claim: *knowing the absolute liberates*). The mechanism is different — realization is a being-claim, knowledge is an epistemic-claim. P-1 targets only the epistemic side.

The `ineffability` axis is the load-bearing distinguisher on the OM side. Without it, the pattern does not apply; with it, the pattern is a strong candidate. Assigning `ineffability` to a node that does not textually warrant it would corrupt the pattern's discriminative power.

#### 7.2 Scope limitations — what P-1 does NOT cover

P-1 applies **only** when:

1. **Shared `absolute` domain.** Both nodes must target the absolute. If one node addresses self (IM-layer), phenomena, the conditioned process, or some other domain, P-1 does not apply — the nodes are addressing different questions.
2. **Cognitive-access mechanism specifically.** The pattern is about *epistemic* access to the absolute. It does not generalize to:
   - Practical / ethical access (cf. LM-59d26971, `liberation-by-ethical-conduct`).
   - Cessation mechanism (cf. LM-c101ae16, which contradicts knowledge-LM via E-0011 — a sibling pattern, not P-1).
   - Devotional or affective access (no current node exercises this; would need separate analysis).
3. **Categorical, not contingent, denial.** Texts asserting that the absolute is *hard to grasp*, *initially imperceptible*, or *requires preparation* express contingent epistemic failure and do not instantiate the OM side. Only categorical claims qualify.

Not all epistemic differences are P-1. E-0011 (knowledge ↔ cessation) is also an epistemic-layer contradiction but a different one — cessation says knowledge is *insufficient* (a claim about sufficiency); P-1 says cognitive access is *misframed* (a claim about possibility). Sibling patterns, distinct rules.

#### 7.3 Sub-feature variation across instances — schema expressiveness limit

The three known instances differ in their *positive co-claim*, but the schema currently has no axis to capture this:

| Instance | Apophatic core | Positive co-claim | Schema representation |
|---|---|---|---|
| E-0017 (Daoist) | categorical nominal denial | generativity (Mother of all things) | captured by `generativity` axis on OM-52056395 |
| E-0018 (Vedic) | categorical multi-modal denial | none — pure apophasis | absence is the feature |
| E-0019 (Christian) | categorical cognitive denial | non-cognitive love-access | captured only via phrases (*"He may well be loved, but not thought"*); no axis represents "love-access" or "non-cognitive-access" |

The Cloud's love-mediation feature is doctrinally distinctive but is NOT visible at the schema/axis level. It is captured only via phrases. Two consequences:

- The auto-emitter cannot generate edges that distinguish Cloud-style apophasis from Kena-style pure apophasis (both have the same axis profile `{absolute, ineffability}` and the same `apophatic-absolute` subtype).
- Equivalence edges between OM-b7b1f8af and OM-0722c84e (auto-generated by rule 2) over-state the alignment by ignoring the love-access sub-feature.

This is a known schema limitation, not a P-1 design defect. See §8 Future Extension for a possible refinement.

#### 7.4 Why P-1 is not currently auto-detected

In addition to the unmet promotion criteria 2 and 3 in §6, several risks of premature automation:

- **Axis-assignment fragility.** P-1 detection depends critically on the `ineffability` axis being assigned correctly. The Brihadaranyaka 2.3 case demonstrated that surface vocabulary (*neti neti*) can mislead; only the structural test (categorical denial NOT paired with kataphatic substantive predication) discriminates correctly. Auto-detection without the documented exclusion criteria would over-fire on Vedantic monism passages.
- **Combinatorial growth.** As new apophatic-of-absolute traditions are added, each one auto-generates a P-1 candidate against LM-9ea458a9 (and any future cognitive-LMs). Without rationale-quality safeguards, edge density grows faster than reviewer capacity.
- **Inappropriate generalization.** Auto-detection from a recognized pattern risks generalizing to near-but-not-identical cases (e.g., LM-9ea458a9 vs LM-36ebce29 — knowledge vs realization). Manual recognition with the documented criteria preserves precision.

### 8. Future Extension

How the pattern might evolve:

- **`non-cognitive-access` axis (or sub-axes).** The Cloud-vs-Kena structural-feature distinction (love-mediation present vs absent) suggests a candidate axis: `non-cognitive-access` (or finer-grained: `love`, `devotion`, `will`). If introduced, the schema could capture Cloud's positive co-claim explicitly, and a refined P-1 sub-pattern could distinguish "pure apophasis" from "apophasis-with-non-cognitive-substitute" at the graph level rather than only in rationale text. This would require a schema-extension justification cycle parallel to the prior `ineffability` and `generativity` extensions.

- **Sibling pattern P-2 — sufficiency contradiction.** E-0011 (knowledge ↔ cessation) is structurally distinct from P-1: cessation asserts that knowledge is *insufficient* without process-dissolution, not that cognition is *categorically misframed*. If E-0011 is joined by additional similar instances (e.g., a future ethical-conduct ↔ knowledge contradiction), formalizing it as P-2 — *Sufficiency Contradiction* — would document a second epistemic-layer pattern alongside P-1.

- **Sibling pattern P-3 — identity-vs-process contradiction.** Already exists in the graph: E-0007 (realization ↔ cessation) — being-claim vs process-dissolution. This is structurally distinct from both P-1 and P-2; could be formalized as P-3 (*Identity-vs-Process Contradiction*) with realization-style identity-LMs as one camp and cessation-style process-LMs as the other.

- **`structural-divergence` edge type.** Currently the auto-emitter's rule 2 produces `equivalence` edges for nodes sharing subtype + operation + ≥2 axes. For pairs like OM-b7b1f8af ↔ OM-0722c84e (Cloud ↔ Kena) that align structurally but differ at the sub-feature level (love-access vs none), a weaker `cross-tradition-convergence` or `structural-parallel` edge type would more accurately capture the relationship. Adding such an edge type would require schema extension to `EDGE_TYPES` in `core/edges.py`.

- **Cross-pattern composition.** Future patterns might combine: e.g., a node could fall under both P-1 (epistemic-access) and a hypothetical P-4 (devotional-access) if it makes both a cognitive-access claim and a devotional-access claim. The current single-pattern-per-edge convention handles one structural opposition at a time; multi-pattern edges would require taxonomy work.

Each extension is a separate justification cycle. None is currently authorized; all are listed here as recognized possibilities surfaced by the three existing instances.

---

## P-2: Sufficiency Contradiction

### 1. Pattern Name

**P-2 — Sufficiency Contradiction.**

### 2. Core Definition

A P-2 contradiction obtains between two LM-layer nodes that **propose different mechanisms of liberation**, where each mechanism's sufficiency claim implicitly or explicitly denies the other's. Both sides agree that the absolute exists (Layer 0 resolved) and that some path leads to liberation (Layer 1 resolved); they disagree about *what path operates* and whether any single path is sufficient.

**Formal rule:**

```
IF  LM_node_A asserts liberation by mechanism X
    (e.g., knowledge / cognitive recognition; cessation; ethical
     conduct; devotion)
AND LM_node_B asserts liberation by mechanism Y
    where X ≠ Y
AND LM_node_B's sufficiency claim implies that LM_node_A's mechanism
    alone is insufficient (or vice versa, or both)
THEN LM_node_A ↔ LM_node_B is a true contradiction at the
     liberation-mechanism / sufficiency layer.
```

The contradiction obtains because: if mechanism X alone liberates, mechanism Y is unnecessary and the Y-tradition's path is misframed. If mechanism Y is required, mechanism X alone is insufficient and the X-tradition's path is incomplete. The two claims about *what is sufficient for liberation* are mutually exclusive — at least one side's sufficiency claim must be false.

Make explicit:
- *Knowledge alone is sufficient* (e.g., LM-9ea458a9 — recognition of the mahavakya liberates) **vs** *Knowledge is insufficient* (e.g., LM-c101ae16 — cessation of conditioned arising is the operative move; recognition without cessation leaves karmic-process intact).

### 3. Structural Conditions

**Source side (LM_A) — necessary:**
- Node type: `LM`.
- Asserts a specific liberation mechanism. Currently-existing mechanism axes: `knowledge` (cognitive recognition); future axes may include `cessation`, `devotion`, etc.
- Operation likely `align`, `dissolve`, or similar mechanism-specific operation.

**Target side (LM_B) — necessary:**
- Node type: `LM`.
- Asserts a different liberation mechanism — one whose existence implies the source's mechanism is insufficient.
- Operation typically differs from source operation.

**Shared structure — necessary:**
- Both LMs share the `freedom` axis (both target liberation as the end-state).
- Both presuppose an absolute exists *and* is in principle accessible — Layers 0 and 1 are not in dispute between the P-2 sides (they may still be in dispute via other edges with other nodes).
- The mutual exclusion is at the *mechanism-sufficiency* level, not at existence (P-4) or access (P-1).

**Operation pattern — incidental but suggestive:**
- The two LM operations are typically distinct (e.g., `align` for knowledge-recognition vs `dissolve` for cessation-of-process). They need not form a strict reversal pair (`align ↔ dissolve` *do* form one in the OPERATION_REVERSAL table, but P-2's contradiction is at the mechanism-axis level, not at the operation-reversal level).

**Auto-detection limitation (parallel to P-1 and P-4):**
- The auto-emitter's rule 3 (intra-type contradiction by reversed-operation + ≥2 shared axes) might fire on some P-2 candidates if the LM endpoints share `freedom` + another axis. E-0011's endpoints share `freedom` only (LM-9ea458a9 has `{absolute, freedom, knowledge}`; LM-c101ae16 has `{freedom, impermanence, non-self}`); 1-axis overlap fails the strengthened rule 3 threshold. **P-2 contradictions are therefore not auto-detected** under the current rules — they must be hand-authored, like P-1 and P-4.

### 4. Doctrinal Interpretation

P-2 is not about access (P-1's domain) or existence (P-4's domain). It is about **what actually works**.

Both sides of a P-2 dispute share a worldview at the deeper layers: there is an absolute, the absolute is in principle reachable, liberation is the goal. The disagreement arises at the practical-soteriological level: which operation, applied by the practitioner, produces the transformation from bound to liberated?

This is the layer at which traditions remain doctrinally separate even when they agree on metaphysics. The Vedantic knowledge-school and the Buddhist cessation-school both presuppose dharmic reality is real and accessible by the practitioner; they differ on whether the operative path is *cognitive recognition of the absolute* (knowledge-school: the mahavakya recognized once is enough) or *extinction of conditioned arising* (cessation-school: the ridge-pole sundered is enough; recognition without cessation is empty).

**Why this layer recurs across traditions:** any soteriological framework must specify a mechanism. Once the deeper questions of existence and access are settled, traditions naturally diverge on mechanism — and the divergence is structurally a contradiction wherever the proposed mechanisms are mutually exclusive. P-2 captures this at a type-level so that future LM-layer disagreements can be recognized and recorded uniformly.

**Position in the contradiction stratification:** P-2 sits at Layer 2 (Mechanism / Sufficiency) — see the Pattern Stratification section below. It is logically downstream of P-4 (Layer 0 Meta-Ontological) and P-1 (Layer 1 Epistemic-Access). A P-2 dispute *presupposes* the resolutions that P-4 and P-1 contest.

### 5. Known Instances

The graph currently contains **one curated P-2 instance**:

| Edge | Source | Target | Mechanism contrast | Curated rationale |
|---|---|---|---|---|
| **E-0011** | LM-9ea458a9 (`liberation-by-knowledge`) | LM-c101ae16 (`liberation-by-cessation`) | knowledge alone vs cessation required | upgraded to substantive rationale in a prior cycle; mahavakya-recognition vs ridge-pole-sundering |

**Short description (E-0011):**

LM-9ea458a9 asserts that cognitive recognition of the absolute is itself sufficient for freedom — the mahavakya *"thou, O Svetaketu, art it"* (Chandogya 6.8.7) is what one comes to know, and by which one is liberated. LM-c101ae16 asserts that liberation is the cessation of the conditioned process — *"thy rafters are broken, thy ridge-pole is sundered; the mind, approaching the Eternal (visankhara, nirvana), has attained to the extinction of all desires"* (Dhammapada 11:154). The two cannot both be sufficient on their own terms: if cognition of the absolute liberates without cessation, conditioned arising must be irrelevant to freedom; if cessation of conditioned arising liberates without cognition, the mahavakya's recognition adds nothing to a process-extinction already complete. The Buddhist cessation-school and the Vedantic knowledge-school propose mutually exclusive sufficient mechanisms.

This is currently a single-instance pattern. Per the convention used for P-1's documentation (which began single-instance and grew to three), single-instance patterns are formalized to enable recognition; auto-detection promotion requires accumulation of additional curated instances.

### 6. Detection Criteria (Future Use)

When evaluating whether a candidate edge instantiates P-2, apply the following checks:

**To recognize a P-2 source / target (both LM-layer):**
1. **Both nodes are LM-type.** P-2 is intra-LM (LM ↔ LM). Cross-layer cases (OM ↔ LM) belong to P-1 or composite patterns; intra-OM cases belong to P-4 or to OM-equivalence.
2. **Each LM asserts a specific liberation mechanism.** The mechanism is encoded by axis combinations like `{absolute, freedom, knowledge}` (knowledge-mechanism) or `{freedom, impermanence, non-self}` (cessation-mechanism). The mechanism axis is the discriminator.
3. **The mechanisms are mutually exclusive.** Each mechanism's sufficiency claim implies the other's insufficiency. If two LMs propose complementary mechanisms (e.g., one tradition's "knowledge AND ethical-conduct"), they may be aligned, not contradictory.
4. **Both presuppose deeper-layer commitments are settled.** Both sides accept that the absolute exists and is accessible — the disagreement is *only* at the mechanism layer. If one side denies absolute-existence or absolute-accessibility, the contradiction belongs to a deeper layer (P-4 or P-1).

**Required textual evidence:**
- Each LM should have textual grounding asserting its mechanism is sufficient for liberation. Strong cases: explicit "if you do X, you are liberated" formulations. Weaker cases: detailed mechanism description that implies sufficiency by exhaustive enumeration.

**Disambiguation tests:**
- *vs P-1:* if the contradiction involves an apophatic OM denying cognitive access, it's P-1 (cross-layer epistemic-access), not P-2 (intra-LM mechanism).
- *vs P-4:* if one side denies the absolute exists, it's P-4 (meta-ontological), not P-2 (which presupposes existence).
- *vs LM equivalence:* if both LMs propose the SAME mechanism on different texts (e.g., two knowledge-LMs from different traditions), they are *equivalent*, not contradictory.
- *vs LM alignment:* if the texts explicitly frame two mechanisms as complementary (e.g., Bhagavad Gita's three-yoga synthesis), don't fire P-2 — the disposition is alignment, not contradiction.

**Promotion criteria for auto-detection (parallel to P-1 / P-4):**
1. ≥2 additional curated P-2 instances beyond E-0011.
2. Mechanism-axis declarations in `core/nodes.py` clarifying which axes mark which mechanisms (e.g., a `cessation` axis paired against `knowledge`; a `devotion` axis if devotional-LMs enter the corpus).
3. Disambiguation criteria preventing false positives between P-2 contradiction and intra-LM equivalence (same-mechanism cases) or alignment (explicitly-complementary cases).

### 7. Limitations

**Confusion with P-1 (epistemic-access).** Both involve LM nodes; both touch on knowledge. Discriminator: **P-1 is OM ↔ LM** (apophatic OM contradicts cognitive LM at the access layer); **P-2 is LM ↔ LM** (one mechanism contradicts another at the sufficiency layer). If the contradiction involves an OM apophatic claim, route to P-1; if both endpoints propose mechanisms, route to P-2.

**Confusion with P-4 (meta-ontological).** P-4 contests existence; P-2 contests mechanism. P-2 *presupposes* both sides accept the absolute exists — that question is settled at the deeper layer. If one side denies the absolute's existence, the edge is P-4-territory regardless of LM involvement.

**Sufficiency claims may be implicit.** Texts rarely state "X alone is sufficient" verbatim. The sufficiency is usually implied by the soteriology — by describing X as the path to liberation without acknowledging other necessary mechanisms. Reviewer judgment is required to identify whether a text genuinely makes a sufficiency claim or merely describes a path among others.

**Risk of over-firing on compatible mechanisms.** Some traditions hold complementary views: the Bhagavad Gita's *karma-yoga + jñāna-yoga + bhakti-yoga* triad explicitly frames three mechanisms as complementary, not exclusive. If a future text from such a tradition is integrated, P-2 should NOT fire between its three corresponding LM nodes — the disposition is alignment-with-multi-path, not mechanism-vs-mechanism contradiction.

**Dependence on clean LM mechanism interpretation.** If an LM node's mechanism is ambiguous (e.g., an LM that mixes knowledge-of-absolute with ethical-conduct-as-precondition), classification is hard. The reviewer must identify the *dominant* mechanism. This is a real interpretive risk for LMs from synthesizing or syncretic traditions.

**LM mechanism axes are currently sparse.** The graph's existing axes include `knowledge` but not `cessation`, `devotion`, `ethical-conduct` as such. Cessation is implied by `{freedom, impermanence, non-self}`, ethical-conduct by `discipline`, etc. — but none of these is unambiguously a mechanism-axis. Refinement of mechanism-axis declarations would tighten P-2 detection.

### 8. Future Extension

**Likely additional P-2 instance candidates** (corpus-dependent, to author only when text-grounded):

- **Knowledge-LM ↔ ethical-conduct-LM** (LM-9ea458a9 ↔ LM-59d26971). Stoic / Christian-ethics traditions imply ethical-conduct as the operative mechanism, contradicting Vedantic knowledge-LM. Currently LM-59d26971 has only synthetic-fixture grounding; an actual Epictetus or Aristotelian text would warrant evaluation. (Note: E-0010 in the graph already pairs these two via auto-emission; whether E-0010 should be hand-curated as P-2 is a separate review.)
- **Knowledge-LM ↔ devotion-LM**. Future Bhakti traditions (devotional liberation) contradicting cognitive-knowledge liberation. Would require introducing a `devotion` axis or an LM subtype reflecting devotional mechanism.
- **Realization-LM ↔ cessation-LM** (LM-36ebce29 ↔ LM-c101ae16). Already curated as E-0007 (substantive rationale). Realization is identity-claim (`align` on `non-duality`), not knowledge per se — it's a *being-claim*, not strictly an *epistemic-claim*. This may belong to P-2 (mechanism-sufficiency, since realization and cessation propose distinct operative paths) OR to a sibling pattern P-3 (Identity-vs-Process Contradiction) that distinguishes "be the absolute" from "extinguish the process". The decision pending clarifies whether P-2 broadly covers all mechanism-sufficiency or whether P-3 carves out being-vs-process specifically.

**Relationship to higher / lower layers:**
- *Below P-2 (deeper):* P-4 (Layer 0) and P-1 (Layer 1) presuppose what P-2 takes for granted. Resolving them logically precedes raising the P-2 question.
- *Above P-2 (shallower):* future patterns may contest details of mechanism implementation (e.g., specific cognitive techniques within knowledge-mechanism, specific cessation methods). These would be Layer 3 or higher — not yet identified.

**Placement in stratification:** **Layer 2 (Mechanism / Sufficiency)** — see the Pattern Stratification section.

**Composite cases:** A future text might combine mechanism-claim with cognitive-access-denial — e.g., a tradition asserting that liberation comes via mechanism X *and* denying that the absolute can be cognitively known *while also* denying the absolute's substantive existence. Such a case would be P-1 + P-2 + P-4 simultaneously. Cross-pattern composite documentation would track these.

Each extension is a separate justification cycle. None is currently authorized; all are documented here as recognized possibilities surfaced by E-0011's standalone instantiation of P-2.

---

## P-3: Identity / Self / Process Contradiction

### 1. Pattern Name

**P-3 — Identity / Self / Process Contradiction.**

### 2. Core Definition

A P-3 contradiction obtains between two IM (IdentityModel) nodes that assert mutually exclusive structures of self or personal identity. The two sides disagree about *what kind of entity (if any) the self is*: substantive, processual, illusory, witnessing, or relational. The contradiction is intra-IM by definition; it does not engage the existence of an absolute (P-4), the cognizability of an absolute (P-1), or the mechanism of liberation (P-2).

P-3 is the **IM-domain analogue of P-4**. Where P-4 contests *whether* an absolute foundation exists, P-3 contests *what* the structure of self is. Both contest existential structure, but in different node-domains: P-4 in OM (ultimate reality), P-3 in IM (personal identity). The two patterns can co-occur within a tradition's full doctrine without redundancy in the graph — each records a distinct domain-specific commitment.

### 3. Source-Side / Target-Side Template

P-3 is **symmetric** in source/target ordering — neither IM is logically prior, and conventional ordering follows stable id sort. Each side carries a structurally distinct identity claim:

- **Substantive side:** asserts an enduring self (`assert` on `{permanence, self}` axes; subtype `self-as-substance` or, in a different mode, `self-as-witness`).
- **Deflationary side:** denies or reframes the substantive self (`negate` or `situate` on `{non-self, self}` or `{impermanence, self}` axes; subtypes `self-as-illusion`, `self-as-process`, or `self-as-relational`).

The two sides need not contrast `assert ↔ negate` strictly — `assert ↔ situate` (substance asserted as enduring vs identity situated within a process) is also a valid P-3 contrast, as is `negate ↔ situate` (illusion-claim vs process-situated-claim, both rejecting substantive permanence but for structurally distinct reasons). The load-bearing feature is the *incompatibility of identity structures*, not a specific operation pair.

### 4. Formal Criteria

P-3 applies when **all** of the following hold:

1. **Both nodes are IM-type.** Cross-type pairings (OM ↔ IM, IM ↔ LM) are not P-3 instances; they may instantiate other patterns (e.g., auto-emitted hierarchical-refinement) or future cross-domain patterns.

2. **The contradiction is about identity structure.** The disagreement concerns what the self is (or whether it exists in any substantive sense), not what one knows about it (P-1), how one is freed from it (P-2), or whether ultimate reality has a substantive ground (P-4).

3. **Subtype incompatibility.** Source and target carry *different* IM subtypes that encode mutually exclusive identity structures. Same-subtype IM pairs (e.g., two `self-as-substance` nodes from different traditions) instantiate equivalence, not contradiction.

4. **Schema-level disagreement.** The structural incompatibility is reflected in either:
   - **Opposing axis pairs** (`{permanence, self}` vs `{impermanence, self}`; `self` paired with `non-self`); or
   - **Reversed operations** (`assert ↔ negate`, `assert ↔ situate`); or both.

5. **Not reducible to P-4.** P-4 source nodes (`madhyamaka-emptiness`) deny *all* foundations including selves; if a contradiction can be cleanly captured by P-4 alone (because the source operates at the OM layer with universal anti-foundationalism against an OM target), it is not a P-3 instance. P-3 is intra-IM and captures identity-structure disputes that are coherent regardless of what either side believes about the absolute.

### 5. Boundary Conditions vs Other Patterns

| Pattern | Domain | What it contests | Distinction from P-3 |
| ------- | ------ | ---------------- | -------------------- |
| **P-4** | OM ↔ OM | Whether an absolute foundation exists | P-4 contests existence at the *meta-ontological* layer (universal); P-3 contests *identity structure specifically*. P-4 source (`madhyamaka-emptiness`) encompasses P-3's substantive-side denial as a downstream entailment, but P-3 is intra-IM and operates whether or not the OM layer is contested. |
| **P-1** | OM ↔ LM | Whether the absolute can be cognitively accessed | Different domain entirely. P-1 disputes cognitive reach toward the absolute; P-3 disputes self-structure. No overlap. |
| **P-2** | LM ↔ LM | Which mechanism is sufficient for liberation | Different domain. P-2 contests the path to freedom; P-3 contests the structure of the self that is (or isn't) freed. A tradition's identity claim and its liberation claim are formally independent, even where they co-occur doctrinally. |

**The P-3 / P-4 relationship deserves particular care.** Buddhism's anatta doctrine is formally an IM-layer claim (about the self) but is generalized in Madhyamaka into an OM-layer claim (about all phenomena). This means a single tradition can carry both:

- An IM node like IM-0dc1c8dd (`self-as-illusion`) — a P-3 source-side
- An OM node like OM-389a76f9 (`madhyamaka-emptiness`) — a P-4 source-side

These are recorded separately in ATLAS because they make claims at different scopes. The IM node says "selves are not substantive entities"; the OM node says "no phenomenon is a substantive entity." The first is narrower (just selves); the second is broader (all phenomena). Both can be true of one tradition without redundancy.

**E-0015 (intra-OM, monism × non-self) is NOT P-3.** Although it concerns substantive existence vs anatta, both endpoints are OM nodes, not IM nodes. E-0015 is proto-P-4 (an early OM-layer foundationalist contradiction predating the formalization of P-4 with Madhyamaka). P-3 is strictly intra-IM.

### 6. Detection Criteria (informal)

A node pair (a, b) is a P-3 candidate when:

```
a.type == "IM" AND b.type == "IM"
AND a.subtype != b.subtype
AND (
    a.axes ∩ {permanence, self}      conflicts with
    b.axes ∩ {non-self, impermanence, self}
    OR
    (a.operation, b.operation) ∈ {(assert, negate), (assert, situate),
                                   (negate, situate), (negate, assert), ...}
)
AND the structural disagreement is at identity-structure level
    (not a downstream entailment of an OM-layer P-4 dispute)
```

The auto-emitter (`Atlas/pipeline/builder.py:_candidate_edges` rule 3) currently emits intra-IM contradictions on `same node-type with reversed operation and shared axis` (post-strengthening: ≥2 shared axes), which captures most P-3 candidates structurally but does not classify them as P-3. Auto-classification of P-3 vs other intra-IM contradictions is not currently implemented; manual rationale-based curation distinguishes curated P-3 instances from auto-emitted candidates.

### 7. Worked Examples

**E-0016 (curated): IM-6657916a (`self-as-substance`) → IM-69f621d6 (`self-as-process`).**
- Substance-self: `assert` on `{permanence, self}` — an enduring, stable entity underlies experience.
- Process-self: `situate` on `{impermanence, self}` — what appears as self is a flow of changing aggregates with no abiding entity.
- The contradiction is at the identity-structure layer: a substantive self CANNOT also be a flow-of-aggregates. The two are mutually exclusive ontological models of selfhood.
- Curated rationale: "Self-as-substance asserts an enduring, stable entity underlying experience; self-as-process asserts that what appears as self is only a changing flow with no abiding entity. These are mutually exclusive ontological models of the self."
- **P-3 status:** canonical curated instance — substance vs process is the textbook P-3 contrast.

**E-0004 (auto-emitted): IM-0dc1c8dd (`self-as-illusion`) → IM-6657916a (`self-as-substance`).**
- Illusion-self: `negate` on `{non-self, self}` — there is no substantive self; what appears as self is illusion (anatta).
- Substance-self: `assert` on `{permanence, self}` — an enduring substantive self exists.
- Operation reversal: `negate ↔ assert`. Axis structure: `non-self` (illusion side) vs `permanence` (substance side), both anchored on `self`.
- Auto-emitted with generic rationale ("same node-type with reversed operation and shared axis"). Substantive curation is pending; the doctrinal content (anatta vs ātman) is well-attested but not yet recorded in this edge's rationale.
- **P-3 status:** auto-emitted P-3 candidate awaiting substantive curation; the structural template is unambiguous.

**E-0003 is NOT a P-3 instance.** E-0003 is an `inversion` edge (auto-emitted under rule 1 of `_candidate_edges`), not a `contradiction` edge. P-3 — like P-1, P-2, and P-4 — is a contradiction pattern that applies to contradiction-type edges only. Inversion edges encode bidirectional self/non-self opposition without contradiction-pattern semantics. E-0003 stays classified as `inversion`; it is not reclassified as P-3. The brief that triggered this formalization listed E-0003 alongside E-0004 and E-0016 as "IM ↔ IM edges" — the listing is structurally accurate (all three are intra-IM) but pattern-classification-wise only the contradiction-typed edges (E-0004, E-0016) qualify.

### 8. Stratification Placement

P-3 occupies an **Identity-Ontological layer** in the IM domain. It is structurally parallel to Layer 0 (Meta-Ontological / P-4) but operates on a different node-type — see §Pattern Stratification, Layer Model, and the IM-domain parallel-layer entry.

The current stratification thus tracks **two domain-parallel patterns at Layer 0** (the deepest logical depth), distinguished by node-domain:

- **Layer 0 (OM-domain):** Meta-Ontological — does the absolute exist? — P-4
- **Layer 0 (IM-domain):** Identity-Ontological — what is the self? — P-3

These layers can interact via cross-tradition doctrinal coherence: a Madhyamaka-source P-4 edge and an anatta-source P-3 edge from the same tradition (Buddhism) record the tradition's two-domain anti-substantialist commitment as two separate edge incidences, not as a single composite. Composite extension across the parallel Layer-0 patterns is anticipated but not currently authorized; reviewer escalation would be required for any cross-domain P-3 × P-4 composite proposal.

### 9. Future Extension

- **IM-c2113c94 (`self-as-witness`) is currently P-3-isolated.** The witness-self subtype could enter P-3 contradictions against substance-self (a witness need not be a substance — Sāṃkhya-style puruṣa is witnessing without being processual or persisting in the ordinary substantive sense), against illusion-self (a witness presupposes an experiential locus that anatta would deny), and against process-self (witnessing implies a stable observer, which process-ontology denies in its strong form). Surfacing these contradictions awaits curation.

- **Cross-domain extension to OM ↔ IM.** The intra-OM `non-self` (OM-e1f9907b) makes a claim that overlaps with intra-IM `self-as-illusion` (IM-0dc1c8dd) in scope. A future cross-domain pattern (or a new P-3 × P-4 composite) might capture cases where an OM-layer non-self claim contradicts an IM-layer substantive-self claim. Currently encoded indirectly via auto-emitted hierarchical-refinement edges (E-0005, E-0006: OM-e1f9907b → IM nodes).

- **Cross-tradition robustness.** P-3 is currently formalized with two qualifying instances (E-0016 curated, E-0004 auto-emitted). Cross-tradition robustness — P-3 instances from corpus traditions other than Buddhist/Vedic (e.g., Christian self-as-imago-Dei vs Cārvāka self-as-body, or Confucian relational-self vs Stoic ruling-faculty-self) — would constitute the kind of empirical diversification that has been the promotion criterion for P-1.

- **Subtype boundary work for IM.** A document parallel to §OM Subtype Boundary Conditions may be warranted as IM diversity grows — particularly to disambiguate `self-as-illusion` (full deflationary denial) from `self-as-process` (positive characterization of self as flux) from `self-as-relational` (self as constituted by relations). The boundary work has not yet been authored; it becomes load-bearing as soon as a hybrid case (an IM node defensible under more than one subtype) appears in the corpus.

---

## P-4: Foundationalist Contradiction

### 1. Pattern Name

**P-4 — Foundationalist Contradiction.**

### 2. Core Definition

A P-4 contradiction obtains between an OM-layer node that **denies that anything has inherent existence (svabhāva)** — and therefore denies that any substantive absolute exists — and an OM-layer node that **asserts the existence of an absolute / ultimate reality**. The two are mutually exclusive at the *meta-ontological layer*: one denies the existence of the absolute that the other affirms.

**Formal rule:**

```
IF  OM_node_A has axis "anti-foundationalism"  (proposed; see §6)
    (categorical denial that any phenomenon has svabhāva /
     inherent existence — therefore denial that any substantive
     absolute or ultimate reality exists)
AND OM_node_B has axis "absolute"
    (asserts an ultimate / unconditioned reality, whether the
     absolute is held as kataphatically knowable or apophatically
     beyond cognition)
THEN OM_node_A ↔ OM_node_B is a true contradiction at the
     meta-ontological layer.
```

The contradiction obtains because: if nothing has svabhāva, an absolute cannot exist (an absolute would *by definition* be the kind of thing that exists in itself, with svabhāva). Conversely, if an absolute exists, anti-foundationalism is false. The two claims are mutually exclusive at the level of *what is*, regardless of whether the absolute can be cognized or named.

### 3. Structural Conditions

**Source side (OM_A) — necessary:**
- Node type: `OM`.
- Carries axis `anti-foundationalism` (proposed; see §6).
- Does **not** carry `absolute` axis — because the source's claim is precisely that no absolute exists, the source's domain is "all phenomena" rather than "the absolute".

**Target side (OM_B) — necessary:**
- Node type: `OM`.
- Carries axis `absolute` (asserts the existence of an ultimate / unconditioned reality).
- Subtype is unconstrained: the target may be `monism`, `apophatic-absolute`, `generative-source`, or any other absolute-asserting OM subtype. The contradiction holds against kataphatic *and* apophatic absolute-assertions equally.

**Cross-cutting — necessary:**
- Both nodes are OM-layer (the contradiction is ontological, not soteriological — it does not directly involve LM nodes).
- Zero shared axes between source and target (this is structural: the source explicitly *denies* the axis the target carries). This is a key distinction from P-1, which requires shared `absolute` between source and target.

**Operation pattern — incidental:**
- The source's operation would likely be `negate` or a similar deflationary move (mirroring how non-self uses `negate`), but the pattern is type-and-axis-defined, not operation-defined.
- Target operations are heterogeneous (`assert` for monism, `negate` for non-self/apophatic, `produce` for generative-source) — all qualify as long as the `absolute` axis is asserted.

**Auto-detection limitation (parallel to P-1):**
- Because source and target share *no* axis, the auto-emitter's rule 3 (which requires ≥2 shared axes for contradiction) cannot fire. P-4 contradictions are invisible to the auto-emitter by design and **must be hand-authored**, like P-1 contradictions.

### 4. Doctrinal Interpretation

What the contradiction represents philosophically:

P-4 is a disagreement about **what reality fundamentally is**, not about how it is known or accessed. It is a *meta-ontological* contradiction — one level deeper than P-1's *epistemic-access* contradiction.

Anti-foundationalist traditions (paradigmatically Madhyamaka Buddhism) reject the premise shared by *all* absolute-positing systems — kataphatic and apophatic alike. To a Madhyamika, both Vedantic monism's "It is the Self" and the Christian mystic's "of God Himself can no man think" make the same prior error: positing a substantive absolute (Brahman, God, the Dao) that has svabhāva. Madhyamaka denies that anything has svabhāva, including emptiness itself (which is a "dependent designation," not a positive entity). This deflationary move exits the apophatic-vs-kataphatic debate by rejecting its shared premise.

**Contrast with P-1:**

| Aspect | **P-1** (Epistemic-Access) | **P-4** (Foundationalist) |
|---|---|---|
| What is contested? | Whether the absolute can be **cognized** | Whether the absolute **exists** |
| Premise shared by both sides | Both posit an absolute | Neither shared — one *denies* what the other *asserts* |
| Layer | Epistemic-access (how-it-is-known) | Meta-ontological (what-it-is) |
| OM source axis | `ineffability` (denies access to existing absolute) | `anti-foundationalism` (denies existence of any absolute) |
| Target | LM with `{absolute, knowledge}` (cognitive-recognition liberation) | OM with `absolute` (any kataphatic or apophatic absolute) |
| Shared axes between source and target | `absolute` (1 axis required) | none (source denies the axis target carries) |
| Cross-layer? | Yes (OM ↔ LM) | No (OM ↔ OM) |
| Auto-emitter visibility | Invisible (rules require same-type) | Invisible (rules require shared axes) |

**Logical relationship:** P-4 is logically prior to P-1. If a P-4 source is right (no absolute exists), then P-1's debate (whether the absolute can be cognized) doesn't arise — there's nothing to cognize or fail to cognize. A Madhyamaka commentator could view all three P-1 instances (E-0017 Daoist, E-0018 Vedic, E-0019 Christian) plus their kataphatic-knowledge-LM target (LM-9ea458a9) as committing the same root error: positing an absolute. P-4 contradicts both sides of P-1's debate from a deeper position.

### 5. Known Instances

**No curated edges yet.** The Mulamadhyamakakarika is not currently in the archive; integration would require archive ingestion, schema extension (new axis), and a separate edge-authoring cycle. The candidate instances below are *forecasts* — pairs that *would* generate P-4 contradictions if and when a Madhyamaka source node is integrated. They are documented here to illustrate the pattern's expected fan-out and to anchor doctrinal reasoning.

**Candidate source: hypothetical Madhyamaka OM node** (Nāgārjuna, MMK chapters 1, 24, 25). MMK 1.1: things do not arise from themselves, from another, from both, or from neither. MMK 24.18: emptiness itself is a *dependent designation*, not a positive entity. MMK 24.11: warning against reifying emptiness. MMK 25.3: tetralemmic negation of nirvāṇa as a positive ultimate.

**Candidate targets** — every existing absolute-positing OM node in the graph:

| Target node | Subtype | Why contradicted by Madhyamaka |
|---|---|---|
| `OM-028a568b` (Vedantic monism, Chandogya) | `monism` | Asserts Brahman as substantive ultimate ("It is the True. It is the Self"). Brahman has svabhāva — exactly what Madhyamaka denies. The mahavakya's identity-claim presupposes both atman and Brahman as svabhāva-bearing entities. |
| `OM-0fe9235c` (Brihadaranyaka monism, 2.3) | `monism` | Asserts Brahman in two-forms doctrine ("there are two forms of Brahman... sat and tya — sat-tya, true"). Substance ontology (sat/tya) is precisely the foundationalist commitment Madhyamaka rejects. |
| `OM-52056395` (Daoist generative-source) | `generative-source` | Asserts the Dao as enduring source ("the enduring and unchanging Tao", "Originator of heaven and earth"). The Dao is presented as substantive (even if unnameable); Madhyamaka denies any svabhāva-bearing source. *Even unnamability* presupposes the Dao's existence as the kind of thing that resists naming. |
| `OM-0722c84e` (Kena apophatic-absolute) | `apophatic-absolute` | Presupposes Brahman as that-which-the-faculties-cannot-reach. Madhyamaka denies the underlying ontological commitment: there is no substantive Brahman to be reached or unreached. The apophatic structure presupposes the entity it apophasizes about. |
| `OM-b7b1f8af` (Cloud apophatic-absolute) | `apophatic-absolute` | Presupposes God as the entity that "thought cannot comprehend". Same structure as Kena: the apophatic move presupposes the existent absolute that Madhyamaka denies. |

**Critically:** Madhyamaka contradicts *both* kataphatic and apophatic absolute-assertions. The pattern P-4 is therefore **high-fanout** — a single Madhyamaka source node would generate five candidate contradiction edges in the current graph state. (Compare P-1, which contradicts a single LM target across multiple OM sources — one LM, three OMs. P-4 inverts: one OM source, five OM targets.)

**Non-instances — what Madhyamaka does NOT contradict via P-4:**

- `OM-e1f9907b` (Buddhist non-self ontology). Both share an anti-substance commitment, though Madhyamaka extends emptiness more universally than non-self does. Relationship is **partial alignment with structural extension**, not contradiction. Anatta is a special case of universal emptiness; Madhyamaka generalizes the anti-substance move beyond the self/dharmas distinction.
- LM-layer nodes. P-4 is OM ↔ OM. Madhyamaka would generate separate, non-P-4 contradictions or alignments with LM nodes (e.g., LM-9ea458a9's knowledge-of-absolute is undermined by Madhyamaka's denial of the absolute, but this is mediated through P-4's denial of the absolute itself — the LM-side contradiction is downstream).

### 6. Detection Criteria (Future Use)

P-4 is **not currently detectable** in any form (auto or manual via the existing axis vocabulary). Detection requires schema extensions documented below. As with P-1, P-4 should remain **manual recognition only** until promotion criteria are satisfied.

**Required for any P-4 detection (manual or automatic):**

1. **New axis `anti-foundationalism`** (alternative names: `no-svabhava`, `emptiness-of-svabhava`). The axis must capture *categorical universal* denial of inherent existence — distinct from `non-self` (which is the narrower anatta-of-self / no-substantive-self claim). The discriminator is *scope* + *reflexivity*: anti-foundationalism applies to all phenomena including the anti-foundationalist claim itself (emptiness is empty); non-self typically does not extend that far.

2. **New OM subtype** (e.g., `madhyamaka-emptiness`, `anti-foundational`, or `svabhāva-negation`). None of the existing seven OM subtypes (`monism`, `dualism`, `non-self`, `process-ontology`, `atomism`, `generative-source`, `apophatic-absolute`) fits cleanly:
   - `non-self` is the closest neighbor but is too narrow (anatta-of-selves rather than universal emptiness).
   - `process-ontology` captures dependent arising but doesn't capture the explicit svabhāva-rejection — process metaphysics could still posit ontologically robust processes; Madhyamaka denies even that.
   - `apophatic-absolute` presupposes an absolute, which Madhyamaka explicitly rejects (Q3 of any P-4 / "absence of absolute" gate test would route Madhyamaka *out* of `apophatic-absolute` and into the proposed new subtype).

3. **Disambiguation criteria preventing false positives** between `anti-foundationalism` and `non-self`:
   - **Q1 — Scope:** Does the text deny inherent existence of *all* phenomena (including selves, processes, dharmas, *and* the denial-claim itself)? Or only of selves / persons? Universal scope → `anti-foundationalism`. Narrow scope (anatta-of-self) → `non-self`.
   - **Q2 — Reflexivity:** Does the text apply the denial to its own claim (e.g., MMK 24.18 — "emptiness is itself a dependent designation")? Reflexive → `anti-foundationalism`. Non-reflexive → likely `non-self`.
   - **Q3 — Domain:** Does the text address the existence of *the absolute* specifically, or of *substantive entities in general*? Targeting the absolute → likely `apophatic-absolute` or `non-self` depending on stance. Targeting all entities including any candidate absolute → `anti-foundationalism`.

4. **Disambiguation criteria preventing false positives** between `anti-foundationalism` and `apophatic-absolute`:
   - The apophatic move *presupposes* the absolute exists; the anti-foundationalist move *denies* the absolute exists. A reviewer must distinguish:
     - "The absolute exists but cannot be named" → `apophatic-absolute` (P-1 territory).
     - "The absolute does not exist as a substantive entity" → `anti-foundationalism` (P-4 territory).
   - Both can produce similar surface-vocabulary negations. Strict criteria are essential.

5. **Promotion criteria for any future auto-detection** (parallel to P-1's three-criterion gate):
   - At least 2 curated instances of P-4 (currently 0; Madhyamaka would be the founding instance).
   - The `anti-foundationalism` axis paired against `absolute` in the proposed `DENIAL_USE_AXIS_PAIRS` table (still not implemented; would be required for both P-1 and P-4 auto-detection).
   - Disambiguation criteria for `anti-foundationalism` vs `non-self` vs `apophatic-absolute` formalized as inclusion/exclusion checklists (analogous to the Ineffability Decision Gate for P-1).

**Auto-detection rule sketch (for future implementation, not yet authorized):**

```
IF  anti-foundationalism is declared in DENIAL_USE_AXIS_PAIRS
    as paired against `absolute` (denial-of-existence vs assertion-of-existence)
AND OM_A carries `anti-foundationalism` (and not `absolute`)
AND OM_B carries `absolute` (any subtype)
AND both nodes are Tier-B grounded on their home texts
THEN emit contradiction edge with auto_generated=true,
     pattern reference "P-4" in rationale.
```

This is conceptual; no implementation is proposed.

### 7. Limitations

#### 7.1 Conflation risks — what P-4 must NOT confuse

**Confusion with non-self (`OM-e1f9907b`).** Surface vocabulary overlaps: both "no self" (Buddhist anatta) and "no svabhāva" (Madhyamaka) are negation moves. The discriminator is scope + reflexivity:
- Non-self: anatta of selves / persons. Does not necessarily extend to the anti-self claim itself.
- Anti-foundationalism: universal denial of svabhāva, including reflexive application to emptiness itself.

A reviewer assigning `anti-foundationalism` to a Theravada anatta text (where the negation is selves-only) would over-extend the axis. Conversely, assigning `non-self` to MMK 24.18 (where the negation explicitly extends to all phenomena including emptiness) would under-extend the appropriate axis.

**Confusion with apophatic ineffability (`OM-0722c84e`, `OM-b7b1f8af`).** Both produce surface negations about the absolute, but:
- Apophatic: "the absolute exists; cognition / nomination cannot reach it."
- Anti-foundationalist: "the absolute does not exist as a substantive entity in the first place."

The reviewer must determine whether the text's negations *presuppose* the existent absolute (apophatic-absolute, P-1 source) or *deny* the existent absolute (anti-foundationalism, P-4 source). This is an interpretive judgment, not a mechanical check. Decision aids:
- Does the text affirm the absolute exists despite its inaccessibility (e.g., Cloud's "of God Himself"; Kena's "There", referring to an existent Brahman)? → apophatic-absolute.
- Does the text deny the substantive existence of any absolute (e.g., MMK 24.11's warning against reifying emptiness; MMK 25.3's tetralemmic negation of nirvāṇa as substantive)? → anti-foundationalism.

**Confusion with partial / weak negation.** Texts that negate specific predicates of the absolute without denying its existence are **not** P-4 sources. The Brihadaranyaka 2.3 case is the canonical pedagogical-negation exclusion (paired with kataphatic *satyasya satyam*, so the text remains absolute-positing). Madhyamaka's negation is structurally categorical — it targets the metaphysical commitment, not specific predicates.

#### 7.2 Dependence on precise axis assignment

P-4's discriminative power rests on the `anti-foundationalism` axis (proposed) being assigned correctly. Three failure modes:

- **Over-assignment:** any text using strong negative language about the absolute could be tagged anti-foundationalist. The reflexivity test (does the negation extend to itself?) is the strongest safeguard.
- **Under-assignment:** Madhyamaka and similar anti-foundationalist texts could be mis-typed as `non-self` or `apophatic-absolute`, missing the universal scope.
- **Domain confusion:** anti-foundationalism is universal-scope; assigning it to a narrow-scope text (e.g., a text only denying the substantive self) over-extends the axis.

These risks parallel the `ineffability` axis-assignment failure modes documented in §7.1 of P-1. The schema's safeguards (mandatory inclusion/exclusion checklist, textual locus requirement, reflexivity test) need to be designed before any actual P-4 axis assignment is made.

#### 7.3 High fan-out risk

A single Madhyamaka source node would generate P-4 contradictions with **all five** existing absolute-positing OM nodes in the current graph (Vedantic monism × 2, Daoist generative-source, Vedic apophatic, Christian apophatic). This is high outdegree — the same pattern repeated across all those pairs.

If P-4 ever becomes auto-detectable, the auto-emitter's "cap on auto-edges per node" safeguard (proposed in prior cycles) would become directly relevant. Five auto-edges from one node already pushes the threshold; a corpus expansion to additional anti-foundationalist sources (Yogācāra, Chinese Madhyamaka, Tibetan Mādhyamika commentaries) would multiply the fan-out further. Manual curation with substantive rationales remains the safer path.

#### 7.4 Why P-4 is not currently auto-detected (or even manually instantiated)

In addition to the schema gaps in §6:

- **Archive prerequisite:** the Mulamadhyamakakarika is not in the archive. Standard Node Integration Protocol cannot proceed past Phase 1 STOP-1 until ingestion is performed.
- **Schema extension prerequisite:** the `anti-foundationalism` axis and a corresponding OM subtype must be added to `core/nodes.py` (with documented justification) before any node can carry the pattern's source-side classification.
- **Pattern-evaluation precedent:** the prior pattern-driven evaluation cycle correctly identified Madhyamaka as a *new pattern requirement* (Phase 4 verdict 4: NEW PATTERN REQUIRED). This documentation formalizes that finding without authorizing implementation.

P-4 is thus a *zero-instance documented pattern* — known by structural analysis but not yet realized in the graph. This is the inverse of P-1's progression: P-1 was documented at single-instance and grew to three; P-4 is documented at zero-instance and would grow to one (at minimum, the founding Madhyamaka instance) when integration is authorized.

### 8. Future Extension

How P-4 might evolve:

- **Schema extensions required for activation:**
  - New axis `anti-foundationalism` (or `no-svabhāva`). Justification cycle parallel to the prior `ineffability` and `generativity` axis additions.
  - New OM subtype `madhyamaka-emptiness` (or `anti-foundational` / `svabhāva-negation`). Justification cycle parallel to the prior `generative-source` and `apophatic-absolute` subtype additions.
  - These extensions are deferable until a Madhyamaka archive ingestion makes them load-bearing.

- **Interaction with P-1:**
  - P-4 source × P-1 LM target (Madhyamaka × LM-9ea458a9 knowledge): would generate a contradiction *not* via P-4 (which is OM↔OM) but via a hypothetical *cross-layer* extension. Madhyamaka denies the absolute; LM-9ea458a9 requires recognition of the absolute. This is meta-ontological + epistemic-access combined — a richer contradiction than either P-1 or P-4 alone. May warrant a new edge type or a P-1×P-4 composite pattern.
  - P-4 source × P-1 source (Madhyamaka × Cloud / Kena / Daodejing): generates a contradiction at the *meta-ontological* layer where P-1 itself doesn't apply. This is the "deepening" effect: Madhyamaka contradicts both sides of P-1's epistemic-access debate from a layer below.

- **Sibling pattern P-5: Cessation-vs-knowledge contradiction (already partially extant as E-0011).** E-0011 (LM-9ea458a9 ↔ LM-c101ae16) is structurally distinct from both P-1 and P-4: it's intra-LM, contesting whether knowledge is *sufficient* without process-cessation. If E-0011 acquires sibling instances, it could be formalized as P-5: **Sufficiency Contradiction**.

- **Yogācāra integration question.** Yogācāra Buddhism's "store-consciousness" (ālayavijñāna) is sometimes read as quasi-substantialist (carrying svabhāva-like commitments) and sometimes as purely deflationary (anti-foundationalist like Madhyamaka). Per-passage evaluation needed for any future Yogācāra integration; could be a P-4 source, or could constitute a new pattern depending on textual evidence.

- **Cross-pattern composition.** A future text might be both anti-foundationalist (P-4 source candidate) AND apophatic about its own limited claims (P-1-adjacent). Multi-pattern instances may emerge; the current single-pattern-per-edge convention would need extension to handle multi-pattern doctrinal positions cleanly.

Each extension is a separate justification cycle. None is currently authorized; all are documented here as recognized possibilities surfaced by the pattern-driven evaluation of MMK.

---

## OM Subtype Boundary Conditions

This section documents the criteria distinguishing OM (OntologicalModel) subtypes, with particular attention to the apparent boundary tension between `generative-source` and `apophatic-absolute`. The section was prompted by an audit of OM-52056395 (Daoist, `generative-source`) and OM-95dd4337 (Plotinian, `apophatic-absolute`), both of which carry both apophatic and generative axes yet are classified differently. The resolution is not a re-classification but a clarification of what subtype labels mean.

### Core principle: subtypes name the dominant doctrinal move

OM subtypes are **dominant-position labels**, not exhaustive descriptors. A subtype names the structural-ontological move that is *load-bearing in the chosen home-text or passage* — the move without which the doctrine collapses or transforms into a different position. Multi-dimensional structure is recorded compositionally on the **axis layer**, not by proliferating subtypes.

This follows the same design principle that governs the rest of the schema: closed enumerations should be small, mutually informative, and interpretable. Encoding every doctrinal hybrid as a new subtype would inflate the enumeration toward illegibility (`apophatic-generative-source`, `apophatic-monism`, `non-dual-process-ontology`, …). The axis vocabulary already exists to express compositional structure; the subtype system should not duplicate it.

### Subtype-by-subtype criteria

The eight current OM subtypes are bounded as follows. In each case, the criterion identifies the dominant move; secondary moves can still be present and are recorded on the axes.

- **`monism`** — absolute as substantive numerical unity; *positive* substantive predication ("the True", "Brahman is real-knowledge-bliss"); typically paired with a self-identity claim (mahāvākya). Distinguished from `generative-source` by its emphasis on what the absolute *is* over what the absolute *produces*.

- **`dualism`** — irreducible two-term ontological structure (spirit/matter, puruṣa/prakṛti, Creator/creation as ontologically distinct). The doctrine's load-bearing move is the refusal to collapse the two terms.

- **`non-self`** — anatta; denial of an enduring substantive entity, typically applied to selves and dharmas. Narrower scope than `madhyamaka-emptiness` (which generalizes the denial reflexively to all phenomena including emptiness itself).

- **`process-ontology`** — becoming-over-being; flux as fundamental; conditioned arising as the structural mode. Distinguished from `non-self` by its positive characterization of what *is* (process), not merely what *isn't* (substance).

- **`atomism`** — reality decomposes into discrete elementary units; the load-bearing move is the *decomposition* claim, not the elementary units' attributes.

- **`generative-source`** — absolute primarily *as source of multiplicity* (Originator, Mother, the One-as-emanator). *Positive generative predication* is the dominant move in the home-text. May carry `ineffability` axis as a secondary apophatic register (the source is named, but its essence eludes naming) — apophasis is present but backgrounded relative to generativity.

- **`apophatic-absolute`** — absolute primarily *by denial of cognitive/nominal access* (neti neti, "not this, not that"; "the One is beyond being"). *Apophasis is the dominant move* in the home-text or passage; generative or substantive predication is backgrounded or absent in scope. May carry `generativity` axis as a secondary register without changing classification.

- **`madhyamaka-emptiness`** — universal denial of svabhāva (inherent existence); reflexive (emptiness itself is empty, MMK XXIV.18); anti-foundationalist. Broader scope than `non-self` (applies to all phenomena, not only selves) and structurally distinct from `apophatic-absolute` (denies the absolute exists, not merely that it can be named).

### Hybrid apophatic+generative cases

The most consequential boundary tension sits between `generative-source` and `apophatic-absolute`. Several major doctrinal traditions deploy *both* moves: Daoism (Tao as nameless Mother), Neoplatonism (the One as ineffable emanator), Christian mystical theology (Pseudo-Dionysius, the Cloud of Unknowing — apophatic about a Creator-God), and Kabbalistic Ein Sof (no-thing that emanates the sefirot).

These are not classification errors. They are doctrinal positions that genuinely operate across both axes. The schema accommodates them via **dominant-doctrinal-move + axis composition**:

1. **Subtype assignment** records which move is *load-bearing* in the chosen home-text or passage scope. If apophasis is the move that does the structural work — the move without which the doctrine reduces to mere generation-talk — the subtype is `apophatic-absolute`. If generativity carries the structural weight — without which the doctrine reduces to bare denial — the subtype is `generative-source`.

2. **Axis composition** records the secondary register. A `generative-source` node carrying `ineffability` *axis* signals "generation is dominant, but the source is also nameless." An `apophatic-absolute` node carrying `generativity` *axis* signals "apophasis is dominant, but the absolute also produces multiplicity." Auto-emitted P-1 (Epistemic-Access) edges fire on the `ineffability` axis regardless of subtype — see §P-1 for behavior.

This division is **per-passage**, not per-tradition. The same tradition may legitimately yield different subtypes in different home-text scopes, because different passages foreground different moves. This is not inconsistency; it is the schema correctly recording where the load-bearing claim sits in the source text.

### Worked examples

**OM-52056395 (Daodejing → `generative-source`).** The home-text scope draws on Daodejing Chapters 1, 25, and 42. While Chapter 1's opening — "The Tao that can be named is not the eternal Tao; the nameless is the origin of heaven and earth" — carries an apophatic register, the *load-bearing* doctrinal move across the scoped passages is generative: the Tao as Mother of the ten thousand things (Ch. 25), the unfolding "Tao gives birth to one, one to two, two to three, three to ten thousand" (Ch. 42). Apophasis is present and recorded on the `ineffability` axis, but generativity is the move without which the Daoist cosmology collapses. Subtype `generative-source` is defensible per the home-text scope.

**OM-95dd4337 (Enneads → `apophatic-absolute`).** The home-text scope draws on Enneads V.3 and VI.9. Plotinus's emanation system *is* metaphysically generative — the One overflows, the Intellect proceeds, the Soul descends. Yet within the scoped passages, the dominant philosophical move is apophatic: "the One is beyond being" (V.3), "it is not any thing that is" (VI.9.5). The emanation framework is structural background; the *foreground* claim — the move Plotinus argues for and defends — is that the One eludes nominal and conceptual capture. Generativity is recorded on the `generativity` axis but is not the load-bearing classification. Subtype `apophatic-absolute` is defensible per the home-text scope.

**Cross-node consistency.** OM-52056395 and OM-95dd4337 are not inconsistently classified. They reflect a defensible methodological choice: subtypes are assigned per the dominant move in the *chosen passages*, and different passages from different traditions can foreground different moves even when the underlying doctrines share structure. The audit that surfaced this question is itself the schema operating as designed — pattern-driven evaluation revealing where boundary criteria need explicit documentation.

### Future possibilities

If three or more nodes accumulate where apophasis and generativity are *equally* load-bearing — neither move clearly dominates within any defensible passage scope — a hybrid subtype `apophatic-generative-source` (or a comparable label) becomes a candidate for schema extension. Until that threshold is met, the cost of subtype proliferation exceeds the benefit; the dominant-move principle plus axis composition is sufficient.

The same logic applies to other potential hybrids: `non-dual-process` (Madhyamaka-adjacent process metaphysics), `apophatic-monism` (Advaita's "neti neti" applied to a substantively-asserted Brahman), etc. None is currently authorized; all are recognized as deferrable schema extensions awaiting empirical pressure from corpus ingestion.

---

## Pattern Stratification

This section documents the logical relationships *between* contradiction patterns. ATLAS contradictions are not a flat catalog — they are **stratified by logical layer**, meaning some patterns operate on deeper premises than others, and patterns can be ordered by which premises they share or contest.

The stratification is **interpretive**, not enforced. It documents how patterns relate semantically, but it imposes no constraints on the graph's structure or the audit tool's behavior. All curated contradictions remain valid records of doctrinal opposition, regardless of which layer they instantiate. ATLAS's design principle (preserving disagreement as a first-class structural object — see `Atlas/README.md`) requires recording all layers simultaneously without pruning or override.

### Layer Model

ATLAS currently identifies three logical-depth layers, ordered by logical depth (Layer 0 is the deepest). **Layer 0 carries two domain-parallel patterns** — one operating in the OM (ultimate-reality) domain, one in the IM (personal-identity) domain. Layers 1 and 2 each carry a single pattern.

#### Layer 0 (OM-domain) — Meta-Ontological

Patterns that contest **whether an absolute or ultimate reality exists**.

The dispute is at the level of *what is*. The two sides disagree about whether a substantive ultimate (Brahman, the Dao, God, an unconditioned ground) exists at all. The shared premise is *not* shared — one side denies precisely what the other affirms.

- **P-4 (Foundationalist Contradiction)** is the only currently-defined Layer 0 OM-domain pattern.
- Source side: anti-foundationalist OMs (denies any phenomenon has svabhāva → denies any absolute exists in the substantive sense).
- Target side: any absolute-asserting OM (kataphatic monism, generative-source, apophatic-absolute, etc.).
- Curated instances: **E-0020** (Madhyamaka ↔ Vedantic monism), **E-0024** (Madhyamaka ↔ Daoist generative-source), **E-0026** (Madhyamaka ↔ Plotinian One); cross-target single-pattern instance **E-0027** (Madhyamaka ↔ devotion-LM as kataphatic-as-devotional-object).

#### Layer 0 (IM-domain) — Identity-Ontological

Patterns that contest **the structure of self / personal identity**.

The dispute is at the level of *what kind of entity (if any) the self is*: substantive, processual, illusory, witnessing, or relational. Both sides may agree (or disagree) about whether ultimate reality has a substantive ground (a Layer 0 OM-domain question) — that is a separate dispute. The IM-domain pattern is independent of the OM-domain meta-ontological dispute, even though doctrinal positions often align both layers' stances within a tradition.

- **P-3 (Identity / Self / Process Contradiction)** is the only currently-defined Layer 0 IM-domain pattern.
- Both source and target are IM-type nodes carrying mutually exclusive identity structures (substance vs illusion; substance vs process; substance vs witness; process vs illusion; etc.).
- Curated instance: **E-0016** (`self-as-substance` ↔ `self-as-process`); auto-emitted instance pending substantive curation: **E-0004** (`self-as-illusion` ↔ `self-as-substance`).

P-3 and P-4 are structurally parallel: both contest existential structure at the deepest logical layer of their respective node-domains. They can co-occur within a tradition's full doctrine without redundancy in the graph — each records a domain-specific commitment. The two domain-parallel layers do not interact via composites in the current schema; reviewer escalation would be required for any cross-domain P-3 × P-4 composite proposal.

#### Layer 1 — Epistemic-Access

Patterns that **assume an absolute exists** and contest **access to it**.

The dispute is at the level of *how the absolute relates to cognition*. Both sides share the existential premise; they disagree only on whether the absolute can be cognized, named, or recognized as the operative path to liberation.

- **P-1 (Epistemic-Access Contradiction)** is the only currently-defined Layer 1 pattern.
- Source side: apophatic OMs (asserts absolute exists but denies cognitive access to it).
- Target side: knowledge-LMs (asserts cognitive recognition of the absolute is itself liberating).
- Three curated instances: **E-0017** (Daoist generative-source ↔ knowledge-LM), **E-0018** (Vedic apophatic ↔ knowledge-LM), **E-0019** (Christian apophatic ↔ knowledge-LM).

#### Layer 2 — Mechanism / Sufficiency

Patterns that **presuppose Layers 0 and 1 are resolved** — the absolute exists *and* is in principle accessible — and contest **which path actually leads to liberation**.

The dispute is at the level of *what works*. Both sides agree on existence and accessibility; they disagree on which mechanism (cognitive recognition, cessation of process, ethical conduct, devotion, etc.) is the operative one. Each side's sufficiency claim implies the other's insufficiency: if knowledge alone liberates, cessation is unnecessary; if cessation is required, knowledge alone is insufficient.

- **P-2 (Sufficiency Contradiction)** is the only currently-defined Layer 2 pattern.
- Source side: an LM proposing one mechanism (e.g., knowledge / cognitive recognition).
- Target side: a different LM proposing an alternative mechanism whose existence implies the source's mechanism is insufficient (e.g., cessation / extinction of conditioned arising).
- One curated instance: **E-0011** (LM-9ea458a9 knowledge ↔ LM-c101ae16 cessation).

The Layer 2 designation means: this layer's disputes are downstream of Layers 0 and 1 — they only arise once those deeper questions are settled (or at least bracketed). Within a tradition that has resolved both deeper layers (typically by accepting both an absolute and its accessibility), the mechanism question remains genuinely open and is the most common locus of intra-soteriological disagreement across world philosophy.

#### Future Layers (placeholder)

Additional layers will be documented as they are surfaced by future pattern-driven evaluations. Candidates already named in the patterns' own §8 Future Extension sections:

- **Layer 3 candidate (sub-mechanism / being-vs-process)** — patterns within Layer 2 that contest specifically *which kind of operation* the right mechanism is (e.g., identity-claim "be the absolute" vs process-extinction "stop conditioned arising"). E-0007 (LM-36ebce29 realization ↔ LM-c101ae16 cessation) is currently classified as **P-2** (broad mechanism-sufficiency); whether a sibling pattern carves out being-vs-process specifically as a distinct Layer 2/3 sub-pattern remains a deferred question.

  *Note on naming.* Earlier drafts of this section used the label "P-3 (Identity-vs-Process Contradiction)" for this LM-domain candidate sub-pattern. That label is now occupied by the **IM-domain** Identity-Ontological pattern formalized in §P-3 above (intra-IM contradictions over self-structure). Any future formalization of an LM-domain sub-mechanism pattern will receive a fresh label (e.g., P-5).
- **Future deeper / shallower layers** as needed. The numbering convention is "deepest = lowest number"; future deeper layers may be re-anchored at the time a deeper pattern is formalized.

These are illustrative; the layer numbering remains open as new patterns are documented.

### Relationships Between Layers

**P-4 is logically prior to P-1.** P-4's source side denies the existential premise that all P-1 disputants share (both apophatic and kataphatic sides). If P-4's source is correct (no absolute exists in the substantive sense), then P-1's question — "can the absolute be cognized?" — becomes ill-formed, because the entity whose cognizability is in dispute does not exist as the kind of thing the dispute is about.

**P-4 recontextualizes but does NOT invalidate P-1.** Adding E-0020 (P-4) to the graph does not make E-0017, E-0018, or E-0019 (P-1) go away. The P-1 edges record what their endpoint texts actually claim about cognitive access. Whether or not Madhyamaka is right about anti-foundationalism, the Daodejing's, Kena's, and Cloud's denials of cognitive access — and LM-9ea458a9's affirmation of it — remain doctrinal facts at the epistemic-access layer. The graph records both layers as distinct typed-edge data.

**ATLAS preserves both layers as valid contradiction structures.** The graph hosts P-4 and P-1 edges simultaneously, on different node pairs (E-0020 is OM↔OM intra-layer; E-0017–E-0019 are OM↔LM cross-layer). They occupy distinct edge incidences. Neither replaces the other. The relationship is **stratification with logical asymmetry**, not parallel coexistence: deeper-layer patterns contest shallower-layer assumptions, and ATLAS records the contest at every layer.

The patterns are nested, not flat — but the graph treats them uniformly as `contradiction` edges with curated rationales. The layer asymmetry is interpretive metadata, not graph topology.

### Interpretation Guidance

When reading edges across layers, use the following guidance:

1. **Read deeper-layer edges first when they are present.** A P-4 contradiction involving a node tells you that the node's *existential commitments are themselves contested*. This recontextualizes any P-1 edges involving the same node — the P-1 (epistemic-access) dispute is *internal to* the existential commitment that the deeper P-4 layer questions. The deeper edge is logically prior; the higher edge is logically dependent on the premise the deeper edge contests.

2. **Treat all edges as data, not rulings.** The graph does not adjudicate which side of any contradiction is correct. Both P-1 and P-4 edges are records of *what is contested*, not *what is true*. Querying for contradictions involving a given node returns all layers; downstream consumers (audit reports, queries, narrative generation) decide how to weight, filter, or order them.

3. **Cross-reference rationale text for layer information.** Each curated edge's rationale identifies which pattern it instantiates (e.g., E-0020's rationale states "First curated instance of pattern P-4 ..."; E-0017's rationale references P-1). Reviewers can use this to identify the layer at a glance. When new edges are authored, they should explicitly name their pattern in the rationale to preserve this convention.

4. **Composite cases require multi-pattern interpretation.** Some edges may instantiate cross-pattern composites (see §Future Composite Patterns below). Such edges should be authored with rationales that reference *both* relevant patterns explicitly, and should be tracked here in the stratification documentation as they accumulate.

### Pattern Stratification Table

| Pattern | Layer | Domain | Examples |
|---|---|---|---|
| **P-4 (Foundationalist Contradiction)** | **Layer 0 — Meta-Ontological** | existence of the absolute | E-0020 |
| **P-1 (Epistemic-Access Contradiction)** | **Layer 1 — Epistemic-Access** | access to the absolute | E-0017, E-0018, E-0019 |
| **P-2 (Sufficiency Contradiction)** | **Layer 2 — Mechanism / Sufficiency** | which path leads to liberation | E-0011 |

Future patterns will be added to this table as they are documented. The "Examples" column should list curated edge IDs; the table is intended to support quick layer identification and serves as a complement to the Pattern History table below (which tracks first instances and auto-detection status).

### Non-Enforcement Note

**Stratification is interpretive, not enforced.** Concretely:

- **No pattern overrides another in graph logic.** P-4 edges do not invalidate, suppress, or remove P-1 edges. Both remain in `atlas_graph.json` as independent typed records. The graph's `contradiction` edge type is not subdivided by layer; layer is documented in this file, not encoded as a JSON field.
- **The audit tool does not consult layer information.** `tools/rehome_audit.py` computes FAIL_DOCTRINAL verdicts based on its standard Tier-B-contributor logic against contradiction-edge partners. Each edge fires (or doesn't) on its own structural-firing conditions, regardless of which layer the underlying pattern occupies. A node may be involved in P-1 and P-4 contradictions simultaneously; the audit reports both without weighting.
- **The auto-emitter does not generate edges based on layer.** `Atlas/pipeline/builder.py:_candidate_edges` does not consider pattern-layer information at all. Both P-1 and P-4 contradictions are invisible to the auto-emitter (P-1 is cross-layer; P-4 has zero source-target axis overlap; neither matches rule 3). All curated pattern instances must be hand-authored, and the auto-emitter's existing rules continue to operate uniformly.
- **Reviewers and downstream consumers may use stratification interpretively** — for diagnostic display, query filtering, narrative generation, cross-layer reasoning, or future tooling. None of these is required by the system. The documentation in this file is the source of truth; code does not enforce it.

This non-enforcement design is deliberate: encoding layer-precedence as a hard graph rule would falsify the corpus by making one layer's claims trump another's. ATLAS's anti-resolution principle requires that both layers' contradictions remain visible as data, accessible to whatever interpretive framework a downstream user prefers.

### Future Composite Patterns

Cross-layer composite edges are anticipated but not yet authored. The clearest forecast case (named in `## P-4` §8 Future Extension):

- **Madhyamaka (OM-389a76f9) × LM-9ea458a9 (knowledge-based liberation).** Combines P-4's meta-ontological denial of any absolute with P-1's contested epistemic access. The source side is anti-foundationalist (P-4 source-side); the target carries `{absolute, knowledge}` (P-1 target-side); but the source side is *not* apophatic-with-`ineffability` (which P-1 source requires) and the target side is LM-not-OM (which P-4 target requires). Neither pattern fits cleanly; the edge would be a **composite P-1 × P-4 instance**.

If/when authored, such an edge should:
- Carry references to both P-1 and P-4 in its rationale, explicitly identifying the composite.
- Be added to a candidate-composite list maintained in this section.
- Use the existing `contradiction` edge type (no new edge type required at the schema level — the multi-pattern character is conveyed by rationale text and stratification documentation).

When two or more cross-pattern instances accumulate, formalizing a composite-pattern naming scheme (e.g., **P-1×P-4** as a hyphenated code, or a separately-numbered pattern P-? that handles meta-ontological-denial-against-cognitive-LM specifically) would be warranted. Until then, composite cases are tracked here individually.

### Stratification version

| Date | Layers documented | Patterns at each layer | Composite candidates |
|---|---|---|---|
| Initial documentation | Layer 0, Layer 1; Layer 2 + 3 placeholders | Layer 0: P-4. Layer 1: P-1. | Madhyamaka × LM-9ea458a9 (P-1 × P-4 composite forecast). |
| Layer 2 formalization (this entry) | Layer 0, Layer 1, Layer 2; Layer 3 placeholder | Layer 0: P-4. Layer 1: P-1. Layer 2: P-2 (formalized from E-0011). | Madhyamaka × LM-9ea458a9 (P-1 × P-4 forecast; unchanged). E-0007 realization↔cessation pending classification as P-2 instance vs P-3 sibling pattern. |

Future updates extend this table.

---

## Composite Contradiction Edges

### Definition

A **composite contradiction edge** is a single `contradiction` edge whose rationale explicitly instantiates **two or more distinct contradiction patterns simultaneously**. The edge records a contradiction that no single pattern captures alone — its content can only be understood as the joint application of multiple patterns from the catalog.

Composite edges exist because some doctrinal positions span more than one layer of disagreement. A position that denies the existence of the absolute (P-4 territory) **and** denies that any cognitive method could reach it (P-1 territory) is *not* expressible as either P-4 alone or P-1 alone — both elements are inseparable in the source's actual claim.

**Difference from single-pattern edges:**
- Single-pattern edges instantiate exactly one pattern; their rationales reference one pattern.
- Composite edges instantiate multiple patterns; their rationales reference each pattern explicitly with separate components.
- The **graph structure is identical** — both use the `contradiction` edge type and the same `Edge` dataclass. The multi-pattern character is conveyed by rationale text and tracked in this section. No new edge type is introduced; no schema change is required to support composite edges.

**When composite edges occur:** when a source node's position bridges multiple stratification layers — typically a deeper-layer denial that *encompasses* a shallower-layer denial. The canonical case (E-0021) is anti-foundationalism (P-4 source-side template) targeting a knowledge-LM that would normally be paired with apophatic-of-existent-absolute (P-1 source-side template). The Madhyamaka source spans both layers because its denial of existence subsumes any apophatic-of-access claim.

### Use Criteria (Strict)

A composite edge is permitted only if **all four** of the following are satisfied:

1. **Distinct layers.** The instantiated patterns must occupy different layers in the Pattern Stratification. Stacking two patterns from the same layer (e.g., two P-1 instances) does not constitute a composite — it is single-pattern with multiple grounding texts, and should be authored as a single-pattern edge whose rationale cites multiple textual sources.
   - *Permitted:* P-1 + P-4 (Layer 1 + Layer 0). P-2 + P-4 (Layer 2 + Layer 0). P-1 + P-2 (Layer 1 + Layer 2).
   - *Not permitted:* P-1 + P-1, P-2 + P-2, P-4 + P-4.

2. **Non-reducibility.** The contradiction must NOT be expressible as either constituent pattern alone. A composite edge is justified only when removing either component would leave the remaining contradiction incomplete — neither pattern, on its own, captures the source's full repudiation of the target.
   - *Diagnostic test:* could a reviewer adequately explain the contradiction by citing only one pattern? If yes, the edge is single-pattern and should be authored as such, not as a composite.

3. **Independent component justification.** Each pattern component must have its OWN textual grounding and doctrinal argument. The components are not redundant restatements of the same claim; each contributes a distinct denial or assertion.
   - *Required textually:* each component cites the relevant source-text passage(s) for its specific claim.
   - *Required doctrinally:* each component states the specific layer-relevant disagreement (e.g., existence claim for P-4 component; access claim for P-1 component).

4. **Synthesis with added meaning.** The composite must include an explicit synthesis that articulates how the components combine — the result must be more than the sum of the parts. The synthesis explains why the contradiction is *cross-layer*, not just *multi-grounded-at-one-layer*.
   - *Required textually:* synthesis identifies what each layer denies, asserts that "neither pattern alone captures the full repudiation" (or close paraphrase), and labels the edge as cross-layer.

If any criterion fails, the edge should be authored as single-pattern (or deferred until additional textual evidence supports the composite case).

### Structure Requirements

Composite edge rationales must use the following labeled format:

```
**Component A — Pattern X (Layer-name).**
[Doctrinal statement of how Pattern X applies, with verbatim source quotations
 and explicit denial/affirmation claims at the relevant layer.]

**Component B — Pattern Y (Layer-name).**
[Doctrinal statement of how Pattern Y applies, with verbatim source quotations
 and explicit denial/affirmation claims at the relevant layer.]

(... additional components if N > 2 ...)

**Synthesis.**
[Explicit statement of what the composite asserts that neither component alone
 asserts. Identifies the cross-layer character of the contradiction. States
 non-reducibility ("not reducible to either pattern alone"). Cross-references
 CONTRADICTION_PATTERNS.md §Pattern Stratification and §Composite Contradiction
 Edges.]
```

**Each component must be:**

- **Clearly labeled.** The exact format `**Component <letter> — Pattern <name> (<Layer-name>).**` (or close variant) at the start of the component. The pattern reference and layer designation must both appear so a reader can identify the component's pattern membership without external lookup.
- **Non-overlapping.** Each component addresses its specific layer's claim. Component A discusses the deeper layer's content; Component B discusses the shallower layer's content. The same passage may be cited in multiple components, but the *claims being made about* the passage differ across components.
- **Doctrinally grounded.** Each component must cite at least one verbatim source-text passage and state explicitly which doctrinal claim grounds the contradiction at that component's layer.

**Synthesis section requirements:**

- Explicitly states "denies BOTH" (for two-component cases) or analogous formulation for three-component cases ("denies all three" / "denies X, Y, AND Z").
- Names the layers and patterns being composed.
- States non-reducibility verbatim or near-verbatim ("not reducible to either pattern alone" / "not expressible as a single pattern").
- Identifies the edge as cross-layer.

### Pattern Interaction Rules

Composite edges follow strict rules about how patterns interact:

1. **Patterns remain conceptually distinct.** A composite edge does not merge or blur the constituent patterns. P-1 retains its definition (epistemic-access dispute presupposing the absolute exists); P-2 retains its definition (mechanism-sufficiency dispute); P-4 retains its definition (meta-ontological dispute about existence). The composite is a *joint instantiation*, not a *new merged pattern*.

2. **No merging of pattern definitions.** The pattern catalog (P-1, P-2, P-4) is not modified by the existence of composite edges. CONTRADICTION_PATTERNS.md's per-pattern sections (§P-1, §P-2, §P-4) define each pattern independently; composite edges *use* those definitions, they don't *change* them.

3. **Composite edges do NOT create new patterns automatically.** A composite edge instantiates existing patterns jointly; it does not establish a new pattern called "P-1×P-4" or similar. New patterns are created only when a recurring structural form is observed across multiple edges and is formalized in its own §P-? section through a separate justification cycle. (See §Future Extensions below for forward-looking notes on potential composite-pattern clustering.)

4. **Layer ordering within composite rationales.** When composing patterns from different layers, components should be ordered **deepest-first** (Layer 0 → Layer 1 → Layer 2 → ...). This reflects the logical priority recorded in the Pattern Stratification section: deeper-layer denials encompass shallower-layer concerns. The canonical example E-0021 places Component A as P-4 (Layer 0) and Component B as P-1 (Layer 1).

### Limits and Constraints

Composite edges should be **rare**. Several safeguards apply:

1. **Reviewer threshold is higher.** Authoring a composite edge requires textual grounding for each component, an explicit synthesis, and cross-layer reasoning. Reviewers should default to single-pattern unless the source's position genuinely spans multiple layers in a non-reducible way. If a single-pattern formulation suffices, prefer it.

2. **Avoid trivial stacking.** Composite edges must not be used to "claim" multiple patterns when a single pattern suffices. If the case for one component is substantially weaker than the case for the dominant component, the dominant component should be the sole pattern, with the weaker observation noted in the rationale prose without composite labeling.

3. **Maximum recommended pattern count: 2–3 patterns per edge.** Edges instantiating more than three patterns simultaneously are likely either over-claiming or symptomatic of a missing single-pattern that better captures the position. A four-pattern composite warrants reviewer escalation and re-evaluation of whether a new specialized pattern is hiding within the case.

4. **Composite / single-pattern edge co-existence.** When a composite edge and a single-pattern edge share the same source-target node pair, the relationship between them must be classified into one of two types:

   #### 4a. Type A — Redundant Composite (FORBIDDEN)

   A composite edge is **redundant** if it adds no informational content beyond an existing single-pattern edge between the same node pair. Redundant composites:

   - Duplicate the single-pattern edge's pattern membership without introducing any additional pattern layers.
   - Contain components whose claims are already fully captured by the single-pattern edge alone.
   - Have a synthesis section whose content is reducible to (i.e., expressible by) the single-pattern edge's claim.

   **Redundant composites must not be authored.** If a proposed composite turns out to be redundant under inspection, author the single-pattern edge instead — or, if the single-pattern edge is already in place, do not add the composite.

   #### 4b. Type B — Extending Composite (PERMITTED)

   A composite edge is **extending** if it introduces at least one pattern layer beyond what the single-pattern edge captures. Extending composites:

   - Include the single-pattern edge's pattern as one of their components (so the single-pattern edge's claim remains visible in the composite).
   - Add at least one *additional* pattern as another component, contributing structurally independent doctrinal content.
   - Have a synthesis whose content is **non-reducible** to the single-pattern edge's claim — capturing more of the source's position than the single-pattern edge alone.

   **Extending composites are permitted to coexist with the single-pattern edge between the same node pair.** The composite is treated as the more complete description; the single-pattern edge is treated as a partial-view legacy or simplified projection. See §4d (Coexistence rule).

   #### 4c. Criteria for an extending composite

   A proposed composite qualifies as **extending** (Type B, permitted) if and only if **all three** of the following are satisfied:

   1. **Layer addition.** The composite introduces at least one pattern layer beyond what the single-pattern edge instantiates. Stacking the same pattern twice does not count (see §Use Criteria §1: distinct layers).
   2. **Independent contribution.** The added pattern contributes independent reasoning grounded in source text — its component is not a restatement of the single-pattern edge's content. The added component must cite source material that the single-pattern edge does not address (or addresses only incidentally).
   3. **Non-reducible synthesis.** The synthesis section captures content that no subset of the components captures alone. Removing the added component must leave the rationale unable to express part of the source's position; the composite is genuinely *more* than its single-pattern projection.

   If any criterion fails, the composite is redundant (Type A) and must not be authored.

   #### 4d. Coexistence rule

   Single-pattern and composite edges between the same node pair MAY coexist, **only when the composite is extending (Type B)**. When they coexist:

   - The **composite edge is the primary interpretation** of the contradiction. It captures the source's position more fully and should be the reference description for downstream queries seeking the complete doctrinal picture.
   - The **single-pattern edge may be retained** for simplicity, legacy, or partial-view querying. Downstream consumers that filter by single-pattern membership benefit from the single-pattern edge's existence; consumers seeking the full doctrinal picture should consult the composite.
   - **Both edges remain valid records** in the graph. The composite does not supersede the single-pattern edge in graph operations or in audit-tool behavior; it provides additional structural information for interpretive use.
   - **Pattern-membership filtering treats the composite as a member of each constituent pattern.** A query for "all P-1 contradictions" should match both the single-pattern P-1 edge and any composite that includes P-1 as a component (per §Interpretation Guidance §4). Coexistence does not double-count by listing the same node pair twice for the same pattern; downstream filtering logic should deduplicate by node pair when reporting per-pattern coverage.

   #### 4e. Resolution guidance (when coexistence is undesired)

   When a node pair has both a single-pattern edge and an extending composite, three resolution paths are available. The system **does not enforce a choice**; the appropriate path depends on curation goals:

   - **Option A — Deprecate the single-pattern edge.** Remove the single-pattern edge from the graph; the composite becomes the sole record for that node pair. Suited when the single-pattern edge adds no diagnostic value beyond what the composite provides, and per-pattern filter queries are well-served by the composite's pattern-membership.
   - **Option B — Retain both with documentation.** Leave both edges in place; document the relationship in each edge's rationale (the single-pattern edge cross-references the composite as the fuller view; the composite cross-references the single-pattern edge as the partial-view legacy). Suited when downstream tooling benefits from filter-by-single-pattern queries that match a node pair without composite-component traversal, and when reviewers prefer explicit redundancy documentation over edge removal.
   - **Option C — Upgrade the single-pattern edge to the composite.** Edit the single-pattern edge's rationale in place to convert it into the composite (multi-component format), then deprecate any separate composite edge that was authored. Suited when the composite work is being incorporated into existing edge records rather than added as a parallel edge. (Note: this path requires modifying an existing edge, which some briefs may forbid; available only when the cycle's constraints permit edge modification.)

   Resolution is curation-level, not enforcement-level. Edges authored before this rule revision (e.g., E-0019 single-pattern + E-0023 composite, the canonical extending-coexistence case) may remain unresolved indefinitely as documented examples of the pattern.

   #### 4f. Worked example: E-0019 + E-0023 (extending composite coexistence)

   **Edges in question:**

   - **E-0019** (single-pattern P-1): OM-b7b1f8af (Cloud) → LM-9ea458a9 (knowledge-LM). Records the Cloud's apophatic-of-cognitive-access denial against the knowledge-LM's cognitive-recognition mechanism.
   - **E-0023** (composite P-1 × P-2): same source-target node pair. Records both the access denial (Component A — P-1, the same claim as E-0019) AND the love-as-mechanism substitution (Component B — P-2, NOT captured by E-0019).

   **Why E-0023 qualifies as extending (Type B), not redundant (Type A):**

   | Criterion (§4c) | Status | How satisfied |
   |---|---|---|
   | 1. Layer addition | ✓ | E-0023 adds Layer 2 (P-2 / Mechanism / Sufficiency) beyond E-0019's Layer 1 (P-1 / Epistemic-Access). The two components occupy different stratification layers per §Use Criteria §1. |
   | 2. Independent contribution | ✓ | Component B (P-2) grounds in Cloud Ch 3 ("Lift up thine heart unto God with a meek stirring of love") and Ch 7 ("Smite upon that thick cloud of unknowing with a sharp dart of longing love") — passages making the love-as-mechanism claim. The single-pattern P-1 edge (E-0019) addresses only the cognitive-access denial from Cloud Ch 6 ("of God Himself can no man think"; "by thought never"). The love-as-mechanism content is structurally distinct from the access-denial content; Component B is not a restatement of E-0019's claim. |
   | 3. Non-reducible synthesis | ✓ | E-0023's synthesis explicitly states "denies BOTH the validity of cognitive access (P-1) and the sufficiency of knowledge as a liberation mechanism (P-2)." Removing Component B leaves the rationale unable to express the love-as-mechanism / mechanism-substitution part of the Cloud's position. The composite is genuinely *more* than its single-pattern P-1 projection. |

   All three criteria satisfied → E-0023 is **Type B (extending composite, permitted)** per §4b.

   **Coexistence status:** E-0023 is the primary interpretation of the Cloud × knowledge-LM contradiction (it captures both the access-denial and the love-mediation). E-0019 is the partial-view legacy edge. Both remain valid records in the graph. Per §Interpretation Guidance §4, queries for P-1 contradictions match both E-0019 and E-0023 (with deduplication by node pair when reporting coverage).

   **Resolution status:** not yet selected (and not required). The user/system may, in a future cycle, choose Option A (deprecate E-0019), Option B (retain both with cross-reference documentation in rationales), or Option C (upgrade E-0019 to composite, deprecating E-0023). This case stands as the canonical worked example of the extending-coexistence pattern; it is documented here, not enforced.

5. **Auto-emitter remains layer-blind.** Composite edges, like single-pattern P-1, P-2, and P-4 edges, are invisible to the auto-emitter (`Atlas/pipeline/builder.py:_candidate_edges`). They are exclusively hand-authored. The composite-edge formalism does not introduce auto-emission rules; the existing rule set is unchanged. Auto-detection of composite cases would require all of the auto-detection prerequisites for the constituent patterns (per their respective §6 Detection Criteria) plus additional cross-pattern logic — none of which is currently authorized.

### Interpretation Guidance

Reading composite edges requires distinguishing what each component contributes:

1. **Each component is a separate denial-target relationship.** In E-0021 (Madhyamaka × knowledge-LM):
   - Component A (P-4) says: the knowledge-LM's *target object* (the absolute) does not exist.
   - Component B (P-1) says: the knowledge-LM's *method* (cognitive recognition) is not a valid access path even if the target were granted.
   - These are independent denials. Each could in principle be true without the other; the composite asserts both jointly.

2. **The composite asserts both denials simultaneously and inseparably.** The source position is precisely the combined denial; partial concession to one half (e.g., a hypothetical compromise where the absolute is provisionally granted but cognition is denied) would not match the composite's claim. This is what makes the composite *non-reducible* — neither half-position accurately represents the source.

3. **Deeper-layer patterns may recontextualize higher ones, but do NOT invalidate them.** This rule is inherited from the Pattern Stratification section's general principle and applies internally to composite rationales. When reading a composite edge:
   - Read deeper-layer components first. If the source rejects the target's existential premise (deeper layer), the access-layer denial is logically downstream of that rejection.
   - But all components remain recorded as separate denials. The graph does not collapse the composite into "just the deeper denial" — both layers' rejections are part of the source's recorded position.

4. **All components remain queryable.** The composite's rationale preserves both the P-4 and the P-1 components verbatim. Future queries, audits, or reports that filter by pattern (e.g., "show all P-1 contradictions") **should match composite edges that include P-1 as a component**, not just single-pattern P-1 edges. Filtering logic for downstream tooling should treat composite edges as members of *each* of their constituent patterns.

5. **Cross-references in the rationale identify pattern membership.** A composite edge's rationale must name each constituent pattern explicitly (e.g., "P-1", "P-4"). Reviewers and downstream tooling can use these names to identify pattern membership at a glance. Future tooling that consumes the rationale text can use the labeled-component convention (`**Component <letter> — Pattern <name>`) to extract structured pattern-membership data.

### Example: E-0021 (Canonical Composite)

**Edge:** OM-389a76f9 (Madhyamaka, anti-foundationalism) → LM-9ea458a9 (knowledge-based liberation).

**Why it qualifies as composite (per the four Use Criteria):**

| Criterion | Status | How it is satisfied |
|---|---|---|
| 1. Distinct layers | ✓ | Component A is P-4 (Layer 0, Meta-Ontological); Component B is P-1 (Layer 1, Epistemic-Access). The two components occupy different stratification layers. |
| 2. Non-reducibility | ✓ | P-4 alone leaves untouched whether cognition could in principle reach a non-existent absolute (the question is malformed but the access-mechanism dispute remains). P-1 alone presupposes the absolute exists, which Madhyamaka denies — and standard P-1 sources carry `ineffability` (denial of access to an existent absolute), not `anti-foundationalism` (denial of existence). Neither pattern individually captures Madhyamaka's full repudiation. |
| 3. Independent component justification | ✓ | Component A grounds in MMK 1.1 (eight-fold negation) + MMK 24.18 (emptiness as dependent designation) for the existential denial. Component B grounds in MMK 24.11 (warning against reifying emptiness) for the conceptual-access denial. Each component cites distinct source passages making distinct claims. |
| 4. Synthesis with added meaning | ✓ | The synthesis section explicitly states "denies BOTH the existence of the object (P-4) and the validity of the method (P-1)" and articulates non-reducibility ("not reducible to either pattern alone"). Identifies the edge as the "first multi-pattern edge in the graph" and as a cross-layer contradiction. |

**Layer ordering:** Component A is P-4 (Layer 0, deepest); Component B is P-1 (Layer 1). Components are ordered deepest-first per the Pattern Interaction Rules §4.

**Source-side schema note:** OM-389a76f9 carries `anti-foundationalism` (P-4 source template) but not `ineffability` (P-1 source template). The composite edge is authored despite the source not matching P-1's standard source-axis template, because the source's anti-foundationalist position logically encompasses any apophatic-of-access claim — a Madhyamaka commentator's denial of existence implies a denial of cognitive access by entailment. **This composite-with-asymmetric-axis-templates structure is a key reason E-0021 is composite rather than single-pattern**: standard P-1 source-axis templates do not apply, but the P-1-layer claim is nonetheless made by the source and contradicts the target's P-1-target-axis template.

### Future Extensions

Other composite combinations are anticipated as the corpus grows. Per the layer model, all pairs (and triples) of formalized patterns can in principle yield composites:

| Composite | Likely source profile | Likely target profile | Status |
|---|---|---|---|
| **P-1 × P-4** | Anti-foundationalist OM (denies existence) targeting cognitive-recognition LM | LM with `{absolute, knowledge}` | **Realized: E-0021** |
| **P-2 × P-4** | Anti-foundationalist OM (denies existence) targeting mechanism-LM (cessation, ethical-conduct, devotion, etc.) | LM with mechanism axis | not yet realized; would require Madhyamaka (or another anti-foundationalist OM) paired against an LM whose contradiction with the source includes both denial-of-existence and mechanism-sufficiency dispute |
| **P-1 × P-2** | Apophatic OM with mechanism-position (denies access AND proposes alternative mechanism) | LM with `{absolute, knowledge}` | not yet realized; would require a single source that both apophasizes the absolute and proposes a non-cognitive liberation mechanism (the Cloud of Unknowing's love-mediation comes close, but its love-claim is access-mode-substitution rather than independent mechanism-claim, so it doesn't quite qualify as a P-2 component) |
| **P-1 × P-2 × P-4** (triple) | Anti-foundationalist OM that *also* makes both apophatic-access and alternative-mechanism claims | any | rare; reviewer escalation required if proposed (per Limits §3); likely indicates a missing single-pattern that better captures the case |

**Composite pattern clustering** (future idea, not implemented): if multiple composite edges accumulate that share the same component-pattern combination (e.g., several P-1 × P-4 edges from different traditions), formalizing the cluster as a **named composite pattern** may be warranted. Naming convention proposal:
- Two-component composites: `P-X×P-Y` (e.g., `P-1×P-4`).
- Three-component composites: `P-X×P-Y×P-Z` (e.g., `P-1×P-2×P-4`).
- Layer order in the name follows the deepest-first rule from the Pattern Interaction Rules.

Until at least 2 instances of a given composite combination exist, composite naming is deferred and edges are simply tagged with their component patterns in rationale text. When a composite combination reaches 2+ instances, a separate justification cycle (parallel to the per-pattern formalization cycles for P-1, P-2, P-4) can document the composite as a named pattern with its own §P-X×P-Y section in this file.

This forward-looking design is documentation-only; no auto-detection, no schema commitment.

---

## Pattern History

| Pattern | First instance | Status | Auto-detection? |
|---|---|---|---|
| P-1 (Epistemic-Access Contradiction) | E-0017 (OM-52056395 ↔ LM-9ea458a9, Daoist) | **four curated instances**: E-0017 (Daoist), E-0018 (Vedic), E-0019 (Christian), E-0025 (Neoplatonist) — cross-tradition robustness empirically established | manual only; promotion criterion 1 (≥2 additional instances beyond founding) **satisfied**; criteria 2 and 3 **not yet met** |
| P-2 (Sufficiency Contradiction) | E-0011 (LM-9ea458a9 ↔ LM-c101ae16, knowledge ↔ cessation) | **four curated instances**: E-0007 (realization ↔ cessation), E-0011 (knowledge ↔ cessation), E-0028 (knowledge ↔ practice), E-0029 (devotion ↔ practice) — cross-mechanism-modality robustness established (cognitive × processual; cognitive × cultivation; affective × cultivation) | manual only; promotion criterion 1 **satisfied**; criteria 2 and 3 **not yet met** |
| P-3 (Identity / Self / Process Contradiction) | E-0016 (IM-6657916a ↔ IM-69f621d6, self-as-substance ↔ self-as-process) | **one curated instance** (E-0016) + **one auto-emitted instance pending curation** (E-0004, `self-as-illusion` ↔ `self-as-substance`) — formalized in this cycle as the IM-domain Layer 0 pattern, parallel to P-4's OM-domain Layer 0 placement | manual only; promotion criterion 1 (≥2 additional instances beyond founding) **not yet met**; criteria 2 and 3 **not yet met** |
| P-4 (Foundationalist Contradiction) | E-0020 (OM-389a76f9 ↔ OM-028a568b, Madhyamaka ↔ Vedantic monism) | **four curated single-pattern instances**: E-0020 (Vedantic monism), E-0024 (Daoist generative-source), E-0026 (Plotinian One), E-0027 (devotion-LM as kataphatic-as-devotional-object); plus participation in composites E-0021 (P-1×P-4) and E-0022 (P-2×P-4) | manual only; promotion criterion 1 **satisfied** across multiple target-substructures; criteria 2 and 3 **not yet met** |

Numbering convention: pattern IDs are not strictly sequential — they were assigned in order of formalization, not in order of logical depth. P-4 was formalized first (after MMK pattern-driven evaluation revealed a meta-ontological contradiction layer that P-1 couldn't capture) and reserved P-2 and P-3 for sibling patterns then-identified in P-1's §8. P-2 has been formalized as the Layer 2 (Mechanism / Sufficiency) pattern. P-3 has been formalized in this cycle as the **IM-domain Layer 0 (Identity-Ontological) pattern** for intra-IM contradictions over self-structure. The earlier tentative use of "P-3" for an LM-domain sub-mechanism pattern (with E-0007 as candidate) is superseded; E-0007 is classified as **P-2** (broad mechanism-sufficiency), and any future LM-domain sub-mechanism pattern will receive a fresh label (e.g., P-5).

When additional patterns are extracted from future curated edges or pattern-driven evaluations, they are appended in the same eight-section format (Pattern Name → Future Extension), with their layer assignment recorded in the Pattern Stratification Table.
