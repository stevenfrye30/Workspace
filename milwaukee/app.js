/* Milwaukee desk — "what could we go do?" Reads data/*.json and lays it
   out around one question: when. Today, this weekend, this week, the next
   30 days — or any time, which is the standing places. No framework;
   nothing from the data is ever put through innerHTML. Personal state
   (marks, checks, filters) lives in this browser's localStorage only. */
(function () {
  'use strict';

  const STARS_KEY = 'mke-desk-stars-v1';
  const PLACES_KEY = 'mke-desk-places-v1';
  const VIEW_KEY = 'mke-desk-view-v2';
  const STALE_DAYS = 3;          // freshness warning threshold
  const NEWS_PAGE = 20;          // headlines shown before "show more"
  const RUN_MIN_DAYS = 3;        // a series on this many days is a "run", not a one-off
  const KINDS = ['music', 'theater', 'comedy', 'film', 'art', 'talks', 'books', 'markets', 'outdoors', 'food', 'sports', 'family', 'community'];
  const KIND_LABEL = { music: 'music', theater: 'theater', comedy: 'comedy', film: 'film', art: 'art', talks: 'talks & tours', books: 'books', markets: 'markets', outdoors: 'outdoors', food: 'food & drink', sports: 'sports', family: 'family', community: 'community' };
  const REACHES = ['walk', 'bus', 'car', 'online'];
  const REACH_LABEL = { walk: 'walk', bus: 'bus', car: 'car', online: 'online' };
  const REACH_TITLE = { walk: 'From home on foot', bus: 'A bus ride: downtown, Third Ward, Walker\'s Point, Bay View', car: 'Needs the car', online: 'From the couch' };

  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const link = (text, href) => { const a = el('a', '', text); a.href = href; a.target = '_blank'; a.rel = 'noopener'; return a; };

  // ---- storage (may be unavailable: private windows, blocked site data)
  const store = {
    get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* fine */ } },
  };

  const saved = store.get(VIEW_KEY, {});
  const savedPlaces = store.get(PLACES_KEY, {});
  const state = {
    orgs: [], sources: [], news: null, events: null, observances: [], places: null,
    stars: new Set(store.get(STARS_KEY, [])),
    placeStars: new Set(savedPlaces.stars || []),
    been: savedPlaces.been || {},               // place id → date
    view: {
      window: 'week',                           // today | weekend | week | month | anytime — asked fresh each visit
      kinds: new Set(saved.kinds || []),        // empty = every kind
      reaches: new Set(saved.reaches || []),
      free: !!saved.free,
      groups: !!saved.groups,                   // only the groups we follow
      cats: new Set(saved.cats || []),          // place categories; empty = every option category
      practical: false, q: '',
      org: null, source: null, newsShown: NEWS_PAGE,
    },
  };
  const saveView = () => store.set(VIEW_KEY, { kinds: [...state.view.kinds], reaches: [...state.view.reaches], free: state.view.free, groups: state.view.groups, cats: [...state.view.cats] });
  const savePlaces = () => store.set(PLACES_KEY, { stars: [...state.placeStars], been: state.been });

  // ---- dates (event times are Milwaukee wall-clock strings: "2026-09-28T17:00" or "2026-09-28")
  const pad = (n) => String(n).padStart(2, '0');
  const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayKey = () => keyOf(new Date());
  const addDays = (key, n) => { const d = new Date(key + 'T12:00'); d.setDate(d.getDate() + n); return keyOf(d); };
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabel = (key) => { const d = new Date(key + 'T12:00'); return `${DOW[d.getDay()]} ${MON[d.getMonth()]} ${d.getDate()}`; };
  const dayShort = (key) => DOW[new Date(key + 'T12:00').getDay()];
  const monthDay = (key) => { const d = new Date(key + 'T12:00'); return `${MON[d.getMonth()]} ${d.getDate()}`; };
  const relLabel = (key) => {
    const t = todayKey();
    if (key === t) return new Date().getHours() >= 15 ? 'Tonight' : 'Today';
    if (key === addDays(t, 1)) return 'Tomorrow';
    return '';
  };
  const timeLabel = (iso) => {
    if (!iso || iso.length < 16) return '';
    let h = +iso.slice(11, 13); const m = iso.slice(14, 16);
    const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
    return m === '00' ? `${h} ${ap}` : `${h}:${m} ${ap}`;
  };
  const shortDate = (isoUtc) => { if (!isoUtc) return ''; const d = new Date(isoUtc); return isNaN(d) ? '' : `${MON[d.getMonth()]} ${d.getDate()}`; };
  const ageDays = (isoUtc) => isoUtc ? (Date.now() - new Date(isoUtc).getTime()) / 864e5 : Infinity;

  // The dated windows, as [first day, last day]
  function windowRange(w) {
    const t = todayKey();
    if (w === 'today') return [t, t];
    if (w === 'weekend') {
      const dow = new Date(t + 'T12:00').getDay();
      if (dow === 0) return [t, t];                 // Sunday: what's left of it
      if (dow === 6) return [t, addDays(t, 1)];     // Saturday: today + Sunday
      const fri = addDays(t, (5 - dow + 7) % 7);
      return [fri, addDays(fri, 2)];
    }
    if (w === 'week') return [t, addDays(t, 6)];
    return [t, addDays(t, 29)];
  }
  const WINDOW_WORD = { today: 'today', weekend: 'this weekend', week: 'this week', month: 'in the next 30 days' };

  // ---- loading
  async function load() {
    $('today').textContent = (() => { const d = new Date(); return `${DOW[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; })();
    const get = (p) => fetch(p, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(`${p}: ${r.status}`); return r.json(); });
    try {
      const [orgs, sources, news, events, obs, places, season] = await Promise.all([
        get('data/orgs.json'), get('data/sources.json').catch(() => ({ sources: [] })), get('data/news.json'), get('data/events.json'),
        get('data/observances.json').catch(() => ({ observances: [] })), get('data/places.json').catch(() => null),
        get('data/season.json').catch(() => ({ anchors: [] }))]);
      state.orgs = orgs.orgs || [];
      state.sources = sources.sources || [];
      state.news = news;
      state.events = events;
      state.observances = obs.observances || [];
      state.places = places;
      state.season = season.anchors || [];
    } catch (e) {
      $('freshness').textContent = 'could not load the data files';
      $('optionsNote').textContent = location.protocol === 'file:'
        ? 'This page reads data/*.json with fetch(), which browsers block on file:// — open it through a web server (python -m http.server).'
        : `Failed to load: ${e.message}`;
      $('optionsNote').classList.add('err');
      return;
    }
    prepareEvents();
    renderFreshness();
    renderWindows();
    renderOrgChips();
    renderRoster();
    renderLists();
    wirePlaces();
    renderOptions();
    renderSourceChips();
    renderNews();
  }

  // ---- masthead freshness
  function renderFreshness() {
    const f = $('freshness'); f.textContent = '';
    [['headlines', state.news.generated_at], ['events', state.events.generated_at]].forEach(([what, at], i) => {
      if (i) f.append(' · ');
      const age = ageDays(at);
      const span = el('span', age > STALE_DAYS ? 'stale' : '', `${what} updated ${shortDate(at) || 'never'}`);
      if (age > STALE_DAYS) span.title = 'The daily refresh has not run for a while — the Action may be stopped.';
      f.append(span);
    });
  }

  // ---- who listed it
  const orgById = (id) => state.orgs.find((o) => o.id === id);
  const sourceById = (id) => state.sources.find((s) => s.id === id);
  const listerOf = (e) => (e.via === 'source' ? sourceById(e.src) : orgById(e.org)) || { name: e.org || e.src || '?' };
  const listerId = (e) => e.org || e.src || '';
  const orgStatus = (id) => (state.events.orgs || {})[id] || { status: 'link' };

  // ---- series: the same thing on several days is a run, shown once with its dates
  const norm = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  function prepareEvents() {
    const all = state.events.events || [];
    const bySeries = new Map();
    all.forEach((e) => {
      e.series = `${listerId(e)}|${norm(e.title)}`;
      if (!bySeries.has(e.series)) bySeries.set(e.series, new Set());
      bySeries.get(e.series).add(e.start.slice(0, 10));
    });
    all.forEach((e) => { e.runDays = bySeries.get(e.series).size; });
    state.seriesDays = bySeries;
  }
  const isRun = (e) => e.runDays >= RUN_MIN_DAYS;
  // religious and cultural observances (UWM's multifaith calendar) touching a day
  const obsFor = (day) => (state.observances || []).filter((o) => o.start <= day && day <= o.end);
  const evKey = (e) => `${listerId(e)}|${e.start}|${e.title}`;
  const runKey = (e) => `series|${e.series}`;

  // ---- filters
  function passesFilters(e, ignore) {
    const v = state.view;
    if (v.org && e.org !== v.org) return false;
    if (v.groups && e.via === 'source') return false;
    if (ignore !== 'kinds' && v.kinds.size && !v.kinds.has(e.kind)) return false;
    if (ignore !== 'reaches' && v.reaches.size && !v.reaches.has(e.reach)) return false;
    if (ignore !== 'free' && v.free && e.free !== true) return false;
    return true;
  }
  function inWindow(e, range, cutoffMs) {
    const day = e.start.slice(0, 10);
    if (day < range[0] || day > range[1]) return false;
    if (cutoffMs && day === todayKey() && !e.all_day && !e.time_unknown && e.start.length >= 16) {
      const t = new Date(e.start).getTime();
      if (!isNaN(t) && t < cutoffMs) return false;  // already started more than an hour ago
    }
    return true;
  }

  // ---- the question bar
  function renderWindows() {
    document.querySelectorAll('.win').forEach((b) => {
      b.classList.toggle('on', b.dataset.window === state.view.window);
      b.setAttribute('aria-selected', String(b.dataset.window === state.view.window));
      if (b.dataset.window === 'today') b.textContent = new Date().getHours() >= 15 ? 'Tonight' : 'Today';
      if (b.dataset.window === 'anytime') b.hidden = !state.places;
      b.onclick = () => { state.view.window = b.dataset.window; renderWindows(); renderOptions(); };
    });
  }

  function reachChip(r, count, on, onClick) {
    const b = el('button', `chip reach-${r}` + (on ? ' on' : '') + (count ? '' : ' dim')); b.type = 'button';
    b.append(el('span', '', REACH_LABEL[r])); b.append(el('span', 'n', String(count || 0)));
    b.title = REACH_TITLE[r];
    b.setAttribute('aria-pressed', String(on));
    b.onclick = onClick;
    return b;
  }

  function renderFilterChips(candidates) {
    const v = state.view;
    // kinds, with counts for this window (other filters applied)
    const kc = $('kindChips'); kc.textContent = '';
    const kindCount = {}; KINDS.forEach((k) => { kindCount[k] = 0; });
    candidates.forEach((e) => { if (passesFilters(e, 'kinds')) kindCount[e.kind] = (kindCount[e.kind] || 0) + 1; });
    const any = el('button', 'chip' + (v.kinds.size ? '' : ' on'), 'anything'); any.type = 'button';
    any.onclick = () => { v.kinds.clear(); saveView(); renderOptions(); };
    kc.append(any);
    KINDS.forEach((k) => {
      const b = el('button', 'chip' + (v.kinds.has(k) ? ' on' : '') + (kindCount[k] ? '' : ' dim')); b.type = 'button';
      b.append(el('span', '', KIND_LABEL[k])); b.append(el('span', 'n', String(kindCount[k])));
      b.setAttribute('aria-pressed', String(v.kinds.has(k)));
      b.onclick = () => { if (v.kinds.has(k)) v.kinds.delete(k); else v.kinds.add(k); saveView(); renderOptions(); };
      kc.append(b);
    });
    // reach + free + groups
    const rc = $('reachChips'); rc.textContent = '';
    const reachCount = {};
    candidates.forEach((e) => { if (passesFilters(e, 'reaches') && e.reach) reachCount[e.reach] = (reachCount[e.reach] || 0) + 1; });
    REACHES.forEach((r) => rc.append(reachChip(r, reachCount[r], v.reaches.has(r), () => { if (v.reaches.has(r)) v.reaches.delete(r); else v.reaches.add(r); saveView(); renderOptions(); })));
    const freeN = candidates.filter((e) => passesFilters(e, 'free') && e.free === true).length;
    const fb = el('button', 'chip free-chip sep-left' + (v.free ? ' on' : '') + (freeN ? '' : ' dim')); fb.type = 'button';
    fb.append(el('span', '', 'free')); fb.append(el('span', 'n', String(freeN)));
    fb.setAttribute('aria-pressed', String(v.free));
    fb.onclick = () => { v.free = !v.free; saveView(); renderOptions(); };
    rc.append(fb);
    const gb = el('button', 'chip' + (v.groups ? ' on' : '')); gb.type = 'button';
    gb.textContent = 'groups we follow';
    gb.title = 'Only what the groups we follow are putting on';
    gb.setAttribute('aria-pressed', String(v.groups));
    gb.onclick = () => { v.groups = !v.groups; if (!v.groups) v.org = null; saveView(); renderOrgChips(); renderOptions(); };
    rc.append(gb);
  }

  // ---- following
  const upcomingCount = (id) => (state.events.events || []).filter((e) => e.org === id && e.start.slice(0, 10) >= todayKey()).length;

  function renderOrgChips() {
    const wrap = $('orgChips'); wrap.textContent = '';
    state.orgs.forEach((o) => {
      const st = orgStatus(o.id);
      const feeds = st.status === 'ok' && 'count' in st;
      const n = feeds ? upcomingCount(o.id) : null;
      const b = el('button', 'chip' + (state.view.org === o.id ? ' on' : '') + (n === 0 || !feeds ? ' dim' : '')); b.type = 'button';
      b.append(el('span', '', o.name));
      if (n != null) b.append(el('span', 'n', String(n)));
      else if (st.status === 'error') b.append(el('span', 'n', '!'));
      b.title = !feeds ? 'No machine-readable calendar — opens on their site' : st.status === 'error' ? 'Their calendar could not be read on the last refresh' : `${n} upcoming`;
      b.onclick = () => {
        if (!feeds) { window.open(o.calendar || o.site, '_blank', 'noopener'); return; }
        state.view.org = state.view.org === o.id ? null : o.id;
        if (state.view.org && state.view.window === 'anytime') state.view.window = 'month';
        renderWindows(); renderOrgChips(); renderOptions();
        if (state.view.org) $('windows').scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      wrap.append(b);
    });
  }

  function renderRoster() {
    const r = $('roster'); r.textContent = '';
    const posts = state.events.posts || [];
    state.orgs.forEach((o) => {
      const card = el('article', 'org');
      card.append(el('h3', '', o.name));
      if (o.what) card.append(el('p', 'what', o.what));
      if (o.where) card.append(el('p', 'where', o.where));
      const st = orgStatus(o.id);
      let line, cls = 'status';
      if (st.status === 'error') { line = `Calendar unreadable on the last refresh (${st.error || 'error'})`; cls += ' err'; }
      else if (st.status === 'ok' && 'count' in st) line = `${upcomingCount(o.id)} upcoming from their calendar`;
      else if (st.status === 'ok' && 'posts' in st) line = 'Follows their news feed; the calendar is on their site';
      else line = 'Calendar on their site';
      card.append(el('p', cls, line));
      const links = el('p', 'links');
      if (o.site) links.append(link('site', o.site));
      if (o.calendar && o.calendar !== o.site) links.append(link('calendar', o.calendar));
      card.append(links);
      const mine = posts.filter((p) => p.org === o.id);
      if (mine.length) {
        const ul = el('ul', 'posts');
        mine.forEach((p) => { const li = el('li'); li.append(el('span', 'd', shortDate(p.published))); li.append(link(p.title, p.url)); ul.append(li); });
        card.append(ul);
      }
      r.append(card);
    });
    const t = $('rosterToggle');
    t.onclick = () => {
      const open = r.hidden; r.hidden = !open;
      t.setAttribute('aria-expanded', String(open));
      t.textContent = open ? 'hide the roster' : 'show the roster';
    };
  }

  // ---- this week's lists (human-curated)
  function renderLists() {
    const items = (state.news.items || []).filter((i) => i.list).slice(0, 6);
    const wrap = $('listsStrip'); const ul = $('listsUl'); ul.textContent = '';
    wrap.hidden = items.length === 0;
    items.forEach((i) => {
      const li = el('li');
      li.append(el('span', 'src', `${i.source} · ${shortDate(i.published)}`));
      li.append(link(i.title, i.url));
      ul.append(li);
    });
  }

  // ---- one event row
  function metaLine(e, o, opts) {
    const meta = el('div', 'meta');
    meta.append(el('span', 'org-tag' + (e.via === 'source' ? ' src-tag' : ''), o.name));
    if (opts && opts.withDay) meta.append(` · ${dayLabel(e.start.slice(0, 10))}`);
    const sameAsOrg = e.where && (e.where.toLowerCase() === o.name.toLowerCase() || (o.where || '').toLowerCase().startsWith(e.where.toLowerCase()));
    if (e.where && !sameAsOrg) meta.append(` · ${e.where}`);
    if (e.kind) meta.append(el('span', 'tag kind', KIND_LABEL[e.kind] || e.kind));
    if (e.reach) meta.append(el('span', 'tag reach reach-' + e.reach, REACH_LABEL[e.reach]));
    if (e.free === true) meta.append(el('span', 'tag free', 'free'));
    (e.tags || []).slice(0, 3).forEach((tg) => meta.append(el('span', 'tag', tg)));
    if (e.also && e.also.length) meta.append(el('span', 'also', ` also on ${e.also.map((id) => (orgById(id) || sourceById(id) || { name: id }).name).join(', ')}`));
    return meta;
  }

  function starButton(key, set, save) {
    const on = set.has(key);
    const b = el('button', 'star' + (on ? ' on' : ''), on ? '★' : '☆'); b.type = 'button';
    b.title = on ? 'Unmark' : 'Mark this one';
    b.setAttribute('aria-pressed', String(on));
    b.onclick = () => { if (set.has(key)) set.delete(key); else set.add(key); save(); renderOptions(); };
    return b;
  }
  const eventStar = (key) => starButton(key, state.stars, () => store.set(STARS_KEY, [...state.stars]));

  function eventRow(e, opts) {
    const li = el('li', 'ev' + (e.start.slice(0, 10) < todayKey() ? ' past' : ''));
    li.append(el('span', 't' + (e.all_day || e.time_unknown ? ' soft' : ''), e.time_unknown ? 'see listing' : e.all_day ? 'all day' : timeLabel(e.start)));
    const main = el('div', 'main');
    const title = el('div', 'title');
    if (e.url) title.append(link(e.title, e.url)); else title.textContent = e.title;
    main.append(title);
    const o = listerOf(e);
    main.append(metaLine(e, o, opts));
    if (e.run_through && e.run_through !== e.start.slice(0, 10)) main.append(el('div', 'perfs', `Runs through ${dayLabel(e.run_through)}`));
    if (e.summary && state.view.org === e.org) main.append(el('div', 'sum', e.summary));
    li.append(main);
    li.append(eventStar(evKey(e)));
    return li;
  }

  // A run: one row for the series, listing its dates inside the window
  function runRow(perfs, range) {
    const first = perfs[0];
    const li = el('li', 'ev');
    const allDays = [...state.seriesDays.get(first.series)].sort();
    li.append(el('span', 't soft', `${allDays.length} dates`));
    const main = el('div', 'main');
    const title = el('div', 'title');
    if (first.url) title.append(link(first.title, first.url)); else title.textContent = first.title;
    main.append(title);
    main.append(metaLine(first, listerOf(first)));
    const byDay = new Map();
    perfs.forEach((p) => { const k = p.start.slice(0, 10); if (!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(p); });
    const dayKeys = [...byDay.keys()].sort();
    const parts = dayKeys.slice(0, 8).map((k) => {
      const times = byDay.get(k).map((p) => p.time_unknown ? 'see listing' : p.all_day ? 'all day' : timeLabel(p.start));
      return `${dayShort(k)} ${monthDay(k)} ${[...new Set(times)].join(' & ')}`;
    });
    const perfsEl = el('div', 'perfs');
    if (range[0] !== range[1] && WINDOW_WORD[state.view.window]) perfsEl.append(el('b', '', `${WINDOW_WORD[state.view.window]}: `));
    perfsEl.append(parts.join(' · ') + (dayKeys.length > 8 ? ` · +${dayKeys.length - 8} more days` : ''));
    const last = allDays[allDays.length - 1];
    if (last > range[1]) perfsEl.append(` · through ${monthDay(last)}`);
    main.append(perfsEl);
    li.append(main);
    li.append(eventStar(runKey(first)));
    return li;
  }

  // ---- the options for the chosen window
  function renderOptions() {
    const anytime = state.view.window === 'anytime' && !!state.places;
    $('optionsSection').hidden = anytime;
    $('listsStrip').hidden = anytime || !$('listsUl').children.length;
    $('followingSection').hidden = anytime;
    $('placesSection').hidden = !anytime;
    if (anytime) { renderPlaces(); return; }

    const all = state.events.events || [];
    const range = windowRange(state.view.window);
    const cutoff = state.view.window === 'today' ? Date.now() - 60 * 60 * 1000 : 0;
    const candidates = all.filter((e) => inWindow(e, range, cutoff));
    renderFilterChips(candidates);
    const shown = candidates.filter((e) => passesFilters(e));

    // marked things float above everything (past marks stay, struck through, until unmarked)
    const sw = $('starred'); const sl = $('starredList'); sl.textContent = '';
    const seenSeries = new Set();
    const starredRows = [];
    all.slice().sort((a, b) => a.start.localeCompare(b.start)).forEach((e) => {
      if (state.stars.has(evKey(e))) starredRows.push(eventRow(e, { withDay: true }));
      else if (state.stars.has(runKey(e)) && !seenSeries.has(e.series)) {
        seenSeries.add(e.series);
        const perfs = all.filter((x) => x.series === e.series && x.start.slice(0, 10) >= todayKey()).sort((a, b) => a.start.localeCompare(b.start));
        if (perfs.length) starredRows.push(runRow(perfs, [todayKey(), addDays(todayKey(), 60)]));
      }
    });
    sw.hidden = starredRows.length === 0;
    starredRows.forEach((r) => sl.append(r));

    // runs vs one-offs
    const runs = new Map(); const singles = [];
    shown.forEach((e) => {
      if (isRun(e)) { if (!runs.has(e.series)) runs.set(e.series, []); runs.get(e.series).push(e); }
      else singles.push(e);
    });
    const rw = $('running'); const rl = $('runningList'); rl.textContent = '';
    rw.hidden = runs.size === 0;
    $('runningH').textContent = `On stage, on view, or repeating ${WINDOW_WORD[state.view.window]}`;
    [...runs.values()].sort((a, b) => a[0].start.localeCompare(b[0].start) || a[0].title.localeCompare(b[0].title)).forEach((perfs) => {
      perfs.sort((a, b) => a.start.localeCompare(b.start));
      rl.append(runRow(perfs, range));
    });

    // the day lists (days with an observance but nothing listed still get a header)
    const days = $('eventDays'); days.textContent = '';
    const byDay = new Map();
    singles.forEach((e) => { const k = e.start.slice(0, 10); if (!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(e); });
    const rank = (e) => (e.time_unknown ? 2 : e.all_day ? 1 : 0);
    const dayKeys = new Set(byDay.keys());
    for (let k = range[0]; k <= range[1]; k = addDays(k, 1)) if (obsFor(k).length) dayKeys.add(k);
    [...dayKeys].sort().forEach((k) => {
      const sec = el('section', 'day');
      const h = el('h3');
      const rel = relLabel(k);
      if (rel) h.append(el('span', 'rel', rel));
      h.append(dayLabel(k));
      sec.append(h);
      const obs = obsFor(k);
      if (obs.length) {
        const p = el('p', 'obs');
        p.append('Observed: ');
        obs.forEach((o, i) => {
          if (i) p.append(' · ');
          const s = el('span', '', o.name); s.title = o.note || '';
          p.append(s);
          const extra = [];
          if (o.tradition) extra.push(o.tradition);
          if (o.start === k && o.sundown) extra.push('begins at sundown');
          else if (o.start !== k) extra.push(`through ${monthDay(o.end)}`);
          if (extra.length) p.append(el('span', 'obs-x', ` (${extra.join(', ')})`));
        });
        sec.append(p);
      }
      if (byDay.has(k)) {
        const ol = el('ol', 'event-list');
        byDay.get(k).sort((a, b) => rank(a) - rank(b) || a.start.localeCompare(b.start) || a.title.localeCompare(b.title)).forEach((e) => ol.append(eventRow(e)));
        sec.append(ol);
      }
      days.append(sec);
    });
    if (!dayKeys.size && !runs.size) days.append(el('p', 'empty', 'Nothing on the calendars for that. Widen the window or drop a filter.'));

    // the count line
    const errs = Object.entries(state.events.orgs || {}).filter(([, s]) => s.status === 'error').map(([id]) => (orgById(id) || sourceById(id) || { name: id }).name);
    const note = $('optionsNote');
    note.classList.toggle('err', errs.length > 0);
    const fromGroups = shown.filter((e) => e.via !== 'source').length;
    const orgName = state.view.org ? (orgById(state.view.org) || {}).name : null;
    const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
    const what = runs.size ? `${plural(singles.length, 'thing')} and ${plural(runs.size, 'run')}` : plural(singles.length, 'thing');
    note.textContent = `${what} ${WINDOW_WORD[state.view.window]}` + (orgName ? ` from ${orgName}` : state.view.groups ? ' from the groups we follow' : ` · ${fromGroups} from the groups we follow`) + (errs.length ? ` · could not read: ${errs.join(', ')}` : '');
  }

  // ---- the year's anchors: in season now, or starting within two months
  function seasonWindows(a) {
    // every window as [from, to] month-day pairs, including repeats ("04-15/04-30")
    const wins = [[a.from, a.to]];
    (a.repeats || []).forEach((r) => { const [f, t] = r.split('/'); wins.push([f, t]); });
    return wins;
  }
  function mdKey(d) { return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  function seasonStatus(a) {
    // → { now: bool, startsIn: days until the next start (0 if in season), from, to } for the nearest window
    const today = new Date(); today.setHours(12, 0, 0, 0);
    const y = today.getFullYear();
    const toDate = (md, year) => new Date(`${year}-${md}T12:00`);
    let best = null;
    seasonWindows(a).forEach(([from, to]) => {
      const wraps = to < from;
      for (const year of [y - 1, y, y + 1]) {
        const start = toDate(from, year);
        const end = toDate(to, wraps ? year + 1 : year);
        if (today >= start && today <= end) { best = { now: true, startsIn: 0, start, end, from, to }; return; }
        const days = Math.round((start - today) / 864e5);
        if (days > 0 && (!best || (!best.now && days < best.startsIn))) best = { now: false, startsIn: days, start, end, from, to };
      }
    });
    return best;
  }
  const spanLabel = (s) => (s.start.getTime() === s.end.getTime() ? monthDay(keyOf(s.start)) : `${monthDay(keyOf(s.start))} – ${monthDay(keyOf(s.end))}`);

  function renderSeason(container) {
    const v = state.view;
    const anchors = (state.season || []).map((a) => ({ a, s: seasonStatus(a) })).filter((x) => x.s && (x.s.now || x.s.startsIn <= 60));
    const shown = anchors.filter(({ a }) => (!v.reaches.size || v.reaches.has(a.reach)) && (!v.q || `${a.name} ${a.where} ${a.note}`.toLowerCase().includes(v.q)));
    if (!shown.length) return;
    shown.sort((x, y) => (y.s.now - x.s.now) || (x.s.now ? x.s.end - y.s.end : x.s.startsIn - y.s.startsIn));
    const band = el('section', 'band season');
    const h = el('h3', '', 'The season'); h.append(el('span', 'n', `${shown.filter((x) => x.s.now).length} on now, ${shown.filter((x) => !x.s.now).length} coming`));
    band.append(h);
    const ol = el('ol', 'event-list');
    shown.forEach(({ a, s }) => {
      const li = el('li', 'ev');
      li.append(el('span', 't' + (s.now ? '' : ' soft'), s.now ? 'on now' : s.startsIn <= 14 ? `in ${s.startsIn} d` : monthDay(keyOf(s.start))));
      const main = el('div', 'main');
      const title = el('div', 'title');
      if (a.url) title.append(link(a.name, a.url)); else title.textContent = a.name;
      main.append(title);
      const meta = el('div', 'meta');
      meta.append(`${spanLabel(s)}${a.where ? ' · ' + a.where : ''}`);
      if (a.kind) meta.append(el('span', 'tag kind', KIND_LABEL[a.kind] || a.kind));
      if (a.reach) meta.append(el('span', 'tag reach reach-' + a.reach, REACH_LABEL[a.reach]));
      main.append(meta);
      if (a.note) main.append(el('p', 'note', a.note));
      li.append(main);
      li.append(starButton('season|' + a.id, state.placeStars, savePlaces));
      ol.append(li);
    });
    band.append(ol);
    container.append(band);
  }

  // ---- Anytime: the standing places
  function wirePlaces() {
    if (!state.places) return;
    const s = $('placeSearch');
    s.oninput = () => { state.view.q = s.value.trim().toLowerCase(); renderPlaces(); };
    const t = $('practicalToggle');
    t.onclick = () => { state.view.practical = !state.view.practical; t.setAttribute('aria-expanded', String(state.view.practical)); t.textContent = state.view.practical ? 'hide the practical directory' : 'show the practical directory'; renderPlaces(); };
    $('placesSource').textContent = `Seeded from UWM's "What's Around Campus" directory (${state.places.source || 'yearly PDF'}); distances are from campus, a ten-minute walk from home. Mark a place with ★, check it off when you've been.`;
  }

  const placeCats = () => (state.places.categories || []);
  const placeMatches = (p, v, ignoreCat) => {
    if (v.q && !(`${p.name} ${p.addr} ${p.note || ''} ${p.category}`.toLowerCase().includes(v.q))) return false;
    if (!ignoreCat && v.cats.size && !v.cats.has(p.category)) return false;
    if (v.reaches.size && !(p.reach && v.reaches.has(p.reach))) return false;
    return true;
  };

  function placeRow(p) {
    const been = state.been[p.id];
    const li = el('li', 'pl' + (been ? ' been' : ''));
    li.append(el('span', 'mi', p.miles != null ? `${p.miles} mi` : ''));
    const main = el('div', 'main');
    const title = el('div', 'title');
    if (p.site) title.append(link(p.name, p.site)); else title.textContent = p.name;
    main.append(title);
    const meta = el('div', 'meta');
    const bits = [];
    if (p.addr) bits.push(p.addr);
    if (p.locations && p.locations.length > 1) bits.push(`${p.locations.length} locations`);
    if (p.phone) bits.push(p.phone);
    meta.append(bits.join(' · '));
    if (p.reach) meta.append(el('span', 'tag reach reach-' + p.reach, REACH_LABEL[p.reach]));
    if (been) meta.append(el('span', 'tag been', `been · ${monthDay(been)}`));
    main.append(meta);
    if (p.note) main.append(el('p', 'note', p.note));
    li.append(main);
    const acts = el('span', 'acts');
    acts.append(starButton(p.id, state.placeStars, savePlaces));
    const c = el('button', 'check' + (been ? ' on' : ''), been ? '✓' : '○'); c.type = 'button';
    c.title = been ? 'Uncheck' : 'We went';
    c.onclick = () => { if (state.been[p.id]) delete state.been[p.id]; else state.been[p.id] = todayKey(); savePlaces(); renderPlaces(); };
    acts.append(c);
    li.append(acts);
    return li;
  }

  function renderPlaces() {
    const v = state.view;
    const all = state.places.places || [];
    const cats = placeCats();
    const optionCats = cats.filter((c) => c.option);
    const practicalCats = cats.filter((c) => !c.option);
    const pool = all.filter((p) => p.option || v.practical);

    // category chips (in place of kinds) and reach chips (no free / groups here)
    const kc = $('kindChips'); kc.textContent = '';
    const count = {};
    pool.forEach((p) => { if (placeMatches(p, v, true)) count[p.category] = (count[p.category] || 0) + 1; });
    const any = el('button', 'chip' + (v.cats.size ? '' : ' on'), 'anywhere'); any.type = 'button';
    any.onclick = () => { v.cats.clear(); saveView(); renderPlaces(); };
    kc.append(any);
    (v.practical ? cats : optionCats).forEach((c) => {
      const b = el('button', 'chip' + (v.cats.has(c.key) ? ' on' : '') + (count[c.key] ? '' : ' dim')); b.type = 'button';
      b.append(el('span', '', c.label.toLowerCase())); b.append(el('span', 'n', String(count[c.key] || 0)));
      b.setAttribute('aria-pressed', String(v.cats.has(c.key)));
      b.onclick = () => { if (v.cats.has(c.key)) v.cats.delete(c.key); else v.cats.add(c.key); saveView(); renderPlaces(); };
      kc.append(b);
    });
    const rc = $('reachChips'); rc.textContent = '';
    const reachCount = {};
    pool.forEach((p) => { if (p.reach && (!v.cats.size || v.cats.has(p.category)) && (!v.q || placeMatches(p, { ...v, reaches: new Set() }))) reachCount[p.reach] = (reachCount[p.reach] || 0) + 1; });
    ['walk', 'bus', 'car'].forEach((r) => rc.append(reachChip(r, reachCount[r], v.reaches.has(r), () => { if (v.reaches.has(r)) v.reaches.delete(r); else v.reaches.add(r); saveView(); renderPlaces(); })));

    // groups: the season first, then marked, then each category in the directory's order
    const groups = $('placeGroups'); groups.textContent = '';
    renderSeason(groups);
    const shown = pool.filter((p) => placeMatches(p, v));
    const marked = shown.filter((p) => state.placeStars.has(p.id) || p.fav);
    const addGroup = (label, rows, cls) => {
      if (!rows.length) return;
      const sec = el('section', 'pgroup' + (cls ? ' ' + cls : ''));
      const h = el('h3', '', label); h.append(el('span', 'n', String(rows.length)));
      sec.append(h);
      const ol = el('ol', 'event-list');
      rows.slice().sort((a, b) => (a.miles == null) - (b.miles == null) || (a.miles || 0) - (b.miles || 0) || a.name.localeCompare(b.name)).forEach((p) => ol.append(placeRow(p)));
      sec.append(ol);
      groups.append(sec);
    };
    addGroup('Marked', marked, 'marked');
    (v.practical ? cats : optionCats).forEach((c) => addGroup(c.label, shown.filter((p) => p.category === c.key && !(state.placeStars.has(p.id) || p.fav))));
    if (!shown.length) groups.append(el('p', 'empty', 'No place matches. Clear the search or a filter.'));

    const walk = shown.filter((p) => p.reach === 'walk').length;
    const beenN = shown.filter((p) => state.been[p.id]).length;
    $('optionsNote').classList.remove('err');
    $('optionsNote').textContent = `${shown.length} places` + (v.practical ? ' including the practical directory' : '') + ` · ${walk} on foot` + (beenN ? ` · ${beenN} been to` : '') + ` · ${practicalCats.length} practical categories ${v.practical ? 'shown' : 'folded away'}`;
  }

  // ---- news
  function renderSourceChips() {
    const wrap = $('sourceChips'); wrap.textContent = '';
    const all = el('button', 'chip' + (state.view.source ? '' : ' on'), 'all sources'); all.type = 'button';
    all.onclick = () => { state.view.source = null; state.view.newsShown = NEWS_PAGE; renderSourceChips(); renderNews(); };
    wrap.append(all);
    (state.news.sources || []).forEach((s) => {
      const b = el('button', 'chip' + (state.view.source === s.name ? ' on' : '') + (s.ok ? '' : ' dim'), s.name); b.type = 'button';
      b.title = s.ok ? `${s.count} in the last ${state.news.window_days} days` : `Could not be reached: ${s.error || ''}`;
      b.onclick = () => { state.view.source = state.view.source === s.name ? null : s.name; state.view.newsShown = NEWS_PAGE; renderSourceChips(); renderNews(); };
      wrap.append(b);
    });
  }

  function renderNews() {
    const list = $('newsList'); list.textContent = '';
    let items = state.news.items || [];
    if (state.view.source) items = items.filter((i) => i.source === state.view.source);
    const down = (state.news.sources || []).filter((s) => !s.ok).map((s) => s.name);
    const note = $('newsNote');
    note.classList.toggle('err', down.length > 0);
    note.textContent = `${items.length} in the last ${state.news.window_days} days` + (down.length ? ` · could not reach: ${down.join(', ')}` : '');
    if (!items.length) { list.append(el('li', 'empty', 'Nothing matches.')); return; }
    items.slice(0, state.view.newsShown).forEach((i) => {
      const li = el('li');
      const k = el('div', 'k');
      k.append(el('span', 'src', i.source));
      k.append(` · ${shortDate(i.published)}`);
      li.append(k);
      const h = el('p', 'h'); h.append(link(i.title, i.url)); li.append(h);
      if (i.summary) li.append(el('p', 's', i.summary));
      list.append(li);
    });
    if (items.length > state.view.newsShown) {
      const li = el('li', 'more');
      const b = el('button', 'linkish', `show ${Math.min(NEWS_PAGE, items.length - state.view.newsShown)} more`); b.type = 'button';
      b.onclick = () => { state.view.newsShown += NEWS_PAGE; renderNews(); };
      li.append(b); list.append(li);
    }
  }

  load();
})();
