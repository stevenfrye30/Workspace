// Earth — base map + a small, growing set of overlay layers.
//
// Each entry in LAYERS is a self-contained add/remove pair. To add a real
// overlay later: write its add(map)/remove(map), flip status to 'ready',
// and it shows up as a working checkbox with no other wiring. Everything
// still marked 'planned' is a visible placeholder for what's coming —
// the roadmap lives in this list, not in a separate doc.

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

const GRATICULE_SOURCE = 'graticule';
const GRATICULE_LAYER = 'graticule-lines';
const GRATICULE_LABEL_LAYER = 'graticule-labels';

function formatLon(lon) {
  if (lon === 0) return '0°';
  if (lon === 180 || lon === -180) return '180°';
  return lon > 0 ? `${lon}°E` : `${-lon}°W`;
}

function formatLat(lat) {
  if (lat === 0) return '0°';
  return lat > 0 ? `${lat}°N` : `${-lat}°S`;
}

function buildGraticule(stepDeg, segmentDeg) {
  const features = [];

  for (let lon = -180; lon <= 180; lon += stepDeg) {
    const coords = [];
    for (let lat = -85; lat <= 85; lat += segmentDeg) coords.push([lon, lat]);
    features.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords },
      properties: { kind: 'meridian', major: lon === 0, label: formatLon(lon) },
    });
  }

  for (let lat = -80; lat <= 80; lat += stepDeg) {
    const coords = [];
    for (let lon = -180; lon <= 180; lon += segmentDeg) coords.push([lon, lat]);
    features.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords },
      properties: { kind: 'parallel', major: lat === 0, label: formatLat(lat) },
    });
  }

  return { type: 'FeatureCollection', features };
}

function addGraticule(map) {
  if (map.getSource(GRATICULE_SOURCE)) return;
  map.addSource(GRATICULE_SOURCE, {
    type: 'geojson',
    data: buildGraticule(10, 2),
  });
  map.addLayer({
    id: GRATICULE_LAYER,
    type: 'line',
    source: GRATICULE_SOURCE,
    paint: {
      'line-color': '#ff5a36',
      'line-width': ['case', ['get', 'major'], 1.6, 0.6],
      'line-opacity': ['case', ['get', 'major'], 0.85, 0.45],
    },
  });
  map.addLayer({
    id: GRATICULE_LABEL_LAYER,
    type: 'symbol',
    source: GRATICULE_SOURCE,
    layout: {
      'symbol-placement': 'line',
      'symbol-spacing': 300,
      'text-field': ['get', 'label'],
      'text-size': 11,
      'text-font': ['Noto Sans Regular'],
    },
    paint: {
      'text-color': '#ff5a36',
      'text-halo-color': 'rgba(255, 255, 255, 0.9)',
      'text-halo-width': 1.2,
    },
  });
}

function removeGraticule(map) {
  if (map.getLayer(GRATICULE_LABEL_LAYER)) map.removeLayer(GRATICULE_LABEL_LAYER);
  if (map.getLayer(GRATICULE_LAYER)) map.removeLayer(GRATICULE_LAYER);
  if (map.getSource(GRATICULE_SOURCE)) map.removeSource(GRATICULE_SOURCE);
}

// --- Countries (UN view) --------------------------------------------------
// Every country/territory Natural Earth draws (~242 shapes), classified by
// UN status. See data/build_countries.py for how the classification is
// derived and why it isn't a straight ISO-code lookup.

const COUNTRIES_SOURCE = 'countries';
const COUNTRIES_FILL_LAYER = 'countries-fill';
const COUNTRIES_LINE_LAYER = 'countries-line';
const COUNTRIES_DATA_URL = 'data/countries.geojson';

const STATUS_COLORS = { member: '#2f6fdb', observer: '#caa23c', other: '#8a8a8a' };
const STATUS_LABELS = { member: 'UN member state', observer: 'UN permanent observer', other: 'Other territory — not a UN member' };
const STATUS_SHORT = { member: 'Member', observer: 'Observer', other: 'Other' };
const STATUS_COLOR_EXPR = [
  'match', ['get', 'un_status'],
  'member', STATUS_COLORS.member,
  'observer', STATUS_COLORS.observer,
  STATUS_COLORS.other,
];

let countriesDataPromise = null;
function loadCountriesData() {
  if (!countriesDataPromise) countriesDataPromise = fetch(COUNTRIES_DATA_URL).then((r) => r.json());
  return countriesDataPromise;
}

// Keep fills under the basemap's place labels so names stay legible.
function firstSymbolLayerId(map) {
  const layer = map.getStyle().layers.find((l) => l.type === 'symbol');
  return layer && layer.id;
}

function addCountries(map) {
  loadCountriesData().then((data) => {
    if (map.getSource(COUNTRIES_SOURCE)) return;
    map.addSource(COUNTRIES_SOURCE, { type: 'geojson', data });
    const beforeId = firstSymbolLayerId(map);
    map.addLayer({
      id: COUNTRIES_FILL_LAYER,
      type: 'fill',
      source: COUNTRIES_SOURCE,
      paint: { 'fill-color': STATUS_COLOR_EXPR, 'fill-opacity': 0.42 },
    }, beforeId);
    map.addLayer({
      id: COUNTRIES_LINE_LAYER,
      type: 'line',
      source: COUNTRIES_SOURCE,
      paint: { 'line-color': STATUS_COLOR_EXPR, 'line-width': 1, 'line-opacity': 0.9 },
    }, beforeId);
  });
}

function removeCountries(map) {
  if (map.getLayer(COUNTRIES_FILL_LAYER)) map.removeLayer(COUNTRIES_FILL_LAYER);
  if (map.getLayer(COUNTRIES_LINE_LAYER)) map.removeLayer(COUNTRIES_LINE_LAYER);
  if (map.getSource(COUNTRIES_SOURCE)) map.removeSource(COUNTRIES_SOURCE);
}

// --- Country areas (km^2 / mi^2) ------------------------------------------
// Same shapes and same source data as the UN-view layer, shaded by land
// area instead of UN status. Area is computed once, in build_countries.py,
// from the *un-simplified* Natural Earth geometry (see that script for why).

const AREA_SOURCE = 'countries-area';
const AREA_FILL_LAYER = 'countries-area-fill';
const AREA_LINE_LAYER = 'countries-area-line';
const KM2_PER_MI2 = 2.58999;

// Stops are in log10(km^2): -1 (~0.1 km^2, Vatican-scale) up to 7.3 (~20M
// km^2, Russia-scale) — area spans too many orders of magnitude for a
// linear scale to show anything but one giant country.
const AREA_COLOR_EXPR = [
  'interpolate', ['linear'], ['get', 'area_log10'],
  -1, '#f7fcf5',
  0, '#c7e9c0',
  2, '#74c476',
  4.5, '#238b45',
  7.3, '#00441b',
];

function addArea(map) {
  loadCountriesData().then((data) => {
    if (map.getSource(AREA_SOURCE)) return;
    map.addSource(AREA_SOURCE, { type: 'geojson', data });
    const beforeId = firstSymbolLayerId(map);
    map.addLayer({
      id: AREA_FILL_LAYER,
      type: 'fill',
      source: AREA_SOURCE,
      paint: { 'fill-color': AREA_COLOR_EXPR, 'fill-opacity': 0.55 },
    }, beforeId);
    map.addLayer({
      id: AREA_LINE_LAYER,
      type: 'line',
      source: AREA_SOURCE,
      paint: { 'line-color': '#0b2e18', 'line-width': 0.6, 'line-opacity': 0.5 },
    }, beforeId);
  });
}

function removeArea(map) {
  if (map.getLayer(AREA_FILL_LAYER)) map.removeLayer(AREA_FILL_LAYER);
  if (map.getLayer(AREA_LINE_LAYER)) map.removeLayer(AREA_LINE_LAYER);
  if (map.getSource(AREA_SOURCE)) map.removeSource(AREA_SOURCE);
}

function fmtArea(km2) {
  const mi2 = km2 / KM2_PER_MI2;
  const round = (n) => (n < 10 ? n.toFixed(2) : Math.round(n).toLocaleString());
  return { km2: round(km2), mi2: round(mi2) };
}

// --- Population (current) --------------------------------------------------
// Same shapes again, shaded by population instead of area or UN status.
// pop_current comes from the World Bank's SP.POP.TOTL, refetched live by
// build_countries.py on every run — not Natural Earth's one-time POP_EST
// snapshot. A small set of territories the World Bank doesn't track (Vatican
// City, Taiwan, Western Sahara, Antarctica…) fall back to that NE estimate;
// pop_source on each feature says which one you're looking at.

const POP_SOURCE = 'countries-pop';
const POP_FILL_LAYER = 'countries-pop-fill';
const POP_LINE_LAYER = 'countries-pop-line';
const POP_SOURCE_LABELS = { worldbank: 'World Bank', natural_earth_est: 'Natural Earth (older estimate)' };

// Stops are in log10(population): 2.5 (~300, smallest inhabited territories)
// up to 9.2 (~1.6B, India/China-scale) — population spans too many orders of
// magnitude for a linear scale to show anything but one giant country.
const POP_COLOR_EXPR = [
  'interpolate', ['linear'], ['get', 'pop_log10'],
  2.5, '#f2f0f7',
  4, '#cbc9e2',
  6, '#9e9ac8',
  7.5, '#6a51a3',
  9.2, '#3f007d',
];

function addPopulation(map) {
  loadCountriesData().then((data) => {
    if (map.getSource(POP_SOURCE)) return;
    map.addSource(POP_SOURCE, { type: 'geojson', data });
    const beforeId = firstSymbolLayerId(map);
    map.addLayer({
      id: POP_FILL_LAYER,
      type: 'fill',
      source: POP_SOURCE,
      paint: { 'fill-color': POP_COLOR_EXPR, 'fill-opacity': 0.55 },
    }, beforeId);
    map.addLayer({
      id: POP_LINE_LAYER,
      type: 'line',
      source: POP_SOURCE,
      paint: { 'line-color': '#1a0f33', 'line-width': 0.6, 'line-opacity': 0.5 },
    }, beforeId);
  });
}

function removePopulation(map) {
  if (map.getLayer(POP_FILL_LAYER)) map.removeLayer(POP_FILL_LAYER);
  if (map.getLayer(POP_LINE_LAYER)) map.removeLayer(POP_LINE_LAYER);
  if (map.getSource(POP_SOURCE)) map.removeSource(POP_SOURCE);
}

function fmtPop(props) {
  const n = props.pop_current;
  return {
    count: n > 0 ? Math.round(n).toLocaleString() : '0',
    year: props.pop_year || '—',
    source: POP_SOURCE_LABELS[props.pop_source] || '—',
  };
}

// --- Population density -----------------------------------------------
// pop_density_km2 (= pop_current / area_km2) is precomputed in
// build_countries.py so it inherits both upstream caveats honestly:
// the same micro-state area-oversizing that understates Monaco/Vatican's
// true density, and — for the ~28 pop_source="natural_earth_est"
// territories — POP_EST's staleness rather than a current figure.

const DENSITY_SOURCE = 'countries-density';
const DENSITY_FILL_LAYER = 'countries-density-fill';
const DENSITY_LINE_LAYER = 'countries-density-line';

// Stops are in log10(people/km^2): -1 (~0.1, near-empty) up to 4.5 (~31,600,
// Macau-scale) — density spans too many orders of magnitude for a linear
// scale to show anything but one outlier city-state.
const DENSITY_COLOR_EXPR = [
  'interpolate', ['linear'], ['get', 'pop_density_log10'],
  -1, '#ffffe5',
  0.5, '#fed98e',
  2, '#fe9929',
  3, '#d95f0e',
  4.5, '#993404',
];

function addPopulationDensity(map) {
  loadCountriesData().then((data) => {
    if (map.getSource(DENSITY_SOURCE)) return;
    map.addSource(DENSITY_SOURCE, { type: 'geojson', data });
    const beforeId = firstSymbolLayerId(map);
    map.addLayer({
      id: DENSITY_FILL_LAYER,
      type: 'fill',
      source: DENSITY_SOURCE,
      paint: { 'fill-color': DENSITY_COLOR_EXPR, 'fill-opacity': 0.55 },
    }, beforeId);
    map.addLayer({
      id: DENSITY_LINE_LAYER,
      type: 'line',
      source: DENSITY_SOURCE,
      paint: { 'line-color': '#4a2511', 'line-width': 0.6, 'line-opacity': 0.5 },
    }, beforeId);
  });
}

function removePopulationDensity(map) {
  if (map.getLayer(DENSITY_FILL_LAYER)) map.removeLayer(DENSITY_FILL_LAYER);
  if (map.getLayer(DENSITY_LINE_LAYER)) map.removeLayer(DENSITY_LINE_LAYER);
  if (map.getSource(DENSITY_SOURCE)) map.removeSource(DENSITY_SOURCE);
}

// --- Unified legend + detail panel ----------------------------------------
// Every country-shaped data layer (countries/area/population/density)
// declares a `legend` (compact swatches-or-gradient summary) and
// `detailFields` (rows for the click-to-inspect card) instead of owning its
// own block. With N of them checked at once, their legends stack as N
// tight rows in one panel and their detail fields stack as N row-groups in
// one card — "one over the other" for any combination, not just a
// hardcoded pair. Field order follows LAYERS array order, so (for example)
// the Countries layer's Region always lands before the Population layer's
// fields, for any set of layers active together.

function buildGradientLegend(gradientClass, stats) {
  const wrap = document.createElement('div');
  const bar = document.createElement('div');
  bar.className = gradientClass;
  wrap.appendChild(bar);
  const labels = document.createElement('div');
  labels.className = 'legend-gradient-labels';
  const small = document.createElement('span');
  small.textContent = 'smaller';
  const large = document.createElement('span');
  large.textContent = 'larger';
  labels.appendChild(small);
  labels.appendChild(large);
  wrap.appendChild(labels);
  stats.forEach(({ label, text }) => {
    const p = document.createElement('p');
    p.className = 'legend-stat';
    p.textContent = `${label}: ${text}`;
    wrap.appendChild(p);
  });
  return wrap;
}

function buildDetailRow(field) {
  const p = document.createElement('p');
  p.className = 'country-row';
  if (field.swatch) {
    const sw = document.createElement('span');
    sw.className = 'swatch';
    sw.style.background = field.swatch;
    p.appendChild(sw);
    p.appendChild(document.createTextNode(field.text));
  } else {
    const k = document.createElement('span');
    k.className = 'k';
    k.textContent = field.label;
    const v = document.createElement('span');
    v.textContent = field.value;
    p.appendChild(k);
    p.appendChild(v);
  }
  return p;
}

function dataLayersChecked(key) {
  return LAYERS.filter((l) => l.status === 'ready' && l[key] && document.getElementById(`layer-${l.id}`).checked);
}

let legendRequestId = 0;

function refreshLegend() {
  const requestId = ++legendRequestId;
  const active = dataLayersChecked('legend');
  const block = document.getElementById('legendBlock');
  const container = document.getElementById('legendRows');
  if (!active.length) {
    block.hidden = true;
    container.innerHTML = '';
    return;
  }
  loadCountriesData().then((data) => {
    // A newer refreshLegend() call (e.g. from a second checkbox flipped in
    // the same burst, as setOtherLayersEnabled does) may have already
    // superseded this one — don't let a stale render win the race.
    if (requestId !== legendRequestId) return;
    container.innerHTML = '';
    active.forEach((layer) => {
      const row = document.createElement('div');
      row.className = 'legend-row';
      const head = document.createElement('div');
      head.className = 'legend-row-head';
      head.textContent = layer.label;
      row.appendChild(head);
      row.appendChild(layer.legend(data));
      container.appendChild(row);
    });
    block.hidden = false;
  });
}

let lastClickedProps = null;

function showDetail(props) {
  lastClickedProps = props;
  renderDetail();
  // The detail card can sit well below the fold now that the layer list
  // has grown (6 ready + 5 planned rows, plus the legend) — without this,
  // clicking a country silently updates a card the user can't see, and
  // looks like the click did nothing. Only fires on a deliberate selection
  // (map click or table row), never on a plain checkbox toggle, and
  // `block: 'nearest'` is a no-op if the card is already in view.
  const block = document.getElementById('detailBlock');
  if (!block.hidden) block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderDetail() {
  const active = dataLayersChecked('detailFields');
  const block = document.getElementById('detailBlock');
  if (!lastClickedProps || !active.length) {
    block.hidden = true;
    return;
  }
  const props = lastClickedProps;
  document.getElementById('dtName').textContent = props.name;
  document.getElementById('dtFormal').textContent =
    props.formal_name && props.formal_name !== props.name ? props.formal_name : '';
  const rows = document.getElementById('detailRows');
  rows.innerHTML = '';
  active.forEach((layer) => {
    const group = document.createElement('div');
    group.className = 'detail-group';
    layer.detailFields(props).forEach((f) => group.appendChild(buildDetailRow(f)));
    rows.appendChild(group);
  });
  block.hidden = false;
}

function fmtDensity(props) {
  const km2 = props.pop_density_km2 || 0;
  const mi2 = km2 * KM2_PER_MI2;
  const round = (n) => (n < 10 ? n.toFixed(2) : Math.round(n).toLocaleString());
  return { km2: round(km2), mi2: round(mi2) };
}

// --- Data table overlay (shared by any layer with a `table` config) -------
// Built from the same cached fetch as the map layers — opening the table
// never requires the layer itself to be toggled on first.

let tableState = null;

function openTable(layer) {
  loadCountriesData().then((data) => {
    tableState = {
      layerId: layer.id,
      columns: layer.table.columns,
      features: data.features,
      sortKey: layer.table.defaultSort || layer.table.columns[0].key,
      sortDir: layer.table.defaultDir || 'asc',
      filter: '',
    };
    document.getElementById('tableTitle').textContent = layer.table.title;
    document.getElementById('tableFilter').value = '';
    renderTable();
    document.getElementById('tableOverlay').hidden = false;
  });
}

function closeTable() {
  document.getElementById('tableOverlay').hidden = true;
}

function renderTable() {
  const { columns, features, sortKey, sortDir, filter } = tableState;
  const sortCol = columns.find((c) => c.key === sortKey);
  const rows = features.filter((f) => !filter || f.properties.name.toLowerCase().includes(filter));
  rows.sort((a, b) => {
    const av = sortCol.sort(a.properties);
    const bv = sortCol.sort(b.properties);
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const thead = document.getElementById('tableHead');
  thead.innerHTML = '';
  const headRow = document.createElement('tr');
  columns.forEach((c) => {
    const th = document.createElement('th');
    const isSorted = c.key === sortKey;
    th.textContent = c.label + (isSorted ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');
    if (c.align === 'right') th.classList.add('num');
    if (isSorted) th.classList.add('is-sorted');
    th.addEventListener('click', () => {
      if (tableState.sortKey === c.key) tableState.sortDir = tableState.sortDir === 'asc' ? 'desc' : 'asc';
      else { tableState.sortKey = c.key; tableState.sortDir = 'asc'; }
      renderTable();
    });
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);

  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  rows.forEach((f) => {
    const tr = document.createElement('tr');
    columns.forEach((c) => {
      const td = document.createElement('td');
      td.textContent = c.value ? c.value(f.properties) : f.properties[c.key];
      if (c.align === 'right') td.classList.add('num');
      tr.appendChild(td);
    });
    tr.addEventListener('click', () => selectTableRow(f));
    tbody.appendChild(tr);
  });

  document.getElementById('tableFoot').textContent =
    `${rows.length.toLocaleString()} of ${features.length.toLocaleString()} shown — click a row to locate it on the map.`;
}

function featureBBox(geometry) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const scan = (coords) => {
    if (typeof coords[0] === 'number') {
      const [x, y] = coords;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    } else {
      coords.forEach(scan);
    }
  };
  scan(geometry.coordinates);
  return [[minX, minY], [maxX, maxY]];
}

function selectTableRow(feature) {
  closeTable();
  const layer = LAYERS.find((l) => l.id === tableState.layerId);
  const checkbox = document.getElementById(`layer-${layer.id}`);
  if (!checkbox.checked) {
    checkbox.checked = true;
    layer.add(map);
  }
  map.fitBounds(featureBBox(feature.geometry), { padding: 60, maxZoom: 5, duration: 600 });
  refreshLegend();
  showDetail(feature.properties);
}

document.getElementById('tableClose').addEventListener('click', closeTable);
document.getElementById('tableOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'tableOverlay') closeTable();
});
document.getElementById('tableFilter').addEventListener('input', (e) => {
  tableState.filter = e.target.value.trim().toLowerCase();
  renderTable();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !document.getElementById('tableOverlay').hidden) closeTable();
});

// --- Explore view (a clean, high-contrast basemap for just looking) -------
// Not a data overlay — a different basemap style (OpenFreeMap's "Bright":
// same place/label set as the default "Liberty" style, but a bolder,
// higher-contrast palette) with every other layer switched off, since data
// shading and grid lines fight the "just look at the Earth" point of this
// one. Turning it on disables (not just unchecks) every other ready layer's
// checkbox so it really is the only thing open; turning it off restores the
// default basemap and hands control back.

const EXPLORE_STYLE_URL = 'https://tiles.openfreemap.org/styles/bright';

function setOtherLayersEnabled(enabled, exceptId) {
  LAYERS.forEach((layer) => {
    if (layer.id === exceptId || layer.status !== 'ready') return;
    const checkbox = document.getElementById(`layer-${layer.id}`);
    if (!enabled && checkbox.checked) {
      checkbox.checked = false;
      layer.remove(map);
    }
    checkbox.disabled = !enabled;
  });
}

function currentProjection() {
  const active = document.querySelector('#projectionToggle .seg-btn.is-active');
  return active ? active.dataset.proj : 'mercator';
}

function addExplore(map) {
  setOtherLayersEnabled(false, 'explore');
  map.setStyle(EXPLORE_STYLE_URL);
  map.once('style.load', () => map.setProjection({ type: currentProjection() }));
}

function removeExplore(map) {
  map.setStyle(STYLE_URL);
  map.once('style.load', () => {
    map.setProjection({ type: currentProjection() });
    setOtherLayersEnabled(true, 'explore');
  });
}

const LAYERS = [
  {
    id: 'explore',
    label: 'Explore view',
    status: 'ready',
    defaultOn: false,
    note: 'A clean, high-contrast map for just looking — countries, cities, and natural features all labeled. Switches off every other layer while it’s on.',
    add: addExplore,
    remove: removeExplore,
  },
  {
    id: 'graticule',
    label: 'Lat / long grid',
    status: 'ready',
    defaultOn: true,
    note: '10° lines; equator & prime meridian in bold.',
    add: addGraticule,
    remove: removeGraticule,
  },
  {
    id: 'countries',
    label: 'Countries (UN view)',
    status: 'ready',
    defaultOn: false,
    note: 'All ~242 Natural Earth shapes, colored by UN status.',
    add: addCountries,
    remove: removeCountries,
    fillLayerId: COUNTRIES_FILL_LAYER,
    legend: (data) => {
      const counts = { member: 0, observer: 0, other: 0 };
      data.features.forEach((f) => { counts[f.properties.un_status]++; });
      const wrap = document.createElement('div');
      const list = document.createElement('ul');
      list.className = 'legend-list';
      [['member', 'UN member'], ['observer', 'UN observer'], ['other', 'Other territory']].forEach(([key, label]) => {
        const li = document.createElement('li');
        const sw = document.createElement('span');
        sw.className = `swatch swatch-${key}`;
        li.appendChild(sw);
        li.appendChild(document.createTextNode(label));
        const count = document.createElement('span');
        count.className = 'legend-count';
        count.textContent = counts[key];
        li.appendChild(count);
        list.appendChild(li);
      });
      wrap.appendChild(list);
      return wrap;
    },
    detailFields: (props) => [
      { swatch: STATUS_COLORS[props.un_status], text: STATUS_LABELS[props.un_status] },
      { label: 'Type', value: props.type || '—' },
      { label: 'ISO', value: `${props.iso_a2 || '—'} / ${props.iso_a3 || '—'}` },
      { label: 'Region', value: [props.continent, props.subregion].filter(Boolean).join(' · ') || '—' },
    ],
    table: {
      title: 'Countries (UN view)',
      defaultSort: 'name',
      columns: [
        { key: 'name', label: 'Country / territory', sort: (p) => p.name.toLowerCase() },
        { key: 'status', label: 'UN status', value: (p) => STATUS_SHORT[p.un_status], sort: (p) => STATUS_SHORT[p.un_status] },
        { key: 'type', label: 'Type', value: (p) => p.type || '—', sort: (p) => p.type || '' },
        { key: 'iso', label: 'ISO', value: (p) => `${p.iso_a2 || '—'} / ${p.iso_a3 || '—'}`, sort: (p) => p.iso_a3 || '' },
        { key: 'pop', label: 'Population', align: 'right', value: (p) => (p.pop_current > 0 ? Math.round(p.pop_current).toLocaleString() : '—'), sort: (p) => p.pop_current || 0 },
        { key: 'region', label: 'Region', value: (p) => [p.continent, p.subregion].filter(Boolean).join(' · ') || '—', sort: (p) => p.continent || '' },
      ],
    },
  },
  {
    id: 'country-area',
    label: 'Country areas (km² / mi²)',
    status: 'ready',
    defaultOn: false,
    note: 'Shaded by land area — darker green is larger. Click for exact km² / mi².',
    add: addArea,
    remove: removeArea,
    fillLayerId: AREA_FILL_LAYER,
    legend: (data) => {
      const withArea = data.features.filter((f) => f.properties.area_km2 > 0);
      const smallest = withArea.reduce((a, b) => (a.properties.area_km2 < b.properties.area_km2 ? a : b));
      const largest = withArea.reduce((a, b) => (a.properties.area_km2 > b.properties.area_km2 ? a : b));
      return buildGradientLegend('area-gradient', [
        { label: 'Largest', text: `${largest.properties.name} — ${fmtArea(largest.properties.area_km2).km2} km²` },
        { label: 'Smallest', text: `${smallest.properties.name} — ${fmtArea(smallest.properties.area_km2).km2} km²` },
      ]);
    },
    detailFields: (props) => {
      const a = fmtArea(props.area_km2);
      return [
        { label: 'km²', value: a.km2 },
        { label: 'mi²', value: a.mi2 },
      ];
    },
    table: {
      title: 'Country areas',
      defaultSort: 'km2',
      defaultDir: 'desc',
      columns: [
        { key: 'name', label: 'Country / territory', sort: (p) => p.name.toLowerCase() },
        { key: 'km2', label: 'Area (km²)', align: 'right', value: (p) => fmtArea(p.area_km2).km2, sort: (p) => p.area_km2 },
        { key: 'mi2', label: 'Area (mi²)', align: 'right', value: (p) => fmtArea(p.area_km2).mi2, sort: (p) => p.area_km2 },
      ],
    },
  },
  {
    id: 'population',
    label: 'Population',
    status: 'ready',
    defaultOn: false,
    note: 'Shaded by population — darker purple is larger. Current World Bank figures; a few territories fall back to an older Natural Earth estimate.',
    add: addPopulation,
    remove: removePopulation,
    fillLayerId: POP_FILL_LAYER,
    legend: (data) => {
      const withPop = data.features.filter((f) => f.properties.pop_current > 0);
      const smallest = withPop.reduce((a, b) => (a.properties.pop_current < b.properties.pop_current ? a : b));
      const largest = withPop.reduce((a, b) => (a.properties.pop_current > b.properties.pop_current ? a : b));
      return buildGradientLegend('pop-gradient', [
        { label: 'Largest', text: `${largest.properties.name} — ${fmtPop(largest.properties).count}` },
        { label: 'Smallest', text: `${smallest.properties.name} — ${fmtPop(smallest.properties).count}` },
      ]);
    },
    detailFields: (props) => {
      const p = fmtPop(props);
      return [
        { label: 'Population', value: p.count },
        { label: 'Year', value: p.year },
        { label: 'Source', value: p.source },
      ];
    },
    table: {
      title: 'Population',
      defaultSort: 'pop',
      defaultDir: 'desc',
      columns: [
        { key: 'name', label: 'Country / territory', sort: (p) => p.name.toLowerCase() },
        { key: 'pop', label: 'Population', align: 'right', value: (p) => fmtPop(p).count, sort: (p) => p.pop_current || 0 },
        { key: 'year', label: 'Year', align: 'right', value: (p) => fmtPop(p).year, sort: (p) => p.pop_year || '' },
        { key: 'source', label: 'Source', value: (p) => fmtPop(p).source, sort: (p) => fmtPop(p).source },
      ],
    },
  },
  {
    id: 'population-density',
    label: 'Population density',
    status: 'ready',
    defaultOn: false,
    note: 'People per km² / mi² — population ÷ land area. Inherits the same micro-state area caveat as Country areas, plus Population’s own source caveat.',
    add: addPopulationDensity,
    remove: removePopulationDensity,
    fillLayerId: DENSITY_FILL_LAYER,
    legend: (data) => {
      const withDensity = data.features.filter((f) => f.properties.pop_density_km2 > 0);
      const smallest = withDensity.reduce((a, b) => (a.properties.pop_density_km2 < b.properties.pop_density_km2 ? a : b));
      const largest = withDensity.reduce((a, b) => (a.properties.pop_density_km2 > b.properties.pop_density_km2 ? a : b));
      return buildGradientLegend('density-gradient', [
        { label: 'Densest', text: `${largest.properties.name} — ${fmtDensity(largest.properties).km2} /km²` },
        { label: 'Sparsest', text: `${smallest.properties.name} — ${fmtDensity(smallest.properties).km2} /km²` },
      ]);
    },
    detailFields: (props) => {
      const d = fmtDensity(props);
      return [
        { label: 'Per km²', value: d.km2 },
        { label: 'Per mi²', value: d.mi2 },
      ];
    },
    table: {
      title: 'Population density',
      defaultSort: 'km2',
      defaultDir: 'desc',
      columns: [
        { key: 'name', label: 'Country / territory', sort: (p) => p.name.toLowerCase() },
        { key: 'km2', label: 'Per km²', align: 'right', value: (p) => fmtDensity(p).km2, sort: (p) => p.pop_density_km2 || 0 },
        { key: 'mi2', label: 'Per mi²', align: 'right', value: (p) => fmtDensity(p).mi2, sort: (p) => p.pop_density_km2 || 0 },
      ],
    },
  },
  { id: 'elevation', label: 'Elevation / topography', status: 'planned', note: 'Land relief — GEBCO / ETOPO.' },
  { id: 'bathymetry', label: 'Ocean depth', status: 'planned', note: 'Seafloor bathymetry — GEBCO.' },
  { id: 'currents', label: 'Ocean currents', status: 'planned', note: 'Surface currents — NOAA OSCAR.' },
  { id: 'wind', label: 'Wind patterns', status: 'planned', note: 'Surface wind — NOAA / NASA GFS.' },
  { id: 'pressure', label: 'Pressure patterns', status: 'planned', note: 'Sea-level pressure — NOAA GFS.' },
];

const map = new maplibregl.Map({
  container: 'map',
  style: STYLE_URL,
  center: [10, 20],
  zoom: 1.6,
  attributionControl: true,
});

map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

const readyLayers = LAYERS.filter((l) => l.status === 'ready');

map.on('load', () => {
  readyLayers.forEach((l) => {
    if (l.defaultOn) l.add(map);
  });
  refreshLegend();
});

// --- Layer panel ---------------------------------------------------------

const layerList = document.getElementById('layerList');

LAYERS.forEach((layer) => {
  const li = document.createElement('li');
  li.className = 'layer-row' + (layer.status === 'planned' ? ' is-planned' : '');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `layer-${layer.id}`;
  checkbox.disabled = layer.status === 'planned';
  checkbox.checked = layer.status === 'ready' && !!layer.defaultOn;
  checkbox.addEventListener('change', () => {
    if (layer.status !== 'ready') return;
    if (checkbox.checked) layer.add(map);
    else layer.remove(map);
    refreshLegend();
    renderDetail();
  });

  const main = document.createElement('div');
  main.className = 'layer-main';

  const labelRow = document.createElement('div');
  labelRow.className = 'layer-label-row';

  const label = document.createElement('label');
  label.className = 'layer-label';
  label.htmlFor = checkbox.id;
  label.textContent = layer.label;
  labelRow.appendChild(label);

  if (layer.status === 'planned') {
    const badge = document.createElement('span');
    badge.className = 'layer-badge';
    badge.textContent = 'soon';
    labelRow.appendChild(badge);
  }

  main.appendChild(labelRow);

  if (layer.note) {
    const note = document.createElement('p');
    note.className = 'layer-note';
    note.textContent = layer.note;
    main.appendChild(note);
  }

  if (layer.table) {
    const tableBtn = document.createElement('button');
    tableBtn.type = 'button';
    tableBtn.className = 'layer-table-btn';
    tableBtn.textContent = 'View as table';
    tableBtn.addEventListener('click', () => openTable(layer));
    main.appendChild(tableBtn);
  }

  li.appendChild(checkbox);
  li.appendChild(main);
  layerList.appendChild(li);
});

// --- Projection toggle (flat Mercator <-> spinning globe) ----------------

function setProjection(type) {
  if (map.isStyleLoaded()) map.setProjection({ type });
  else map.once('style.load', () => map.setProjection({ type }));
}

document.getElementById('projectionToggle').addEventListener('click', (e) => {
  const btn = e.target.closest('.seg-btn');
  if (!btn) return;
  document.querySelectorAll('#projectionToggle .seg-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
  setProjection(btn.dataset.proj);
});

// --- Cursor coordinate readout --------------------------------------------

const coordBlock = document.getElementById('coordBlock');
const coordOut = document.getElementById('coordOut');

function showCoord(lngLat) {
  coordBlock.hidden = false;
  coordOut.textContent = `${lngLat.lat.toFixed(3)}°, ${lngLat.lng.toFixed(3)}°`;
}

map.on('click', (e) => {
  showCoord(e.lngLat);
  // Every data layer's source is the same countries.geojson, so whichever
  // active fill layer is hit first already carries every field any of
  // them might want — no need to query each one separately.
  const candidates = LAYERS.filter((l) => l.status === 'ready' && l.fillLayerId && document.getElementById(`layer-${l.id}`).checked);
  for (const layer of candidates) {
    if (!map.getLayer(layer.fillLayerId)) continue;
    const hit = map.queryRenderedFeatures(e.point, { layers: [layer.fillLayerId] });
    if (hit.length) {
      showDetail(hit[0].properties);
      break;
    }
  }
});
map.on('mousemove', (e) => showCoord(e.lngLat));

// --- Panel collapse (handy on small screens) ------------------------------

const panel = document.getElementById('panel');
const collapseBtn = document.getElementById('panelCollapse');

collapseBtn.addEventListener('click', () => {
  const collapsed = panel.classList.toggle('is-collapsed');
  collapseBtn.setAttribute('aria-expanded', String(!collapsed));
  collapseBtn.textContent = collapsed ? '+' : '—';
});
