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

function buildGraticule(stepDeg, segmentDeg) {
  const features = [];

  for (let lon = -180; lon <= 180; lon += stepDeg) {
    const coords = [];
    for (let lat = -85; lat <= 85; lat += segmentDeg) coords.push([lon, lat]);
    features.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords },
      properties: { kind: 'meridian', major: lon === 0 },
    });
  }

  for (let lat = -80; lat <= 80; lat += stepDeg) {
    const coords = [];
    for (let lon = -180; lon <= 180; lon += segmentDeg) coords.push([lon, lat]);
    features.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords },
      properties: { kind: 'parallel', major: lat === 0 },
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
}

function removeGraticule(map) {
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
    showCountryStats(data);
  });
}

function removeCountries(map) {
  if (map.getLayer(COUNTRIES_FILL_LAYER)) map.removeLayer(COUNTRIES_FILL_LAYER);
  if (map.getLayer(COUNTRIES_LINE_LAYER)) map.removeLayer(COUNTRIES_LINE_LAYER);
  if (map.getSource(COUNTRIES_SOURCE)) map.removeSource(COUNTRIES_SOURCE);
  document.getElementById('countriesBlock').hidden = true;
  document.getElementById('countryDetail').hidden = true;
}

function showCountryStats(data) {
  const counts = { member: 0, observer: 0, other: 0 };
  data.features.forEach((f) => { counts[f.properties.un_status]++; });
  document.getElementById('countMember').textContent = counts.member;
  document.getElementById('countObserver').textContent = counts.observer;
  document.getElementById('countOther').textContent = counts.other;
  document.getElementById('countriesBlock').hidden = false;
}

function showCountryDetail(props) {
  document.getElementById('cdName').textContent = props.name;
  document.getElementById('cdFormal').textContent =
    props.formal_name && props.formal_name !== props.name ? props.formal_name : '';
  document.getElementById('cdStatusDot').style.background = STATUS_COLORS[props.un_status];
  document.getElementById('cdStatus').textContent = STATUS_LABELS[props.un_status];
  document.getElementById('cdType').textContent = props.type || '—';
  document.getElementById('cdCodes').textContent = `${props.iso_a2 || '—'} / ${props.iso_a3 || '—'}`;
  document.getElementById('cdPop').textContent =
    props.pop_est && props.pop_est > 0 ? Math.round(props.pop_est).toLocaleString() : '—';
  document.getElementById('cdRegion').textContent =
    [props.continent, props.subregion].filter(Boolean).join(' · ') || '—';
  const a = fmtArea(props.area_km2);
  document.getElementById('cdKm2').textContent = a.km2;
  document.getElementById('cdMi2').textContent = a.mi2;
  document.getElementById('countryDetail').hidden = false;
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
    showAreaStats(data);
  });
}

function removeArea(map) {
  if (map.getLayer(AREA_FILL_LAYER)) map.removeLayer(AREA_FILL_LAYER);
  if (map.getLayer(AREA_LINE_LAYER)) map.removeLayer(AREA_LINE_LAYER);
  if (map.getSource(AREA_SOURCE)) map.removeSource(AREA_SOURCE);
  document.getElementById('areaBlock').hidden = true;
  document.getElementById('areaDetail').hidden = true;
}

function fmtArea(km2) {
  const mi2 = km2 / KM2_PER_MI2;
  const round = (n) => (n < 10 ? n.toFixed(2) : Math.round(n).toLocaleString());
  return { km2: round(km2), mi2: round(mi2) };
}

function showAreaStats(data) {
  const withArea = data.features.filter((f) => f.properties.area_km2 > 0);
  const smallest = withArea.reduce((a, b) => (a.properties.area_km2 < b.properties.area_km2 ? a : b));
  const largest = withArea.reduce((a, b) => (a.properties.area_km2 > b.properties.area_km2 ? a : b));
  const s = fmtArea(smallest.properties.area_km2);
  const l = fmtArea(largest.properties.area_km2);
  document.getElementById('areaSmallest').textContent = `${smallest.properties.name} — ${s.km2} km²`;
  document.getElementById('areaLargest').textContent = `${largest.properties.name} — ${l.km2} km²`;
  document.getElementById('areaBlock').hidden = false;
}

function showAreaDetail(props) {
  const a = fmtArea(props.area_km2);
  document.getElementById('adName').textContent = props.name;
  document.getElementById('adKm2').textContent = a.km2;
  document.getElementById('adMi2').textContent = a.mi2;
  document.getElementById('areaDetail').hidden = false;
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
  if (layer.id === 'countries') showCountryDetail(feature.properties);
  if (layer.id === 'country-area') showAreaDetail(feature.properties);
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

const LAYERS = [
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
    table: {
      title: 'Countries (UN view)',
      defaultSort: 'name',
      columns: [
        { key: 'name', label: 'Country / territory', sort: (p) => p.name.toLowerCase() },
        { key: 'status', label: 'UN status', value: (p) => STATUS_SHORT[p.un_status], sort: (p) => STATUS_SHORT[p.un_status] },
        { key: 'type', label: 'Type', value: (p) => p.type || '—', sort: (p) => p.type || '' },
        { key: 'iso', label: 'ISO', value: (p) => `${p.iso_a2 || '—'} / ${p.iso_a3 || '—'}`, sort: (p) => p.iso_a3 || '' },
        { key: 'pop', label: 'Population', align: 'right', value: (p) => (p.pop_est > 0 ? Math.round(p.pop_est).toLocaleString() : '—'), sort: (p) => p.pop_est || 0 },
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
  if (map.getLayer(COUNTRIES_FILL_LAYER)) {
    const hit = map.queryRenderedFeatures(e.point, { layers: [COUNTRIES_FILL_LAYER] });
    if (hit.length) showCountryDetail(hit[0].properties);
  }
  if (map.getLayer(AREA_FILL_LAYER)) {
    const hit = map.queryRenderedFeatures(e.point, { layers: [AREA_FILL_LAYER] });
    if (hit.length) showAreaDetail(hit[0].properties);
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
