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
  document.getElementById('countryDetail').hidden = false;
}

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
  if (!map.getLayer(COUNTRIES_FILL_LAYER)) return;
  const hit = map.queryRenderedFeatures(e.point, { layers: [COUNTRIES_FILL_LAYER] });
  if (hit.length) showCountryDetail(hit[0].properties);
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
