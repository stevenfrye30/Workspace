/* Milwaukee desk — reads data/*.json and lays it out. No framework, no
   innerHTML from data (everything is built with createElement/textContent).
   Personal state (marks, the horizon, the "happenings only" toggle) lives in
   this browser's localStorage only. */
(function () {
  'use strict';

  const STARS_KEY = 'mke-desk-stars-v1';
  const VIEW_KEY = 'mke-desk-view-v1';
  const STALE_DAYS = 3;          // freshness warning threshold
  const NEWS_PAGE = 40;          // headlines shown before "show more"

  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  // ---- storage (may be unavailable: private windows, blocked site data)
  const store = {
    get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* fine */ } },
  };

  const state = {
    orgs: [], sources: [], news: null, events: null,
    stars: new Set(store.get(STARS_KEY, [])),
    view: Object.assign({ horizon: 30, source: null, eventsOnly: false, org: null, newsShown: NEWS_PAGE }, store.get(VIEW_KEY, {})),
  };
  state.view.newsShown = NEWS_PAGE;
  const saveView = () => store.set(VIEW_KEY, { horizon: state.view.horizon, eventsOnly: state.view.eventsOnly });

  // ---- dates (event times are Milwaukee wall-clock strings: "2026-09-28T17:00" or "2026-09-28")
  const pad = (n) => String(n).padStart(2, '0');
  const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const addDays = (key, n) => { const d = new Date(key + 'T12:00'); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabel = (key) => { const d = new Date(key + 'T12:00'); return `${DOW[d.getDay()]} ${MON[d.getMonth()]} ${d.getDate()}`; };
  const relLabel = (key) => {
    const t = todayKey();
    if (key === t) return 'Today';
    if (key === addDays(t, 1)) return 'Tomorrow';
    return '';
  };
  const timeLabel = (iso) => {
    if (!iso || iso.length < 16) return '';
    let h = +iso.slice(11, 13); const m = iso.slice(14, 16);
    const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
    return m === '00' ? `${h} ${ap}` : `${h}:${m} ${ap}`;
  };
  const shortDate = (isoUtc) => {
    if (!isoUtc) return '';
    const d = new Date(isoUtc);
    return isNaN(d) ? '' : `${MON[d.getMonth()]} ${d.getDate()}`;
  };
  const ageDays = (isoUtc) => isoUtc ? (Date.now() - new Date(isoUtc).getTime()) / 864e5 : Infinity;

  // ---- loading
  async function load() {
    $('today').textContent = (() => { const d = new Date(); return `${DOW[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; })();
    const get = (p) => fetch(p, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(`${p}: ${r.status}`); return r.json(); });
    try {
      const [orgs, sources, news, events] = await Promise.all([get('data/orgs.json'), get('data/sources.json').catch(() => ({ sources: [] })), get('data/news.json'), get('data/events.json')]);
      state.orgs = orgs.orgs || [];
      state.sources = sources.sources || [];
      state.news = news;
      state.events = events;
    } catch (e) {
      $('freshness').textContent = 'could not load the data files';
      $('eventsNote').textContent = location.protocol === 'file:'
        ? 'This page reads data/*.json with fetch(), which browsers block on file:// — open it through a web server (python -m http.server).'
        : `Failed to load: ${e.message}`;
      $('eventsNote').classList.add('err');
      return;
    }
    renderFreshness();
    renderOrgChips();
    renderRoster();
    renderEvents();
    renderSourceChips();
    renderNews();
  }

  // ---- masthead freshness
  function renderFreshness() {
    const f = $('freshness'); f.textContent = '';
    const parts = [['headlines', state.news.generated_at], ['events', state.events.generated_at]];
    parts.forEach(([what, at], i) => {
      if (i) f.append(' · ');
      const age = ageDays(at);
      const span = el('span', age > STALE_DAYS ? 'stale' : '', `${what} updated ${shortDate(at) || 'never'}`);
      if (age > STALE_DAYS) span.title = 'The daily refresh has not run for a while — the Action may be stopped.';
      f.append(span);
    });
  }

  // ---- following
  const orgById = (id) => state.orgs.find((o) => o.id === id);
  const sourceById = (id) => state.sources.find((s) => s.id === id);
  const listerOf = (e) => (e.via === 'source' ? sourceById(e.src) : orgById(e.org)) || { name: e.org || e.src || '?' };
  const REACH_LABEL = { walk: 'walk', bus: 'bus', car: 'car' };
  const orgStatus = (id) => (state.events.orgs || {})[id] || { status: 'link' };
  const upcomingCount = (id) => state.events.events.filter((e) => e.org === id && e.start.slice(0, 10) >= todayKey()).length;

  function renderOrgChips() {
    const wrap = $('orgChips'); wrap.textContent = '';
    const all = el('button', 'chip' + (state.view.org ? '' : ' on'), 'everyone');
    all.type = 'button';
    all.addEventListener('click', () => { state.view.org = null; renderOrgChips(); renderEvents(); });
    wrap.append(all);
    state.orgs.forEach((o) => {
      const st = orgStatus(o.id);
      const n = st.status === 'ok' && 'count' in st ? upcomingCount(o.id) : null;
      const b = el('button', 'chip' + (state.view.org === o.id ? ' on' : '') + (n === 0 || st.status === 'link' ? ' dim' : ''));
      b.type = 'button';
      b.append(el('span', '', o.name));
      if (n != null) b.append(el('span', 'n', String(n)));
      else if (st.status === 'error') b.append(el('span', 'n', '!'));
      b.title = st.status === 'link' ? 'No machine-readable calendar — opens on their site' : st.status === 'error' ? 'Their calendar could not be read on the last refresh' : `${n} upcoming`;
      b.addEventListener('click', () => {
        if (st.status === 'link' || (st.status === 'ok' && !('count' in st))) { window.open(o.calendar || o.site, '_blank', 'noopener'); return; }
        state.view.org = state.view.org === o.id ? null : o.id;
        renderOrgChips(); renderEvents();
      });
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
      if (o.site) { const a = el('a', '', 'site'); a.href = o.site; a.target = '_blank'; a.rel = 'noopener'; links.append(a); }
      if (o.calendar && o.calendar !== o.site) { const a = el('a', '', 'calendar'); a.href = o.calendar; a.target = '_blank'; a.rel = 'noopener'; links.append(a); }
      card.append(links);
      const mine = posts.filter((p) => p.org === o.id);
      if (mine.length) {
        const ul = el('ul', 'posts');
        mine.forEach((p) => {
          const li = el('li');
          li.append(el('span', 'd', shortDate(p.published)));
          const a = el('a', '', p.title); a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
          li.append(a); ul.append(li);
        });
        card.append(ul);
      }
      r.append(card);
    });
    const t = $('rosterToggle');
    t.addEventListener('click', () => {
      const open = r.hidden; r.hidden = !open;
      t.setAttribute('aria-expanded', String(open));
      t.textContent = open ? 'hide the roster' : 'show the roster';
    });
  }

  // ---- events
  const evKey = (e) => `${e.org}|${e.start}|${e.title}`;

  function eventRow(e, opts) {
    const li = el('li', 'ev' + (e.start.slice(0, 10) < todayKey() ? ' past' : ''));
    const t = el('span', 't' + (e.all_day ? ' soft' : ''), e.time_unknown ? 'see listing' : e.all_day ? 'all day' : timeLabel(e.start));
    li.append(t);
    const main = el('div', 'main');
    const title = el('div', 'title');
    if (e.url) { const a = el('a', '', e.title); a.href = e.url; a.target = '_blank'; a.rel = 'noopener'; title.append(a); }
    else title.textContent = e.title;
    main.append(title);
    const meta = el('div', 'meta');
    const o = listerOf(e);
    meta.append(el('span', 'org-tag' + (e.via === 'source' ? ' src-tag' : ''), o.name));
    if (opts && opts.withDay) meta.append(` · ${dayLabel(e.start.slice(0, 10))}`);
    // the venue is worth a word only when it is not simply the lister itself
    const sameAsOrg = e.where && (e.where.toLowerCase() === o.name.toLowerCase() || (o.where || '').toLowerCase().startsWith(e.where.toLowerCase()));
    if (e.where && !sameAsOrg) meta.append(` · ${e.where}`);
    if (e.kind) meta.append(el('span', 'tag kind', e.kind));
    if (e.reach) meta.append(el('span', 'tag reach reach-' + e.reach, REACH_LABEL[e.reach]));
    if (e.free === true) meta.append(el('span', 'tag free', 'free'));
    (e.tags || []).forEach((tg) => meta.append(el('span', 'tag', tg)));
    if (e.also && e.also.length) meta.append(el('span', 'also', ` also on ${e.also.map((id) => (orgById(id) || sourceById(id) || { name: id }).name).join(', ')}`));
    main.append(meta);
    if (e.summary && state.view.org === e.org) main.append(el('div', 'sum', e.summary));
    li.append(main);
    const k = evKey(e);
    const star = el('button', 'star' + (state.stars.has(k) ? ' on' : ''), state.stars.has(k) ? '★' : '☆');
    star.type = 'button';
    star.title = state.stars.has(k) ? 'Unmark' : 'Mark this one';
    star.setAttribute('aria-pressed', String(state.stars.has(k)));
    star.addEventListener('click', () => {
      if (state.stars.has(k)) state.stars.delete(k); else state.stars.add(k);
      store.set(STARS_KEY, [...state.stars]);
      renderEvents();
    });
    li.append(star);
    return li;
  }

  function renderEvents() {
    const t0 = todayKey();
    const until = addDays(t0, state.view.horizon);
    const all = state.events.events || [];
    const inWindow = all.filter((e) => e.start.slice(0, 10) >= t0 && e.start.slice(0, 10) <= until && (!state.view.org || e.org === state.view.org));

    document.querySelectorAll('.seg').forEach((b) => b.classList.toggle('on', +b.dataset.horizon === state.view.horizon));

    // marked events float above the days (past marks stay, struck through, until unmarked)
    const starred = all.filter((e) => state.stars.has(evKey(e)));
    const sw = $('starred'); const sl = $('starredList'); sl.textContent = '';
    sw.hidden = starred.length === 0;
    starred.sort((a, b) => a.start.localeCompare(b.start)).forEach((e) => sl.append(eventRow(e, { withDay: true })));

    const days = $('eventDays'); days.textContent = '';
    const byDay = new Map();
    inWindow.forEach((e) => { const k = e.start.slice(0, 10); if (!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(e); });
    const errs = Object.entries(state.events.orgs || {}).filter(([, s]) => s.status === 'error').map(([id]) => (orgById(id) || { name: id }).name);
    const note = $('eventsNote');
    note.classList.toggle('err', errs.length > 0);
    const orgName = state.view.org ? (orgById(state.view.org) || {}).name : null;
    const fromOrgs = inWindow.filter((e) => e.via !== 'source').length;
    note.textContent = `${inWindow.length} in the next ${state.view.horizon} days${orgName ? ` from ${orgName}` : ` · ${fromOrgs} from the groups we follow, the rest citywide`}` + (errs.length ? ` · could not read: ${errs.join(', ')}` : '');
    if (!byDay.size) { days.append(el('p', 'empty', 'Nothing on the calendars in this window.')); return; }
    [...byDay.keys()].sort().forEach((k) => {
      const sec = el('section', 'day');
      const h = el('h3');
      const rel = relLabel(k);
      if (rel) h.append(el('span', 'rel', rel));
      h.append(dayLabel(k));
      sec.append(h);
      const ol = el('ol', 'event-list');
      // timed things first in the order they happen; day-only listings ("see listing") close the day
      const rank = (e) => (e.time_unknown ? 2 : e.all_day ? 1 : 0);
      byDay.get(k).sort((a, b) => rank(a) - rank(b) || a.start.localeCompare(b.start) || a.title.localeCompare(b.title)).forEach((e) => ol.append(eventRow(e)));
      sec.append(ol);
      days.append(sec);
    });
  }

  document.querySelectorAll('.seg').forEach((b) => b.addEventListener('click', () => {
    state.view.horizon = +b.dataset.horizon; saveView(); renderEvents();
  }));

  // ---- news
  function renderSourceChips() {
    const wrap = $('sourceChips'); wrap.textContent = '';
    const all = el('button', 'chip' + (state.view.source ? '' : ' on'), 'all sources');
    all.type = 'button';
    all.addEventListener('click', () => { state.view.source = null; state.view.newsShown = NEWS_PAGE; renderSourceChips(); renderNews(); });
    wrap.append(all);
    (state.news.sources || []).forEach((s) => {
      const b = el('button', 'chip' + (state.view.source === s.name ? ' on' : '') + (s.ok ? '' : ' dim'), s.name);
      b.type = 'button';
      b.title = s.ok ? `${s.count} in the last ${state.news.window_days} days` : `Could not be reached: ${s.error || ''}`;
      b.addEventListener('click', () => {
        state.view.source = state.view.source === s.name ? null : s.name; state.view.newsShown = NEWS_PAGE;
        renderSourceChips(); renderNews();
      });
      wrap.append(b);
    });
    const cb = $('eventsOnly');
    cb.checked = !!state.view.eventsOnly;
    cb.addEventListener('change', () => { state.view.eventsOnly = cb.checked; state.view.newsShown = NEWS_PAGE; saveView(); renderNews(); });
  }

  function renderNews() {
    const list = $('newsList'); list.textContent = '';
    let items = state.news.items || [];
    if (state.view.source) items = items.filter((i) => i.source === state.view.source);
    if (state.view.eventsOnly) items = items.filter((i) => i.event);
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
      if (i.kind === 'roundup') k.append(el('span', 'ev-flag', 'weekly roundup'));
      else if (i.event) k.append(el('span', 'ev-flag', 'happening'));
      li.append(k);
      const h = el('p', 'h');
      const a = el('a', '', i.title); a.href = i.url; a.target = '_blank'; a.rel = 'noopener';
      h.append(a); li.append(h);
      if (i.summary) li.append(el('p', 's', i.summary));
      list.append(li);
    });
    if (items.length > state.view.newsShown) {
      const li = el('li', 'more');
      const b = el('button', 'linkish', `show ${Math.min(NEWS_PAGE, items.length - state.view.newsShown)} more`);
      b.type = 'button';
      b.addEventListener('click', () => { state.view.newsShown += NEWS_PAGE; renderNews(); });
      li.append(b); list.append(li);
    }
  }

  load();
})();
