/**
 * SOUND/schemas.js
 *
 * Schema definitions and validators for persistent SOUND records.
 * Validators return { ok: boolean, errors: string[] } — never throw.
 *
 * Public API:
 *   SOUND.SCHEMA_VERSION
 *   SOUND.DICTIONARY            "cmudict-0.7b"
 *   SOUND.FEATURE_TABLE         "SM_FEATS@v1"
 *   SOUND.SOURCES               frozen array
 *   SOUND.STATES                frozen array
 *   SOUND.validateBar(obj)      → { ok, errors }
 *   SOUND.validatePersona(obj)  → { ok, errors }
 */
(function () {
  "use strict";
  if (!window.SOUND) window.SOUND = {};

  const SCHEMA_VERSION = 1;
  const SOURCES = ["bar-builder", "sound-map", "rhyme-finder", "manual", "import"];
  const STATES  = ["draft", "kept", "archived"];

  const ULID_BODY = "[0-9A-HJKMNP-TV-Z]{26}";
  const BAR_ID_RE = new RegExp("^bar_" + ULID_BODY + "$");
  const PER_ID_RE = new RegExp("^per_" + ULID_BODY + "$");
  const SES_ID_RE = new RegExp("^ses_" + ULID_BODY + "$");
  const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/;
  const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

  const isStr  = v => typeof v === "string";
  const isBool = v => typeof v === "boolean";
  const isInt  = v => Number.isInteger(v);
  const isArr  = v => Array.isArray(v);
  const isObj  = v => v !== null && typeof v === "object" && !Array.isArray(v);
  const isSingleGrapheme = s => isStr(s) && [...s].length === 1;

  function validateBar(b) {
    const errors = [];
    const need = (cond, msg) => { if (!cond) errors.push(msg); };

    if (!isObj(b)) return { ok: false, errors: ["bar must be a non-null object"] };

    need(BAR_ID_RE.test(b.id),                              "id must match 'bar_' + 26-char ULID");
    need(b.schema_version === 1,                            "schema_version must be 1");
    need(isStr(b.created_at) && ISO_RE.test(b.created_at),  "created_at must be ISO 8601");
    need(isStr(b.text) && b.text.trim().length > 0,         "text must be non-empty string");
    need(SOURCES.includes(b.source),                        `source must be one of: ${SOURCES.join(", ")}`);

    need(b.parent_id === null
         || (isStr(b.parent_id) && BAR_ID_RE.test(b.parent_id)),
         "parent_id must be null or 'bar_' ULID");
    need(isStr(b.lineage_root_id) && BAR_ID_RE.test(b.lineage_root_id),
         "lineage_root_id must be 'bar_' ULID");
    need(isInt(b.revision_index) && b.revision_index >= 0,
         "revision_index must be integer ≥ 0");

    need(STATES.includes(b.state),                          `state must be one of: ${STATES.join(", ")}`);
    need(b.persona_id === null
         || (isStr(b.persona_id) && PER_ID_RE.test(b.persona_id)),
         "persona_id must be null or 'per_' ULID");
    need(b.session_id === null
         || (isStr(b.session_id) && SES_ID_RE.test(b.session_id)),
         "session_id must be null or 'ses_' ULID");
    need(isArr(b.tags) && b.tags.every(isStr),              "tags must be string[]");
    need(isStr(b.notes),                                     "notes must be string (may be empty)");
    need(isBool(b.favorite),                                 "favorite must be boolean");

    if (!isObj(b.analysis)) {
      errors.push("analysis must be an object");
    } else {
      const a = b.analysis;
      need(isInt(a.analysis_version) && a.analysis_version >= 1,
           "analysis.analysis_version must be integer ≥ 1");
      need(isStr(a.analyzed_at) && ISO_RE.test(a.analyzed_at),
           "analysis.analyzed_at must be ISO 8601");
      need(isStr(a.dictionary),                              "analysis.dictionary must be string");
      need(isStr(a.feature_table),                           "analysis.feature_table must be string");
      need(isStr(a.ipa),                                      "analysis.ipa must be string");
      need(isArr(a.words),                                    "analysis.words must be array");
      need(isArr(a.stress_pattern) && a.stress_pattern.every(isInt),
           "analysis.stress_pattern must be integer[]");
      need(a.meter === null || isObj(a.meter),                "analysis.meter must be null or object");
      need(isObj(a.articulation),                              "analysis.articulation must be object");
    }

    need(isArr(b.cadence) && b.cadence.length === 0,         "cadence must be empty array in v1");
    need(isArr(b.takes)   && b.takes.length === 0,           "takes must be empty array in v1");
    need(isArr(b.links)   && b.links.length === 0,           "links must be empty array in v1");

    return { ok: errors.length === 0, errors };
  }

  function validatePersona(p) {
    const errors = [];
    const need = (cond, msg) => { if (!cond) errors.push(msg); };

    if (!isObj(p)) return { ok: false, errors: ["persona must be a non-null object"] };

    need(PER_ID_RE.test(p.id),                              "id must match 'per_' + 26-char ULID");
    need(p.schema_version === 1,                            "schema_version must be 1");
    need(isStr(p.created_at) && ISO_RE.test(p.created_at),  "created_at must be ISO 8601");
    need(isStr(p.name) && p.name.trim().length > 0,         "name must be non-empty string");
    need(isStr(p.color) && HEX_COLOR_RE.test(p.color),      "color must be #RRGGBB hex");
    need(isSingleGrapheme(p.glyph),                          "glyph must be exactly one grapheme");
    need(isStr(p.notes),                                     "notes must be string (may be empty)");
    need(isBool(p.pinned),                                   "pinned must be boolean");
    need(isBool(p.archived),                                 "archived must be boolean");
    need(p.fingerprint === null,                             "fingerprint must be null in v1");
    need(isArr(p.exclusions) && p.exclusions.length === 0,
         "exclusions must be empty array in v1");
    need(isArr(p.reference_bar_ids) && p.reference_bar_ids.length === 0,
         "reference_bar_ids must be empty array in v1");

    return { ok: errors.length === 0, errors };
  }

  SOUND.SCHEMA_VERSION = SCHEMA_VERSION;
  SOUND.DICTIONARY     = "cmudict-0.7b";
  SOUND.FEATURE_TABLE  = "SM_FEATS@v1";
  SOUND.SOURCES        = Object.freeze(SOURCES.slice());
  SOUND.STATES         = Object.freeze(STATES.slice());
  SOUND.validateBar    = validateBar;
  SOUND.validatePersona = validatePersona;
})();
