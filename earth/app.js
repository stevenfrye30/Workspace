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

// --- Countries ---------------------------------------------------------
// One layer, one shared source — every ~242 Natural Earth shape, carrying
// every field build_countries.py attaches (UN status, area, population,
// density, and the identity/economic fields below). It used to be four
// separate layers (one map fill per metric); now there's one fill whose
// color is switchable ("Color by" below) while the click/hover info
// always shows everything regardless of which metric is coloring the map.

const COUNTRIES_SOURCE = 'countries';
const COUNTRIES_FILL_LAYER = 'countries-fill';
const COUNTRIES_LINE_LAYER = 'countries-line';
const COUNTRIES_DATA_URL = 'data/countries.geojson';
const KM2_PER_MI2 = 2.58999;

const STATUS_COLORS = { member: '#2f6fdb', observer: '#caa23c', other: '#8a8a8a' };
const STATUS_LABELS = { member: 'UN member state', observer: 'UN permanent observer', other: 'Other territory — not a UN member' };
const STATUS_SHORT = { member: 'Member', observer: 'Observer', other: 'Other' };
const STATUS_COLOR_EXPR = [
  'match', ['get', 'un_status'],
  'member', STATUS_COLORS.member,
  'observer', STATUS_COLORS.observer,
  STATUS_COLORS.other,
];

// Stops are in log10 of the underlying value — area, population, and
// density each span too many orders of magnitude for a linear scale to
// show anything but one outlier.
const AREA_COLOR_EXPR = [
  'interpolate', ['linear'], ['get', 'area_log10'],
  -1, '#f7fcf5',
  0, '#c7e9c0',
  2, '#74c476',
  4.5, '#238b45',
  7.3, '#00441b',
];
const POP_COLOR_EXPR = [
  'interpolate', ['linear'], ['get', 'pop_log10'],
  2.5, '#f2f0f7',
  4, '#cbc9e2',
  6, '#9e9ac8',
  7.5, '#6a51a3',
  9.2, '#3f007d',
];
const DENSITY_COLOR_EXPR = [
  'interpolate', ['linear'], ['get', 'pop_density_log10'],
  -1, '#ffffe5',
  0.5, '#fed98e',
  2, '#fe9929',
  3, '#d95f0e',
  4.5, '#993404',
];

const POP_SOURCE_LABELS = { worldbank: 'World Bank', natural_earth_est: 'Natural Earth (older estimate)' };

// What the map's fill/line paint for each "Color by" mode. gradientClass
// matches a CSS class in styles.css for the legend's mini-bar.
const COLOR_MODES = {
  status: { label: 'Status', fillExpr: STATUS_COLOR_EXPR, fillOpacity: 0.42, lineColor: STATUS_COLOR_EXPR, lineWidth: 1, lineOpacity: 0.9 },
  area: { label: 'Area', fillExpr: AREA_COLOR_EXPR, fillOpacity: 0.55, lineColor: '#0b2e18', lineWidth: 0.6, lineOpacity: 0.5, gradientClass: 'area-gradient' },
  population: { label: 'Population', fillExpr: POP_COLOR_EXPR, fillOpacity: 0.55, lineColor: '#1a0f33', lineWidth: 0.6, lineOpacity: 0.5, gradientClass: 'pop-gradient' },
  density: { label: 'Density', fillExpr: DENSITY_COLOR_EXPR, fillOpacity: 0.55, lineColor: '#4a2511', lineWidth: 0.6, lineOpacity: 0.5, gradientClass: 'density-gradient' },
};
const COLOR_MODE_ORDER = ['status', 'area', 'population', 'density'];

let colorByMode = 'status';

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

// --- Color fill toggle -----------------------------------------------------
// fill-opacity is wrapped in currentFillOpacity() at the point it's
// painted, so when "Hide color fill" is on, the layer paints at opacity 0
// from the moment it's added — the border (never hidden) is still
// visible, and clicking/hovering still works, since queryRenderedFeatures
// hit-tests geometry, not painted opacity.

let hideFillMode = false;

function currentFillOpacity(normal) {
  return hideFillMode ? 0 : normal;
}

function applyFillVisibility() {
  if (map.getLayer(COUNTRIES_FILL_LAYER)) {
    map.setPaintProperty(COUNTRIES_FILL_LAYER, 'fill-opacity', currentFillOpacity(COLOR_MODES[colorByMode].fillOpacity));
  }
}

function addCountries(map) {
  loadCountriesData().then((data) => {
    if (map.getSource(COUNTRIES_SOURCE)) return;
    map.addSource(COUNTRIES_SOURCE, { type: 'geojson', data });
    const beforeId = firstSymbolLayerId(map);
    const mode = COLOR_MODES[colorByMode];
    map.addLayer({
      id: COUNTRIES_FILL_LAYER,
      type: 'fill',
      source: COUNTRIES_SOURCE,
      paint: { 'fill-color': mode.fillExpr, 'fill-opacity': currentFillOpacity(mode.fillOpacity) },
    }, beforeId);
    map.addLayer({
      id: COUNTRIES_LINE_LAYER,
      type: 'line',
      source: COUNTRIES_SOURCE,
      paint: { 'line-color': mode.lineColor, 'line-width': mode.lineWidth, 'line-opacity': mode.lineOpacity },
    }, beforeId);
  });
}

function removeCountries(map) {
  if (map.getLayer(COUNTRIES_FILL_LAYER)) map.removeLayer(COUNTRIES_FILL_LAYER);
  if (map.getLayer(COUNTRIES_LINE_LAYER)) map.removeLayer(COUNTRIES_LINE_LAYER);
  if (map.getSource(COUNTRIES_SOURCE)) map.removeSource(COUNTRIES_SOURCE);
}

function setColorByMode(newMode) {
  colorByMode = newMode;
  const mode = COLOR_MODES[newMode];
  if (map.getLayer(COUNTRIES_FILL_LAYER)) {
    map.setPaintProperty(COUNTRIES_FILL_LAYER, 'fill-color', mode.fillExpr);
    map.setPaintProperty(COUNTRIES_FILL_LAYER, 'fill-opacity', currentFillOpacity(mode.fillOpacity));
    map.setPaintProperty(COUNTRIES_LINE_LAYER, 'line-color', mode.lineColor);
    map.setPaintProperty(COUNTRIES_LINE_LAYER, 'line-width', mode.lineWidth);
    map.setPaintProperty(COUNTRIES_LINE_LAYER, 'line-opacity', mode.lineOpacity);
  }
  refreshLegend();
}

// --- Formatting helpers ------------------------------------------------

function fmtArea(km2) {
  const mi2 = km2 / KM2_PER_MI2;
  const round = (n) => (n < 10 ? n.toFixed(2) : Math.round(n).toLocaleString());
  return { km2: round(km2), mi2: round(mi2) };
}

function fmtPop(props) {
  const n = props.pop_current;
  return {
    count: n > 0 ? Math.round(n).toLocaleString() : '0',
    year: props.pop_year || '—',
    source: POP_SOURCE_LABELS[props.pop_source] || '—',
  };
}

function fmtDensity(props) {
  const km2 = props.pop_density_km2 || 0;
  const mi2 = km2 * KM2_PER_MI2;
  const round = (n) => (n < 10 ? n.toFixed(2) : Math.round(n).toLocaleString());
  return { km2: round(km2), mi2: round(mi2) };
}

// languages/neighbors arrive as plain comma-joined strings, not arrays —
// MapLibre's GeoJSON property model only supports primitives, so an array
// value gets silently JSON.stringify()'d into literal text like
// '["German"]' by the time it reaches queryRenderedFeatures. Splitting
// back on ", " is safe since no language or country name contains it.

function fmtLanguages(str) {
  if (!str) return '—';
  const list = str.split(', ');
  if (list.length <= 6) return str;
  return `${list.slice(0, 6).join(', ')} +${list.length - 6} more`;
}

function fmtNeighbors(str) {
  if (!str) return '—';
  return `${str.split(', ').length} — ${str}`;
}

function fmtMoney(usd) {
  if (usd == null) return '—';
  const abs = Math.abs(usd);
  if (abs >= 1e12) return `$${(usd / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(usd / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(usd / 1e6).toFixed(2)}M`;
  return `$${Math.round(usd).toLocaleString()}`;
}

function fmtGdp(props) {
  return props.gdp_usd != null ? `${fmtMoney(props.gdp_usd)} (${props.gdp_year})` : '—';
}

function fmtGdpPerCapita(props) {
  return props.gdp_per_capita_usd != null ? `$${Math.round(props.gdp_per_capita_usd).toLocaleString()} (${props.gdp_per_capita_year})` : '—';
}

function fmtLifeExpectancy(props) {
  return props.life_expectancy != null ? `${props.life_expectancy} yrs (${props.life_expectancy_year})` : '—';
}

function fmtUrbanPct(props) {
  return props.urban_pct != null ? `${props.urban_pct}% (${props.urban_pct_year})` : '—';
}

function displayName(props) {
  return props.flag_emoji ? `${props.flag_emoji} ${props.name}` : props.name;
}

// --- Legend for the current "Color by" mode ---------------------------

function countriesLegend(data) {
  if (colorByMode === 'status') {
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
  }

  if (colorByMode === 'area') {
    const withArea = data.features.filter((f) => f.properties.area_km2 > 0);
    const smallest = withArea.reduce((a, b) => (a.properties.area_km2 < b.properties.area_km2 ? a : b));
    const largest = withArea.reduce((a, b) => (a.properties.area_km2 > b.properties.area_km2 ? a : b));
    return buildGradientLegend('area-gradient', [
      { label: 'Largest', text: `${largest.properties.name} — ${fmtArea(largest.properties.area_km2).km2} km²` },
      { label: 'Smallest', text: `${smallest.properties.name} — ${fmtArea(smallest.properties.area_km2).km2} km²` },
    ]);
  }

  if (colorByMode === 'population') {
    const withPop = data.features.filter((f) => f.properties.pop_current > 0);
    const smallest = withPop.reduce((a, b) => (a.properties.pop_current < b.properties.pop_current ? a : b));
    const largest = withPop.reduce((a, b) => (a.properties.pop_current > b.properties.pop_current ? a : b));
    return buildGradientLegend('pop-gradient', [
      { label: 'Largest', text: `${largest.properties.name} — ${fmtPop(largest.properties).count}` },
      { label: 'Smallest', text: `${smallest.properties.name} — ${fmtPop(smallest.properties).count}` },
    ]);
  }

  // density
  const withDensity = data.features.filter((f) => f.properties.pop_density_km2 > 0);
  const smallest = withDensity.reduce((a, b) => (a.properties.pop_density_km2 < b.properties.pop_density_km2 ? a : b));
  const largest = withDensity.reduce((a, b) => (a.properties.pop_density_km2 > b.properties.pop_density_km2 ? a : b));
  return buildGradientLegend('density-gradient', [
    { label: 'Densest', text: `${largest.properties.name} — ${fmtDensity(largest.properties).km2} /km²` },
    { label: 'Sparsest', text: `${smallest.properties.name} — ${fmtDensity(smallest.properties).km2} /km²` },
  ]);
}

// --- Detail fields — always all of it, regardless of "Color by" --------

function countriesDetailFields(props) {
  const a = fmtArea(props.area_km2);
  const p = fmtPop(props);
  const d = fmtDensity(props);
  return [
    { swatch: STATUS_COLORS[props.un_status], text: STATUS_LABELS[props.un_status] },
    { label: 'Type', value: props.type || '—' },
    { label: 'ISO', value: `${props.iso_a2 || '—'} / ${props.iso_a3 || '—'}` },
    { label: 'Region', value: [props.continent, props.subregion].filter(Boolean).join(' · ') || '—' },
    { label: 'km²', value: a.km2 },
    { label: 'mi²', value: a.mi2 },
    { label: 'Population', value: p.count },
    { label: 'Pop. year', value: p.year },
    { label: 'Pop. source', value: p.source },
    { label: 'Density /km²', value: d.km2 },
    { label: 'Density /mi²', value: d.mi2 },
    { label: 'Capital', value: props.capital || '—' },
    { label: 'Languages', value: fmtLanguages(props.languages) },
    { label: 'Currency', value: props.currency || '—' },
    { label: 'Calling code', value: props.calling_code || '—' },
    { label: 'Domain', value: props.tld || '—' },
    { label: 'Neighbors', value: fmtNeighbors(props.neighbors) },
    { label: 'GDP', value: fmtGdp(props) },
    { label: 'GDP / capita', value: fmtGdpPerCapita(props) },
    { label: 'Life expectancy', value: fmtLifeExpectancy(props) },
    { label: 'Urban population', value: fmtUrbanPct(props) },
  ];
}

// --- Unified legend + detail panel ----------------------------------------
// The Countries layer declares `legend` (compact swatches-or-gradient
// summary, following the current Color-by mode) and `detailFields` (every
// row for the click-to-inspect card) instead of owning its own block.

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
    // A newer refreshLegend() call (e.g. switching Color by right after a
    // checkbox toggle) may have already superseded this one — don't let a
    // stale render win the race.
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
  // The detail card can sit well below the fold — without this, clicking
  // a country silently updates a card the user can't see, and looks like
  // the click did nothing. Only fires on a deliberate selection (map
  // click or table row), never on a plain checkbox toggle, and
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
  document.getElementById('dtName').textContent = displayName(props);
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

// --- Data table overlay (shared by any layer with a `table` config) -------
// Built from the same cached fetch as the map layer — opening the table
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
    label: 'Countries',
    status: 'ready',
    defaultOn: false,
    note: 'All ~242 Natural Earth shapes. Click or hover any shape for its full profile — status, size, population, density, and more. Color the map by whichever one below.',
    add: addCountries,
    remove: removeCountries,
    fillLayerId: COUNTRIES_FILL_LAYER,
    colorBy: true,
    legend: countriesLegend,
    detailFields: countriesDetailFields,
    table: {
      title: 'Countries',
      defaultSort: 'name',
      columns: [
        { key: 'name', label: 'Country / territory', value: (p) => displayName(p), sort: (p) => p.name.toLowerCase() },
        { key: 'status', label: 'Status', value: (p) => STATUS_SHORT[p.un_status], sort: (p) => STATUS_SHORT[p.un_status] },
        { key: 'capital', label: 'Capital', value: (p) => p.capital || '—', sort: (p) => p.capital || '' },
        { key: 'region', label: 'Region', value: (p) => [p.continent, p.subregion].filter(Boolean).join(' · ') || '—', sort: (p) => p.continent || '' },
        { key: 'km2', label: 'Area (km²)', align: 'right', value: (p) => fmtArea(p.area_km2).km2, sort: (p) => p.area_km2 },
        { key: 'pop', label: 'Population', align: 'right', value: (p) => fmtPop(p).count, sort: (p) => p.pop_current || 0 },
        { key: 'density', label: 'Density /km²', align: 'right', value: (p) => fmtDensity(p).km2, sort: (p) => p.pop_density_km2 || 0 },
        { key: 'gdp', label: 'GDP', align: 'right', value: (p) => fmtGdp(p), sort: (p) => p.gdp_usd || 0 },
        { key: 'gdp_pc', label: 'GDP / capita', align: 'right', value: (p) => fmtGdpPerCapita(p), sort: (p) => p.gdp_per_capita_usd || 0 },
        { key: 'life_exp', label: 'Life exp.', align: 'right', value: (p) => fmtLifeExpectancy(p), sort: (p) => p.life_expectancy || 0 },
        { key: 'urban', label: 'Urban %', align: 'right', value: (p) => fmtUrbanPct(p), sort: (p) => p.urban_pct || 0 },
        { key: 'currency', label: 'Currency', value: (p) => p.currency || '—', sort: (p) => p.currency || '' },
        { key: 'languages', label: 'Languages', value: (p) => fmtLanguages(p.languages), sort: (p) => p.languages || '' },
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
    hideHoverTooltip();
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

  if (layer.colorBy) {
    const seg = document.createElement('div');
    seg.className = 'seg seg-small';
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', 'Color by');
    COLOR_MODE_ORDER.forEach((key) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'seg-btn' + (key === colorByMode ? ' is-active' : '');
      btn.textContent = COLOR_MODES[key].label;
      btn.addEventListener('click', () => {
        seg.querySelectorAll('.seg-btn').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        setColorByMode(key);
      });
      seg.appendChild(btn);
    });
    main.appendChild(seg);
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

// Shared by the click handler and the hover tooltip below.
function findHitProps(point) {
  const candidates = LAYERS.filter((l) => l.status === 'ready' && l.fillLayerId && document.getElementById(`layer-${l.id}`).checked);
  for (const layer of candidates) {
    if (!map.getLayer(layer.fillLayerId)) continue;
    const hit = map.queryRenderedFeatures(point, { layers: [layer.fillLayerId] });
    if (hit.length) return hit[0].properties;
  }
  return null;
}

map.on('click', (e) => {
  showCoord(e.lngLat);
  const props = findHitProps(e.point);
  if (props) showDetail(props);
});

// --- Hover tooltip (toggleable) -------------------------------------------
// Off by default — clicking already gives a persistent detail card in the
// panel. When on, this is a lightweight, read-only echo of the exact same
// detailFields used there, in a box that follows the cursor instead of
// requiring a click.

let hoverMode = false;
let hoveredName = null;

function hideHoverTooltip() {
  document.getElementById('hoverTooltip').hidden = true;
  hoveredName = null;
}

function renderHoverTooltip(props) {
  document.getElementById('hvName').textContent = displayName(props);
  document.getElementById('hvFormal').textContent =
    props.formal_name && props.formal_name !== props.name ? props.formal_name : '';
  const rows = document.getElementById('hvRows');
  rows.innerHTML = '';
  dataLayersChecked('detailFields').forEach((layer) => {
    const group = document.createElement('div');
    group.className = 'detail-group';
    layer.detailFields(props).forEach((f) => group.appendChild(buildDetailRow(f)));
    rows.appendChild(group);
  });
}

function positionHoverTooltip(point) {
  const tooltip = document.getElementById('hoverTooltip');
  const pad = 16;
  const margin = 8;
  let left = point.x + pad;
  let top = point.y + pad;
  if (left + tooltip.offsetWidth + margin > window.innerWidth) left = point.x - tooltip.offsetWidth - pad;
  if (top + tooltip.offsetHeight + margin > window.innerHeight) top = window.innerHeight - tooltip.offsetHeight - margin;
  tooltip.style.left = `${Math.max(margin, left)}px`;
  tooltip.style.top = `${Math.max(margin, top)}px`;
}

document.getElementById('hoverModeToggle').addEventListener('change', (e) => {
  hoverMode = e.target.checked;
  if (!hoverMode) hideHoverTooltip();
});

document.getElementById('hideFillToggle').addEventListener('change', (e) => {
  hideFillMode = e.target.checked;
  applyFillVisibility();
});

document.getElementById('map').addEventListener('mouseleave', hideHoverTooltip);

map.on('mousemove', (e) => {
  showCoord(e.lngLat);
  if (!hoverMode || !dataLayersChecked('detailFields').length) {
    hideHoverTooltip();
    return;
  }
  const props = findHitProps(e.point);
  if (!props) {
    hideHoverTooltip();
    return;
  }
  if (props.name !== hoveredName) {
    renderHoverTooltip(props);
    hoveredName = props.name;
  }
  document.getElementById('hoverTooltip').hidden = false;
  positionHoverTooltip(e.point);
});

// --- Panel collapse (handy on small screens) ------------------------------

const panel = document.getElementById('panel');
const collapseBtn = document.getElementById('panelCollapse');

collapseBtn.addEventListener('click', () => {
  const collapsed = panel.classList.toggle('is-collapsed');
  collapseBtn.setAttribute('aria-expanded', String(!collapsed));
  collapseBtn.textContent = collapsed ? '+' : '—';
});
