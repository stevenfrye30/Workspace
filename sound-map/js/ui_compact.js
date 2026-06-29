/**
 * SOUND/ui_compact.js
 *
 * Tiny SOUND MAP toolbar collapse/expand mode.
 * Side-effect module — runs init() on DOMContentLoaded.
 *
 * When `#sm-toolbar` carries the class `sm-compact`, the legend, highlight
 * mode picker, Play Flow row, and Capture row are hidden via CSS, and the
 * input area is condensed. The text input, Visualize button, and view
 * switcher remain accessible.
 *
 * Persisted in localStorage as `sound:sm_compact`.
 */
(function () {
  "use strict";
  if (!window.SOUND) window.SOUND = {};

  const LS_KEY = "sound:sm_compact";

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (_) {} }

  function setCompact(toolbar, btn, compact) {
    toolbar.classList.toggle("sm-compact", compact);
    // Body-level class so we can compress chrome that lives outside the
    // toolbar (legacy banner, sm-header) without sprinkling class toggles.
    document.body.classList.toggle("sm-mode-compact", compact);
    if (btn) {
      const chevron = compact ? "▾" : "▴";
      const label   = compact ? "Expand" : "Compact";
      const titleText = compact ? "Expand controls" : "Compact controls";
      btn.innerHTML =
        '<span class="sm-compact-chevron" aria-hidden="true">' + chevron + '</span>' +
        '<span class="sm-compact-label">' + label + '</span>';
      btn.title = titleText;
      btn.setAttribute("aria-label", titleText);
      btn.setAttribute("aria-pressed", compact ? "true" : "false");
    }
    lsSet(LS_KEY, compact ? "1" : "0");
  }

  function init() {
    const toolbar = document.getElementById("sm-toolbar");
    const btn     = document.getElementById("sm-compact-toggle");
    if (!toolbar || !btn) {
      console.warn("[SOUND] Compact toggle: required elements not found");
      return;
    }

    // Apply persisted state from localStorage on load.
    const initial = lsGet(LS_KEY) === "1";
    setCompact(toolbar, btn, initial);

    // The button itself uses an inline onclick fallback so it works even if
    // this module fails to attach. We don't bind another listener here to
    // avoid double-firing.

    console.log("[SOUND] Compact toggle ready (initial: " + (initial ? "compact" : "expanded") + ")");
  }

  SOUND.UI = SOUND.UI || {};
  SOUND.UI.Compact = {
    set(compact) {
      const toolbar = document.getElementById("sm-toolbar");
      const btn = document.getElementById("sm-compact-toggle");
      if (toolbar && btn) setCompact(toolbar, btn, !!compact);
    },
    isCompact() {
      const toolbar = document.getElementById("sm-toolbar");
      return !!(toolbar && toolbar.classList.contains("sm-compact"));
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
