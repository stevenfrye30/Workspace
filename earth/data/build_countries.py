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
"""
import json
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
            },
            "geometry": geom_out,
        })

    # Guard rails — a bad source fetch or a classification regression should
    # fail loudly here, not silently ship a wrong count to the map.
    assert counts["member"] == 193, f"expected 193 UN members, got {counts['member']}"
    assert counts["observer"] == 2, f"expected 2 UN observers, got {counts['observer']}"
    assert len(out_features) >= 240, f"expected ~242 shapes, got {len(out_features)}"

    out = {"type": "FeatureCollection", "features": out_features}
    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    print(f"wrote {OUT_PATH} ({OUT_PATH.stat().st_size:,} bytes)")
    print(f"{len(out_features)} shapes — {counts['member']} members, {counts['observer']} observers, {counts['other']} other")


if __name__ == "__main__":
    main()
