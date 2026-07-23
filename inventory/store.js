/* Inventory — storage, sync and merge.
 *
 * The app runs against one of two backends and doesn't much care which:
 *
 *   local   — the Python server, via /api/state. Over Tailscale this is
 *             still "local": the data never leaves the machine it's on.
 *   github  — a JSON file in a private GitHub repo. Kept as a fallback for
 *             anyone who'd rather not run a always-on box.
 *
 * Whichever it is, every change is written to localStorage first and
 * pushed second. That's what makes a dead-signal supermarket aisle — or a
 * home PC that happens to be asleep — survivable rather than fatal.
 *
 * ---------------------------------------------------------------------
 * Two people editing at once
 *
 * Both backends hand out a token for the version you read (a blob sha
 * from GitHub, an integer rev from the local server) and refuse a write
 * carrying a stale one. So a conflict is always *detected*.
 *
 * Resolving it is ours, and happens per item rather than per file: each
 * item carries an `updated` stamp, newest wins, and deletions leave
 * tombstones so a merge can't resurrect what someone threw away.
 *
 * The failure this avoids: you tick eggs off in the shop, Zeina adds
 * pasta at home, and whoever saves second silently erases the other.
 */

'use strict';

const Store = (function () {

  const LS_STATE = 'inventory_state';
  const LS_TOKEN_VER = 'inventory_version_token';
  const LS_MODE = 'inventory_mode';
  const LS_TOKEN = 'inventory_gh_token';
  const LS_CFG = 'inventory_gh_cfg';
  const LS_DIRTY = 'inventory_dirty';

  const API = 'https://api.github.com';

  let mode = null;          // 'local' | 'github'
  let token = null;         // version we last read: gh sha, or local rev
  let onStatus = () => {};

  /* ---------------------------------------------------------------- utils */

  function b64encode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
  }

  function b64decode(b64) {
    const bin = atob(String(b64).replace(/\s/g, ''));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  }

  function nowStamp() { return new Date().toISOString(); }

  function readLS(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  }

  function writeLS(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* full */ }
  }

  /* ----------------------------------------------------------- the merge */

  /** Newest-wins union of two lists of {id, updated}. */
  function mergeById(mine, theirs, dead) {
    const byId = new Map();
    for (const row of [...(theirs || []), ...(mine || [])]) {
      if (!row || !row.id) continue;
      const prev = byId.get(row.id);
      if (!prev || String(row.updated || '') >= String(prev.updated || '')) {
        byId.set(row.id, row);
      }
    }
    return [...byId.values()].filter((row) => {
      const killedAt = dead.get(row.id);
      // Re-adding something after it was deleted beats the tombstone.
      return !killedAt || String(row.updated || '') > killedAt;
    });
  }

  function mergeTombstones(mine, theirs) {
    const byId = new Map();
    for (const t of [...(theirs || []), ...(mine || [])]) {
      if (!t || !t.id) continue;
      const prev = byId.get(t.id);
      if (!prev || String(t.at || '') > String(prev.at || '')) byId.set(t.id, t);
    }
    // Forget tombstones after 90 days; by then every device has seen them.
    const cutoff = new Date(Date.now() - 90 * 864e5).toISOString();
    return [...byId.values()].filter((t) => String(t.at || '') > cutoff);
  }

  function merge(mine, theirs) {
    const tombstones = mergeTombstones(mine.tombstones, theirs.tombstones);
    const dead = new Map(tombstones.map((t) => [t.id, String(t.at || '')]));
    return {
      version: 1,
      items: mergeById(mine.items, theirs.items, dead),
      blueprints: mergeById(mine.blueprints, theirs.blueprints, dead),
      areas: mergeById(mine.areas, theirs.areas, dead),
      tombstones: tombstones,
      updated: nowStamp(),
    };
  }

  /* ------------------------------------------------------------- backends */

  /* Both backends expose the same shape: load() hands back the state plus a
   * token identifying the version you read, and push() refuses if that token
   * has gone stale. For GitHub the token is a blob sha; for the local server
   * it's an integer rev. Everything above this line treats them alike. */
  const Local = {
    async load() {
      const res = await fetch('/api/state', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const state = await res.json();
      return { state, token: state.rev == null ? null : state.rev };
    },
    async push(state, token) {
      const body = { ...state };
      if (token != null) body.rev = token;
      const res = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 409) {
        const err = new Error('someone else edited this first');
        err.conflict = true;
        try { err.remote = await res.json(); } catch { /* ignore */ }
        throw err;
      }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const out = await res.json();
      return out.rev;
    },
  };

  const GitHub = {
    cfg() { return readLS(LS_CFG, null); },
    token() { try { return localStorage.getItem(LS_TOKEN) || ''; } catch { return ''; } },

    configured() {
      const c = this.cfg();
      return !!(c && c.owner && c.repo && this.token());
    },

    url() {
      const c = this.cfg();
      return `${API}/repos/${c.owner}/${c.repo}/contents/${c.path || 'inventory.json'}`;
    },

    headers() {
      return {
        Authorization: 'Bearer ' + this.token(),
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      };
    },

    /** Returns {state, token} — token null when the file isn't there yet. */
    async load() {
      const c = this.cfg();
      const res = await fetch(this.url() + '?ref=' + (c.branch || 'main') +
                              '&t=' + Date.now(), { headers: this.headers() });
      if (res.status === 404) return { state: null, token: null };
      if (res.status === 401 || res.status === 403) {
        throw new Error('GitHub rejected the token (' + res.status +
                        '). Check it has Contents: read and write on this repo.');
      }
      if (!res.ok) throw new Error('GitHub said ' + res.status);
      const body = await res.json();
      return { state: JSON.parse(b64decode(body.content)), token: body.sha };
    },

    /** Throws {conflict:true} if someone else wrote since we loaded. */
    async push(state, token, message) {
      const c = this.cfg();
      const res = await fetch(this.url(), {
        method: 'PUT',
        headers: { ...this.headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message || 'inventory update',
          content: b64encode(JSON.stringify(state, null, 2)),
          branch: c.branch || 'main',
          ...(token ? { sha: token } : {}),
        }),
      });
      if (res.status === 409 || res.status === 422) {
        const err = new Error('someone else edited this first');
        err.conflict = true;
        throw err;
      }
      if (!res.ok) throw new Error('GitHub said ' + res.status);
      const body = await res.json();
      return body.content.sha;
    },
  };

  /* --------------------------------------------------------------- public */

  /* Which backend? A working /api/ping means the local server is here.
   * Anything else — a 404 from GitHub Pages, a dead network — means we are
   * NOT on the local server, so github is the only backend that can work.
   * Sticky either way, so a blip can't flip an established app. */
  async function detectMode() {
    try {
      const res = await fetch('/api/ping', { cache: 'no-store' });
      if (res.ok) { writeLS(LS_MODE, 'local'); return 'local'; }
    } catch { /* server not answering right now */ }
    const remembered = readLS(LS_MODE, null);
    if (remembered) return remembered;
    return 'github';   // no local server answered — hosted is the only option
  }

  function backend() { return mode === 'github' ? GitHub : Local; }

  function cached() { return readLS(LS_STATE, null); }
  function isDirty() { return !!readLS(LS_DIRTY, false); }
  function setDirty(v) { writeLS(LS_DIRTY, !!v); onStatus(status()); }

  function status() {
    return {
      mode,
      online: navigator.onLine,
      dirty: isDirty(),
      configured: mode === 'local' || GitHub.configured(),
    };
  }

  /* Push; on a conflict pull, merge per item, and retry once. */
  async function pushNow(state, message) {
    const be = backend();
    try {
      token = await be.push(state, token, message);
      writeLS(LS_TOKEN_VER, token);
      writeLS(LS_STATE, state);
      setDirty(false);
      return { ok: true };
    } catch (err) {
      if (!err.conflict) { setDirty(true); return { ok: false, error: err.message }; }
      try {
        // The local server hands the winning state back with the 409;
        // GitHub makes us go and fetch it.
        let remote, remoteToken;
        if (err.remote && err.remote.state) {
          remote = err.remote.state;
          remoteToken = err.remote.rev;
        } else {
          const got = await be.load();
          remote = got.state;
          remoteToken = got.token;
        }
        const merged = merge(state, remote);
        token = await be.push(merged, remoteToken, message + ' (merged)');
        writeLS(LS_TOKEN_VER, token);
        writeLS(LS_STATE, merged);
        setDirty(false);
        return { ok: true, merged: true, state: merged };
      } catch (err2) {
        setDirty(true);
        return { ok: false, error: err2.message };
      }
    }
  }

  return {
    merge,           // exposed for tests
    nowStamp,

    onStatus(fn) { onStatus = fn; },
    status,
    mode() { return mode; },
    github: GitHub,

    setGitHubConfig(cfg, tok) {
      writeLS(LS_CFG, cfg);
      writeLS(LS_MODE, 'github');
      try { localStorage.setItem(LS_TOKEN, tok); } catch { /* ignore */ }
    },

    forgetToken() {
      try {
        localStorage.removeItem(LS_TOKEN);
        localStorage.removeItem(LS_CFG);
        localStorage.removeItem(LS_MODE);
      } catch { /* ignore */ }
    },

    /** Boot: pick a backend and get the best state we can, online or not. */
    async init() {
      mode = await detectMode();
      token = readLS(LS_TOKEN_VER, null);

      if (mode === 'github' && !GitHub.configured()) {
        return { state: cached(), needsSetup: true };
      }
      if (!navigator.onLine) {
        return { state: cached(), needsSetup: false, offline: true };
      }

      try {
        const { state: remote, token: remoteToken } = await backend().load();
        if (!remote) return { state: cached(), needsSetup: false, empty: true };

        const local = cached();
        // Edits made while offline are still sitting in localStorage.
        const merged = (local && isDirty()) ? merge(local, remote) : remote;
        token = remoteToken;
        writeLS(LS_TOKEN_VER, token);
        writeLS(LS_STATE, merged);
        if (local && isDirty()) await pushNow(merged, 'merge offline edits');
        return { state: merged, needsSetup: false };
      } catch (err) {
        // A dead server or a bad token must not present an empty app.
        return { state: cached(), needsSetup: false, error: err.message };
      }
    },

    /** Write locally always; push if we can. Never throws. */
    async save(state) {
      state.updated = nowStamp();
      writeLS(LS_STATE, state);
      if (mode === 'github' && !GitHub.configured()) {
        setDirty(true); return { ok: false, error: 'not set up' };
      }
      if (!navigator.onLine) { setDirty(true); return { ok: false, offline: true }; }
      return await pushNow(state, 'inventory update');
    },

    /** Pull, merge, push back if we are ahead. Returns the state to render. */
    async sync(local) {
      if (mode === 'github' && !GitHub.configured()) {
        return { state: local, ok: false, error: 'not set up' };
      }
      if (!navigator.onLine) return { state: local, ok: false, offline: true };
      try {
        const { state: remote, token: remoteToken } = await backend().load();
        if (!remote) {
          const r = await pushNow(local, 'sync');
          return { state: local, ok: r.ok, error: r.error };
        }
        const merged = merge(local, remote);
        token = remoteToken;
        writeLS(LS_TOKEN_VER, token);
        writeLS(LS_STATE, merged);
        const ahead = isDirty() ||
          JSON.stringify(merged.items) !== JSON.stringify(remote.items);
        if (!ahead) { setDirty(false); return { state: merged, ok: true }; }
        const r = await pushNow(merged, 'sync');
        return { state: r.state || merged, ok: r.ok, error: r.error };
      } catch (err) {
        return { state: local, ok: false, error: err.message };
      }
    },

    /** First-run upload of a starting inventory into an empty destination. */
    async seed(state) {
      state.updated = nowStamp();
      writeLS(LS_STATE, state);
      return await pushNow(state, 'seed inventory');
    },

    cached,
    isDirty,
  };
})();
