/**
 * SOUND/ui_ipa.js
 *
 * Phonology → IPA: a deliberately bare-bones, playful IPA explorer.
 *
 * The default screen shows only the symbols. Click one and it (a) plays the
 * best honest audio we have and (b) opens a COMPACT card: the symbol, a
 * plain-English name, one short "how to make it" sentence, and an example
 * word or language. Everything technical hides behind two understated
 * controls — "More details" (on the card) and "More IPA symbols" (a single
 * collapsed section holding affricates, other symbols, non-pulmonics,
 * suprasegmentals, and diacritics).
 *
 * Audio is HONEST about its source and picked automatically, best-first:
 *   human recording (if a real asset ever exists) → example word (browser
 *   TTS of a whole word, where English genuinely has it) → approximate
 *   synthesis (Web Audio; declined entirely for clicks/trills/implosives/
 *   ejectives) → nothing (rather than play something misleading).
 *
 * Depends on: SOUND.IPA (ipa_data.js), SOUND.Synth (ipa_synth.js),
 *   smSpeak (data/phonetics.js).
 */
(function () {
  "use strict";
  const SOUND = (window.SOUND = window.SOUND || {});

  let built = false;
  let current = null;            // selected symbol

  // Dormant lesson data — the old "Learn" mode is retired from this tab, but
  // the sequence is kept intact for a possible future Phonology → Practice
  // integration. Not rendered here.
  const LESSONS = [
    { title: "Voicing pairs", note: "Same mouth position — the only change is whether the vocal folds vibrate.", syms: ["p", "b", "t", "d", "k", "ɡ", "f", "v", "s", "z"] },
    { title: "Places of articulation", note: "All stops, but the closure moves back through the mouth.", syms: ["p", "t", "c", "k", "q", "ʔ"] },
    { title: "Manners of articulation", note: "All at the alveolar ridge, shaped differently each time.", syms: ["t", "n", "s", "ɾ", "r", "l", "ɹ"] },
    { title: "Affricates", note: "A stop released into a fricative, fused into one sound — English ‘ch’ and ‘j’.", syms: ["t͡ʃ", "d͡ʒ", "t͡s", "d͡z"] },
    { title: "Basic vowels", note: "The corners and centre of the vowel space.", syms: ["i", "u", "ɑ", "a", "ə"] },
    { title: "Sounds English lacks", note: "Common worldwide, unfamiliar to most English speakers.", syms: ["y", "ø", "ɲ", "x", "ʁ", "ɕ"] },
    { title: "Beyond the lungs", note: "Non-pulmonic sounds — made with the tongue or larynx.", syms: ["ǀ", "ǃ", "ɓ", "ɗ", "kʼ"] },
  ];
  SOUND.ipaLessons = LESSONS; // exposed for future reuse; unused in this tab

  const IPA = () => SOUND.IPA;
  const Synth = () => SOUND.Synth;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const carrier = (s) => (IPA().carrier ? IPA().carrier(s) : s);

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

  // ── Sagittal diagram (consonants / other / affricates) ────────────────
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

  // ── Formal articulation rows (shown inside "More details") ────────────
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

  function diagramBlock(info) {
    if (info.kind === "vowel") {
      return `<div class="ipa-diagram">${vowelSpaceSVG(info)}
        <div class="ipa-d-legend">Dot = tongue-hump position in the vowel space (front↔back, close↔open). Lips: ${info.rounded ? "rounded" : "spread"}.</div></div>`;
    }
    if (info.kind === "supra" || info.kind === "diacritic") return "";
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

  // ── Audio: pick the best honest source automatically ──────────────────
  const canWord = (info) => !!(info && info.example && typeof smSpeak === "function");
  const canSyn = (info) => !!(info && Synth() && Synth().canSynth(info));
  function playableSource(info) {
    if (!info) return null;
    if (info.recording && info.recording.src) return "recording";
    if (canWord(info)) return "word";
    if (canSyn(info)) return "synth";
    return null;
  }
  function status(msg) { const s = document.getElementById("ipa-audio-status"); if (s) s.textContent = msg; }
  function playSource(info, source) {
    if (source === "recording" && info.recording && info.recording.src) { status("Human recording"); return; }
    if (source === "word" && canWord(info)) { smSpeak(info.example, 0.85); status("♪ example word “" + info.example + "” — browser voice"); return; }
    if (source === "synth" && canSyn(info)) { Synth().play(info.sym, info); status("♪ approximate synthesis — not a recording"); return; }
  }
  function playBest(info) {
    if (!info) return;
    const src = playableSource(info);
    if (!src) { status(info.audio === false ? "Not a sound on its own" : "No honest demonstration for this one yet"); return; }
    playSource(info, src);
  }

  // ── Compact detail card ───────────────────────────────────────────────
  const displayName = (info) => info.friendly || info.name;
  const howLine = (info) => info.plain || info.howto || "";
  function exampleHTML(info) {
    if (info.example) return `Example: <b>${esc(info.example)}</b>`;
    if (info.lang) { const pre = /[⟨A-Z]/.test(info.lang) ? "Heard in: " : ""; return pre + esc(info.lang); }
    return "";
  }

  // The honest audio note explains what the automatic Play button will do.
  function audioNoteHTML(info) {
    const notes = [];
    const src = playableSource(info);
    if (src === "recording") notes.push("Plays a human recording.");
    if (src === "word") notes.push("Plays the example word in your browser’s voice — a whole word, not the isolated sound.");
    if (src === "synth") notes.push("Plays an approximate Web-Audio synthesis — illustrative, not a recording of a human speaker.");
    if (info.exApprox && info.example) notes.push("This English example only loosely matches the pure IPA value" + (info.lang ? " (" + esc(info.lang) + ")." : "."));
    if (!src) {
      if (info.audio === false) notes.push(info.kind === "diacritic"
        ? "A diacritic isn’t a sound on its own — it modifies the letter it’s attached to."
        : "A suprasegmental organizes sounds rather than being one, so it doesn’t play in isolation.");
      else notes.push("No reliable isolated demonstration yet: browser voices can’t isolate this sound, and synthesizing this category would mislead more than teach.");
    }
    if (!notes.length) return "";
    return `<div class="ipa-d-audionote">${notes.map((n) => `<span>${n}</span>`).join("")}</div>`;
  }

  function detailsHTML(info) {
    // Rich, formal content revealed by "More details".
    const fullHow = info.plain && info.howto ? `<div class="ipa-d-howto"><span class="ipa-d-howto-h">In detail</span>${esc(info.howto)}</div>` : "";
    return `
      <div class="ipa-d-cat">${esc(CAT_LABEL[info.kind] || info.kind)}</div>
      <div class="ipa-d-rows">${articRows(info)}</div>
      ${fullHow}
      ${info.note ? `<div class="ipa-d-note">${esc(info.note)}</div>` : ""}
      ${diagramBlock(info)}
      ${audioNoteHTML(info)}
      ${relatedBlock(info)}`;
  }

  function renderDetail(info) {
    const aside = document.getElementById("ipa-detail");
    const box = document.getElementById("ipa-detail-body");
    const layout = document.getElementById("ipa-layout");
    if (!aside || !box) return;
    if (!info) {
      aside.hidden = true;
      box.innerHTML = "";
      if (layout) layout.classList.remove("sel");
      return;
    }
    aside.hidden = false;
    if (layout) layout.classList.add("sel");

    const formalUnder = info.friendly ? `<div class="ipa-card-formal">${esc(info.name)}</div>` : "";
    const how = howLine(info);
    const ex = exampleHTML(info);
    const canPlay = playableSource(info) != null;

    box.innerHTML = `
      <button class="ipa-card-close" type="button" aria-label="Close">×</button>
      <div class="ipa-card-top">
        <div class="ipa-card-glyph">${esc(carrier(info.sym))}</div>
        <div class="ipa-card-names">
          <div class="ipa-card-name">${esc(displayName(info))}</div>
          ${formalUnder}
        </div>
      </div>
      ${how ? `<p class="ipa-card-how">${esc(how)}</p>` : ""}
      ${ex ? `<p class="ipa-card-example">${ex}</p>` : ""}
      <div class="ipa-card-actions">
        ${canPlay ? `<button class="ipa-card-play" type="button" aria-label="Play ${esc(info.name)}">▶ Play</button>` : `<span class="ipa-card-noaudio">No audio for this one</span>`}
        <button class="ipa-card-more" type="button" aria-expanded="false">More details</button>
      </div>
      <div class="ipa-card-status" id="ipa-audio-status" role="status" aria-live="polite"></div>
      <div class="ipa-card-details" id="ipa-card-details" hidden>${detailsHTML(info)}</div>`;

    box.querySelector(".ipa-card-close").addEventListener("click", deselect);
    const playBtn = box.querySelector(".ipa-card-play");
    if (playBtn) playBtn.addEventListener("click", () => playBest(info));
    const more = box.querySelector(".ipa-card-more");
    more.addEventListener("click", () => {
      const d = box.querySelector("#ipa-card-details");
      const opening = d.hidden;
      d.hidden = !opening;
      more.setAttribute("aria-expanded", opening ? "true" : "false");
      more.textContent = opening ? "Fewer details" : "More details";
    });
    box.querySelectorAll(".ipa-rel").forEach((b) => b.addEventListener("click", () => select(b.dataset.sym, true)));
  }

  // ── Selection ─────────────────────────────────────────────────────────
  function highlight(sym) {
    document.querySelectorAll("#panel-ipa .ipa-sym.sel, #panel-ipa .ipa-vnode.sel").forEach((s) => s.classList.remove("sel"));
    if (!sym) return;
    document.querySelectorAll(`#panel-ipa [data-sym="${CSS.escape(sym)}"]`).forEach((s) => {
      if (s.classList.contains("ipa-sym") || s.classList.contains("ipa-vnode")) s.classList.add("sel");
    });
  }
  function select(sym, play) {
    const info = IPA().INFO[sym];
    if (!info) return;
    if (sym === current) { if (play) playBest(info); return; } // replay, keep card state
    current = sym;
    highlight(sym);
    renderDetail(info);
    if (play) playBest(info);
  }
  function deselect() {
    current = null;
    highlight(null);
    renderDetail(null);
  }

  // ── Symbol button / chip builders ─────────────────────────────────────
  function symBtn(sym, cls) {
    const info = IPA().INFO[sym];
    const b = el("button", "ipa-sym" + (cls ? " " + cls : ""));
    b.type = "button";
    b.dataset.sym = sym;
    b.textContent = carrier(sym);
    if (info) b.setAttribute("aria-label", info.name + " — play");
    return b;
  }

  function buildConsonants() {
    const P = IPA();
    const wrap = el("section", "ipa-block");
    wrap.dataset.cat = "cons";
    wrap.appendChild(el("h3", "ipa-h3", "Consonants"));
    wrap.appendChild(el("p", "ipa-hint", "Two symbols in a cell: the left is voiceless, the right is voiced."));
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
    wrap.appendChild(el("p", "ipa-hint", "Left = front of the mouth, top = tongue high. Paired dots: left unrounded, right rounded."));
    const quad = el("div", "ipa-quad");
    quad.appendChild(el("span", "ipa-quad-ax ipa-ax-front", "front"));
    quad.appendChild(el("span", "ipa-quad-ax ipa-ax-back", "back"));
    quad.appendChild(el("span", "ipa-quad-ax ipa-ax-close", "close"));
    quad.appendChild(el("span", "ipa-quad-ax ipa-ax-open", "open"));
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "ipa-quad-frame");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.innerHTML = `<polygon points="${QUAD.clF[0]},${QUAD.clF[1]} ${QUAD.clB[0]},${QUAD.clB[1]} ${QUAD.opB[0]},${QUAD.opB[1]} ${QUAD.opF[0]},${QUAD.opF[1]}"/>
      <line x1="${(QUAD.clF[0]+QUAD.clB[0])/2}" y1="${QUAD.clF[1]}" x2="${(QUAD.opF[0]+QUAD.opB[0])/2}" y2="${QUAD.opF[1]}"/>`;
    quad.appendChild(svg);
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

  function subSection(title, list, note, useCarrier) {
    const g = el("div", "ipa-subblock");
    g.appendChild(el("h4", "ipa-h4", title));
    if (note) g.appendChild(el("p", "ipa-hint", note));
    g.appendChild(chipRow(list, (e) => e.sym, (e) => e.name, useCarrier));
    return g;
  }

  // Everything specialist folds into ONE collapsed <details>.
  function buildMore() {
    const P = IPA();
    const details = el("details", "ipa-more");
    details.id = "ipa-more";
    const summary = document.createElement("summary");
    summary.className = "ipa-more-summary";
    summary.textContent = "More IPA symbols";
    details.appendChild(summary);
    const body = el("div", "ipa-more-body");
    body.dataset.cat = "more";
    body.appendChild(subSection("Affricates", P.AFFRICATES, P.GROUP_NOTES.affricate));
    body.appendChild(subSection("Other symbols", P.OTHER, P.GROUP_NOTES.other));
    const np = el("div", "ipa-subblock");
    np.appendChild(el("h4", "ipa-h4", "Non-pulmonic consonants"));
    np.appendChild(subSection("Clicks", P.CLICKS, P.GROUP_NOTES.click));
    np.appendChild(subSection("Implosives", P.IMPLOSIVES, P.GROUP_NOTES.implosive));
    np.appendChild(subSection("Ejectives", P.EJECTIVES, P.GROUP_NOTES.ejective));
    body.appendChild(np);
    body.appendChild(subSection("Suprasegmentals", P.SUPRAS, P.GROUP_NOTES.supra, true));
    const dia = el("div", "ipa-subblock");
    dia.appendChild(el("h4", "ipa-h4", "Diacritics"));
    dia.appendChild(el("p", "ipa-hint", P.GROUP_NOTES.diacritic));
    P.DIA_GROUPS.forEach((g) => dia.appendChild(subSection(g.label, g.items, null, true)));
    body.appendChild(dia);
    details.appendChild(body);
    return details;
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
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const dir = e.key === "ArrowUp" ? -1 : 1;
    let best = null, bestScore = Infinity;
    all.forEach((b) => {
      const br = b.getBoundingClientRect();
      const dy = (br.top + br.height / 2) - (r.top + r.height / 2);
      if (dir < 0 ? dy >= -4 : dy <= 4) return;
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
    charts.appendChild(buildVowels());
    charts.appendChild(buildMore());
    renderDetail(null);

    // One delegated listener for every symbol / chip (survives forever).
    const onPick = (e) => {
      const t = e.target.closest(".ipa-sym") || e.target.closest(".ipa-chip");
      if (!t || !t.dataset.sym) return;
      select(t.dataset.sym, true);
    };
    charts.addEventListener("click", onPick);
    charts.addEventListener("keydown", gridKeydown);

    built = true;
  }

  SOUND.ipaBuild = build;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
