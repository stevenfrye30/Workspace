/**
 * SOUND/ui_performance.js
 *
 * Phase A — Phoneme Progression Playback wiring (UI only).
 * Side-effect module — runs init() on DOMContentLoaded.
 *
 * Reads from inline globals (read-only):
 *   window.smLastData           ({ processed, byLine, mode })
 *   window.SM_FEATS              (passed through to engine; engine accesses directly)
 *   window.smUpdateVocalTract    (called per active phoneme)
 *
 * Wires DOM:
 *   #sm-play-flow                play/stop toggle button
 *   #sm-flow-tempo               tempo selector (slow|natural|fast)
 *   #sm-flow-loop                loop checkbox
 *
 * Visual side-effects on the rendered phoneme map (#sm-view-map):
 *   - .sm-phon elements gain  .sm-active   while in-window
 *   - .sm-syllable elements receive .sm-stress-pulse on stressed-syllable starts
 *   - vocal tract pulses through smUpdateVocalTract(symbol) per phoneme
 */
(function () {
  "use strict";
  if (!window.SOUND) window.SOUND = {};

  const LS_TEMPO = "sound:flow_tempo";
  const LS_LOOP  = "sound:flow_loop";

  const TEMPOS = { slow: 0.7, natural: 1.0, fast: 1.4 };

  const els = {};
  let player = null;
  let activeLineEl = null;        // .sm-line element currently being played
  let activePhonNodes = null;     // NodeList of .sm-phon for activeLineEl
  let activeSylNodes  = null;     // NodeList of .sm-syllable for activeLineEl

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (_) {} }

  function tempoFactor() {
    const v = els.tempoSel ? els.tempoSel.value : "natural";
    return TEMPOS[v] != null ? TEMPOS[v] : 1.0;
  }

  function setButtonState(stateName) {
    if (!els.btn) return;
    if (stateName === "playing") {
      els.btn.textContent = "Stop Flow";
      els.btn.dataset.state = "playing";
    } else {
      els.btn.textContent = "Play Flow";
      els.btn.dataset.state = "idle";
    }
  }

  function clearAllVisualState() {
    if (activePhonNodes) {
      activePhonNodes.forEach(n => n.classList.remove("sm-active"));
    }
    if (activeSylNodes) {
      activeSylNodes.forEach(n => n.classList.remove("sm-stress-pulse"));
    }
    if (typeof window.smUpdateVocalTract === "function") {
      try { window.smUpdateVocalTract(null); } catch (_) {}
    }
  }

  function startPlayback() {
    // Validate analyzer output is present
    const data = window.smLastData;
    if (!data || !data.processed || !data.byLine || !data.byLine.length) {
      // Subtle no-op; the user should click Visualize first.
      return;
    }

    const lineWordIndices = data.byLine[0]; // first line for Phase A
    if (!lineWordIndices || !lineWordIndices.length) return;

    const progression = SOUND.Performance.buildProgression(
      data.processed, lineWordIndices, {}
    );
    if (!progression.phonemeCount) {
      // Nothing to play — line was all unknown words, etc.
      return;
    }

    // Locate DOM context for this line in the rendered phoneme map.
    const lineEls = document.querySelectorAll("#sm-view-map .sm-line");
    activeLineEl  = lineEls[0] || null;
    if (!activeLineEl) return;

    activePhonNodes = activeLineEl.querySelectorAll(".sm-phon");
    activeSylNodes  = activeLineEl.querySelectorAll(".sm-syllable");

    player = SOUND.Performance.createPlayer(progression, {
      onPhonemeEnter(ev) {
        const node = activePhonNodes && activePhonNodes[ev.phonElIdx];
        if (node) node.classList.add("sm-active");
        if (typeof window.smUpdateVocalTract === "function") {
          try { window.smUpdateVocalTract(ev.symbol); } catch (_) {}
        }
        if (ev.isFirstInSyllable && ev.stress === 1) {
          const syl = activeSylNodes && activeSylNodes[ev.sylElIdx];
          if (syl) {
            // Restart the CSS animation by toggling the class via reflow.
            syl.classList.remove("sm-stress-pulse");
            // Force reflow so the next add re-triggers the animation.
            void syl.offsetWidth;
            syl.classList.add("sm-stress-pulse");
          }
        }
      },
      onPhonemeExit(ev) {
        const node = activePhonNodes && activePhonNodes[ev.phonElIdx];
        if (node) node.classList.remove("sm-active");
      },
      onStop() {
        clearAllVisualState();
        setButtonState("idle");
        // Drop references; let GC reclaim NodeLists if DOM rebuilds.
        activeLineEl = null;
        activePhonNodes = null;
        activeSylNodes = null;
        player = null;
      }
    });

    player.setTempoFactor(tempoFactor());
    player.setLoop(els.loopToggle && els.loopToggle.checked);
    player.play();
    setButtonState("playing");
  }

  function stopPlayback() {
    if (player) {
      player.stop(); // triggers onStop → clears visuals + button
    }
  }

  function onPlayClick() {
    if (player && player.getState() === "playing") {
      stopPlayback();
    } else {
      startPlayback();
    }
  }

  function onTempoChange() {
    lsSet(LS_TEMPO, els.tempoSel.value);
    if (player) player.setTempoFactor(tempoFactor());
  }

  function onLoopChange() {
    lsSet(LS_LOOP, els.loopToggle.checked ? "1" : "0");
    if (player) player.setLoop(els.loopToggle.checked);
  }

  // Stop playback any time the user re-runs Visualize — the rendered DOM
  // is rebuilt and our captured NodeLists become stale.
  function attachVisualizeHook() {
    const vizBtn = document.getElementById("sm-visualize");
    if (vizBtn) vizBtn.addEventListener("click", () => {
      if (player) stopPlayback();
    });
  }

  function init() {
    els.btn        = document.getElementById("sm-play-flow");
    els.tempoSel   = document.getElementById("sm-flow-tempo");
    els.loopToggle = document.getElementById("sm-flow-loop");

    if (!els.btn || !els.tempoSel || !els.loopToggle) {
      console.warn("[SOUND] Performance UI: required elements not found");
      return;
    }

    // Hydrate from LocalStorage
    const lsTempo = lsGet(LS_TEMPO);
    if (lsTempo && TEMPOS[lsTempo] != null) els.tempoSel.value = lsTempo;
    els.loopToggle.checked = lsGet(LS_LOOP) === "1";

    els.btn.addEventListener("click", onPlayClick);
    els.tempoSel.addEventListener("change", onTempoChange);
    els.loopToggle.addEventListener("change", onLoopChange);
    attachVisualizeHook();

    setButtonState("idle");
    console.log("[SOUND] Performance UI ready");
  }

  // Public surface (small)
  SOUND.UI = SOUND.UI || {};
  SOUND.UI.Performance = {
    play: startPlayback,
    stop: stopPlayback,
    isPlaying: () => !!(player && player.getState() === "playing")
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
