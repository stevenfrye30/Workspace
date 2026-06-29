/**
 * SOUND/ui_capture.js
 *
 * SOUND MAP → Vault capture wiring.
 * Side-effect module — runs init() on DOMContentLoaded.
 *
 * Wires:
 *   #sm-capture-btn         → capture all non-empty lines from #sm-input
 *   #sm-capture-open-after  → checkbox: load single-line captures into Bar Builder
 *   #sm-capture-persona-*   → live indicator of active persona (read-only)
 *   #sm-capture-status      → transient confirmation/error text
 *
 * Reuses existing primitives:
 *   SOUND.Bar.fromSoundMapLine(text, { personaId })
 *   SOUND.Vault.bars.add(bar)
 *   SOUND.UI.loadBar(bar)
 *   window.flSwitchTab + top-level tab .click()
 *
 * Public surface (small):
 *   SOUND.UI.Capture.refreshPersona()    async
 *   SOUND.UI.Capture.capture()           async (programmatic trigger)
 *   SOUND.UI.Capture.state()             snapshot
 */
(function () {
  "use strict";
  if (!window.SOUND) window.SOUND = {};

  const LS_OPEN_AFTER     = "sound:capture_open_after";
  const LS_ACTIVE_PERSONA = "sound:active_persona_id";

  const els = {};
  let statusTimer = null;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (_) {} }

  function showStatus(msg, kind) {
    const el = els.status;
    if (!el) return;
    el.textContent = msg || "";
    el.className = msg ? "sm-capture-status sm-capture-status-" + (kind || "ok")
                       : "sm-capture-status";
    clearTimeout(statusTimer);
    if (msg) {
      statusTimer = setTimeout(() => {
        el.textContent = "";
        el.className = "sm-capture-status";
      }, 2400);
    }
  }

  // Resolve the active persona id robustly:
  // 1. The Bar Builder picker if it has been populated.
  // 2. LocalStorage fallback (covers the case where ui_capture init
  //    runs before ui_integration's refreshPersonaPicker).
  function readActivePersonaId() {
    const sel = document.getElementById("bb-persona");
    if (sel && sel.value) return sel.value;
    return lsGet(LS_ACTIVE_PERSONA) || null;
  }

  async function refreshPersona() {
    if (!els.personaGlyph || !els.personaName) return;
    const id = readActivePersonaId();
    if (!id) {
      els.personaGlyph.textContent = "·";
      els.personaGlyph.style.color = "var(--muted)";
      els.personaName.textContent = "(no persona)";
      els.personaName.style.color = "var(--muted)";
      return;
    }
    try {
      const p = await SOUND.Vault.personas.get(id);
      if (p) {
        els.personaGlyph.textContent = p.glyph;
        els.personaGlyph.style.color = p.color;
        els.personaName.textContent = p.name;
        els.personaName.style.color = "var(--text)";
      } else {
        // Stored id no longer resolves to an active persona.
        els.personaGlyph.textContent = "·";
        els.personaGlyph.style.color = "var(--muted)";
        els.personaName.textContent = "(no persona)";
        els.personaName.style.color = "var(--muted)";
      }
    } catch (err) {
      console.warn("[SOUND] capture: persona refresh failed", err);
    }
  }

  async function onCapture() {
    const text = els.input ? els.input.value : "";
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      showStatus("nothing to capture", "warn");
      return;
    }

    const personaId = readActivePersonaId();
    const captured = [];
    els.btn.disabled = true;
    try {
      for (const line of lines) {
        const bar = SOUND.Bar.fromSoundMapLine(line, { personaId });
        await SOUND.Vault.bars.add(bar);
        captured.push(bar);
      }
    } catch (err) {
      console.error("[SOUND] capture failed:", err);
      showStatus("✗ " + (err && (err.code || err.message) || "capture failed"), "error");
      els.btn.disabled = false;
      return;
    }
    els.btn.disabled = false;

    showStatus(`✓ captured ${captured.length} bar${captured.length === 1 ? "" : "s"}`, "ok");

    // Refresh Vault list if its module is loaded.
    if (SOUND.UI && SOUND.UI.Vault && typeof SOUND.UI.Vault.refresh === "function") {
      SOUND.UI.Vault.refresh();
    }

    // Open in Bar Builder when exactly one line was captured AND opt-in is on.
    if (captured.length === 1 && els.openAfter && els.openAfter.checked) {
      const flowTopBtn = document.querySelector('#tab-nav .tab-btn[data-tab="flow"]');
      if (flowTopBtn) flowTopBtn.click();
      if (typeof window.flSwitchTab === "function") {
        const bbBtn = document.querySelector('#panel-flow .fl-tab-btn[data-fl-tab="bar-builder"]');
        window.flSwitchTab("bar-builder", bbBtn);
      }
      if (SOUND.UI && typeof SOUND.UI.loadBar === "function") {
        SOUND.UI.loadBar(captured[0]);
      }
    }
  }

  async function init() {
    els.row          = document.getElementById("sm-capture-row");
    els.btn          = document.getElementById("sm-capture-btn");
    els.openAfter    = document.getElementById("sm-capture-open-after");
    els.personaGlyph = document.getElementById("sm-capture-persona-glyph");
    els.personaName  = document.getElementById("sm-capture-persona-name");
    els.status       = document.getElementById("sm-capture-status");
    els.input        = document.getElementById("sm-input");

    if (!els.btn || !els.input) {
      console.warn("[SOUND] Capture UI: required elements not found");
      return;
    }

    try {
      await SOUND.Vault.init();
    } catch (err) {
      console.error("[SOUND] capture init: vault unavailable", err);
      els.btn.disabled = true;
      showStatus("vault unavailable", "error");
      return;
    }

    if (els.openAfter) {
      els.openAfter.checked = lsGet(LS_OPEN_AFTER) === "1";
      els.openAfter.addEventListener("change", () => {
        lsSet(LS_OPEN_AFTER, els.openAfter.checked ? "1" : "0");
      });
    }

    els.btn.addEventListener("click", onCapture);

    // Persona indicator stays in sync with the Bar Builder picker.
    const personaSel = document.getElementById("bb-persona");
    if (personaSel) {
      personaSel.addEventListener("change", refreshPersona);
    }

    // Refresh whenever the user clicks back to Sound Map.
    const soundTopBtn = document.querySelector('#tab-nav .tab-btn[data-tab="sound"]');
    if (soundTopBtn) {
      soundTopBtn.addEventListener("click", () => Promise.resolve().then(refreshPersona));
    }

    await refreshPersona();
    console.log("[SOUND] Capture UI ready");
  }

  SOUND.UI = SOUND.UI || {};
  SOUND.UI.Capture = {
    refreshPersona,
    capture: onCapture,
    state: () => ({
      openAfter: !!(els.openAfter && els.openAfter.checked),
      activePersonaId: readActivePersonaId()
    })
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init().catch(console.error));
  } else {
    init().catch(console.error);
  }
})();
