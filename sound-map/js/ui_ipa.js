/**
 * SOUND/ui_ipa.js
 *
 * Phonology → IPA: an interactive International Phonetic Alphabet chart.
 * Side-effect module — builds the panel ONCE (idempotent build()).
 *
 * Renders into #panel-ipa:
 *   • Explore mode: the full chart — pulmonic consonant grid, a real vowel
 *     quadrilateral, "other symbols", non-pulmonics, suprasegmentals, and
 *     grouped diacritics.
 *   • Learn mode: a short guided sequence (voicing pairs → places → manners →
 *     vowels → sounds English lacks → non-pulmonics).
 *   • A sticky detail card: symbol, name, category, articulation readout, a
 *     plain-language "how to make it", honest audio sources, an articulation
 *     diagram (sagittal for consonants, vowel-space for vowels, hidden for
 *     marks), and clickable related/contrasting sounds.
 *
 * Audio is HONEST about its source (Phase 3):
 *   • "Example word" — a whole word spoken by the browser's TTS voice, NOT an
 *     isolated phoneme. Offered only where the English word genuinely fits.
 *   • "Approximate synthesis" — Web Audio; illustrative, not a recording.
 *     Declined entirely for clicks/trills/implosives/ejectives.
 *   • "Human recording" — reserved for future recorded assets (info.recording);
 *     the button appears only when a real, attributed recording exists.
 *
 * Depends on: SOUND.IPA (ipa_data.js), SOUND.Synth (ipa_synth.js),
 *   smSpeak (data/phonetics.js).
 */
(function () {
  "use strict";
  const SOUND = (window.SOUND = window.SOUND || {});

  let built = false;
  let audioPref = "word";        // preferred non-recording source: "word" | "synth"
  let mode = "explore";          // "explore" | "learn"
  let current = null;            // selected symbol
  let learnIndex = 0;
  const activeCats = new Set();  // empty = show all
  let voiceFilter = null;        // null | 0 | 1

  try {
    const p = localStorage.getItem("ipa-audio-pref");
    if (p === "word" || p === "synth") audioPref = p;
    const m = localStorage.getItem("ipa-mode");
    if (m === "explore" || m === "learn") mode = m;
  } catch (_) {}

  const IPA = () => SOUND.IPA;
  const Synth = () => SOUND.Synth;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const carrier = (s) => (IPA().carrier ? IPA().carrier(s) : s);

  // ── Learn-mode lessons ────────────────────────────────────────────────
  const LESSONS = [
    { title: "Voicing pairs", note: "Same mouth position — the only change is whether the vocal folds vibrate. Rest a hand on your throat and feel the buzz switch on.", syms: ["p", "b", "t", "d", "k", "ɡ", "f", "v", "s", "z"] },
    { title: "Places of articulation", note: "All stops, but the closure moves steadily back through the mouth: lips → ridge → palate → soft palate → throat.", syms: ["p", "t", "c", "k", "q", "ʔ"] },
    { title: "Manners of articulation", note: "All at the alveolar ridge, but the airflow is shaped differently each time.", syms: ["t", "n", "s", "ɾ", "r", "l", "ɹ"] },
    { title: "Affricates", note: "A stop released into a fricative, fused into a single sound — English ‘ch’ and ‘j’ are the everyday examples.", syms: ["t͡ʃ", "d͡ʒ", "t͡s", "d͡z"] },
    { title: "Basic vowels", note: "The corners and centre of the vowel space — the anchors everything else is measured against.", syms: ["i", "u", "ɑ", "a", "ə"] },
    { title: "Sounds English lacks", note: "Common across the world's languages, unfamiliar to most English speakers.", syms: ["y", "ø", "ɲ", "x", "ʁ", "ɕ"] },
    { title: "Beyond the lungs", note: "Non-pulmonic sounds — made with the tongue or larynx instead of the breath.", syms: ["ǀ", "ǃ", "ɓ", "ɗ", "kʼ"] },
  ];

  // ── Vowel-quadrilateral geometry (shared by chart + detail) ───────────
  const QUAD = { clF: [14, 8], clB: [92, 8], opF: [30, 92], opB: [80, 92] };
  const lerp = (a, b, t) => a + (b - a) * t;
  function quadPos(height, backness) {
    const hi = IPA().HEIGHTS.findIndex((h) => h[0] === height);
    const t = hi < 0 ? 0.5 : hi / (IPA().HEIGHTS.length - 1);
    const leftX = lerp(QUAD.clF[0], QUAD.opF[0], t);
    const rightX = lerp(QUAD.clB[0], QUAD.opB[0], t);
    const x = backness === "front" ? leftX : backness === "back" ? rightX : (leftX + rightX) / 2;
    return { x, y: lerp(QUAD.clF[1], QUAD.opF[1], t) };
  }

  // ── Category / helpers ────────────────────────────────────────────────
  const CAT_LABEL = {
    cons: "Pulmonic consonant", vowel: "Vowel", affricate: "Affricate",
    click: "Click · non-pulmonic",
    implosive: "Implosive · non-pulmonic", ejective: "Ejective · non-pulmonic",
    other: "Other symbol", supra: "Suprasegmental", diacritic: "Diacritic",
  };
  const catOf = (info) => (["click", "implosive", "ejective"].includes(info.kind) ? "nonpulm" :
    info.kind === "cons" ? "cons" : info.kind === "vowel" ? "vowel" :
    info.kind === "affricate" ? "affricate" :
    info.kind === "other" ? "other" : info.kind === "supra" ? "supra" : "diacritic");

  // Full-text search haystack per symbol.
  function haystack(info) {
    const P = IPA();
    return [info.sym, info.name, info.place && P.placeLabel(info.place), info.manner && P.mannerLabel(info.manner),
      info.voice === 1 ? "voiced" : info.voice === 0 ? "voiceless" : "", info.airstream,
      info.lang, info.example, info.height, info.backness].filter(Boolean).join(" ").toLowerCase();
  }

  // ── Sagittal diagram (consonants / other) ─────────────────────────────
  const ZONE_XY = {
    bilabial: [200, 98], labiodental: [196, 106], dental: [186, 90],
    alveolar: [174, 80], postalveolar: [160, 74], retroflex: [150, 78],
    palatal: [136, 68], velar: [110, 70], uvular: [96, 82],
    pharyngeal: [90, 120], glottal: [90, 162],
  };
  function sagittalSVG(info) {
    const zones = Object.keys(ZONE_XY).map((z) => {
      const [x, y] = ZONE_XY[z];
      const on = info.zone === z || info.secondary === z;
      return `<circle class="ipa-zone${on ? " on" : ""}" cx="${x}" cy="${y}" r="${on ? 8 : 5}"></circle>`;
    }).join("");
    const nasal = info.oral === false;
    const voiced = info.voice === 1;
    const ingressive = info.airstream && info.airstream.indexOf("ingressive") >= 0;
    // Airflow arrow: oral (out the mouth) unless nasal; reverse for ingressive.
    const airflow = nasal
      ? `<path class="ipa-air" d="M120,70 L120,40" marker-end="url(#ipa-arrow)"/>`
      : `<path class="ipa-air" d="M150,150 L${ingressive ? 120 : 214},150" marker-end="url(#ipa-arrow)"/>`;
    const lips = info.secondary === "bilabial" ? "ipa-lips rounded" : "ipa-lips";
    return `
<svg class="ipa-sagittal" viewBox="0 0 240 210" role="img" aria-label="Vocal-tract diagram for ${esc(info.name)}">
  <defs><marker id="ipa-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
    <path d="M0,0 L6,3 L0,6 Z" fill="var(--gold)"/></marker></defs>
  <path class="ipa-nasal${nasal ? " on" : ""}" d="M96,64 Q120,44 176,52 L176,64 Q120,58 100,72 Z"/>
  <path class="ipa-tract" d="M206,92 Q198,84 186,86 Q172,74 158,70 Q140,60 126,64 Q108,60 100,74 Q94,86 96,96"/>
  <path class="ipa-tract" d="M96,96 Q86,120 88,150 Q88,172 96,184"/>
  <path class="ipa-tongue" d="M104,150 Q120,120 150,116 Q178,116 196,128 Q188,150 150,160 Q120,162 104,150 Z"/>
  <path class="ipa-tract" d="M206,110 Q200,118 196,128"/>
  <path class="${lips}" d="M206,92 Q212,101 206,110"/>
  ${airflow}
  ${zones}
  <circle class="ipa-voicebox${voiced ? " voiced" : ""}" cx="90" cy="178" r="7"></circle>
</svg>`;
  }

  function vowelSpaceSVG(info) {
    const p = quadPos(info.height, info.backness);
    // trapezoid corners in the same 0..100 space, drawn in a 120×100 viewBox
    const c = QUAD;
    const pts = `${c.clF[0]},${c.clF[1]} ${c.clB[0]},${c.clB[1]} ${c.opB[0]},${c.opB[1]} ${c.opF[0]},${c.opF[1]}`;
    return `
<svg class="ipa-vspace" viewBox="0 0 106 104" role="img" aria-label="Vowel-space position for ${esc(info.name)}">
  <polygon class="ipa-vquad" points="${pts}"/>
  <text class="ipa-vlabel" x="12" y="5">front</text>
  <text class="ipa-vlabel" x="86" y="5">back</text>
  <text class="ipa-vlabel" x="2" y="52" transform="rotate(-90 2 52)">close → open</text>
  <circle class="ipa-vdot" cx="${p.x}" cy="${p.y}" r="4.2"/>
  <text class="ipa-vsym" x="${p.x}" y="${p.y - 6}">${esc(info.sym)}</text>
</svg>`;
  }

  // ── Detail card ───────────────────────────────────────────────────────
  function articRows(info) {
    const P = IPA();
    const R = (k, v) => `<div class="ipa-d-row"><span class="ipa-d-k">${k}</span><span class="ipa-d-v">${esc(v)}</span></div>`;
    if (info.kind === "vowel") {
      return R("Height", P.heightLabel(info.height)) + R("Backness", P.backnessLabel(info.backness)) +
        R("Rounding", info.rounded ? "rounded" : "unrounded") + R("Airstream", info.airstream);
    }
    if (info.kind === "cons" || info.kind === "other") {
      const a = P.PLACE_ARTIC[info.place];
      let rows = "";
      if (info.kind === "other") rows += R("Type", info.name.replace(/^(Voice(less|d)) /, ""));
      rows += R("Place", info.secondary ? P.placeLabel(info.place) + " + " + P.placeLabel(info.secondary) : P.placeLabel(info.place));
      if (info.manner && info.manner !== "other") rows += R("Manner", P.mannerLabel(info.manner));
      if (info.voice != null) rows += R("Voicing", info.voice ? "voiced" : "voiceless");
      if (a) { rows += R("Active", a.active); if (a.passive !== "—") rows += R("Passive", a.passive); }
      rows += R("Airflow", info.oral === false ? "nasal (through the nose)" : info.lateral ? "lateral (over the sides)" : "oral (central)");
      rows += R("Airstream", info.airstream);
      return rows;
    }
    if (info.kind === "affricate") {
      let rows = R("Type", "affricate (stop released into a fricative)");
      rows += R("Place", P.placeLabel(info.place));
      if (info.voice != null) rows += R("Voicing", info.voice ? "voiced" : "voiceless");
      rows += R("Airflow", "oral (central)");
      rows += R("Airstream", info.airstream);
      return rows;
    }
    if (info.kind === "click") return R("Type", "click") + R("Place", P.placeLabel(info.place)) + R("Airstream", info.airstream);
    if (info.kind === "implosive") return R("Type", "implosive") + R("Place", P.placeLabel(info.place)) + R("Airstream", info.airstream);
    if (info.kind === "ejective") return R("Type", "ejective") + R("Place", P.placeLabel(info.place)) + R("Airstream", info.airstream);
    if (info.kind === "supra") return R("Type", "suprasegmental") + (info.role ? R("Use", info.role) : "");
    if (info.kind === "diacritic") return R("Type", "diacritic (modifies a base letter)");
    return "";
  }

  function audioBlock(info) {
    const parts = [];
    const nm = esc(info.name);
    if (info.recording && info.recording.src) {
      parts.push(`<button class="ipa-play ipa-play-rec" data-play="recording" aria-label="Play human recording of ${nm}">▶ Human recording</button>`);
    }
    if (info.example && typeof smSpeak === "function") {
      parts.push(`<button class="ipa-play" data-play="word" aria-label="Speak the example word ${esc(info.example)} with the browser voice">▶ Example word: “${esc(info.example)}”</button>`);
    }
    if (Synth() && Synth().canSynth(info)) {
      parts.push(`<button class="ipa-play ipa-play-synth" data-play="synth" aria-label="Play approximate synthesis of ${nm}">▶ Approximate synthesis</button>`);
    }
    const notes = [];
    if (info.example) notes.push("The example word is spoken by your browser's voice — a whole word, not the isolated sound.");
    if (info.exApprox) notes.push("This English example only approximates the pure IPA value" + (info.lang ? " (" + esc(info.lang) + ")." : "."));
    if (info.audio !== false && !info.example && Synth() && !Synth().canSynth(info)) {
      notes.push("No reliable isolated demonstration yet: browser voices can't isolate this sound, and synthesizing this category (" + esc(info.kind) + ") would mislead more than teach.");
    }
    if (info.audio === false) {
      notes.push(info.kind === "diacritic"
        ? "A diacritic isn't a sound on its own — it modifies the letter it's attached to."
        : "A suprasegmental organizes sounds rather than being one, so it doesn't play in isolation.");
    }
    return {
      html: (parts.length ? `<div class="ipa-d-audio">${parts.join("")}</div>` : "") +
        (notes.length ? `<div class="ipa-d-audionote">${notes.map((n) => `<span>${n}</span>`).join("")}</div>` : "") +
        `<div class="ipa-audio-status" id="ipa-audio-status" role="status" aria-live="polite"></div>`,
      hasAudio: parts.length > 0,
    };
  }

  function diagramBlock(info) {
    if (info.kind === "vowel") {
      return `<div class="ipa-diagram">${vowelSpaceSVG(info)}
        <div class="ipa-d-legend">Dot = tongue-hump position in the vowel space (front↔back, close↔open). Lips: ${info.rounded ? "rounded" : "spread"}.</div></div>`;
    }
    if (info.kind === "supra" || info.kind === "diacritic") return ""; // no mouth diagram
    const bits = [];
    bits.push(`<span>Voicing: <b class="${info.voice ? "on" : ""}">${info.voice ? "voiced (folds vibrate)" : "voiceless (folds still)"}</b></span>`);
    bits.push(`<span>Airflow: <b>${info.oral === false ? "nasal" : info.lateral ? "lateral" : "oral"}</b></span>`);
    bits.push(`<span>Airstream: <b>${esc(info.airstream || "—")}</b></span>`);
    return `<div class="ipa-diagram">${sagittalSVG(info)}
      <div class="ipa-d-legend">Gold marker = place of articulation. ${bits.join(" · ")}</div></div>`;
  }

  function relatedBlock(info) {
    if (!info.related || !info.related.length) return "";
    const chips = info.related.map((r) => {
      const ri = IPA().INFO[r.sym];
      if (!ri) return "";
      return `<button class="ipa-rel" data-sym="${esc(r.sym)}" aria-label="${esc(ri.name)} — ${esc(r.rel)}"><span class="ipa-rel-sym">${esc(carrier(r.sym))}</span><span class="ipa-rel-lbl">${esc(r.rel)}</span></button>`;
    }).join("");
    return `<div class="ipa-d-related"><div class="ipa-d-related-h">Compare</div><div class="ipa-rel-row">${chips}</div></div>`;
  }

  function renderDetail(info) {
    const box = document.getElementById("ipa-detail-body");
    if (!box) return;
    if (!info) {
      box.innerHTML = `<div class="ipa-d-empty">Pick a symbol to see how it's made, hear it (where we honestly can), and read its full name.</div>`;
      return;
    }
    const audio = audioBlock(info);
    box.innerHTML = `
      <div class="ipa-d-glyph">${esc(carrier(info.sym))}</div>
      <div class="ipa-d-cat">${esc(CAT_LABEL[info.kind] || info.kind)}</div>
      <div class="ipa-d-name">${esc(info.name)}</div>
      <div class="ipa-d-rows">${articRows(info)}</div>
      ${info.howto ? `<div class="ipa-d-howto"><span class="ipa-d-howto-h">How to make it</span>${esc(info.howto)}</div>` : ""}
      ${info.note ? `<div class="ipa-d-note">${esc(info.note)}</div>` : ""}
      ${info.lang && !info.exApprox ? `<div class="ipa-d-lang">Heard in: ${esc(info.lang)}</div>` : ""}
      ${audio.html}
      ${diagramBlock(info)}
      ${relatedBlock(info)}`;

    box.querySelectorAll(".ipa-play").forEach((b) => b.addEventListener("click", () => playSource(info, b.dataset.play)));
    box.querySelectorAll(".ipa-rel").forEach((b) => b.addEventListener("click", () => select(b.dataset.sym, true)));
  }

  // ── Audio ─────────────────────────────────────────────────────────────
  const canWord = (info) => !!(info && info.example && typeof smSpeak === "function");
  const canSyn = (info) => !!(info && Synth() && Synth().canSynth(info));
  function status(msg) { const s = document.getElementById("ipa-audio-status"); if (s) s.textContent = msg; }
  function playSource(info, source) {
    if (source === "recording" && info.recording && info.recording.src) {
      // Reserved for future assets; no fabricated playback path.
      status("Human recording");
      return;
    }
    if (source === "word" && canWord(info)) { smSpeak(info.example, 0.85); status("Playing example word (browser voice)"); return; }
    if (source === "synth" && canSyn(info)) { Synth().play(info.sym, info); status("Playing approximate synthesis"); return; }
    // fallback
    if (canWord(info)) { smSpeak(info.example, 0.85); status("Playing example word (browser voice)"); }
    else if (canSyn(info)) { Synth().play(info.sym, info); status("Playing approximate synthesis"); }
    else status(info.audio === false ? "Not a sound in isolation" : "No demonstration available");
  }
  function playPreferred(info) {
    if (!info) return;
    if (audioPref === "word" && canWord(info)) return playSource(info, "word");
    if (audioPref === "synth" && canSyn(info)) return playSource(info, "synth");
    return playSource(info, "auto");
  }

  // ── Selection ─────────────────────────────────────────────────────────
  function select(sym, play) {
    const info = IPA().INFO[sym];
    if (!info) return;
    current = sym;
    document.querySelectorAll("#panel-ipa .ipa-sym.sel, #panel-ipa .ipa-vnode.sel").forEach((s) => s.classList.remove("sel"));
    document.querySelectorAll(`#panel-ipa [data-sym="${CSS.escape(sym)}"]`).forEach((s) => {
      if (s.classList.contains("ipa-sym") || s.classList.contains("ipa-vnode")) s.classList.add("sel");
    });
    renderDetail(info);
    if (play) playPreferred(info);
  }

  // ── Symbol button ─────────────────────────────────────────────────────
  function symBtn(sym, cls) {
    const info = IPA().INFO[sym];
    const b = el("button", "ipa-sym" + (cls ? " " + cls : ""));
    b.type = "button";
    b.dataset.sym = sym;
    b.textContent = carrier(sym);
    if (info) b.setAttribute("aria-label", info.name + " — play");
    return b;
  }

  // ── Explore-mode builders ─────────────────────────────────────────────
  function buildConsonants() {
    const P = IPA();
    const wrap = el("section", "ipa-block");
    wrap.dataset.cat = "cons";
    wrap.appendChild(el("h3", "ipa-h3", "Pulmonic consonants"));
    wrap.appendChild(el("p", "ipa-sub", "Rows are manner of articulation; columns are place, front of the mouth on the left. In a pair the left symbol is voiceless, the right is voiced. Blank cells are sounds no known language uses, or that are judged impossible — the chart doesn't distinguish the two."));
    const scroll = el("div", "ipa-tablescroll");
    const table = el("table", "ipa-grid");
    table.setAttribute("aria-label", "Pulmonic consonants");
    let head = "<th class='ipa-corner' scope='col'></th>";
    P.PLACES.forEach(([, l]) => (head += `<th class="ipa-place" scope="col">${l}</th>`));
    table.appendChild(el("thead", null, `<tr>${head}</tr>`));
    const tbody = el("tbody");
    P.MANNERS.forEach(([mk, ml]) => {
      const tr = el("tr");
      const th = el("th", "ipa-manner", ml); th.scope = "row"; tr.appendChild(th);
      P.PLACES.forEach(([pk]) => {
        const td = el("td", "ipa-cell");
        const cell = P.CONS_CELLS[mk + "|" + pk];
        if (cell) {
          const vl = el("span", "ipa-slot ipa-slot-vl"), vd = el("span", "ipa-slot ipa-slot-vd");
          cell.forEach(([s, v]) => (v ? vd : vl).appendChild(symBtn(s)));
          td.appendChild(vl); td.appendChild(vd);
        } else td.classList.add("ipa-cell-empty");
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    wrap.appendChild(scroll);
    return wrap;
  }

  function buildVowels() {
    const P = IPA();
    const wrap = el("section", "ipa-block");
    wrap.dataset.cat = "vowel";
    wrap.appendChild(el("h3", "ipa-h3", "Vowels"));
    wrap.appendChild(el("p", "ipa-sub", "Plotted on the IPA quadrilateral by tongue height (top = close) and backness (left = front). Where two share a spot, the left is unrounded and the right is rounded."));
    const quad = el("div", "ipa-quad");
    // axis labels
    quad.appendChild(el("span", "ipa-quad-ax ipa-ax-front", "front"));
    quad.appendChild(el("span", "ipa-quad-ax ipa-ax-back", "back"));
    quad.appendChild(el("span", "ipa-quad-ax ipa-ax-close", "close"));
    quad.appendChild(el("span", "ipa-quad-ax ipa-ax-open", "open"));
    // trapezoid outline
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "ipa-quad-frame");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.innerHTML = `<polygon points="${QUAD.clF[0]},${QUAD.clF[1]} ${QUAD.clB[0]},${QUAD.clB[1]} ${QUAD.opB[0]},${QUAD.opB[1]} ${QUAD.opF[0]},${QUAD.opF[1]}"/>
      <line x1="${(QUAD.clF[0]+QUAD.clB[0])/2}" y1="${QUAD.clF[1]}" x2="${(QUAD.opF[0]+QUAD.opB[0])/2}" y2="${QUAD.opF[1]}"/>`;
    quad.appendChild(svg);
    // nodes
    P.VOWELS.forEach((v) => {
      const p = quadPos(v.height, v.backness);
      const node = el("button", "ipa-vnode ipa-sym");
      node.type = "button";
      node.dataset.sym = v.sym;
      node.textContent = v.sym;
      node.style.left = p.x + "%";
      node.style.top = p.y + "%";
      node.classList.add(v.rounded ? "vn-round" : "vn-unround");
      const info = P.INFO[v.sym];
      if (info) node.setAttribute("aria-label", info.name + " — play");
      quad.appendChild(node);
    });
    wrap.appendChild(quad);
    wrap.appendChild(el("p", "ipa-quad-caption", "Overlapping symbols are nudged apart; unrounded vowels sit left of their rounded partner. There's no separate letter for an open central unrounded vowel — that's written [ä]."));
    return wrap;
  }

  function chipRow(list, symOf, nameOf, useCarrier) {
    const row = el("div", "ipa-chips");
    list.forEach((e) => {
      const sym = symOf(e);
      const c = el("button", "ipa-chip");
      c.type = "button";
      c.dataset.sym = sym;
      const info = IPA().INFO[sym];
      c.setAttribute("aria-label", (info ? info.name : nameOf(e)));
      c.innerHTML = `<span class="ipa-sym" data-sym="${esc(sym)}" tabindex="-1" aria-hidden="true">${esc(useCarrier ? carrier(sym) : sym)}</span><span class="ipa-chip-name">${esc(nameOf(e))}</span>`;
      row.appendChild(c);
    });
    return row;
  }

  function buildAffricates() {
    const P = IPA();
    const wrap = el("section", "ipa-block");
    wrap.dataset.cat = "affricate";
    wrap.appendChild(el("h3", "ipa-h3", "Affricates"));
    wrap.appendChild(el("p", "ipa-sub", P.GROUP_NOTES.affricate));
    wrap.appendChild(chipRow(P.AFFRICATES, (e) => e.sym, (e) => e.name));
    return wrap;
  }

  function buildOther() {
    const P = IPA();
    const wrap = el("section", "ipa-block");
    wrap.dataset.cat = "other";
    wrap.appendChild(el("h3", "ipa-h3", "Other symbols"));
    wrap.appendChild(el("p", "ipa-sub", P.GROUP_NOTES.other));
    wrap.appendChild(chipRow(P.OTHER, (e) => e.sym, (e) => e.name));
    return wrap;
  }

  function buildNonPulmonic() {
    const P = IPA();
    const wrap = el("section", "ipa-block ipa-nonpulm");
    wrap.dataset.cat = "nonpulm";
    wrap.appendChild(el("h3", "ipa-h3", "Non-pulmonic consonants"));
    const groups = [["Clicks", P.CLICKS, P.GROUP_NOTES.click], ["Implosives", P.IMPLOSIVES, P.GROUP_NOTES.implosive], ["Ejectives", P.EJECTIVES, P.GROUP_NOTES.ejective]];
    groups.forEach(([title, list, note]) => {
      const g = el("div", "ipa-subblock");
      g.appendChild(el("h4", "ipa-h4", title));
      g.appendChild(el("p", "ipa-sub", note));
      g.appendChild(chipRow(list, (e) => e.sym, (e) => e.name));
      wrap.appendChild(g);
    });
    return wrap;
  }

  function buildSupras() {
    const P = IPA();
    const wrap = el("section", "ipa-block");
    wrap.dataset.cat = "supra";
    wrap.appendChild(el("h3", "ipa-h3", "Suprasegmentals"));
    wrap.appendChild(el("p", "ipa-sub", P.GROUP_NOTES.supra));
    wrap.appendChild(chipRow(P.SUPRAS, (e) => e.sym, (e) => e.name, true));
    return wrap;
  }

  function buildDiacritics() {
    const P = IPA();
    const wrap = el("section", "ipa-block");
    wrap.dataset.cat = "diacritic";
    wrap.appendChild(el("h3", "ipa-h3", "Diacritics"));
    wrap.appendChild(el("p", "ipa-sub", P.GROUP_NOTES.diacritic));
    P.DIA_GROUPS.forEach((g) => {
      const sub = el("div", "ipa-subblock");
      sub.appendChild(el("h4", "ipa-h4", g.label));
      sub.appendChild(chipRow(g.items, (e) => e.sym, (e) => e.name, true));
      wrap.appendChild(sub);
    });
    return wrap;
  }

  // ── Learn-mode ────────────────────────────────────────────────────────
  function renderLearn() {
    const host = document.getElementById("ipa-learn");
    if (!host) return;
    const L = LESSONS[learnIndex];
    host.innerHTML = `
      <div class="ipa-learn-head">
        <div class="ipa-learn-step">Lesson ${learnIndex + 1} of ${LESSONS.length}</div>
        <h3 class="ipa-h3">${esc(L.title)}</h3>
        <p class="ipa-sub">${esc(L.note)}</p>
      </div>
      <div class="ipa-learn-syms" id="ipa-learn-syms"></div>
      <div class="ipa-learn-nav">
        <button class="ipa-lnav" id="ipa-learn-prev" ${learnIndex === 0 ? "disabled" : ""} aria-label="Previous lesson">← Prev</button>
        <button class="ipa-lnav" id="ipa-learn-next" ${learnIndex === LESSONS.length - 1 ? "disabled" : ""} aria-label="Next lesson">Next →</button>
      </div>`;
    const row = host.querySelector("#ipa-learn-syms");
    L.syms.forEach((s) => row.appendChild(symBtn(s, "ipa-learn-sym")));
    host.querySelector("#ipa-learn-prev").addEventListener("click", () => { if (learnIndex > 0) { learnIndex--; renderLearn(); } });
    host.querySelector("#ipa-learn-next").addEventListener("click", () => { if (learnIndex < LESSONS.length - 1) { learnIndex++; renderLearn(); } });
    // auto-select the first sound of the lesson (no autoplay)
    if (L.syms[0]) select(L.syms[0], false);
  }

  // ── Filters & mode ────────────────────────────────────────────────────
  function applyMode() {
    const charts = document.getElementById("ipa-charts");
    const learn = document.getElementById("ipa-learn");
    const filters = document.getElementById("ipa-filters");
    if (!charts || !learn) return;
    const isLearn = mode === "learn";
    charts.style.display = isLearn ? "none" : "";
    learn.style.display = isLearn ? "" : "none";
    if (filters) filters.style.display = isLearn ? "none" : "";
    document.querySelectorAll("#ipa-mode-toggle [data-mode]").forEach((b) => {
      const on = b.dataset.mode === mode;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (isLearn) renderLearn();
  }

  function applyFilters() {
    const charts = document.getElementById("ipa-charts");
    if (!charts) return;
    const q = (document.getElementById("ipa-search")?.value || "").trim().toLowerCase();
    charts.querySelectorAll(".ipa-block").forEach((block) => {
      const cat = block.dataset.cat;
      const catOn = activeCats.size === 0 || activeCats.has(cat);
      block.style.display = catOn ? "" : "none";
    });
    // per-symbol search + voicing filter
    charts.querySelectorAll(".ipa-sym[data-sym], .ipa-chip[data-sym]").forEach((node) => {
      const isChip = node.classList.contains("ipa-chip");
      if (!isChip && node.closest(".ipa-chip")) return; // inner chip glyph
      const info = IPA().INFO[node.dataset.sym];
      let hit = true;
      if (q) hit = info ? haystack(info).includes(q) : node.dataset.sym.toLowerCase().includes(q);
      if (hit && voiceFilter != null && info && info.voice != null) hit = info.voice === voiceFilter;
      if (hit && voiceFilter != null && info && info.voice == null) hit = false;
      if (isChip) node.style.display = hit ? "" : "none";
      else { node.style.opacity = hit ? "" : "0.12"; node.style.pointerEvents = hit ? "" : "none"; }
    });
  }

  // ── Keyboard navigation within the consonant grid ─────────────────────
  function gridKeydown(e) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    const btn = e.target.closest(".ipa-sym");
    if (!btn || !btn.closest(".ipa-grid")) return;
    const all = [...document.querySelectorAll("#ipa-charts .ipa-grid .ipa-sym")].filter((b) => b.offsetParent !== null);
    const i = all.indexOf(btn);
    if (i < 0) return;
    e.preventDefault();
    if (e.key === "ArrowLeft" && i > 0) return all[i - 1].focus();
    if (e.key === "ArrowRight" && i < all.length - 1) return all[i + 1].focus();
    // up/down: nearest button by horizontal centre in the adjacent row band
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const dir = e.key === "ArrowUp" ? -1 : 1;
    let best = null, bestScore = Infinity;
    all.forEach((b) => {
      const br = b.getBoundingClientRect();
      const dy = (br.top + br.height / 2) - (r.top + r.height / 2);
      if (dir < 0 ? dy >= -4 : dy <= 4) return; // must be in the target direction
      const score = Math.abs(dy) * 3 + Math.abs((br.left + br.width / 2) - cx);
      if (score < bestScore) { bestScore = score; best = b; }
    });
    if (best) best.focus();
  }

  // ── Build (idempotent) ────────────────────────────────────────────────
  function build() {
    if (built || !IPA()) return;
    const charts = document.getElementById("ipa-charts");
    if (!charts) return;

    charts.appendChild(buildConsonants());
    charts.appendChild(buildAffricates());
    charts.appendChild(buildVowels());
    charts.appendChild(buildOther());
    charts.appendChild(buildNonPulmonic());
    charts.appendChild(buildSupras());
    charts.appendChild(buildDiacritics());
    renderDetail(null);

    // Delegated selection (one listener, survives forever).
    const onPick = (e) => {
      const sym = e.target.closest(".ipa-sym");
      const chip = e.target.closest(".ipa-chip");
      const learnSym = e.target.closest(".ipa-learn-sym");
      const t = learnSym || sym || chip;
      if (!t || !t.dataset.sym) return;
      select(t.dataset.sym, true);
    };
    charts.addEventListener("click", onPick);
    charts.addEventListener("keydown", gridKeydown);
    const learnHost = document.getElementById("ipa-learn");
    if (learnHost) learnHost.addEventListener("click", onPick);

    // Search
    const search = document.getElementById("ipa-search");
    if (search) search.addEventListener("input", applyFilters);

    // Category + voicing filters
    const filters = document.getElementById("ipa-filters");
    if (filters) {
      filters.addEventListener("click", (e) => {
        const b = e.target.closest("[data-cat],[data-voice]");
        if (!b) return;
        if (b.dataset.cat != null) {
          const c = b.dataset.cat;
          if (c === "all") activeCats.clear();
          else { activeCats.has(c) ? activeCats.delete(c) : activeCats.add(c); }
        } else {
          const v = b.dataset.voice === "voiced" ? 1 : 0;
          voiceFilter = voiceFilter === v ? null : v;
        }
        syncFilterButtons();
        applyFilters();
      });
      syncFilterButtons();
    }

    // Audio-preference toggle
    const audioToggle = document.getElementById("ipa-audio-toggle");
    if (audioToggle) {
      const sync = () => audioToggle.querySelectorAll("[data-pref]").forEach((b) => { const on = b.dataset.pref === audioPref; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
      audioToggle.addEventListener("click", (e) => {
        const b = e.target.closest("[data-pref]"); if (!b) return;
        audioPref = b.dataset.pref;
        try { localStorage.setItem("ipa-audio-pref", audioPref); } catch (_) {}
        sync();
        if (current) playPreferred(IPA().INFO[current]);
      });
      sync();
    }

    // Explore / Learn mode
    const modeToggle = document.getElementById("ipa-mode-toggle");
    if (modeToggle) {
      modeToggle.addEventListener("click", (e) => {
        const b = e.target.closest("[data-mode]"); if (!b) return;
        mode = b.dataset.mode;
        try { localStorage.setItem("ipa-mode", mode); } catch (_) {}
        applyMode();
      });
    }

    built = true;
    applyMode();
    applyFilters();
  }

  function syncFilterButtons() {
    const filters = document.getElementById("ipa-filters");
    if (!filters) return;
    filters.querySelectorAll("[data-cat]").forEach((b) => {
      const c = b.dataset.cat;
      const on = c === "all" ? activeCats.size === 0 : activeCats.has(c);
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    filters.querySelectorAll("[data-voice]").forEach((b) => {
      const v = b.dataset.voice === "voiced" ? 1 : 0;
      const on = voiceFilter === v;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  SOUND.ipaBuild = build;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
