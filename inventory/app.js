/* Inventory — local only.
 *
 * Three ideas hold the whole thing up:
 *   1. An ITEM is something you have. Supplies get used up, gear doesn't.
 *   2. A BLUEPRINT is something you could make. It lists needs and tools.
 *   3. Both sides meet on TAGS. "Cast iron skillet" tagged `pan` satisfies a
 *      blueprint asking for `pan`. That's the entire matching engine, and it
 *      works the same for a kitchen, a workshop, or a desk drawer.
 */

'use strict';

const API = '/api/state';

const DEFAULT_AREAS = [
  { id: 'kitchen',  name: '🍳 Kitchen' },
  { id: 'workshop', name: '🔧 Workshop' },
  { id: 'home',     name: '🏠 Home' },
];

const UNITS = new Set([
  'bag','bags','box','boxes','bottle','bottles','can','cans','jar','jars',
  'lb','lbs','pound','pounds','kg','g','gram','grams','oz','ml','l','liter',
  'liters','litre','litres','pack','packs','packet','packets','roll','rolls',
  'bar','bars','sheet','sheets','cup','cups','tbsp','tsp','dozen','case',
  'cases','tube','tubes','tub','tubs','carton','cartons','stick','sticks',
  'piece','pieces','pcs','set','sets','pair','pairs','gal','gallon','gallons',
  'qt','quart','quarts','pint','pints','head','heads','bunch','bunches',
]);

/* Words that carry no matching signal — dropped when tokenizing a name so
 * "extra virgin olive oil" still answers a blueprint asking for `oil`. */
const STOP = new Set([
  'a','an','the','of','and','or','with','for','all','purpose','extra',
  'virgin','fresh','organic','my','some','brand','pack','size','large',
  'small','medium','new','old',
]);

/* Generic vessel words. These are never inferred by chopping up a longer
 * name, only honoured as a whole name or an explicit tag — because a
 * "pizza pan" is not a pan you can fry an egg in, and a "Dutch oven" is not
 * an oven. If a thing genuinely acts as one, tag it as one. */
const GENERIC = new Set([
  'pan','pot','oven','board','dish','tray','cooker','maker','machine',
  'mixer','press','grill','grinder','processor','iron','stone','set',
  'water',   // soda water, coconut water and rose water are not water
]);

/* A name joining two nouns is the name of a *dish*, not a kind of its last
 * noun. "Macaroni and cheese" is not cheese. Nothing with a connector in it
 * generalises. */
const CONNECTORS = new Set(['and', 'with', 'n']);

/* Tags are meant to say what a thing IS, but it's natural to write what it
 * DOES — `wash greens`, `cream butter`, `crush ice`. The head noun of those
 * is the *object being acted on*, so a salad spinner ends up claiming to be
 * lettuce. A tag starting with a verb describes a capability; it stands on
 * its own but never generalises. */
const VERB_PREFIXES = new Set([
  'wash','dry','crush','cream','whip','grind','chop','slice','dice','mix',
  'blend','heat','cook','bake','fry','boil','steam','stir','peel','grate',
  'mash','roll','knead','brew','press','juice','strain','sift','warm',
  'chill','freeze','melt','toast','spread','scoop','open','store','hold',
]);

/* Idioms where the head noun lies outright — the modifier names a different
 * thing rather than a variety. A butter knife will not chop an onion. There
 * is no rule that catches these, only a list; add to it when one bites you.
 * The `butter`/`milk`/`cream` cases moved to the allowlist below, after this
 * approach let cacao butter through. */
const MISLEADING_COMPOUNDS = new Set([
  'cream of tartar', 'ice cream', 'cream cheese', 'cottage cheese',
  'cream soda', 'butter knife', 'paper plate', 'paper bowl',
  'plastic cutlery',
]);

/* For a few heads, blocklisting the liars kept failing — peanut butter got
 * caught, cacao butter slipped through. These three are the ones where a
 * compound name most often denotes a *different substance*, and where a
 * false "you have it" ruins a recipe. So they invert the default: the
 * modifier must be a known variety, or the name doesn't generalise at all.
 * An allowlist fails closed, which is the error we prefer. */
const ALLOWED_VARIETIES = {
  butter: new Set(['salted', 'unsalted', 'sweet', 'clarified', 'whipped',
                   'melted', 'softened', 'cultured', 'irish', 'european',
                   'fresh', 'raw', 'organic', 'stick', 'sticks']),
  milk: new Set(['whole', 'skim', 'skimmed', 'nonfat', 'lowfat', 'low-fat',
                 'fat-free', 'evaporated', 'condensed', 'fresh', 'raw',
                 'organic', 'warm', 'cold']),
  cream: new Set(['heavy', 'whipping', 'light', 'double', 'single', 'fresh',
                  'thick', 'table', 'clotted', 'pouring']),
};

/* Modifiers that make a thing a *different* thing rather than a variant of
 * it. Dried lime is not lime; garlic powder is not garlic. A name carrying
 * one of these only ever matches in full — it never stands in for its head
 * noun. Note what's deliberately absent: `ground`, `whole`, `chopped`,
 * `crushed`. Ground cinnamon really is cinnamon. */
const NEGATING = new Set([
  'dried','dry','powder','powdered','instant','imitation','artificial',
]);

/* Emoji are derived, not stored — first keyword that appears in an item's
 * name or tags wins, so anything you add later gets one for free. Order is
 * load-bearing: `peanut` must beat `butter`, `cream cheese` must beat
 * `cream`. Set an item's `emoji` field to override. */
const EMOJI = [
  // compounds first, or the generic word steals them
  ['peanut butter','🥜'], ['cream cheese','🧀'], ['ice cream','🍨'],
  ['sour cream','🥛'], ['coconut','🥥'], ['cocoa butter','🍫'],
  ['cacao','🍫'], ['whipped cream','🍦'], ['baked beans','🫘'],
  ['soy sauce','🍶'], ['hot sauce','🌶️'], ['tomato sauce','🥫'],
  ['bouillon','🧊'], ['mac and cheese','🧀'], ['pancake','🥞'],
  ['cake mix','🎂'], ['popcorn','🍿'], ['oatmeal','🥣'],
  // produce
  ['tomato','🍅'], ['onion','🧅'], ['garlic','🧄'], ['potato','🥔'],
  ['carrot','🥕'], ['broccoli','🥦'], ['spinach','🥬'], ['lettuce','🥬'],
  ['greens','🥬'], ['cucumber','🥒'], ['pickle','🥒'], ['lemon','🍋'],
  ['lime','🍋'], ['jalapeno','🌶️'], ['pepper flakes','🌶️'], ['chili','🌶️'],
  ['harissa','🌶️'], ['hot pepper','🌶️'], ['bell pepper','🫑'],
  ['black pepper','🧂'], ['peppercorn','🧂'],
  ['cherries','🍒'], ['banana','🍌'], ['apple','🍎'], ['ginger','🫚'],
  ['berries','🫐'], ['fruit','🍎'], ['mushroom','🍄'], ['corn','🌽'],
  ['peas','🫛'], ['sauerkraut','🥬'], ['vegetable','🥬'], ['herb','🌿'],
  // proteins + dairy
  ['egg','🥚'], ['butter','🧈'], ['cheese','🧀'], ['milk','🥛'],
  ['yogurt','🥣'], ['cream','🥛'], ['beef','🥩'], ['steak','🥩'],
  ['pork','🥓'], ['bacon','🥓'], ['chicken','🍗'], ['fish','🐟'],
  ['tuna','🐟'], ['tofu','🧊'], ['falafel','🧆'], ['hummus','🧆'],
  ['tahini','🧆'], ['lentil','🫘'], ['bean','🫘'], ['chickpea','🫘'],
  // staples
  ['bread','🍞'], ['crouton','🍞'], ['flour','🌾'], ['yeast','🫧'],
  ['rice','🍚'], ['pasta','🍝'], ['noodle','🍜'], ['macaroni','🍝'],
  ['vermicelli','🍝'], ['couscous','🌾'], ['quinoa','🌾'], ['oats','🌾'],
  ['ramen','🍜'], ['tortilla','🫓'], ['bechamel','🥛'],
  // sweet + baking
  ['sugar','🍬'], ['honey','🍯'], ['syrup','🍯'], ['chocolate','🍫'],
  ['cocoa','🍫'], ['vanilla','🍦'], ['marshmallow','🍡'], ['cookie','🍪'],
  ['shortbread','🍪'], ['cake','🍰'], ['tiramisu','🍰'], ['pudding','🍮'],
  ['baking soda','🧪'], ['baking powder','🧪'], ['starch','🧪'],
  // drinks
  ['coffee','☕'], ['espresso','☕'], ['tea','🍵'], ['hibiscus','🌺'],
  ['wine','🍷'], ['rum','🥃'], ['tequila','🥃'], ['soda','🥤'],
  ['juice','🧃'], ['water','💧'],
  // snacks + condiments
  ['pretzel','🥨'], ['chips','🍟'], ['nuts','🌰'], ['almond','🌰'],
  ['pecan','🌰'], ['walnut','🌰'], ['sunflower','🌻'], ['sesame','🌱'],
  ['flax','🌱'], ['chia','🌱'], ['seed','🌱'], ['protein powder','💪'],
  ['ketchup','🍅'], ['mustard','🌭'], ['mayo','🥚'], ['applesauce','🍎'],
  ['molasses','🍯'], ['vinegar','🧴'], ['olive oil','🫒'], ['oil','🫗'],
  ['salt','🧂'], ['spice','🧂'], ['seasoning','🧂'], ['paprika','🌶️'],
  ['cinnamon','🪵'], ['cumin','🌱'], ['coriander','🌱'], ['turmeric','🟡'],
  ['cardamom','🌱'], ['clove','🌱'], ['thyme','🌿'], ['basil','🌿'],
  ['parsley','🌿'], ['methi','🌿'], ['jeera','🌱'], ['curry','🍛'],
  ['tajin','🌶️'], ['soup','🍲'], ['sauce','🥫'], ['canned','🥫'],
  // gear
  ['stock pot','🍲'], ['pot','🍲'], ['cast iron','🍳'], ['skillet','🍳'],
  ['pan','🍳'], ['griddle','🍳'], ['knife','🔪'], ['peeler','🔪'],
  ['grater','🧀'], ['bowl','🥣'], ['mortar','🥣'], ['spoon','🥄'],
  ['whisk','🥄'], ['spatula','🍳'], ['fork','🍴'], ['chopstick','🥢'],
  ['tong','🥢'], ['skewer','🍢'], ['plate','🍽️'], ['tray','🍽️'],
  ['cutlery','🍴'], ['can opener','🥫'],
  ['cup','☕'], ['mug','☕'], ['glass','🥛'], ['jar','🫙'],
  ['container','📦'], ['tupperware','📦'], ['bag','🛍️'], ['wrap','📜'],
  ['foil','📜'], ['parchment','📜'], ['blender','🌀'], ['processor','🌀'],
  ['mixer','🌀'], ['spinner','🌀'], ['oven','🔥'], ['stove','🔥'],
  ['toaster','🍞'], ['microwave','📡'], ['fridge','🧊'], ['freezer','🧊'],
  ['kettle','🫖'], ['moka','☕'], ['slow cooker','🍲'], ['rice cooker','🍚'],
  ['scale','⚖️'], ['measuring','⚖️'], ['thermometer','🌡️'],
  ['strainer','🕳️'], ['colander','🕳️'], ['sieve','🕳️'], ['lid','⭕'],
  ['mitt','🧤'], ['goggle','🥽'], ['scrubber','🧽'], ['napkin','🧻'],
  ['opener','🔧'], ['corkscrew','🍾'], ['baker','🧇'], ['ebelskiver','🧇'],
  ['board','🪵'], ['decorating','🎂'], ['ice cube','🧊'],
  // health
  ['ibuprofen','💊'], ['acetaminophen','💊'], ['aleve','💊'],
  ['vitamin','💊'], ['niacin','💊'], ['centrum','💊'], ['multivitamin','💊'],
  ['capsule','💊'], ['pill','💊'],
];

/* Matched at word starts, not anywhere — otherwise `oil` claims "foil",
 * `egg` is fine on "eggs" but `pot` would claim "potato". Compiled once. */
const EMOJI_RX = EMOJI.map(([key, glyph]) =>
  [new RegExp('\\b' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), glyph]);

function emojiFor(item) {
  if (item.emoji) return item.emoji;
  const hay = norm(item.name) + ' ' + (item.tags || []).map(norm).join(' ');
  for (const [rx, glyph] of EMOJI_RX) if (rx.test(hay)) return glyph;
  return item.kind === 'durable' ? '🔧' : '📦';
}

let state = { version: 1, items: [], blueprints: [], areas: [] };
let view = 'stock';
let area = 'all';
let quickKind = 'consumable';
let saveTimer = null;

/* ------------------------------------------------------------------ utils */

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

function uid(prefix) {
  return prefix + '-' + Date.now().toString(36) + '-' +
         Math.random().toString(36).slice(2, 7);
}

function norm(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .replace(/[^a-z0-9+\- ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function singular(w) {
  if (w.length > 3 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && w.endsWith('oes')) return w.slice(0, -2);   // potatoes
  if (w.length > 4 && /(ch|sh|ss|x)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

function fmtQty(n) {
  if (n == null) return '';
  const r = Math.round(n * 100) / 100;
  return String(r);
}

function areaName(id) {
  const a = state.areas.find((x) => x.id === id);
  return a ? a.name : id;
}

/* ------------------------------------------------------------- persistence */

function setSaveState(cls, text) {
  const n = $('saveState');
  n.className = 'save-state ' + cls;
  n.textContent = text;
}

function save() {
  clearTimeout(saveTimer);
  setSaveState('saving', 'saving…');
  saveTimer = setTimeout(async () => {
    const res = await Store.save(state);
    if (res.ok) {
      setSaveState('saved', res.merged ? 'merged ✓' : 'saved ✓');
      if (res.state) { state = res.state; render(); }
    } else if (res.offline) {
      setSaveState('pending', 'offline — will sync');
    } else {
      setSaveState('pending', 'not synced');
      console.warn('save deferred:', res.error);
    }
  }, 600);
}

/** Deleting has to leave a trace, or a merge with the other device
 *  resurrects whatever you just threw away. */
function tombstone(id) {
  if (!Array.isArray(state.tombstones)) state.tombstones = [];
  state.tombstones = state.tombstones.filter((t) => t.id !== id);
  state.tombstones.push({ id, at: Store.nowStamp() });
}

function normalizeState(s) {
  if (!s || typeof s !== 'object') s = {};
  if (!Array.isArray(s.items)) s.items = [];
  if (!Array.isArray(s.blueprints)) s.blueprints = [];
  if (!Array.isArray(s.tombstones)) s.tombstones = [];
  if (!Array.isArray(s.areas) || !s.areas.length) s.areas = DEFAULT_AREAS.slice();
  s.areas.forEach((a, i) => { if (!a.id) a.id = 'area-' + i; });
  return s;
}

async function syncNow() {
  setSaveState('saving', 'syncing…');
  const res = await Store.sync(state);
  state = normalizeState(res.state);
  render();
  if (res.ok) setSaveState('saved', 'synced ✓');
  else if (res.offline) setSaveState('pending', 'offline');
  else setSaveState('error', 'sync failed');
  if (res.error) console.warn('sync:', res.error);
}

/* ------------------------------------------------------- matching engine */

/* Two tiers. `exact` is what the thing literally is — its name and its tags,
 * whole. `derived` is what it can stand in for, inferred from the head noun.
 * Exact always wins when crediting an item, so "coriander" reports the
 * ground jar rather than the whole seeds. */
function itemTokens(item) {
  const exact = new Set();
  const derived = new Set();

  /* If the item's own name says dried/powdered, nothing about it generalises
   * — not even via a tag. "Black lime" is still a dried lime. */
  const preserved = norm(item.name).split(' ').some((w) => NEGATING.has(w));

  const add = (raw) => {
    const t = norm(raw);
    if (!t) return;
    exact.add(t);
    exact.add(singular(t));
    if (preserved) return;

    const words = t.split(' ').filter(Boolean);
    if (words.length < 2) return;
    if (words.some((w) => NEGATING.has(w) || CONNECTORS.has(w))) return;
    if (VERB_PREFIXES.has(words[0])) return;
    if (words.some((_, i) => MISLEADING_COMPOUNDS.has(words.slice(i).join(' ')))) return;

    /* Generalise to the head noun only — the last word. "Extra virgin olive
     * oil" is a kind of oil, so it answers `oil`. "Garlic powder" is a kind
     * of powder, not a kind of garlic, so it must not answer `garlic`. */
    const head = words[words.length - 1];
    if (STOP.has(head) || GENERIC.has(singular(head))) return;

    /* Risky heads invert the rule: allowlist, not blocklist. */
    const allowed = ALLOWED_VARIETIES[singular(head)];
    if (allowed && !words.slice(0, -1).some((w) => allowed.has(w))) return;

    derived.add(head);
    derived.add(singular(head));
  };

  add(item.name);
  (item.tags || []).forEach(add);
  return { exact, derived };
}

function inStock(item) {
  return item.qty == null || Number(item.qty) > 0;
}

/** Index of everything currently on hand, for fast requirement lookups. */
function buildIndex() {
  const exact = new Map();    // token -> the item that literally is this
  const derived = new Map();  // token -> an item that can stand in for it
  const phrases = [];         // [normalised name, item] for substring matches
  for (const it of state.items) {
    if (area !== 'all' && it.area !== area) continue;
    if (!inStock(it)) continue;
    const tok = itemTokens(it);
    /* When several items answer the same token, credit the plainest one —
     * `flour` should name your all-purpose bag, not the gluten-free one. */
    const keep = (map, t) => {
      const cur = map.get(t);
      if (!cur || norm(it.name).length < norm(cur.name).length) map.set(t, it);
    };
    for (const t of tok.exact) keep(exact, t);
    for (const t of tok.derived) keep(derived, t);
    phrases.push([norm(it.name), it]);
  }
  return { exact, derived, phrases };
}

/** `~parsley` -> optional. `butter|oil` -> either one satisfies it. */
function parseReq(raw, kind) {
  let s = String(raw || '').trim();
  const optional = s.startsWith('~');
  if (optional) s = s.slice(1);
  const alts = s.split('|').map((x) => norm(x)).filter(Boolean);
  return { kind, optional, alts, label: alts.join(' or ') };
}

function provider(token, idx) {
  const t = norm(token);
  if (!t) return null;
  const s = singular(t);
  for (const map of [idx.exact, idx.derived]) {
    if (map.has(t)) return map.get(t);
    if (map.has(s)) return map.get(s);
  }
  if (t.includes(' ')) {
    for (const [name, it] of idx.phrases) if (name.includes(t)) return it;
  }
  return null;
}

function evalBlueprint(bp, idx) {
  const reqs = [];
  for (const r of bp.needs || []) reqs.push(parseReq(r, 'need'));
  for (const r of bp.tools || []) reqs.push(parseReq(r, 'tool'));
  for (const req of reqs) {
    req.provider = null;
    for (const alt of req.alts) {
      const p = provider(alt, idx);
      if (p) { req.provider = p; break; }
    }
    req.have = !!req.provider;
  }
  const missing = reqs.filter((r) => !r.have && !r.optional);
  return { bp, reqs, missing, gap: missing.length };
}

function evaluateAll() {
  const idx = buildIndex();
  const list = state.blueprints
    .filter((bp) => area === 'all' || bp.area === area)
    .map((bp) => evalBlueprint(bp, idx));
  list.sort((a, b) => a.gap - b.gap || a.bp.name.localeCompare(b.bp.name));
  return list;
}

/* ------------------------------------------------------------- quick add */

/** "2 bag flour @pantry #baking" -> a real item. */
function parseQuick(text) {
  let s = text.trim();
  const tags = [];
  let location = '';

  s = s.replace(/#([\w\-]+)/g, (_, t) => { tags.push(t.replace(/-/g, ' ')); return ' '; });
  s = s.replace(/@([\w\- ]+?)(?=\s+[#@]|$)/g, (_, l) => { location = l.trim(); return ' '; });
  s = s.replace(/\s+/g, ' ').trim();

  let qty = 1;
  let unit = '';
  const m = s.match(/^(\d+(?:[.,]\d+)?|\d+\/\d+)\s+(.*)$/);
  if (m) {
    qty = m[1].includes('/')
      ? Number(m[1].split('/')[0]) / Number(m[1].split('/')[1])
      : Number(m[1].replace(',', '.'));
    s = m[2];
    const w = s.split(' ')[0];
    if (w && UNITS.has(w.toLowerCase()) && s.split(' ').length > 1) {
      unit = w.toLowerCase();
      s = s.slice(w.length).trim();
    }
  }

  if (!s) return null;
  const now = new Date().toISOString();
  return {
    id: uid('it'),
    name: s,
    area: area === 'all' ? state.areas[0].id : area,
    kind: quickKind,
    qty: qty,
    unit: unit,
    location: location,
    tags: tags,
    notes: '',
    added: now,
    updated: now,
  };
}

/* ------------------------------------------------------------- rendering */

function render() {
  renderAreas();
  document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));
  $('view-' + view).classList.remove('hidden');
  document.querySelectorAll('.tab').forEach((t) =>
    t.classList.toggle('active', t.dataset.view === view));

  const evals = evaluateAll();
  $('makeCount').textContent = evals.filter((e) => e.gap === 0).length;

  if (view === 'stock') renderStock();
  if (view === 'make') renderMake(evals);
  if (view === 'gaps') renderGaps(evals);
  if (view === 'blueprints') renderBlueprints();
}

function renderAreas() {
  const bar = $('areaBar');
  bar.innerHTML = '';
  const mk = (id, label) => {
    const b = el('button', 'areabtn' + (area === id ? ' active' : ''), label);
    b.onclick = () => { area = id; render(); };
    bar.appendChild(b);
  };
  mk('all', 'Everything');
  state.areas.forEach((a) => mk(a.id, a.name));
  const add = el('button', 'areabtn add', '+ area');
  add.onclick = () => {
    const name = prompt('New area (an emoji at the front is nice):');
    if (!name || !name.trim()) return;
    const id = norm(name).replace(/ /g, '-') || uid('area');
    if (state.areas.some((a) => a.id === id)) return;
    state.areas.push({ id, name: name.trim(), updated: Store.nowStamp() });
    area = id;
    save(); render();
  };
  bar.appendChild(add);
}

function itemsInScope() {
  return state.items.filter((it) => area === 'all' || it.area === area);
}

function renderStock() {
  const box = $('stockList');
  box.innerHTML = '';
  const q = norm($('search').value);
  const hideOut = $('hideOut').checked;

  let items = itemsInScope();
  if (q) {
    items = items.filter((it) =>
      norm(it.name).includes(q) ||
      norm(it.location).includes(q) ||
      (it.tags || []).some((t) => norm(t).includes(q)));
  }
  if (hideOut) items = items.filter(inStock);

  const all = itemsInScope();
  $('stockCounts').textContent =
    `${all.filter((i) => i.kind !== 'durable').length} supplies · ` +
    `${all.filter((i) => i.kind === 'durable').length} gear · ` +
    `${all.filter((i) => !inStock(i)).length} out`;

  if (!items.length) {
    const e = el('div', 'empty');
    e.appendChild(el('strong', null, all.length ? 'Nothing matches.' : 'Nothing here yet.'));
    e.appendChild(el('div', null, all.length
      ? 'Try a different search.'
      : 'Add your first item above — start with what you can see right now.'));
    box.appendChild(e);
    return;
  }

  const groups = [
    ['Supplies', items.filter((i) => i.kind !== 'durable')],
    ['Gear', items.filter((i) => i.kind === 'durable')],
  ];
  for (const [title, list] of groups) {
    if (!list.length) continue;
    list.sort((a, b) => a.name.localeCompare(b.name));
    const g = el('div', 'group');
    const h = el('div', 'group-head');
    h.appendChild(el('h2', null, title));
    h.appendChild(el('span', 'n', String(list.length)));
    g.appendChild(h);
    list.forEach((it) => g.appendChild(itemRow(it)));
    box.appendChild(g);
  }
}

function itemRow(it) {
  const row = el('div', 'item' + (inStock(it) ? '' : ' out'));

  const qtyCls = it.kind === 'durable' ? 'gear'
    : !inStock(it) ? 'zero'
    : Number(it.qty) <= 0.34 ? 'low' : '';
  const qtyText = !inStock(it) ? 'out'
    : fmtQty(it.qty) + (it.unit ? ' ' + it.unit : '');
  row.appendChild(el('span', 'qty ' + qtyCls, qtyText));

  row.appendChild(el('span', 'item-emoji', emojiFor(it)));

  const main = el('div', 'item-main');
  main.appendChild(el('div', 'item-name', it.name));
  const meta = el('div', 'item-meta');
  if (area === 'all') meta.appendChild(el('span', null, areaName(it.area)));
  if (it.location) meta.appendChild(el('span', null, '· ' + it.location));
  (it.tags || []).forEach((t) => meta.appendChild(el('span', 'tagchip', t)));
  if (it.notes) meta.appendChild(el('span', null, '· ' + it.notes));
  if (meta.children.length) main.appendChild(meta);
  row.appendChild(main);

  const btns = el('div', 'rowbtns');
  const add = el('button', 'iconbtn', '+');
  add.title = 'Add one';
  add.onclick = () => {
    it.qty = (Number(it.qty) || 0) + 1;
    it.updated = new Date().toISOString();
    save(); render();
  };
  const use = el('button', 'iconbtn', '−');
  use.title = 'Used some of it';
  use.onclick = () => openUse(it);
  const edit = el('button', 'iconbtn', '✎');
  edit.title = 'Edit';
  edit.onclick = () => openEdit(it);
  const del = el('button', 'iconbtn danger', '🗑');
  del.title = 'Delete this item entirely';
  del.onclick = () => {
    if (!confirm(`Delete "${it.name}" from the inventory?\n\n` +
                 `To say you ran out but keep it on the list, use − → Mark out of stock.`)) return;
    tombstone(it.id);
    state.items = state.items.filter((x) => x.id !== it.id);
    save(); render();
  };
  [add, use, edit, del].forEach((b) => btns.appendChild(b));
  row.appendChild(btns);
  return row;
}

function renderMake(evals) {
  const box = $('makeList');
  box.innerHTML = '';
  const q = norm($('makeSearch').value);
  const showAll = $('showAllMake').checked;

  let list = evals;
  if (q) list = list.filter((e) => norm(e.bp.name).includes(q) ||
                                   (e.bp.tags || []).some((t) => norm(t).includes(q)));

  const buckets = [
    ['Ready now', list.filter((e) => e.gap === 0), 'ready'],
    ['One thing short', list.filter((e) => e.gap === 1), 'close'],
    ['Two things short', list.filter((e) => e.gap === 2), ''],
  ];
  if (showAll) buckets.push(['Further off', list.filter((e) => e.gap >= 3), '']);

  if (!list.length) {
    box.appendChild(emptyBox('No blueprints yet.',
      'Add some in the Blueprints tab — or switch area to Everything.'));
    return;
  }

  for (const [title, items, cls] of buckets) {
    if (!items.length) continue;
    const g = el('div', 'group');
    const h = el('div', 'group-head');
    h.appendChild(el('h2', null, title));
    h.appendChild(el('span', 'n', String(items.length)));
    g.appendChild(h);
    const cards = el('div', 'cards');
    items.forEach((e) => cards.appendChild(makeCard(e, cls)));
    g.appendChild(cards);
    box.appendChild(g);
  }

  const hidden = list.filter((e) => e.gap >= 3).length;
  if (hidden && !showAll) {
    box.appendChild(el('p', 'hint',
      `${hidden} more are three or more things away — tick "show everything" to see them.`));
  }
}

function makeCard(e, cls) {
  const c = el('div', 'card ' + cls);
  c.appendChild(el('h3', null,
    emojiFor({ name: e.bp.name, tags: e.bp.tags || [] }) + '  ' + e.bp.name));
  const note = [areaName(e.bp.area)].concat(e.bp.tags || []).join(' · ');
  c.appendChild(el('div', 'area-note', note));

  const reqs = el('div', 'reqs');
  for (const r of e.reqs) {
    const chip = el('span', 'req ' +
      (r.have ? 'have' : r.optional ? 'opt' : 'miss') +
      (r.kind === 'tool' ? ' tool' : ''), r.label);
    if (r.have) chip.title = 'You have: ' + r.provider.name;
    else if (r.optional) chip.title = 'Optional — not blocking';
    else chip.title = 'Missing';
    reqs.appendChild(chip);
  }
  c.appendChild(reqs);

  if (e.gap === 0) {
    c.appendChild(el('div', 'card-foot', '✓ everything required is on hand'));
  } else {
    c.appendChild(el('div', 'card-foot',
      'Need: ' + e.missing.map((r) => r.label).join(', ')));
  }
  return c;
}

function renderGaps(evals) {
  const box = $('gapList');
  box.innerHTML = '';

  /* A gap is credited to every alternative that would satisfy it, because
   * buying any one of them clears the requirement. */
  const gaps = new Map();
  for (const e of evals) {
    if (!e.gap) continue;
    for (const r of e.missing) {
      for (const alt of r.alts) {
        if (!gaps.has(alt)) {
          gaps.set(alt, { token: alt, finishes: [], appears: 0, tool: 0, need: 0 });
        }
        const g = gaps.get(alt);
        g.appears += 1;
        g[r.kind] += 1;
        if (e.gap === 1) g.finishes.push(e.bp.name);
      }
    }
  }

  const list = [...gaps.values()].sort((a, b) =>
    b.finishes.length - a.finishes.length ||
    b.appears - a.appears ||
    a.token.localeCompare(b.token));

  if (!list.length) {
    box.appendChild(emptyBox('No gaps.',
      evals.length
        ? 'Every blueprint in this area is fully covered by what you own.'
        : 'Add blueprints first — gaps are measured against them.'));
    return;
  }

  list.slice(0, 40).forEach((g, i) => {
    const row = el('div', 'gap');
    row.appendChild(el('div', 'gap-rank', String(i + 1)));
    const main = el('div', 'gap-main');
    main.appendChild(el('div', 'gap-name',
      emojiFor({ name: g.token, kind: g.tool > g.need ? 'durable' : 'consumable' }) +
      '  ' + g.token));

    const why = el('div', 'gap-why');
    if (g.finishes.length) {
      why.innerHTML = `Get this one thing and <b>${g.finishes.length}</b> ` +
        `${g.finishes.length === 1 ? 'thing becomes' : 'things become'} makeable immediately.`;
    } else {
      why.innerHTML = `Blocks <b>${g.appears}</b> ` +
        `${g.appears === 1 ? 'blueprint' : 'blueprints'}, but none of them are ` +
        `waiting on this alone.`;
    }
    main.appendChild(why);

    if (g.finishes.length) {
      main.appendChild(el('div', 'gap-unlocks',
        g.finishes.slice(0, 6).join(' · ') +
        (g.finishes.length > 6 ? ` · +${g.finishes.length - 6} more` : '')));
    }
    row.appendChild(main);

    const add = el('button', 'ghost', 'I have it');
    add.title = 'Add it to your stock now';
    add.onclick = () => {
      const now = new Date().toISOString();
      state.items.push({
        id: uid('it'), name: g.token,
        area: area === 'all' ? state.areas[0].id : area,
        kind: g.tool > g.need ? 'durable' : 'consumable',
        qty: 1, unit: '', location: '', tags: [], notes: '',
        added: now, updated: now,
      });
      save(); render();
    };
    row.appendChild(add);
    box.appendChild(row);
  });

  if (list.length > 40) {
    box.appendChild(el('p', 'hint', `Showing the top 40 of ${list.length} gaps.`));
  }
}

function renderBlueprints() {
  const box = $('bpList');
  box.innerHTML = '';
  const q = norm($('bpSearch').value);

  let list = state.blueprints.filter((bp) => area === 'all' || bp.area === area);
  $('bpCounts').textContent = `${list.length} in view · ${state.blueprints.length} total`;
  if (q) list = list.filter((bp) => norm(bp.name).includes(q));
  list.sort((a, b) => a.name.localeCompare(b.name));

  if (!list.length) {
    box.appendChild(emptyBox('No blueprints here.', 'Add one with the form above.'));
    return;
  }

  for (const bp of list) {
    const row = el('div', 'bp');
    const main = el('div', 'bp-main');
    main.appendChild(el('div', 'bp-name', bp.name));
    const bits = [];
    if ((bp.needs || []).length) bits.push('needs: ' + bp.needs.join(', '));
    if ((bp.tools || []).length) bits.push('tools: ' + bp.tools.join(', '));
    main.appendChild(el('div', 'bp-req', bits.join('  ·  ') || 'no requirements'));
    row.appendChild(main);

    const btns = el('div', 'rowbtns');
    const edit = el('button', 'iconbtn', '✎');
    edit.title = 'Edit';
    edit.onclick = () => loadBpForm(bp);
    const del = el('button', 'iconbtn danger', '🗑');
    del.title = 'Delete blueprint';
    del.onclick = () => {
      if (!confirm(`Delete the blueprint "${bp.name}"?`)) return;
      tombstone(bp.id);
      state.blueprints = state.blueprints.filter((x) => x.id !== bp.id);
      save(); render();
    };
    btns.appendChild(edit); btns.appendChild(del);
    row.appendChild(btns);
    box.appendChild(row);
  }
}

function emptyBox(title, sub) {
  const e = el('div', 'empty');
  e.appendChild(el('strong', null, title));
  e.appendChild(el('div', null, sub));
  return e;
}

/* ------------------------------------------------------ use / edit modals */

let useTarget = null;

function openUse(it) {
  useTarget = it;
  $('useTitle').textContent = 'Used some ' + it.name;
  const unit = it.unit ? ' ' + it.unit : '';
  $('useSub').textContent = `You have ${fmtQty(it.qty)}${unit}. ` +
    `Take a bite out of it — the item stays on your list.`;

  const quick = $('useQuick');
  quick.innerHTML = '';
  const cur = Number(it.qty) || 0;
  const steps = [0.25, 0.5, 1, 2, 5].filter((s) => s <= cur);
  for (const s of steps) {
    const b = el('button', null, '−' + (s === 0.25 ? '¼' : s === 0.5 ? '½' : s));
    b.onclick = () => applyUse(Math.max(0, cur - s));
    quick.appendChild(b);
  }
  const half = el('button', null, 'Half of it left');
  half.onclick = () => applyUse(Math.round((cur / 2) * 100) / 100);
  quick.appendChild(half);

  $('useExact').value = fmtQty(it.qty);
  $('useModal').classList.remove('hidden');
  $('useExact').focus();
}

function applyUse(newQty) {
  if (!useTarget) return;
  useTarget.qty = Math.max(0, Number(newQty) || 0);
  useTarget.updated = new Date().toISOString();
  closeModal('useModal');
  useTarget = null;
  save(); render();
}

function openEdit(it) {
  $('editId').value = it.id;
  $('editName').value = it.name;
  $('editEmoji').value = it.emoji || '';
  $('editEmoji').placeholder = emojiFor(it);
  $('editQty').value = it.qty == null ? '' : it.qty;
  $('editUnit').value = it.unit || '';
  $('editLoc').value = it.location || '';
  $('editTags').value = (it.tags || []).join(', ');
  $('editNotes').value = it.notes || '';
  $('editKind').value = it.kind === 'durable' ? 'durable' : 'consumable';
  fillAreaSelect($('editArea'), it.area);
  $('editModal').classList.remove('hidden');
  $('editName').focus();
}

function fillAreaSelect(sel, chosen) {
  sel.innerHTML = '';
  for (const a of state.areas) {
    const o = document.createElement('option');
    o.value = a.id; o.textContent = a.name;
    if (a.id === chosen) o.selected = true;
    sel.appendChild(o);
  }
}

function closeModal(id) { $(id).classList.add('hidden'); }

/* ------------------------------------------------------- blueprint form */

function splitList(s) {
  return String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
}

function loadBpForm(bp) {
  $('bpId').value = bp.id;
  $('bpName').value = bp.name;
  $('bpNeeds').value = (bp.needs || []).join(', ');
  $('bpTools').value = (bp.tools || []).join(', ');
  $('bpTags').value = (bp.tags || []).join(', ');
  fillAreaSelect($('bpArea'), bp.area);
  $('bpSubmit').textContent = 'Save changes';
  $('bpCancel').hidden = false;
  $('bpName').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetBpForm() {
  $('bpId').value = '';
  $('bpForm').reset();
  fillAreaSelect($('bpArea'), area === 'all' ? state.areas[0].id : area);
  $('bpSubmit').textContent = 'Add blueprint';
  $('bpCancel').hidden = true;
}

/* --------------------------------------------------------------- wiring */

function wire() {
  document.querySelectorAll('.tab').forEach((t) => {
    t.onclick = () => {
      view = t.dataset.view;
      if (view === 'blueprints') resetBpForm();
      render();
    };
  });

  document.querySelectorAll('.kind').forEach((b) => {
    b.onclick = () => {
      quickKind = b.dataset.kind;
      document.querySelectorAll('.kind').forEach((x) =>
        x.classList.toggle('active', x === b));
      $('quickInput').focus();
    };
  });

  $('quickAdd').onsubmit = (ev) => {
    ev.preventDefault();
    const item = parseQuick($('quickInput').value);
    if (!item) return;
    state.items.push(item);
    $('quickInput').value = '';
    save(); render();
  };

  $('search').oninput = renderStock;
  $('hideOut').onchange = renderStock;
  $('makeSearch').oninput = () => renderMake(evaluateAll());
  $('showAllMake').onchange = () => renderMake(evaluateAll());
  $('bpSearch').oninput = renderBlueprints;

  // use modal
  $('useCancel').onclick = () => { closeModal('useModal'); useTarget = null; };
  $('useSave').onclick = () => applyUse($('useExact').value);
  $('useOut').onclick = () => applyUse(0);
  $('useExact').onkeydown = (e) => { if (e.key === 'Enter') applyUse($('useExact').value); };

  // edit modal
  $('editCancel').onclick = () => closeModal('editModal');
  $('editSave').onclick = () => {
    const it = state.items.find((x) => x.id === $('editId').value);
    if (!it) return closeModal('editModal');
    it.name = $('editName').value.trim() || it.name;
    const em = $('editEmoji').value.trim();
    if (em) it.emoji = em; else delete it.emoji;   // blank = back to automatic
    const q = $('editQty').value;
    it.qty = q === '' ? 0 : Math.max(0, Number(q) || 0);
    it.unit = $('editUnit').value.trim();
    it.location = $('editLoc').value.trim();
    it.tags = splitList($('editTags').value);
    it.notes = $('editNotes').value.trim();
    it.area = $('editArea').value;
    it.kind = $('editKind').value;
    it.updated = new Date().toISOString();
    closeModal('editModal');
    save(); render();
  };
  $('editDelete').onclick = () => {
    const it = state.items.find((x) => x.id === $('editId').value);
    if (!it) return closeModal('editModal');
    if (!confirm(`Delete "${it.name}" from the inventory?`)) return;
    tombstone(it.id);
    state.items = state.items.filter((x) => x.id !== it.id);
    closeModal('editModal');
    save(); render();
  };

  // blueprint form
  $('bpForm').onsubmit = (ev) => {
    ev.preventDefault();
    const id = $('bpId').value;
    const data = {
      name: $('bpName').value.trim(),
      area: $('bpArea').value,
      needs: splitList($('bpNeeds').value),
      tools: splitList($('bpTools').value),
      tags: splitList($('bpTags').value),
    };
    if (!data.name) return;
    if (id) {
      const bp = state.blueprints.find((x) => x.id === id);
      if (bp) Object.assign(bp, data, { updated: Store.nowStamp() });
    } else {
      state.blueprints.push(Object.assign({ id: uid('bp') }, data,
                                          { updated: Store.nowStamp() }));
    }
    resetBpForm();
    save(); render();
  };
  $('bpCancel').onclick = resetBpForm;

  // export / import
  $('btnExport').onclick = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inventory-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  $('btnImport').onclick = () => $('importFile').click();
  $('importFile').onchange = async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    try {
      const next = JSON.parse(await file.text());
      if (!Array.isArray(next.items)) throw new Error('no items list');
      if (!confirm(`Replace everything with this file?\n\n` +
                   `${next.items.length} items, ${(next.blueprints || []).length} blueprints.\n` +
                   `Your current data stays in backups/.`)) return;
      state = next;
      if (!Array.isArray(state.areas) || !state.areas.length) state.areas = DEFAULT_AREAS.slice();
      save(); render();
    } catch (err) {
      alert('That file did not look like an Inventory export.\n\n' + err.message);
    }
    ev.target.value = '';
  };

  // theme
  if (localStorage.getItem('inventory_theme') === 'dark') document.body.classList.add('dark');
  $('btnTheme').onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('inventory_theme',
      document.body.classList.contains('dark') ? 'dark' : 'light');
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('useModal'); closeModal('editModal'); useTarget = null;
    }
  });
  document.querySelectorAll('.modal').forEach((m) => {
    m.onclick = (e) => { if (e.target === m) { m.classList.add('hidden'); useTarget = null; } };
  });
}

/* ----------------------------------------------------------------- boot */

function wireSync() {
  $('btnSync').onclick = syncNow;
  $('btnSettings').onclick = openSetup;

  $('cfgCancel').onclick = () => closeModal('setupModal');
  $('cfgForget').onclick = () => {
    if (!confirm('Sign out on this device?\n\nYour inventory stays safe on ' +
                 'GitHub — this only forgets the token here.')) return;
    Store.forgetToken();
    closeModal('setupModal');
    location.reload();
  };
  $('cfgSave').onclick = async () => {
    const owner = $('cfgOwner').value.trim();
    const repo = $('cfgRepo').value.trim();
    const token = $('cfgToken').value.trim();
    if (!owner || !repo || !token) {
      $('setupMsg').textContent = 'All three are needed.';
      return;
    }
    $('setupMsg').textContent = 'Checking…';
    const stuck = Store.setGitHubConfig(
      { owner, repo, path: 'inventory.json', branch: 'main' }, token);
    if (!stuck || !Store.storagePersists()) {
      $('setupMsg').innerHTML =
        '<b>This browser isn\'t saving the login.</b> You\'re almost ' +
        'certainly in <b>Private Browsing</b> — turn it off (Safari: tap the ' +
        'tabs icon, then “Private” → switch to a normal tab), reopen this ' +
        'page, and connect once more. After that it stays signed in.';
      return;
    }
    try {
      const { state: remote } = await Store.github.load();
      if (remote) {
        state = normalizeState(remote);
        closeModal('setupModal');
        render();
        setSaveState('saved', 'connected ✓');
        return;
      }
      // Empty repo. If this device happens to hold an inventory, offer to
      // upload it; otherwise point them at the reliable path.
      const local = Store.cached() || state;
      const n = (local.items || []).length;
      if (n && confirm(`Connected — but the repo has no inventory.json yet.\n\n` +
                       `Upload the ${n} items on this device to start it off?`)) {
        const res = await Store.seed(normalizeState(local));
        $('setupMsg').textContent = res.ok
          ? 'Uploaded — you\'re live.' : 'Upload failed: ' + res.error;
        if (res.ok) { closeModal('setupModal'); render(); }
      } else {
        $('setupMsg').innerHTML =
          'Connected, but the repo has no <code>inventory.json</code> yet. ' +
          'Upload it to the repo (drag the file onto the repo page on github.com), ' +
          'then reopen this.';
      }
    } catch (err) {
      $('setupMsg').textContent = err.message;
    }
  };

  window.addEventListener('online', () => { if (Store.isDirty()) syncNow(); });
  window.addEventListener('offline', () => setSaveState('pending', 'offline'));

  // Coming back to the app is the moment your partner's changes matter most.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Store.mode() === 'github' && navigator.onLine) syncNow();
  });
}

function openSetup() {
  const cfg = Store.github.cfg() || {};
  $('cfgOwner').value = cfg.owner || '';
  $('cfgRepo').value = cfg.repo || '';
  $('cfgToken').value = '';
  $('setupMsg').textContent = Store.mode() === 'local'
    ? 'This device is talking to the local server, so it does not need any of this. ' +
      'Set it up to reach the same inventory from your phone.'
    : '';
  $('cfgForget').hidden = !Store.github.configured();
  $('setupSteps').hidden = Store.github.configured();
  $('setupModal').classList.remove('hidden');
}

(async function boot() {
  let res;
  try {
    res = await Store.init();
  } catch (err) {
    res = { state: Store.cached(), error: err.message };
  }

  state = normalizeState(res.state);
  wire();
  wireSync();
  resetBpForm();
  render();

  if (res.needsSetup) {
    openSetup();
    setSaveState('pending', 'not connected');
  } else if (res.offline) {
    setSaveState('pending', 'offline');
  } else if (res.error) {
    setSaveState('error', 'sync problem');
    console.warn(res.error);
  } else {
    setSaveState('', '');
  }

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* fine without it */ });
  }

  if (!res.needsSetup) $('quickInput').focus();
})();
