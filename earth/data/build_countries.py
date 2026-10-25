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
"""
import json
import math
import urllib.request
from pathlib import Path

NE_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson"
MLEDOZE_URL = "https://raw.githubusercontent.com/mledoze/countries/master/countries.json"
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


def main():
    from shapely.geometry import shape, mapping

    ne = fetch_json(NE_URL)
    mledoze = fetch_json(MLEDOZE_URL)
    members_by_iso3 = {c["cca3"]: c for c in mledoze}

    out_features = []
    counts = {"member": 0, "observer": 0, "other": 0}

    for f in ne["features"]:
        p = f["properties"]
        iso3 = clean_iso3(p)
        status = classify(p, iso3, members_by_iso3)
        counts[status] += 1

        area_km2 = round(geodesic_area_km2(f["geometry"]), 2)
        area_log10 = round(math.log10(max(area_km2, 0.01)), 3)

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

    out = {"type": "FeatureCollection", "features": out_features}
    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    by_area = sorted(out_features, key=lambda f: f["properties"]["area_km2"])
    smallest, largest = by_area[0]["properties"], by_area[-1]["properties"]

    print(f"wrote {OUT_PATH} ({OUT_PATH.stat().st_size:,} bytes)")
    print(f"{len(out_features)} shapes — {counts['member']} members, {counts['observer']} observers, {counts['other']} other")
    print(f"smallest: {smallest['name']} ({smallest['area_km2']:,} km^2)")
    print(f"largest: {largest['name']} ({largest['area_km2']:,} km^2)")


if __name__ == "__main__":
    main()
