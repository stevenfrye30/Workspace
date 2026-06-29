/**
 * SOUND/personas.js
 *
 * Persona helpers. Pure functions over plain Persona objects.
 *
 * Public API:
 *   SOUND.Persona.create({ name, color, glyph, notes?, pinned? })
 *   SOUND.Persona.applyPatch(persona, patch)        // returns new object
 *   SOUND.Persona.archive(persona)                  // returns new object
 *   SOUND.Persona.getDefault(personas)              // → Persona | null
 *   SOUND.Persona.ensureStarterIfEmpty()            // async; touches Vault
 */
(function () {
  "use strict";
  if (!window.SOUND) window.SOUND = {};
  const SOUNDError = SOUND.SOUNDError;
  const MUTABLE_FIELDS = ["name", "color", "glyph", "notes", "pinned"];

  function create({ name, color, glyph, notes = "", pinned = false } = {}) {
    if (!name || !String(name).trim()) {
      throw new SOUNDError("PERSONA_NAME_REQUIRED", "name is required and must be non-empty");
    }
    return {
      id: SOUND.ulid("per"),
      schema_version: 1,
      created_at: new Date().toISOString(),
      name: String(name).trim(),
      color: color || "#9fdc9f",
      glyph: glyph || "✦",
      notes: String(notes),
      pinned: !!pinned,
      archived: false,
      fingerprint: null,
      exclusions: [],
      reference_bar_ids: []
    };
  }

  function applyPatch(persona, patch) {
    const out = { ...persona };
    for (const k of Object.keys(patch || {})) {
      if (!MUTABLE_FIELDS.includes(k)) {
        throw new SOUNDError("IMMUTABLE_FIELD", k);
      }
      out[k] = patch[k];
    }
    return out;
  }

  function archive(persona) {
    return { ...persona, archived: true, pinned: false };
  }

  function getDefault(personas) {
    const active = (personas || []).filter(p => !p.archived);
    return active.find(p => p.pinned) || active[0] || null;
  }

  async function ensureStarterIfEmpty() {
    const all = await SOUND.Vault.personas.list({ includeArchived: true });
    if (all.length > 0) return getDefault(all);
    const starter = create({
      name: "Default",
      color: "#e8c840",
      glyph: "◇",
      notes: "starter persona — rename or archive once you've made your own",
      pinned: true
    });
    await SOUND.Vault.personas.add(starter);
    return starter;
  }

  SOUND.Persona = {
    create,
    applyPatch,
    archive,
    getDefault,
    ensureStarterIfEmpty
  };
})();
