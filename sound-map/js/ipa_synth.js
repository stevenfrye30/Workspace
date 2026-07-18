/**
 * SOUND/ipa_synth.js
 *
 * Web Audio synthesis of isolated IPA phones, for symbols English can't
 * demonstrate with a spoken example word. Everything is generated from
 * oscillators + filtered noise — no audio assets, fully offline, CSP-safe.
 *
 * ── Honesty ──────────────────────────────────────────────────────────────
 * This is an APPROXIMATION, not a recording of a human phonetician. Vowels
 * use three-formant synthesis and come out recognizable; obstruent
 * consonants are illustrative gestures (a sibilant hiss, a stop burst, a
 * nasal murmur) rather than natural speech. Some categories can't be faked
 * convincingly at all — clicks, trills, implosives, and ejectives — so
 * canSynth() returns false for them and the UI declines to offer a play
 * button instead of playing a misleading imitation. Never present synthesis
 * as a "recording"; the UI labels it "approximate synthesis".
 *
 * Public API (window.SOUND.Synth):
 *   supported            boolean — Web Audio available
 *   canSynth(info)       boolean — do we have a non-misleading synth for it?
 *   play(sym, info)      play the phone (returns true if it made a sound)
 *   stop()               silence anything currently ringing
 */
(function () {
  "use strict";
  const SOUND = (window.SOUND = window.SOUND || {});

  const AC = window.AudioContext || window.webkitAudioContext;
  const supported = !!AC;

  // Categories whose synthesis would mislead more than teach.
  const DISABLED_KINDS = new Set(["click", "implosive", "ejective", "supra", "diacritic"]);
  const DISABLED_MANNERS = new Set(["trill"]);

  function canSynth(info) {
    if (!supported || !info || info.audio === false) return false;
    if (DISABLED_KINDS.has(info.kind)) return false;
    if (DISABLED_MANNERS.has(info.manner)) return false;
    return true;
  }

  let ctx = null, master = null, noiseBuf = null;
  let live = [];

  function ensure() {
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      // A limiter so a stop burst or hiss can never blast the listener.
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -14;
      limiter.knee.value = 6;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.002;
      limiter.release.value = 0.15;
      master.connect(limiter);
      limiter.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    if (!noiseBuf) {
      const n = ctx.sampleRate * 1.2;
      noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    return ctx;
  }

  const track = (node) => { live.push(node); return node; };
  function stop() {
    live.forEach((n) => { try { n.stop(); } catch (_) {} });
    live = [];
  }

  // ── Formant tables ────────────────────────────────────────────────────
  const VOWEL_FORMANTS = {
    i: [270, 2290], y: [235, 2100], "ɨ": [320, 1650], "ʉ": [320, 1450],
    "ɯ": [300, 1390], u: [300, 870],
    "ɪ": [400, 1900], "ʏ": [360, 1830], "ʊ": [400, 1020],
    e: [400, 2100], "ø": [370, 1900], "ɘ": [460, 1600], "ɵ": [460, 1480],
    "ɤ": [460, 1310], o: [400, 750],
    "ə": [500, 1500],
    "ɛ": [550, 1800], "œ": [530, 1550], "ɜ": [520, 1460], "ɞ": [520, 1400],
    "ʌ": [640, 1190], "ɔ": [570, 840],
    "æ": [660, 1720], "ɐ": [650, 1500],
    a: [800, 1400], "ɶ": [730, 1200], "ɑ": [750, 1000], "ɒ": [700, 830],
  };
  const F3_BY_BACK = { front: 2900, central: 2600, back: 2400 };

  const PLACE_SPECTRUM = {
    bilabial: { freq: 900, q: 1.0 }, labiodental: { freq: 4500, q: 0.8 },
    dental: { freq: 6500, q: 0.8 }, alveolar: { freq: 7000, q: 3.2 },
    postalveolar: { freq: 3200, q: 3.0 }, retroflex: { freq: 2200, q: 2.6 },
    palatal: { freq: 3000, q: 1.6 }, velar: { freq: 1400, q: 1.3 },
    uvular: { freq: 1100, q: 1.3 }, pharyngeal: { freq: 900, q: 1.0 },
    glottal: { freq: 1800, q: 0.6 },
  };
  const PLACE_F2 = {
    bilabial: 800, labiodental: 1100, dental: 1600, alveolar: 1700,
    postalveolar: 1900, retroflex: 1600, palatal: 2400, velar: 1200,
    uvular: 1000, pharyngeal: 900, glottal: 1500,
  };

  // ── Primitives ────────────────────────────────────────────────────────
  // Duration-safe attack/sustain/release; clamps so short phones stay monotonic.
  function env(param, t0, dur, peak) {
    const a = Math.min(0.012, dur * 0.3);
    const r = Math.min(0.05, dur * 0.4);
    param.setValueAtTime(0.0001, t0);
    param.exponentialRampToValueAtTime(peak, t0 + a);
    param.setValueAtTime(peak, t0 + Math.max(a, dur - r));
    param.exponentialRampToValueAtTime(0.0001, t0 + dur);
  }
  function glottis(t0, dur, f0, gainTo) {
    const osc = track(ctx.createOscillator());
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(f0, t0);
    const g = ctx.createGain();
    env(g.gain, t0, dur, gainTo);
    osc.connect(g);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
    return { out: g, osc };
  }
  function noise(t0, dur, gainTo) {
    const src = track(ctx.createBufferSource());
    src.buffer = noiseBuf;
    src.loop = true;
    const g = ctx.createGain();
    env(g.gain, t0, dur, gainTo);
    src.connect(g);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
    return { out: g, src };
  }
  const bp = (freq, q) => { const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q; return f; };
  const lp = (freq) => { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = freq; return f; };

  // ── Voice types ───────────────────────────────────────────────────────
  function playVowel(info, t0) {
    const f = VOWEL_FORMANTS[info.sym] || [500, 1500];
    const f3 = F3_BY_BACK[info.backness] || 2600;
    const dur = 0.42;
    const src = glottis(t0, dur, 130, 0.9);
    const sum = ctx.createGain();
    [[f[0], 8, 1.0], [f[1], 10, 0.55], [f3, 12, 0.28]].forEach(([fr, q, gain]) => {
      const filt = bp(fr, q); const gg = ctx.createGain(); gg.gain.value = gain;
      src.out.connect(filt); filt.connect(gg); gg.connect(sum);
    });
    sum.connect(master);
  }
  function playFricative(info, t0) {
    const sp = PLACE_SPECTRUM[info.place] || { freq: 3000, q: 1.5 };
    const dur = 0.34;
    const n = noise(t0, dur, info.voice ? 0.42 : 0.62);
    const filt = info.place === "glottal" ? lp(sp.freq) : bp(sp.freq, sp.q);
    n.out.connect(filt); filt.connect(master);
    if (info.voice) { const v = glottis(t0, dur, 120, 0.32); const vlp = lp(500); v.out.connect(vlp); vlp.connect(master); }
  }
  function playLateralFric(info, t0) {
    const dur = 0.34;
    const n = noise(t0, dur, info.voice ? 0.4 : 0.58);
    const filt = bp(2600, 2.0);
    n.out.connect(filt); filt.connect(master);
    if (info.voice) { const v = glottis(t0, dur, 120, 0.3); const vlp = lp(500); v.out.connect(vlp); vlp.connect(master); }
  }
  function playPlosive(info, t0) {
    const closure = 0.09;
    if (info.voice) { const v = glottis(t0, closure + 0.08, 110, 0.26); const vlp = lp(300); v.out.connect(vlp); vlp.connect(master); }
    const sp = PLACE_SPECTRUM[info.place] || { freq: 1500, q: 1.5 };
    const burst = noise(t0 + closure, 0.035, 0.8);
    const filt = bp(sp.freq, Math.max(1.2, sp.q));
    burst.out.connect(filt); filt.connect(master);
    if (!info.voice) { const asp = noise(t0 + closure + 0.02, 0.06, 0.22); const alp = lp(3500); asp.out.connect(alp); alp.connect(master); }
  }
  function playNasal(info, t0) {
    const dur = 0.34;
    const src = glottis(t0, dur, 125, 0.8);
    const nf = lp(450); const anti = bp(1000, 0.7);
    const g2 = ctx.createGain(); g2.gain.value = 0.25;
    src.out.connect(nf); nf.connect(master);
    src.out.connect(anti); anti.connect(g2); g2.connect(master);
  }
  function playApprox(info, t0) {
    const dur = 0.3;
    const src = glottis(t0, dur, 128, 0.8);
    const f2 = (PLACE_F2[info.place] || 1500) * (info.manner === "lateral-approximant" ? 0.9 : 1);
    const sum = ctx.createGain();
    [[450, 8, 1.0], [f2, 9, 0.5], [2600, 10, 0.2]].forEach(([fr, q, gn]) => {
      const filt = bp(fr, q); const gg = ctx.createGain(); gg.gain.value = gn;
      src.out.connect(filt); filt.connect(gg); gg.connect(sum);
    });
    sum.connect(master);
  }
  function playTap(info, t0) {
    const dur = 0.06;
    const src = glottis(t0, dur, 130, 0.85);
    const filt = bp(PLACE_F2[info.place] || 1600, 2); src.out.connect(filt); filt.connect(master);
  }
  // Affricate = a stop burst that opens straight into a fricative at the same
  // place. Illustrative, like the other obstruents — labelled "approximate".
  function playAffricate(info, t0) {
    const closure = 0.05;
    const sp = PLACE_SPECTRUM[info.place] || { freq: 3000, q: 2.5 };
    if (info.voice) { const v = glottis(t0, closure + 0.26, 110, 0.24); const vlp = lp(320); v.out.connect(vlp); vlp.connect(master); }
    const burst = noise(t0 + closure, 0.03, 0.75);
    const bf = bp(sp.freq, Math.max(1.4, sp.q)); burst.out.connect(bf); bf.connect(master);
    const fr = noise(t0 + closure + 0.028, 0.24, info.voice ? 0.4 : 0.6);
    const ff = bp(sp.freq, sp.q); fr.out.connect(ff); ff.connect(master);
    if (info.voice) { const v2 = glottis(t0 + closure + 0.028, 0.24, 120, 0.28); const v2lp = lp(500); v2.out.connect(v2lp); v2lp.connect(master); }
  }

  function play(sym, info) {
    info = info || (SOUND.IPA && SOUND.IPA.INFO[sym]);
    if (!canSynth(info)) return false;
    ensure();
    stop();
    const t0 = ctx.currentTime + 0.02;
    if (info.kind === "vowel") { playVowel(info, t0); return true; }
    switch (info.manner) {
      case "plosive": playPlosive(info, t0); break;
      case "nasal": playNasal(info, t0); break;
      case "tap": playTap(info, t0); break;
      case "fricative": playFricative(info, t0); break;
      case "affricate": playAffricate(info, t0); break;
      case "lateral-fricative": playLateralFric(info, t0); break;
      case "approximant":
      case "lateral-approximant": playApprox(info, t0); break;
      default:
        // "other" kind (e.g. w, ɥ, ɕ) — approximate by manner-ish fallback.
        if (info.kind === "other") { info.voice ? playApprox(info, t0) : playFricative(info, t0); break; }
        return false;
    }
    return true;
  }

  SOUND.Synth = { supported, canSynth, play, stop };
})();
