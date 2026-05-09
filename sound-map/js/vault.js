/**
 * SOUND/vault.js
 *
 * IndexedDB persistence wrapper. Single source of truth for stored bars
 * and personas. All public methods return Promises. All thrown errors
 * are SOUNDError instances with a stable `code` field.
 *
 * Stores:
 *   bars       (keyPath "id")  + indexes: by_persona, by_state, by_lineage,
 *                                         by_created, by_session, by_tag (multiEntry)
 *   personas   (keyPath "id")  + indexes: by_archived, by_pinned
 *   meta       (keyPath "key", singleton "singleton")
 *
 * Mutable fields (enforced at patch boundary):
 *   bar:     state, persona_id, session_id, tags, notes, favorite
 *   persona: name, color, glyph, notes, pinned
 *   (archived flag on persona is set only via archivePersona)
 *
 * Error codes:
 *   SCHEMA_INVALID   NOT_FOUND   DUPLICATE_ID   IMMUTABLE_FIELD
 *   BAD_PATCH        DB_BLOCKED
 *
 * Public API:
 *   SOUND.SOUNDError
 *   SOUND.Vault.init()
 *   SOUND.Vault.bars.{add,get,patch,archive,list}
 *   SOUND.Vault.personas.{add,get,patch,archive,list}
 *   SOUND.Vault.meta.{get,patch}
 */
(function () {
  "use strict";
  if (!window.SOUND) window.SOUND = {};

  const DB_NAME = "sound_vault";
  const DB_VERSION = 1;
  const STORE_BARS = "bars";
  const STORE_PERSONAS = "personas";
  const STORE_META = "meta";

  const BAR_MUTABLE_FIELDS     = ["state", "persona_id", "session_id", "tags", "notes", "favorite"];
  const PERSONA_MUTABLE_FIELDS = ["name", "color", "glyph", "notes", "pinned"];

  class SOUNDError extends Error {
    constructor(code, detail) {
      super(`[${code}]${detail ? " " + detail : ""}`);
      this.name = "SOUNDError";
      this.code = code;
      this.detail = detail;
    }
  }

  function reqAsPromise(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  function txAsPromise(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
      tx.onabort    = () => reject(tx.error || new Error("transaction aborted"));
    });
  }

  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (ev) => {
        const db = req.result;
        const oldV = ev.oldVersion;

        if (oldV < 1) {
          const bars = db.createObjectStore(STORE_BARS, { keyPath: "id" });
          bars.createIndex("by_persona", "persona_id");
          bars.createIndex("by_state",   "state");
          bars.createIndex("by_lineage", "lineage_root_id");
          bars.createIndex("by_created", "created_at");
          bars.createIndex("by_session", "session_id");
          bars.createIndex("by_tag",     "tags", { multiEntry: true });

          const personas = db.createObjectStore(STORE_PERSONAS, { keyPath: "id" });
          personas.createIndex("by_archived", "archived");
          personas.createIndex("by_pinned",   "pinned");

          db.createObjectStore(STORE_META, { keyPath: "key" });
        }
      };

      req.onsuccess = () => {
        const db = req.result;
        db.onversionchange = () => { db.close(); dbPromise = null; };
        resolve(db);
      };
      req.onerror   = () => reject(req.error);
      req.onblocked = () => reject(new SOUNDError("DB_BLOCKED",
        "Another tab is holding an older DB version open. Close other tabs and reload."));
    });
    return dbPromise;
  }

  async function withStore(storeName, mode, fn) {
    const db = await openDB();
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let result;
    try {
      result = await fn(store);
    } catch (err) {
      try { tx.abort(); } catch (_) {}
      throw err;
    }
    await txAsPromise(tx);
    return result;
  }

  const cloneOut = (v) => (v == null ? v : structuredClone(v));

  async function init() {
    await openDB();
    const existing = await withStore(STORE_META, "readonly",
      s => reqAsPromise(s.get("singleton")));
    if (!existing) {
      await withStore(STORE_META, "readwrite", s => reqAsPromise(s.put({
        key: "singleton",
        schema_version: SOUND.SCHEMA_VERSION,
        created_at: new Date().toISOString(),
        last_export_at: null
      })));
    }
    return true;
  }

  async function addBar(bar) {
    const v = SOUND.validateBar(bar);
    if (!v.ok) throw new SOUNDError("SCHEMA_INVALID", v.errors.join("; "));
    return withStore(STORE_BARS, "readwrite", async (s) => {
      try {
        await reqAsPromise(s.add(structuredClone(bar)));
      } catch (e) {
        if (e && e.name === "ConstraintError")
          throw new SOUNDError("DUPLICATE_ID", bar.id);
        throw e;
      }
      return bar.id;
    });
  }

  async function getBar(id) {
    return withStore(STORE_BARS, "readonly", async (s) => {
      const r = await reqAsPromise(s.get(id));
      return cloneOut(r) ?? null;
    });
  }

  async function patchBar(id, patch) {
    if (!patch || typeof patch !== "object" || Array.isArray(patch))
      throw new SOUNDError("BAD_PATCH", "patch must be a plain object");
    for (const k of Object.keys(patch)) {
      if (!BAR_MUTABLE_FIELDS.includes(k))
        throw new SOUNDError("IMMUTABLE_FIELD", k);
    }
    return withStore(STORE_BARS, "readwrite", async (s) => {
      const existing = await reqAsPromise(s.get(id));
      if (!existing) throw new SOUNDError("NOT_FOUND", id);
      const updated = { ...existing, ...patch };
      const v = SOUND.validateBar(updated);
      if (!v.ok) throw new SOUNDError("SCHEMA_INVALID", v.errors.join("; "));
      await reqAsPromise(s.put(updated));
      return cloneOut(updated);
    });
  }

  async function archiveBar(id) {
    return patchBar(id, { state: "archived" });
  }

  async function listBars(query = {}) {
    return withStore(STORE_BARS, "readonly", async (s) => {
      const all = await reqAsPromise(s.getAll());
      return applyBarQuery(all, query).map(cloneOut);
    });
  }

  function applyBarQuery(arr, q) {
    const scope   = q.scope   || {};
    const filters = q.filters || {};
    const sort    = q.sort    || { by: "created_at", dir: "desc" };

    let out = arr;

    if (scope.personaId !== undefined && scope.personaId !== null) {
      out = out.filter(b => b.persona_id === scope.personaId);
    } else if (scope.personaNone) {
      out = out.filter(b => b.persona_id === null);
    } else if (scope.archivedOnly) {
      out = out.filter(b => b.state === "archived");
    } else if (scope.lineageRoot) {
      out = out.filter(b => b.lineage_root_id === scope.lineageRoot);
    }

    const wantArchived =
      scope.archivedOnly ||
      scope.lineageRoot  ||
      filters.includeArchived ||
      filters.state === "archived";
    if (!wantArchived) out = out.filter(b => b.state !== "archived");

    if (filters.state)    out = out.filter(b => b.state === filters.state);
    if (filters.tag)      out = out.filter(b => b.tags.includes(filters.tag));
    if (filters.dateFrom) out = out.filter(b => b.created_at >= filters.dateFrom);
    if (filters.dateTo)   out = out.filter(b => b.created_at <= filters.dateTo);
    if (filters.search) {
      const qs = filters.search.toLowerCase();
      out = out.filter(b =>
        b.text.toLowerCase().includes(qs) ||
        b.notes.toLowerCase().includes(qs) ||
        b.tags.some(t => t.includes(qs))
      );
    }

    out = [...out];
    if (sort.by === "created_at") {
      out.sort((a, b) => {
        const cmp = a.created_at.localeCompare(b.created_at);
        return sort.dir === "asc" ? cmp : -cmp;
      });
    } else if (sort.by === "lineage") {
      const rootCreated = new Map();
      for (const b of out) if (b.parent_id === null) rootCreated.set(b.id, b.created_at);
      out.sort((a, b) => {
        const ra = rootCreated.get(a.lineage_root_id) ?? a.created_at;
        const rb = rootCreated.get(b.lineage_root_id) ?? b.created_at;
        if (ra !== rb) return ra.localeCompare(rb);
        if (a.lineage_root_id !== b.lineage_root_id)
          return a.lineage_root_id.localeCompare(b.lineage_root_id);
        return a.revision_index - b.revision_index;
      });
    }

    return out;
  }

  async function addPersona(p) {
    const v = SOUND.validatePersona(p);
    if (!v.ok) throw new SOUNDError("SCHEMA_INVALID", v.errors.join("; "));
    return withStore(STORE_PERSONAS, "readwrite", async (s) => {
      try {
        await reqAsPromise(s.add(structuredClone(p)));
      } catch (e) {
        if (e && e.name === "ConstraintError")
          throw new SOUNDError("DUPLICATE_ID", p.id);
        throw e;
      }
      return p.id;
    });
  }

  async function getPersona(id) {
    return withStore(STORE_PERSONAS, "readonly", async (s) => {
      const r = await reqAsPromise(s.get(id));
      return cloneOut(r) ?? null;
    });
  }

  async function patchPersona(id, patch) {
    if (!patch || typeof patch !== "object" || Array.isArray(patch))
      throw new SOUNDError("BAD_PATCH", "patch must be a plain object");
    for (const k of Object.keys(patch)) {
      if (!PERSONA_MUTABLE_FIELDS.includes(k))
        throw new SOUNDError("IMMUTABLE_FIELD", k);
    }
    return withStore(STORE_PERSONAS, "readwrite", async (s) => {
      const existing = await reqAsPromise(s.get(id));
      if (!existing) throw new SOUNDError("NOT_FOUND", id);
      const updated = { ...existing, ...patch };
      const v = SOUND.validatePersona(updated);
      if (!v.ok) throw new SOUNDError("SCHEMA_INVALID", v.errors.join("; "));
      await reqAsPromise(s.put(updated));
      return cloneOut(updated);
    });
  }

  async function archivePersona(id) {
    return withStore(STORE_PERSONAS, "readwrite", async (s) => {
      const existing = await reqAsPromise(s.get(id));
      if (!existing) throw new SOUNDError("NOT_FOUND", id);
      const updated = { ...existing, archived: true, pinned: false };
      const v = SOUND.validatePersona(updated);
      if (!v.ok) throw new SOUNDError("SCHEMA_INVALID", v.errors.join("; "));
      await reqAsPromise(s.put(updated));
      return cloneOut(updated);
    });
  }

  async function listPersonas({ includeArchived = false } = {}) {
    return withStore(STORE_PERSONAS, "readonly", async (s) => {
      const all = await reqAsPromise(s.getAll());
      const filtered = includeArchived ? all : all.filter(p => !p.archived);
      filtered.sort((a, b) => a.created_at.localeCompare(b.created_at));
      return filtered.map(cloneOut);
    });
  }

  async function getMeta() {
    return withStore(STORE_META, "readonly", async (s) => {
      const r = await reqAsPromise(s.get("singleton"));
      return cloneOut(r) ?? null;
    });
  }

  async function patchMeta(fields) {
    return withStore(STORE_META, "readwrite", async (s) => {
      const existing = await reqAsPromise(s.get("singleton"));
      const updated = { ...(existing || { key: "singleton" }), ...fields };
      await reqAsPromise(s.put(updated));
      return cloneOut(updated);
    });
  }

  // ── INTERCHANGE ──────────────────────────────────────
  // Returns a serializable snapshot of the entire Vault.
  // Pretty-prints stable; bars + personas sorted by created_at ascending.
  // Stamps meta.last_export_at as a side-effect (best-effort).
  async function exportVault() {
    const [bars, personas] = await Promise.all([
      listBars({ filters: { includeArchived: true } }),
      listPersonas({ includeArchived: true })
    ]);

    const sortedBars     = bars.slice().sort((a, b) => a.created_at.localeCompare(b.created_at));
    const sortedPersonas = personas.slice().sort((a, b) => a.created_at.localeCompare(b.created_at));
    const exported_at    = new Date().toISOString();

    const result = {
      tool: "SOUND",
      tool_version: "PR4",
      schema_version: SOUND.SCHEMA_VERSION,
      exported_at,
      stats: {
        bars: sortedBars.length,
        personas: sortedPersonas.length,
        first_created_at: sortedBars[0] ? sortedBars[0].created_at : null,
        last_created_at:  sortedBars.length ? sortedBars[sortedBars.length - 1].created_at : null
      },
      personas: sortedPersonas,
      bars: sortedBars
    };

    try { await patchMeta({ last_export_at: exported_at }); } catch (_) {}

    return result;
  }

  // Validates and (optionally) applies an exported Vault snapshot.
  // Collision policy: SKIP ONLY. Existing records are never mutated.
  // Invalid records are reported and skipped; never partial-write a record.
  // Order of writes: personas first, then bars.
  //
  // @param {Object}  json
  // @param {Object}  [opts]
  // @param {boolean} [opts.dryRun=false]
  // @param {"skip"}  [opts.policy="skip"]
  // @returns {Promise<{added, skipped, invalid, meta}>}
  // @throws {SOUNDError} INVALID_FILE | IMPORT_VERSION_MISMATCH | UNSUPPORTED_POLICY
  async function importVault(json, opts) {
    opts = opts || {};
    const policy = opts.policy || "skip";
    const dryRun = !!opts.dryRun;

    if (policy !== "skip") {
      throw new SOUNDError("UNSUPPORTED_POLICY",
        `policy '${policy}' is not supported in this version (only 'skip')`);
    }
    if (!json || typeof json !== "object" || Array.isArray(json)) {
      throw new SOUNDError("INVALID_FILE", "expected a JSON object");
    }
    if (json.schema_version !== SOUND.SCHEMA_VERSION) {
      throw new SOUNDError("IMPORT_VERSION_MISMATCH",
        `expected schema_version=${SOUND.SCHEMA_VERSION}, got ${json.schema_version}`);
    }
    if (!Array.isArray(json.bars) || !Array.isArray(json.personas)) {
      throw new SOUNDError("INVALID_FILE", "missing bars[] or personas[] arrays");
    }

    const [existingBars, existingPersonas] = await Promise.all([
      listBars({ filters: { includeArchived: true } }),
      listPersonas({ includeArchived: true })
    ]);
    const existingBarIds = new Set(existingBars.map(b => b.id));
    const existingPerIds = new Set(existingPersonas.map(p => p.id));

    const result = {
      added:   { bars: 0, personas: 0 },
      skipped: { bars_collision: 0, personas_collision: 0 },
      invalid: { bars: [], personas: [] },
      meta: {
        exported_at:    json.exported_at    || null,
        schema_version: json.schema_version,
        tool:           json.tool           || null,
        tool_version:   json.tool_version   || null
      }
    };

    const candPersonas = [];
    const candBars     = [];

    for (const p of json.personas) {
      const v = SOUND.validatePersona(p);
      if (!v.ok) {
        result.invalid.personas.push({ id: (p && p.id) || "(unknown)", errors: v.errors });
        continue;
      }
      if (existingPerIds.has(p.id)) {
        result.skipped.personas_collision++;
        continue;
      }
      candPersonas.push(p);
    }

    for (const b of json.bars) {
      const v = SOUND.validateBar(b);
      if (!v.ok) {
        result.invalid.bars.push({ id: (b && b.id) || "(unknown)", errors: v.errors });
        continue;
      }
      if (existingBarIds.has(b.id)) {
        result.skipped.bars_collision++;
        continue;
      }
      candBars.push(b);
    }

    if (dryRun) {
      result.added.bars     = candBars.length;
      result.added.personas = candPersonas.length;
      return result;
    }

    for (const p of candPersonas) {
      try {
        await addPersona(p);
        result.added.personas++;
      } catch (err) {
        result.invalid.personas.push({ id: p.id, errors: [err.code || err.message] });
      }
    }
    for (const b of candBars) {
      try {
        await addBar(b);
        result.added.bars++;
      } catch (err) {
        result.invalid.bars.push({ id: b.id, errors: [err.code || err.message] });
      }
    }

    return result;
  }

  SOUND.SOUNDError = SOUNDError;
  SOUND.Vault = {
    init,
    bars: {
      add:     addBar,
      get:     getBar,
      patch:   patchBar,
      archive: archiveBar,
      list:    listBars
    },
    personas: {
      add:     addPersona,
      get:     getPersona,
      patch:   patchPersona,
      archive: archivePersona,
      list:    listPersonas
    },
    meta: {
      get:   getMeta,
      patch: patchMeta
    },
    export: exportVault,
    import: importVault
  };
})();
