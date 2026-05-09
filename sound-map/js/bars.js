/**
 * SOUND/bars.js
 *
 * Bar factories. Reads (read-only) from inline analysis globals:
 *   window.D                 (CMUDict map)
 *   window.smSyllabify       (arpabet → syllables)
 *   window.smAnalyzeMeter    (stress[] → meter analysis)
 *   window.SM_FEATS          (phoneme → features)
 *
 * Public API:
 *   SOUND.Bar.extractAnalysisSnapshot(text)
 *   SOUND.Bar.fromBuilder(text, ctx)
 *   SOUND.Bar.revisionOf(parentBar, newText, ctx)
 *   SOUND.Bar.normalizeTags(input)
 *
 *   ctx (optional): { personaId, sessionId, source, tags, notes }
 */
(function () {
  "use strict";
  if (!window.SOUND) window.SOUND = {};
  const SOUNDError = SOUND.SOUNDError;

  function normalizeTags(input) {
    if (!input) return [];
    const arr = Array.isArray(input) ? input : String(input).split(/[,\n]/);
    const seen = new Set();
    const out = [];
    for (const raw of arr) {
      const t = String(raw).trim().toLowerCase().replace(/\s+/g, "-");
      if (t && !seen.has(t)) { seen.add(t); out.push(t); }
    }
    return out;
  }

  function voicedRatio(words) {
    let voiced = 0, total = 0;
    for (const w of words) {
      if (!w.known) continue;
      for (const syl of w.syllables) {
        const phonemes = [...syl.onset, syl.nucleus, ...syl.coda];
        for (const ph of phonemes) {
          const f = window.SM_FEATS[ph];
          if (!f) continue;
          total++;
          if (f.voice) voiced++;
        }
      }
    }
    return total > 0 ? +(voiced / total).toFixed(4) : null;
  }

  function plosiveDensity(words) {
    let plosives = 0, syllables = 0;
    for (const w of words) {
      if (!w.known) continue;
      for (const syl of w.syllables) {
        syllables++;
        for (const ph of syl.onset) {
          const f = window.SM_FEATS[ph];
          if (f && (f.manner === "stop" || f.manner === "plosive")) plosives++;
        }
      }
    }
    return syllables > 0 ? +(plosives / syllables).toFixed(4) : null;
  }

  function buildPhoneticString(words) {
    return words
      .map(w => w.known
        ? w.syllables.map(s => [...s.onset, s.nucleus, ...s.coda].join("")).join("·")
        : `[${w.w}]`)
      .join(" ");
  }

  function extractAnalysisSnapshot(text) {
    if (!window.D || !window.smSyllabify || !window.smAnalyzeMeter || !window.SM_FEATS) {
      throw new SOUNDError("ANALYSIS_NOT_LOADED",
        "inline analysis globals (D, smSyllabify, smAnalyzeMeter, SM_FEATS) not found");
    }

    const tokens = text.toLowerCase().split(/\s+/)
      .map(t => t.replace(/[^a-z\-']/g, ""))
      .filter(Boolean);

    const words = tokens.map(w => {
      const entry = window.D[w];
      return {
        w,
        known: !!entry,
        syllables: entry ? window.smSyllabify(entry[0]) : []
      };
    });

    const stress_pattern = [];
    for (const w of words) {
      if (!w.known) continue;
      for (const syl of w.syllables) stress_pattern.push(syl.stress);
    }

    let meter = null;
    if (stress_pattern.length > 0) {
      const ma = window.smAnalyzeMeter(stress_pattern);
      if (ma && Number.isInteger(ma.feet) && ma.feet >= 1) {
        meter = {
          pattern: ma.pattern || null,
          feet: ma.feet,
          confidence: typeof ma.confidence === "number" ? +ma.confidence.toFixed(4) : 0
        };
      }
    }

    return {
      analysis_version: 1,
      analyzed_at: new Date().toISOString(),
      dictionary: SOUND.DICTIONARY,
      feature_table: SOUND.FEATURE_TABLE,
      ipa: buildPhoneticString(words),
      words,
      stress_pattern,
      meter,
      articulation: {
        voiced_ratio: voicedRatio(words),
        plosive_density: plosiveDensity(words),
        gesture_distance_avg: null,
        vowel_openness_mean:  null
      }
    };
  }

  function fromBuilder(text, ctx = {}) {
    const trimmed = (text ?? "").trim();
    if (!trimmed) throw new SOUNDError("EMPTY_TEXT", "text must be non-empty");
    const id = SOUND.ulid("bar");
    return {
      id,
      schema_version: 1,
      created_at: new Date().toISOString(),
      text: trimmed,
      source: ctx.source || "bar-builder",
      parent_id: null,
      lineage_root_id: id,
      revision_index: 0,
      state: "kept",
      persona_id: ctx.personaId ?? null,
      session_id: ctx.sessionId ?? null,
      tags: normalizeTags(ctx.tags),
      notes: ctx.notes ?? "",
      favorite: false,
      analysis: extractAnalysisSnapshot(trimmed),
      cadence: [], takes: [], links: []
    };
  }

  function revisionOf(parentBar, newText, ctx = {}) {
    if (!parentBar || !parentBar.id) throw new SOUNDError("BAD_PARENT", "parent bar required");
    const trimmed = (newText ?? "").trim();
    if (!trimmed) throw new SOUNDError("EMPTY_TEXT", "text must be non-empty");
    const id = SOUND.ulid("bar");
    return {
      id,
      schema_version: 1,
      created_at: new Date().toISOString(),
      text: trimmed,
      source: ctx.source || parentBar.source,
      parent_id: parentBar.id,
      lineage_root_id: parentBar.lineage_root_id,
      revision_index: parentBar.revision_index + 1,
      state: "kept",
      persona_id: ctx.personaId !== undefined ? ctx.personaId : parentBar.persona_id,
      session_id: ctx.sessionId ?? null,
      tags: ctx.tags !== undefined ? normalizeTags(ctx.tags) : [...parentBar.tags],
      notes: ctx.notes ?? "",
      favorite: false,
      analysis: extractAnalysisSnapshot(trimmed),
      cadence: [], takes: [], links: []
    };
  }

  // Thin wrapper that stamps source = "sound-map". Identical analysis pipeline
  // as fromBuilder; intent-tag only.
  function fromSoundMapLine(text, ctx = {}) {
    return fromBuilder(text, { ...ctx, source: "sound-map" });
  }

  SOUND.Bar = {
    extractAnalysisSnapshot,
    fromBuilder,
    fromSoundMapLine,
    revisionOf,
    normalizeTags
  };
})();
