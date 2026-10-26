#!/usr/bin/env python3
"""Build earth/data/countries.geojson — every country/territory shape,
classified by UN membership. Run from anywhere; writes next to this file.

Sources (both public domain / open data, fetched fresh each run):
  - Natural Earth 1:50m Admin-0 Countries (public domain):
    https://github.com/nvkelso/natural-earth-vector (geojson/ne_50m_admin_0_countries.geojson)
  - mledoze/countries (ODbL), for the `unMember` flag per ISO-3166 code:
    https://github.com/mledoze/countries

Natural Earth's TYPE field is NOT a UN-membership signal — Israel and
Palestine carry TYPE "Disputed"/"Indeterminate" despite one being a member
and the other an observer, while Australia's stub territories (Indian Ocean
Territory, Ashmore & Cartier Is.) get backfilled with Australia's own ISO3
in the EH field despite being Dependencies, not sovereign states. So
membership eligibility is gated on TYPE *and* looked up by the feature's
own ISO3 — never inherited from an administering country.

mledoze/countries has one known bad flag: Vatican City (VAT) is marked
unMember=true but the Holy See is a permanent observer, not a member — the
193/2 split below corrects that by hand (verified against the UN's own
193-member count).

area_km2 is computed directly from this same Natural Earth geometry (no
third dataset) using the Chamberlain & Duquette spherical-polygon formula,
on the geometry as fetched — BEFORE the simplify() below. Simplifying at
0.01 degrees (~1km) would meaningfully distort the area of city-state-sized
features like Vatican City or Monaco, whose entire extent is smaller than
that tolerance, so area is measured from the full-resolution shape even
though the map only ever renders the simplified one.

pop_current/pop_year/pop_source come from the World Bank's SP.POP.TOTL
indicator (CC BY-4.0), most-recent-value-per-country, refetched live each
run — NOT Natural Earth's POP_EST, which is a one-time snapshot baked into
the NE release and goes stale between NE releases. The World Bank's own
"Aggregates" rows (regions/income groups like "Africa Eastern and
Southern") are excluded via its /country list's region.id, so a region
rollup can never masquerade as a real country's population. The ~20 NE
shapes the World Bank doesn't cover at all (Vatican City, Taiwan, Western
Sahara, Antarctica, a few other territories) fall back to NE's own
POP_EST, flagged with pop_source="natural_earth_est" so the UI can
disclose which figures are which.

pop_density_km2 is simply pop_current / area_km2, computed here rather than
left to the client so the log-scaled color ramp (pop_density_log10) can be
precomputed too. It inherits both upstream caveats: NE's micro-state area
oversizing (understates density for Monaco/Vatican-scale shapes) and, for
the ~20 pop_source="natural_earth_est" territories, POP_EST's staleness.
"""
import json
import math
import urllib.request
from pathlib import Path

NE_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson"
MLEDOZE_URL = "https://raw.githubusercontent.com/mledoze/countries/master/countries.json"
WB_COUNTRY_URL = "https://api.worldbank.org/v2/country?format=json&per_page=400"
WB_POP_URL = "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=400&mrv=1"
OUT_PATH = Path(__file__).parent / "countries.geojson"

OBSERVERS = {"VAT", "PSE"}  # Holy See, Palestine — UN permanent observers
# Only these NE feature types can plausibly be their own UN member/observer.
# Dependency and Geo unit are always territories of someone else, even when
# Natural Earth backfills their ISO3 with the administering country's code.
ELIGIBLE_TYPES = {"Sovereign country", "Country", "Sovereignty", "Disputed", "Indeterminate"}


def fetch_json(url):
    with urllib.request.urlopen(url, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def clean_iso3(props):
    for key in ("ISO_A3_EH", "ISO_A3"):
        v = props.get(key)
        if v and v != "-99":
            return v
    return None


def classify(props, iso3, members_by_iso3):
    if props.get("TYPE") not in ELIGIBLE_TYPES:
        return "other"
    if iso3 in OBSERVERS:
        return "observer"
    c = members_by_iso3.get(iso3) if iso3 else None
    if c and c.get("unMember") is True:
        return "member"
    return "other"


def round_coords(coords, nd=3):
    if isinstance(coords[0], (int, float)):
        return [round(c, nd) for c in coords]
    return [round_coords(c, nd) for c in coords]


EARTH_RADIUS_M = 6371008.8  # authalic (equal-area) radius


def ring_area(ring):
    """Chamberlain & Duquette spherical polygon area, in m^2. `ring` is a
    closed GeoJSON linear ring [[lon, lat], ...] with first == last point."""
    n = len(ring)
    if n < 3:
        return 0.0
    total = 0.0
    for i in range(n):
        if i == n - 2:
            p1, p2, p3 = ring[n - 2], ring[n - 1], ring[0]
        elif i == n - 1:
            p1, p2, p3 = ring[n - 1], ring[0], ring[1]
        else:
            p1, p2, p3 = ring[i], ring[i + 1], ring[i + 2]
        total += (math.radians(p3[0]) - math.radians(p1[0])) * math.sin(math.radians(p2[1]))
    return abs(total * EARTH_RADIUS_M * EARTH_RADIUS_M / 2)


def polygon_area(coords):
    """coords = [exterior_ring, hole_ring, ...] (GeoJSON Polygon.coordinates)."""
    if not coords:
        return 0.0
    area = ring_area(coords[0])
    for hole in coords[1:]:
        area -= ring_area(hole)
    return area


def geodesic_area_km2(geometry):
    if geometry["type"] == "Polygon":
        m2 = polygon_area(geometry["coordinates"])
    elif geometry["type"] == "MultiPolygon":
        m2 = sum(polygon_area(poly) for poly in geometry["coordinates"])
    else:
        m2 = 0.0
    return m2 / 1_000_000


def fetch_worldbank_population():
    """Returns {iso3: (population, year)} for real countries only (the
    World Bank's own region/income-group aggregate rows are excluded by
    checking each code against the country list's region.id != 'NA')."""
    countries = fetch_json(WB_COUNTRY_URL)[1]
    real_iso3 = {c["id"] for c in countries if c["region"]["id"] != "NA"}

    rows = fetch_json(WB_POP_URL)[1]
    out = {}
    for r in rows:
        code = r.get("countryiso3code")
        if code in real_iso3 and r.get("value") is not None:
            out[code] = (int(r["value"]), r["date"])
    return out


def main():
    from shapely.geometry import shape, mapping

    ne = fetch_json(NE_URL)
    mledoze = fetch_json(MLEDOZE_URL)
    members_by_iso3 = {c["cca3"]: c for c in mledoze}
    wb_pop = fetch_worldbank_population()

    # A handful of NE's own Dependency/Geo-unit stubs (e.g. Indian Ocean
    # Territory, Ashmore & Cartier Is.) get backfilled with their
    # *administering* country's own ISO3 in the EH field, because the stub
    # has no distinct code in NE's data — same quirk the module docstring
    # already calls out for UN-membership classification. Left unguarded,
    # looking those codes up against the World Bank hands a 3 km^2 island
    # the sovereign country's entire national population. Detect the
    # collision generically: codes already claimed by an ELIGIBLE_TYPES
    # feature (an actual country) are off-limits for population lookups by
    # any feature that ISN'T that eligible type.
    eligible_iso3 = {
        clean_iso3(f["properties"]) for f in ne["features"]
        if f["properties"].get("TYPE") in ELIGIBLE_TYPES and clean_iso3(f["properties"])
    }

    out_features = []
    counts = {"member": 0, "observer": 0, "other": 0}
    pop_sources = {"worldbank": 0, "natural_earth_est": 0}

    for f in ne["features"]:
        p = f["properties"]
        iso3 = clean_iso3(p)
        status = classify(p, iso3, members_by_iso3)
        counts[status] += 1

        area_km2 = round(geodesic_area_km2(f["geometry"]), 2)
        area_log10 = round(math.log10(max(area_km2, 0.01)), 3)

        borrowed_code = iso3 in eligible_iso3 and p.get("TYPE") not in ELIGIBLE_TYPES
        wb = wb_pop.get(iso3) if iso3 and not borrowed_code else None
        if wb:
            pop_current, pop_year, pop_source = wb[0], wb[1], "worldbank"
        else:
            pop_current, pop_year, pop_source = p.get("POP_EST"), None, "natural_earth_est"
        pop_sources[pop_source] += 1
        pop_log10 = round(math.log10(max(pop_current or 1, 1)), 3)

        pop_density_km2 = round(pop_current / area_km2, 2) if area_km2 > 0 and pop_current else 0.0
        pop_density_log10 = round(math.log10(max(pop_density_km2, 0.01)), 3)

        geom = shape(f["geometry"]).simplify(0.01, preserve_topology=True)
        geom_out = mapping(geom)
        if geom_out["type"] != "GeometryCollection":
            geom_out = {"type": geom_out["type"], "coordinates": round_coords(list(geom_out["coordinates"]))}

        out_features.append({
            "type": "Feature",
            "properties": {
                "name": p.get("NAME"),
                "name_long": p.get("NAME_LONG") or p.get("NAME"),
                "formal_name": p.get("FORMAL_EN"),
                "sovereignty": p.get("SOVEREIGNT"),
                "type": p.get("TYPE"),
                "continent": p.get("CONTINENT"),
                "subregion": p.get("SUBREGION"),
                "iso_a2": p.get("ISO_A2_EH") if p.get("ISO_A2_EH") not in (None, "-99") else None,
                "iso_a3": iso3,
                "pop_est": p.get("POP_EST"),
                "pop_current": pop_current,
                "pop_year": pop_year,
                "pop_source": pop_source,
                "pop_log10": pop_log10,
                "pop_density_km2": pop_density_km2,
                "pop_density_log10": pop_density_log10,
                "un_status": status,
                "area_km2": area_km2,
                "area_log10": area_log10,
            },
            "geometry": geom_out,
        })

    # Guard rails — a bad source fetch or a classification regression should
    # fail loudly here, not silently ship a wrong count to the map.
    assert counts["member"] == 193, f"expected 193 UN members, got {counts['member']}"
    assert counts["observer"] == 2, f"expected 2 UN observers, got {counts['observer']}"
    assert len(out_features) >= 240, f"expected ~242 shapes, got {len(out_features)}"

    # Sanity-check the area formula itself against a distinctive, well-known
    # figure (Russia, ~17.1M km^2) — catches a wrong radius/unit, not just a
    # wrong classification.
    russia_area = next(f["properties"]["area_km2"] for f in out_features if f["properties"]["iso_a3"] == "RUS")
    assert 15_000_000 <= russia_area <= 19_000_000, f"Russia area looks wrong: {russia_area} km^2"

    # The World Bank should cover the overwhelming majority of shapes; a
    # near-zero count here means the API/filter broke, not that every
    # country suddenly went uncovered — fail loudly rather than silently
    # shipping an all-fallback population layer.
    assert pop_sources["worldbank"] >= 180, f"World Bank population coverage looks wrong: {pop_sources}"
    india_pop = next(f["properties"]["pop_current"] for f in out_features if f["properties"]["iso_a3"] == "IND")
    assert 1_000_000_000 <= india_pop <= 2_000_000_000, f"India population looks wrong: {india_pop}"

    # Density sanity check against Bangladesh — a large country, so its shape
    # isn't inflated by Natural Earth's micro-state oversizing the way a
    # Monaco or Vatican City would be, making it a clean cross-check that
    # pop_current / area_km2 didn't get its units crossed somewhere.
    bgd_density = next(f["properties"]["pop_density_km2"] for f in out_features if f["properties"]["iso_a3"] == "BGD")
    assert 800 <= bgd_density <= 2000, f"Bangladesh density looks wrong: {bgd_density} /km^2"

    # No real sub-2,000-km^2 shape has a population over ~8M (Hong Kong,
    # the densest real place in this dataset, is 1,029 km^2 / 7.5M) — well
    # clear of legitimate dense city-states (Singapore, Hong Kong, Bahrain),
    # so a shape past this line is the borrowed-ISO3 bug class recurring.
    for feat in out_features:
        fp = feat["properties"]
        if fp["area_km2"] < 2_000 and (fp["pop_current"] or 0) > 15_000_000:
            raise AssertionError(f"{fp['name']} looks like a borrowed-ISO3 population: {fp['pop_current']:,} over {fp['area_km2']} km^2")

    out = {"type": "FeatureCollection", "features": out_features}
    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    by_area = sorted(out_features, key=lambda f: f["properties"]["area_km2"])
    smallest, largest = by_area[0]["properties"], by_area[-1]["properties"]

    by_pop = sorted(out_features, key=lambda f: f["properties"]["pop_current"] or 0)
    pop_smallest, pop_largest = by_pop[0]["properties"], by_pop[-1]["properties"]

    print(f"wrote {OUT_PATH} ({OUT_PATH.stat().st_size:,} bytes)")
    print(f"{len(out_features)} shapes — {counts['member']} members, {counts['observer']} observers, {counts['other']} other")
    print(f"smallest: {smallest['name']} ({smallest['area_km2']:,} km^2)")
    print(f"largest: {largest['name']} ({largest['area_km2']:,} km^2)")
    print(f"population sources: {pop_sources}")
    print(f"least populous: {pop_smallest['name']} ({pop_smallest['pop_current']:,}, {pop_smallest['pop_source']})")
    print(f"most populous: {pop_largest['name']} ({pop_largest['pop_current']:,}, {pop_largest['pop_source']})")

    by_density = sorted(out_features, key=lambda f: f["properties"]["pop_density_km2"])
    dens_smallest, dens_largest = by_density[0]["properties"], by_density[-1]["properties"]
    print(f"least dense: {dens_smallest['name']} ({dens_smallest['pop_density_km2']:,}/km^2)")
    print(f"most dense: {dens_largest['name']} ({dens_largest['pop_density_km2']:,}/km^2)")


if __name__ == "__main__":
    main()
