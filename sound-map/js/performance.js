/**
 * SOUND/performance.js
 *
 * Phase A — Phoneme Progression Playback engine.
 *
 * Pure logic. No DOM. No audio. Builds a temporal sequence of phoneme
 * events from existing analyzer output, plus a player driven by
 * requestAnimationFrame.
 *
 * Public API:
 *   SOUND.Performance.buildProgression(processed, lineWordIndices, opts?)
 *     → { events: [...], totalMs: number, phonemeCount: number }
 *
 *   SOUND.Performance.createPlayer(progression, callbacks?)
 *     → { play, pause, stop, setTempoFactor, setLoop, getState }
 *
 * Event shape (kind = "phoneme"):
 *   {
 *     kind: "phoneme",
 *     symbol, wordIdx, sylIdx, stress,
 *     isFirstInSyllable: bool,
 *     phonElIdx: number,   // index into the rendered .sm-phon NodeList for the line
 *     sylElIdx:  number,   // index into the rendered .sm-syllable NodeList for the line
 *     onsetMs:   number,   // base time (no tempo applied)
 *     durationMs:number,
 *     feat: { type, place, manner, voice } | null
 *   }
 *
 * Event shape (kind = "pause"):
 *   { kind: "pause", wordIdx, onsetMs, durationMs }
 */
(function () {
  "use strict";
  if (!window.SOUND) window.SOUND = {};

  // Lightweight Phase-A duration table (ms, base / 1.0 tempo).
  // Independent from the inline timeline-view table so this engine has
  // no implicit coupling to inline-script internals.
  const DUR = {
    stop:        110,
    affricate:   160,
    fricative:   170,
    nasal:       150,
    liquid:      130,
    approximant: 140,
    vowel_short: 200,
    vowel_long:  280,
    diphthong:   320,
    unknown:     180,
    inter_word:  160,
    unknown_word_pause: 200
  };

  function phonemeDuration(p, feat, stress) {
    if (!feat) return DUR.unknown;
    let base;
    if (feat.type === "V") {
      base = (feat.place === "diphthong") ? DUR.diphthong : DUR.vowel_short;
      if (stress === 1) base *= 1.35;
      else if (stress === 2) base *= 1.10;
      else base *= 0.88;
    } else {
      base = DUR[feat.manner] || DUR.unknown;
      if (stress === 1) base *= 1.05;
    }
    return base;
  }

  /**
   * Build a progression from analyzer output for one line.
   * @param processed         array of word records ({word, known, syllables})
   * @param lineWordIndices   word indices belonging to the line (from byLine)
   * @param opts              { interWordPauseMs?, featTable? }
   */
  function buildProgression(processed, lineWordIndices, opts) {
    opts = opts || {};
    const featTable    = opts.featTable || window.SM_FEATS || {};
    const interWordPause = (opts.interWordPauseMs != null) ? opts.interWordPauseMs : DUR.inter_word;

    const events = [];
    let cursorMs = 0;
    let phonElIdx = 0;
    let sylElIdx  = 0;
    let firstWord = true;
    let phonemeCount = 0;

    for (const wIdx of lineWordIndices) {
      const wp = processed[wIdx];

      if (!wp || !wp.known || !wp.syllables || !wp.syllables.length) {
        // Unknown word: emit a small pause; rendered as a gap.
        events.push({
          kind: "pause",
          wordIdx: wIdx,
          onsetMs: cursorMs,
          durationMs: DUR.unknown_word_pause
        });
        cursorMs += DUR.unknown_word_pause;
        firstWord = false;
        continue;
      }

      if (!firstWord) {
        events.push({
          kind: "pause",
          wordIdx: wIdx,
          onsetMs: cursorMs,
          durationMs: interWordPause
        });
        cursorMs += interWordPause;
      }
      firstWord = false;

      wp.syllables.forEach((syl, sIdx) => {
        const phonemes = syl.phonemes || [];
        let firstInSyl = true;
        for (const p of phonemes) {
          const feat = featTable[p] || null;
          const dur  = phonemeDuration(p, feat, syl.stress);
          events.push({
            kind: "phoneme",
            symbol: p,
            wordIdx: wIdx,
            sylIdx: sIdx,
            stress: syl.stress,
            isFirstInSyllable: firstInSyl,
            phonElIdx: phonElIdx,
            sylElIdx: sylElIdx,
            onsetMs: cursorMs,
            durationMs: dur,
            feat: feat
          });
          cursorMs += dur;
          phonElIdx++;
          firstInSyl = false;
          phonemeCount++;
        }
        sylElIdx++;
      });
    }

    return { events, totalMs: cursorMs, phonemeCount };
  }

  /**
   * Create a RAF-based player for a progression.
   *
   * callbacks: {
   *   onPhonemeEnter(event)
   *   onPhonemeExit(event)
   *   onSyllableStart(event)        // fired only on isFirstInSyllable
   *   onStop()                       // fired on natural end, manual stop, or end-of-non-loop
   *   onTick(elapsedBaseMs, totalMs) // optional, every frame
   * }
   *
   * Internal time is "base time" (1.0× tempo). tempoFactor advances
   * elapsed time faster (>1) or slower (<1).
   */
  function createPlayer(progression, callbacks) {
    callbacks = callbacks || {};
    const events = progression.events;
    const total  = progression.totalMs;

    let state = "stopped";        // "stopped" | "playing" | "paused"
    let rafId = 0;
    let lastTickWallMs = 0;
    let elapsedBaseMs = 0;
    let tempoFactor = 1.0;
    let loop = false;
    let curIdx = -1;

    function fireExit(idx) {
      if (idx < 0) return;
      const ev = events[idx];
      if (ev && ev.kind === "phoneme" && callbacks.onPhonemeExit) {
        try { callbacks.onPhonemeExit(ev); } catch (e) { console.error("[SOUND] onPhonemeExit", e); }
      }
    }
    function fireEnter(idx) {
      if (idx < 0) return;
      const ev = events[idx];
      if (ev && ev.kind === "phoneme") {
        if (callbacks.onPhonemeEnter) {
          try { callbacks.onPhonemeEnter(ev); } catch (e) { console.error("[SOUND] onPhonemeEnter", e); }
        }
        if (ev.isFirstInSyllable && callbacks.onSyllableStart) {
          try { callbacks.onSyllableStart(ev); } catch (e) { console.error("[SOUND] onSyllableStart", e); }
        }
      }
    }

    // Linear scan — events are already sorted by onsetMs. Small list.
    function findEventIndexAt(baseMs) {
      for (let i = 0; i < events.length; i++) {
        const e = events[i];
        if (baseMs >= e.onsetMs && baseMs < e.onsetMs + e.durationMs) return i;
      }
      return -1;
    }

    function tick() {
      if (state !== "playing") return;
      const now = performance.now();
      if (lastTickWallMs > 0) {
        const dt = now - lastTickWallMs;
        elapsedBaseMs += dt * tempoFactor;
      }
      lastTickWallMs = now;

      // End-of-progression handling
      if (elapsedBaseMs >= total) {
        fireExit(curIdx);
        curIdx = -1;
        if (loop) {
          elapsedBaseMs = 0;
        } else {
          state = "stopped";
          rafId = 0;
          lastTickWallMs = 0;
          if (callbacks.onStop) {
            try { callbacks.onStop(); } catch (e) { console.error("[SOUND] onStop", e); }
          }
          return;
        }
      }

      const newIdx = findEventIndexAt(elapsedBaseMs);
      if (newIdx !== curIdx) {
        fireExit(curIdx);
        fireEnter(newIdx);
        curIdx = newIdx;
      }

      if (callbacks.onTick) {
        try { callbacks.onTick(elapsedBaseMs, total); } catch (e) { /* noop */ }
      }

      rafId = requestAnimationFrame(tick);
    }

    function play() {
      if (state === "playing") return;
      if (state === "stopped") {
        elapsedBaseMs = 0;
        curIdx = -1;
      }
      state = "playing";
      lastTickWallMs = 0;
      rafId = requestAnimationFrame(tick);
    }

    function pause() {
      if (state !== "playing") return;
      state = "paused";
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      lastTickWallMs = 0;
    }

    function stop() {
      if (state === "stopped") return;
      const wasPlaying = (state === "playing");
      state = "stopped";
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      lastTickWallMs = 0;
      elapsedBaseMs = 0;
      fireExit(curIdx);
      curIdx = -1;
      if (callbacks.onStop) {
        try { callbacks.onStop(); } catch (e) { console.error("[SOUND] onStop", e); }
      }
    }

    function setTempoFactor(f) {
      const v = Number(f);
      if (Number.isFinite(v) && v > 0.05 && v < 10) tempoFactor = v;
    }

    function setLoop(b) { loop = !!b; }

    function getState() { return state; }

    return { play, pause, stop, setTempoFactor, setLoop, getState };
  }

  SOUND.Performance = {
    buildProgression,
    createPlayer,
    DUR  // exposed read-only for inspection
  };
})();
