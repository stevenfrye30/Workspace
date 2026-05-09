/**
 * SOUND/ui_vault.js
 *
 * Minimal Vault view inside FLOW LAB → Vault sub-tab.
 *
 * Wires:
 *   #vault-search          → debounced text/notes/tags/persona search
 *   #vault-persona-filter  → scope by persona
 *   #vault-show-archived   → include archived bars
 *   #vault-list            → list rows; click-to-load, hover-to-archive
 *
 * Public surface:
 *   SOUND.UI.Vault.refresh()    async
 *   SOUND.UI.Vault.state()      snapshot
 */
(function () {
  "use strict";
  if (!window.SOUND) window.SOUND = {};

  const LS_VAULT_STATE = "sound:vault_filters";

  const els = {};
  const cache = { bars: [], personas: [] };
  const state = {
    search: "",
    personaFilter: "__all",
    showArchived: false
  };
  let initialized = false;
  let searchTimer = null;
  let statusTimer = null;
  let pendingImport = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(LS_VAULT_STATE);
      if (raw) Object.assign(state, JSON.parse(raw));
    } catch (_) {}
  }
  function saveState() {
    try { localStorage.setItem(LS_VAULT_STATE, JSON.stringify(state)); } catch (_) {}
  }

  function relTime(iso) {
    const then = new Date(iso).getTime();
    const diff = (Date.now() - then) / 1000;
    if (diff < 30)        return "just now";
    if (diff < 90)        return "1 min ago";
    if (diff < 3600)      return `${Math.round(diff / 60)} min ago`;
    if (diff < 7200)      return "1 hour ago";
    if (diff < 86400)     return `${Math.round(diff / 3600)} hours ago`;
    if (diff < 172800)    return "yesterday";
    if (diff < 604800)    return `${Math.round(diff / 86400)} days ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function lineageStats(bars) {
    const map = new Map();
    for (const b of bars) {
      const cur = map.get(b.lineage_root_id) || { count: 0 };
      cur.count++;
      map.set(b.lineage_root_id, cur);
    }
    return map;
  }

  function personaById(id) {
    return id ? (cache.personas.find(p => p.id === id) || null) : null;
  }

  function applyFilters(bars) {
    let out = bars.slice();
    if (!state.showArchived) out = out.filter(b => b.state !== "archived");
    if (state.personaFilter === "__none") {
      out = out.filter(b => b.persona_id === null);
    } else if (state.personaFilter !== "__all") {
      out = out.filter(b => b.persona_id === state.personaFilter);
    }
    const q = state.search.trim().toLowerCase();
    if (q) {
      out = out.filter(b => {
        if (b.text.toLowerCase().includes(q)) return true;
        if (b.notes && b.notes.toLowerCase().includes(q)) return true;
        if (b.tags && b.tags.some(t => t.includes(q))) return true;
        const persona = personaById(b.persona_id);
        if (persona && persona.name.toLowerCase().includes(q)) return true;
        return false;
      });
    }
    out.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return out;
  }

  function render() {
    if (!els.list) return;
    const filtered = applyFilters(cache.bars);
    const stats = lineageStats(cache.bars);

    els.list.innerHTML = "";

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.id = "vault-empty";
      empty.className = "vault-empty";
      empty.textContent = cache.bars.length === 0
        ? "No saved bars yet. Switch to Bar Builder, type a bar, click Save."
        : "No bars match these filters.";
      els.list.appendChild(empty);
      els.count.textContent = `0 / ${cache.bars.length}`;
      return;
    }

    const frag = document.createDocumentFragment();
    for (const bar of filtered) frag.appendChild(renderRow(bar, stats.get(bar.lineage_root_id)));
    els.list.appendChild(frag);

    els.count.textContent = filtered.length === cache.bars.length
      ? `${filtered.length}`
      : `${filtered.length} / ${cache.bars.length}`;
  }

  function renderRow(bar, lineage) {
    const persona = personaById(bar.persona_id);
    const row = document.createElement("article");
    row.className = "vault-row";
    if (bar.state === "archived") row.classList.add("vault-row-archived");
    row.dataset.id = bar.id;
    row.style.setProperty("--row-color", persona ? persona.color : "#3a3a3a");
    row.tabIndex = 0;

    const glyph = document.createElement("span");
    glyph.className = "vault-glyph";
    glyph.textContent = persona ? persona.glyph : "·";
    if (persona) glyph.style.color = persona.color;
    row.appendChild(glyph);

    const content = document.createElement("div");
    content.className = "vault-content";

    const text = document.createElement("div");
    text.className = "vault-text";
    text.textContent = bar.text;
    content.appendChild(text);

    const meta = document.createElement("div");
    meta.className = "vault-meta";
    const baseParts = [];
    if (persona) baseParts.push(persona.name);
    baseParts.push(relTime(bar.created_at));
    meta.textContent = baseParts.join(" · ");

    if (bar.parent_id) {
      meta.appendChild(document.createTextNode(" · "));
      const revSpan = document.createElement("span");
      revSpan.className = "vault-meta-rev";
      revSpan.textContent = `rev ${bar.revision_index}`;
      meta.appendChild(revSpan);
    } else if (lineage && lineage.count > 1) {
      const n = lineage.count - 1;
      meta.appendChild(document.createTextNode(" · "));
      const revsSpan = document.createElement("span");
      revsSpan.className = "vault-meta-revs";
      revsSpan.textContent = `${n} revision${n === 1 ? "" : "s"}`;
      meta.appendChild(revsSpan);
    }
    if (bar.state === "archived") {
      meta.appendChild(document.createTextNode(" · archived"));
    }
    content.appendChild(meta);

    if (bar.tags && bar.tags.length) {
      const tagRow = document.createElement("div");
      tagRow.className = "vault-tags";
      for (const t of bar.tags) {
        const chip = document.createElement("span");
        chip.className = "vault-tag";
        chip.textContent = t;
        tagRow.appendChild(chip);
      }
      content.appendChild(tagRow);
    }

    row.appendChild(content);

    const actions = document.createElement("div");
    actions.className = "vault-actions";
    const archBtn = document.createElement("button");
    archBtn.type = "button";
    archBtn.className = "vault-action-btn";
    archBtn.title = bar.state === "archived" ? "Unarchive" : "Archive";
    archBtn.setAttribute("aria-label", archBtn.title);
    archBtn.textContent = bar.state === "archived" ? "↺" : "×";
    archBtn.addEventListener("click", (e) => { e.stopPropagation(); onArchiveToggle(bar); });
    actions.appendChild(archBtn);
    row.appendChild(actions);

    row.addEventListener("click", () => onLoadBar(bar));
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onLoadBar(bar); }
    });

    return row;
  }

  function rebuildPersonaFilter() {
    const sel = els.personaFilter;
    if (!sel) return;
    const previous = state.personaFilter;
    sel.innerHTML = "";
    sel.appendChild(opt("__all", "All personas"));
    sel.appendChild(opt("__none", "(no persona)"));
    for (const p of cache.personas) {
      const o = opt(p.id, `${p.glyph}  ${p.name}`);
      o.style.color = p.color;
      sel.appendChild(o);
    }
    if ([...sel.options].some(o => o.value === previous)) {
      sel.value = previous;
    } else {
      sel.value = "__all";
      state.personaFilter = "__all";
      saveState();
    }
  }
  function opt(value, label) {
    const o = document.createElement("option");
    o.value = value; o.textContent = label;
    return o;
  }

  async function refresh() {
    if (!initialized) return;
    try {
      cache.bars = await SOUND.Vault.bars.list({
        filters: { includeArchived: true }
      });
      cache.personas = await SOUND.Vault.personas.list();
      rebuildPersonaFilter();
      render();
    } catch (err) {
      console.error("[SOUND] vault refresh failed:", err);
    }
  }

  function onLoadBar(bar) {
    if (typeof window.flSwitchTab === "function") {
      const btn = document.querySelector('#panel-flow .fl-tab-btn[data-fl-tab="bar-builder"]');
      window.flSwitchTab("bar-builder", btn);
    }
    if (SOUND.UI && typeof SOUND.UI.loadBar === "function") {
      SOUND.UI.loadBar(bar);
    } else {
      console.warn("[SOUND] loadBar unavailable; ui_integration.js not loaded?");
    }
  }

  async function onArchiveToggle(bar) {
    try {
      if (bar.state === "archived") {
        await SOUND.Vault.bars.patch(bar.id, { state: "kept" });
      } else {
        await SOUND.Vault.bars.archive(bar.id);
      }
      await refresh();
    } catch (err) {
      console.error("[SOUND] archive toggle failed:", err);
    }
  }

  // ── Status messaging ─────────────────────────────────
  function showStatus(msg, kind) {
    if (!els.status) return;
    if (!msg) {
      els.status.hidden = true;
      els.status.textContent = "";
      els.status.className = "vault-status";
      return;
    }
    els.status.textContent = msg;
    els.status.className = "vault-status vault-status-" + (kind || "ok");
    els.status.hidden = false;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      els.status.hidden = true;
      els.status.textContent = "";
      els.status.className = "vault-status";
    }, 4000);
  }

  // ── Export ───────────────────────────────────────────
  function downloadJson(obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 200);
  }

  async function onExport() {
    if (!els.exportBtn) return;
    els.exportBtn.disabled = true;
    try {
      const data = await SOUND.Vault.export();
      const today = new Date().toISOString().slice(0, 10);
      downloadJson(data, `sound-vault-${today}.json`);
      showStatus(`✓ exported ${data.bars.length} bars · ${data.personas.length} personas`, "ok");
    } catch (err) {
      console.error("[SOUND] export failed:", err);
      showStatus("✗ export failed: " + ((err && (err.code || err.message)) || err), "error");
    } finally {
      els.exportBtn.disabled = false;
    }
  }

  // ── Import ───────────────────────────────────────────
  function onImport() {
    if (!els.importFile) return;
    els.importFile.value = "";
    els.importFile.click();
  }

  async function onFileSelect(ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;

    let json;
    try {
      const text = await file.text();
      json = JSON.parse(text);
    } catch (_) {
      showStatus("✗ invalid JSON file", "error");
      ev.target.value = "";
      return;
    }

    let summary;
    try {
      summary = await SOUND.Vault.import(json, { dryRun: true });
    } catch (err) {
      console.error("[SOUND] import preview failed:", err);
      showStatus("✗ " + ((err && (err.code || err.message)) || "import failed"), "error");
      ev.target.value = "";
      hidePreview();
      return;
    }

    pendingImport = json;
    renderPreview(summary, file.name);
    ev.target.value = "";
  }

  function renderPreview(summary, filename) {
    if (!els.importPreview) return;
    const adds = summary.added.bars + summary.added.personas;
    const cols = summary.skipped.bars_collision + summary.skipped.personas_collision;
    const inv  = summary.invalid.bars.length + summary.invalid.personas.length;

    const parts = [];
    parts.push(`${summary.added.bars} bar${summary.added.bars === 1 ? "" : "s"}`);
    parts.push(`${summary.added.personas} persona${summary.added.personas === 1 ? "" : "s"}`);
    if (cols > 0) parts.push(`${cols} duplicate${cols === 1 ? "" : "s"} (skip)`);
    if (inv  > 0) parts.push(`${inv} invalid (skip)`);
    els.vipSummary.textContent = "Found " + parts.join(" · ");

    const detailParts = [];
    if (filename) detailParts.push(filename);
    if (summary.meta && summary.meta.exported_at) {
      detailParts.push("exported " + summary.meta.exported_at.slice(0, 19).replace("T", " "));
    }
    detailParts.push("schema v" + summary.meta.schema_version);
    els.vipDetail.textContent = detailParts.join(" · ");

    els.vipConfirm.disabled = (adds === 0);
    els.vipConfirm.textContent = adds === 0 ? "Nothing to import" : `Confirm Import (${adds})`;
    els.importPreview.hidden = false;
  }

  function hidePreview() {
    if (els.importPreview) els.importPreview.hidden = true;
    pendingImport = null;
  }

  async function onConfirmImport() {
    if (!pendingImport) { hidePreview(); return; }
    const json = pendingImport;
    els.vipConfirm.disabled = true;
    try {
      const r = await SOUND.Vault.import(json, { dryRun: false });
      hidePreview();
      const skipped = r.skipped.bars_collision + r.skipped.personas_collision
                    + r.invalid.bars.length + r.invalid.personas.length;
      let msg = `✓ imported ${r.added.bars} bars · ${r.added.personas} personas`;
      if (skipped > 0) msg += ` · ${skipped} skipped`;
      showStatus(msg, "ok");
      if (SOUND.UI && typeof SOUND.UI.refreshPersonaPicker === "function") {
        try { await SOUND.UI.refreshPersonaPicker(); } catch (_) {}
      }
      await refresh();
    } catch (err) {
      console.error("[SOUND] import failed:", err);
      showStatus("✗ import failed: " + ((err && (err.code || err.message)) || err), "error");
      els.vipConfirm.disabled = false;
    }
  }

  async function init() {
    els.panel         = document.getElementById("fl-panel-bars");
    els.search        = document.getElementById("vault-search");
    els.personaFilter = document.getElementById("vault-persona-filter");
    els.showArchived  = document.getElementById("vault-show-archived");
    els.list          = document.getElementById("vault-list");
    els.count         = document.getElementById("vault-count");
    els.exportBtn     = document.getElementById("vault-export");
    els.importBtn     = document.getElementById("vault-import");
    els.importFile    = document.getElementById("vault-import-file");
    els.importPreview = document.getElementById("vault-import-preview");
    els.vipSummary    = document.getElementById("vip-summary");
    els.vipDetail     = document.getElementById("vip-detail");
    els.vipConfirm    = document.getElementById("vip-confirm");
    els.vipCancel     = document.getElementById("vip-cancel");
    els.status        = document.getElementById("vault-status");

    if (!els.panel || !els.list || !els.search) {
      console.warn("[SOUND] Vault UI: required elements not found");
      return;
    }

    loadState();
    els.search.value = state.search;
    els.showArchived.checked = state.showArchived;

    els.search.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.search = els.search.value;
        saveState();
        render();
      }, 150);
    });

    els.personaFilter.addEventListener("change", () => {
      state.personaFilter = els.personaFilter.value;
      saveState();
      render();
    });

    els.showArchived.addEventListener("change", () => {
      state.showArchived = els.showArchived.checked;
      saveState();
      render();
    });

    const tabBtn = document.querySelector('#panel-flow .fl-tab-btn[data-fl-tab="bars"]');
    if (tabBtn) tabBtn.addEventListener("click", () => Promise.resolve().then(refresh));

    if (els.exportBtn)  els.exportBtn.addEventListener("click", onExport);
    if (els.importBtn)  els.importBtn.addEventListener("click", onImport);
    if (els.importFile) els.importFile.addEventListener("change", onFileSelect);
    if (els.vipConfirm) els.vipConfirm.addEventListener("click", onConfirmImport);
    if (els.vipCancel)  els.vipCancel.addEventListener("click", hidePreview);

    initialized = true;
    await refresh();
    console.log("[SOUND] Vault UI ready");
  }

  SOUND.UI = SOUND.UI || {};
  SOUND.UI.Vault = {
    refresh,
    state: () => ({ ...state })
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init().catch(console.error));
  } else {
    init().catch(console.error);
  }
})();
