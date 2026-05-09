/**
 * SOUND/ui_integration.js
 *
 * Bar Builder ↔ Vault wiring.
 * Side-effect module — runs init() on DOMContentLoaded.
 *
 * Wires:
 *   #bb-input, #bb-persona, #bb-save, #bb-save-rev,
 *   #bb-state-indicator, #bb-bar-chip(+ -text, -clear)
 *
 * Public surface:
 *   SOUND.UI.loadBar(bar)
 *   SOUND.UI.loadBarById(id)        async
 *   SOUND.UI.unloadBar()
 *   SOUND.UI.refreshPersonaPicker() async
 *   SOUND.UI.state()                snapshot
 */
(function () {
  "use strict";
  if (!window.SOUND) window.SOUND = {};

  const LS_ACTIVE_PERSONA = "sound:active_persona_id";

  const state = {
    activePersonaId: null,
    currentBar: null,
    dirty: false
  };
  const els = {};

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (_) {} }

  async function refreshPersonaPicker() {
    if (!els.persona) return;
    const personas = await SOUND.Vault.personas.list();
    const previous = state.activePersonaId;

    els.persona.innerHTML = "";
    for (const p of personas) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.glyph}  ${p.name}`;
      opt.style.color = p.color;
      els.persona.appendChild(opt);
    }

    let active = personas.find(p => p.id === previous);
    if (!active) active = SOUND.Persona.getDefault(personas);

    if (active) {
      els.persona.value = active.id;
      state.activePersonaId = active.id;
      lsSet(LS_ACTIVE_PERSONA, active.id);
    } else {
      state.activePersonaId = null;
      lsSet(LS_ACTIVE_PERSONA, null);
    }
  }

  function updateIndicator() {
    if (!els.stateIndicator) return;
    const el = els.stateIndicator;
    el.classList.remove("bb-state-draft", "bb-state-saved", "bb-state-modified");

    const text = els.input.value.trim();

    if (!text) {
      el.textContent = "no text";
      el.classList.add("bb-state-draft");
      els.save.disabled = true;
      els.saveRev.disabled = true;
      return;
    }

    if (state.currentBar) {
      const changed = text !== state.currentBar.text.trim();
      if (changed) {
        el.textContent = "modified";
        el.classList.add("bb-state-modified");
        els.saveRev.disabled = false;
      } else {
        el.textContent = "saved";
        el.classList.add("bb-state-saved");
        els.saveRev.disabled = true;
      }
      els.save.disabled = true;
    } else {
      el.textContent = state.dirty ? "draft (unsaved)" : "ready";
      el.classList.add("bb-state-draft");
      els.save.disabled = false;
      els.saveRev.disabled = true;
    }
  }

  function updateBarChip() {
    if (state.currentBar) {
      const b = state.currentBar;
      els.barChipText.textContent = b.parent_id
        ? `rev ${b.revision_index} · ${b.id.slice(0, 12)}…`
        : `${b.id.slice(0, 16)}…`;
      els.barChip.hidden = false;
      els.save.hidden = true;
      els.saveRev.hidden = false;
    } else {
      els.barChip.hidden = true;
      els.save.hidden = false;
      els.saveRev.hidden = true;
    }
  }

  async function onSave() {
    const text = els.input.value;
    if (!text.trim()) return;
    try {
      const bar = SOUND.Bar.fromBuilder(text, {
        personaId: state.activePersonaId,
        sessionId: null
      });
      await SOUND.Vault.bars.add(bar);
      state.currentBar = bar;
      state.dirty = false;
      updateBarChip();
      flashIndicator("saved");
      SOUND.UI.Vault?.refresh?.();
    } catch (err) {
      reportError("Save failed", err);
    }
  }

  async function onSaveRevision() {
    if (!state.currentBar) return;
    const text = els.input.value;
    if (!text.trim()) return;
    if (text.trim() === state.currentBar.text.trim()) return;
    try {
      const child = SOUND.Bar.revisionOf(state.currentBar, text, {
        personaId: state.activePersonaId
      });
      await SOUND.Vault.bars.add(child);
      state.currentBar = child;
      state.dirty = false;
      updateBarChip();
      flashIndicator("revision saved");
      SOUND.UI.Vault?.refresh?.();
    } catch (err) {
      reportError("Save Revision failed", err);
    }
  }

  function flashIndicator(msg) {
    if (!els.stateIndicator) return;
    els.stateIndicator.textContent = "✓ " + msg;
    els.stateIndicator.classList.remove("bb-state-draft", "bb-state-modified");
    els.stateIndicator.classList.add("bb-state-saved");
    setTimeout(updateIndicator, 1400);
  }

  function reportError(prefix, err) {
    console.error("[SOUND]", prefix, err);
    const detail = (err && (err.code || err.message)) || String(err);
    if (els.stateIndicator) {
      els.stateIndicator.textContent = `✗ ${detail}`;
      els.stateIndicator.classList.remove("bb-state-saved", "bb-state-modified");
      els.stateIndicator.classList.add("bb-state-draft");
      setTimeout(updateIndicator, 3000);
    }
  }

  function loadBar(bar) {
    if (!bar) return unloadBar();
    state.currentBar = bar;
    state.dirty = false;
    els.input.value = bar.text;
    if (bar.persona_id && els.persona && [...els.persona.options].some(o => o.value === bar.persona_id)) {
      els.persona.value = bar.persona_id;
      state.activePersonaId = bar.persona_id;
      lsSet(LS_ACTIVE_PERSONA, bar.persona_id);
    }
    updateBarChip();
    updateIndicator();
  }

  async function loadBarById(id) {
    const bar = await SOUND.Vault.bars.get(id);
    if (!bar) { console.warn(`[SOUND] no bar with id ${id}`); return null; }
    loadBar(bar);
    return bar;
  }

  function unloadBar() {
    state.currentBar = null;
    state.dirty = els.input.value.trim().length > 0;
    updateBarChip();
    updateIndicator();
  }

  async function init() {
    els.input          = document.getElementById("bb-input");
    els.analyze        = document.getElementById("bb-analyze");
    els.persona        = document.getElementById("bb-persona");
    els.save           = document.getElementById("bb-save");
    els.saveRev        = document.getElementById("bb-save-rev");
    els.stateIndicator = document.getElementById("bb-state-indicator");
    els.barChip        = document.getElementById("bb-bar-chip");
    els.barChipText    = document.getElementById("bb-bar-chip-text");
    els.barChipClear   = document.getElementById("bb-bar-chip-clear");

    if (!els.input || !els.persona || !els.save || !els.saveRev) {
      console.warn("[SOUND] Bar Builder integration: required elements not found; integration disabled.");
      return;
    }

    state.activePersonaId = lsGet(LS_ACTIVE_PERSONA);

    try {
      await SOUND.Vault.init();
      await SOUND.Persona.ensureStarterIfEmpty();
      await refreshPersonaPicker();
    } catch (err) {
      console.error("[SOUND] vault init failed:", err);
      if (els.stateIndicator) els.stateIndicator.textContent = "vault unavailable";
      return;
    }

    els.input.addEventListener("input", () => {
      state.dirty = true;
      updateIndicator();
    });

    els.persona.addEventListener("change", () => {
      state.activePersonaId = els.persona.value || null;
      lsSet(LS_ACTIVE_PERSONA, state.activePersonaId);
    });

    els.save.addEventListener("click", onSave);
    els.saveRev.addEventListener("click", onSaveRevision);
    els.barChipClear?.addEventListener("click", unloadBar);

    updateIndicator();
    updateBarChip();

    // Sync the Vault module if it loaded first.
    SOUND.UI.Vault?.refresh?.();

    console.log("[SOUND] Bar Builder integration ready");
  }

  SOUND.UI = SOUND.UI || {};
  Object.assign(SOUND.UI, {
    init,
    loadBar,
    loadBarById,
    unloadBar,
    refreshPersonaPicker,
    state: () => ({ ...state, currentBar: state.currentBar ? { ...state.currentBar } : null })
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init().catch(e => console.error("[SOUND] init", e)));
  } else {
    init().catch(e => console.error("[SOUND] init", e));
  }
})();
