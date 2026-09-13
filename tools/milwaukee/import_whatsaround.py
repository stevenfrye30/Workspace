"""One-time importer: UWM's "What's Around Campus" directory → milwaukee/data/places.json

The PDF (Dean of Students office, yearly) lists places near campus by
category, each with its distance from campus, address, phone and site.
Campus is a ten-minute walk from home, so the distances stand in for ours.

Run:  python tools/milwaukee/import_whatsaround.py "<path to the PDF or its extracted .txt>"
      … --merge   keep the existing places.json's hand-edited fields (fav, note, tags) by id

Reads the PDF with PyMuPDF (pip install pymupdf) when given a .pdf; a .txt
with the same text (one entry per block) works without it. Writes
places.json — which is then HAND-EDITED: the daily Action never touches it.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parents[1] / "milwaukee" / "data" / "places.json"

CATEGORY = [  # header text (upper-cased, joined) → key, label, kind of thing
    (r"GENERAL MILWAUKEE", "town", "Around town"),
    (r"LAUNDROMAT", "laundry", "Laundromats"),
    (r"GROCERY", "groceries", "Groceries & markets"),
    (r"BOOKSTORE", "books", "Bookstores"),
    (r"HOSPITAL|CLINIC", "health", "Hospitals & clinics"),
    (r"VETERINAR", "vets", "Veterinarians"),
    (r"COFFEE", "coffee", "Coffee"),
    (r"THEATRE|THEATER|VENUE", "venues", "Theatres & venues"),
    (r"BARBER|SALON|SPA", "salons", "Barbers, salons & spas"),
    (r"MUSEUM", "museums", "Museums"),
    (r"RESTAURANT|FOOD", "food", "Restaurants"),
    (r"BAR|BREWER", "bars", "Bars & breweries"),
    (r"CHILDCARE", "childcare", "Childcare"),
    (r"CAR WASH", "carwash", "Car washes"),
    (r"BANK", "banks", "Banks"),
    (r"TAX", "tax", "Tax preparation"),
    (r"PRINT|COPY", "print", "Print & copy"),
]
OPTION_CATEGORIES = {"town", "groceries", "books", "coffee", "venues", "museums", "food", "bars"}  # things to go and do

PHONE = re.compile(r"\(?\b\d{3}\)?[\s.-]*\d{3}[\s.-]*\d{4}\b")
URLISH = re.compile(r"^(https?://\S+|www\.\S+|[\w.-]+\.(com|org|net|edu|us|io|coffee|cafe|site|co|gov|info|shop|bar|pizza)(/\S*)?)$", re.I)
DIST = re.compile(r"\((\d+(?:\.\d+)?)\.?\s*mi\w*\)|\((on campus[^)]*|on UWM[^)]*)\)", re.I)
ADDR = re.compile(r"^(\d{1,6}(-\d{2,6})?[A-Z]?\s+[NSEW]?\.?\s*\w|[NW]\d+\s*[NW]\d+|Student Union|UWM Student Union|EMS Building|Golda Meir|Lubar |Mitchell Hall|\d+ ?[NSEW] )", re.I)
LABELS = re.compile(r"^(Parks Map|NetNutrition|Yelp)\b|^Facebook$|\s\|\s")  # hyperlink labels with no URL in the text (case matters: not facebook.com/…)
HEADER = re.compile(r"^[A-Z][A-Z &,'’/-]{3,}$")
URLFRAG = re.compile(r"^[\w\-./?=&%:#]+( [\w\-./?=&%:#]+)?$")  # the tail of a URL that wrapped onto its own line
PAGEMARK = re.compile(r"^(=+ PAGE \d+ =+|\d{1,2})$")


def read_text(path: Path) -> str:
    if path.suffix.lower() == ".pdf":
        import fitz  # PyMuPDF
        return "\n".join(page.get_text() for page in fitz.open(path))
    return path.read_text(encoding="utf-8")


def clean_lines(text: str) -> list[str]:
    out = []
    for raw in text.splitlines():
        ln = raw.replace(" ", " ").replace("�", "’").strip()
        ln = re.sub(r"\s+", " ", ln)
        if PAGEMARK.match(ln):
            continue
        out.append(ln)
    return out


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60]


def site_url(s: str) -> str:
    s = s.strip().rstrip("/.")
    if re.match(r"^https?://", s, re.I):
        return s
    return "https://" + s


def parse(lines: list[str]) -> list[dict]:
    places, cat, cur = [], None, None
    pending_header = ""
    footnote = False

    def close():
        nonlocal cur
        if cur and cur["category"] == "town" and not (cur.get("addr") or cur.get("locations")):
            cur = None  # "City of Milwaukee", "911 (Emergency)": not places
            return
        if cur and (cur.get("addr") or cur.get("phone") or cur.get("site") or cur.get("locations")):
            if cur.get("locations") and not cur.get("addr"):
                first = cur["locations"][0]
                cur["addr"], cur["miles"], cur["phone"] = first.get("addr", ""), first.get("miles"), first.get("phone", "") or cur.get("phone", "")
            places.append(cur)
        cur = None

    i = 0
    while i < len(lines):
        ln = lines[i]
        i += 1
        if not ln:
            continue
        # category header (may wrap onto a second capitals line)
        if HEADER.match(ln) and not DIST.search(ln) and not ADDR.match(ln):
            pending_header = (pending_header + " " + ln).strip()
            for rx, key, label in CATEGORY:
                if re.search(rx, pending_header):
                    close()
                    cat = key
                    pending_header = ""
                    break
            continue
        pending_header = ""
        if ln.startswith("*"):
            footnote = True  # "*Students may receive discounts…" runs over several lines
            continue
        if footnote:
            if ln.endswith("tickets."):
                footnote = False
            continue
        if LABELS.search(ln):
            continue
        is_bullet = ln.startswith("•")
        body = ln.lstrip("• ").strip()
        if not body:
            # a bare bullet: the next line is a location line
            if cur is not None:
                cur.setdefault("locations", []).append({})
            continue
        if is_bullet and cur is not None:
            cur.setdefault("locations", []).append({})
        dm = DIST.search(body)
        # a bulleted branch named by town ("Brookfield (16.3 mi)") before its address
        if cur is not None and cur.get("locations") and cur["locations"] and not cur["locations"][-1].get("addr") \
                and dm and not ADDR.match(body) and not is_bullet:
            loc = cur["locations"][-1]
            loc["label"] = DIST.sub("", body).strip(" ,.")
            loc["miles"] = 0.1 if dm.group(2) else float(dm.group(1))
            continue
        if cur is not None and cur.get("locations") and (is_bullet or (ADDR.match(body) and cur["locations"] and not cur["locations"][-1].get("addr"))):
            loc = cur["locations"][-1] if cur["locations"] and not cur["locations"][-1].get("addr") else {}
            if loc is not cur["locations"][-1]:
                cur["locations"].append(loc)
            loc["addr"] = DIST.sub("", body).strip(" ,.")
            if dm:
                loc["miles"] = 0.1 if dm.group(2) else float(dm.group(1))
            continue
        if PHONE.search(body) and not ADDR.match(body):
            phone = PHONE.search(body).group(0)
            if cur is not None:
                if cur.get("locations") and not cur["locations"][-1].get("phone"):
                    cur["locations"][-1]["phone"] = phone
                elif not cur.get("phone"):
                    cur["phone"] = phone
            continue
        if URLISH.match(body):
            if cur is not None and not cur.get("site"):
                cur["site"] = site_url(body)
            continue
        if cur is not None and cur.get("site") and URLFRAG.match(body) and not dm and not ADDR.match(body):
            longest = max(len(t) for t in body.split())
            if "/" in body or "?" in body or body.endswith(".html") or longest >= 15 or body.islower():
                cur["site"] = cur["site"] + body.replace(" ", "")
                continue
        if re.search(r"\| Facebook$|- Home \| Facebook|^Facebook$", body):
            continue  # a hyperlink label, no URL behind it in the text
        if ADDR.match(body) and cur is not None and not cur.get("addr"):
            cur["addr"] = DIST.sub("", body).strip(" ,.")
            if dm and cur.get("miles") is None:
                cur["miles"] = 0.1 if dm.group(2) else float(dm.group(1))
            # a wrapped address continues on the next line ("Milwaukee, WI 53203")
            if i < len(lines) and re.match(r"^(Milwaukee|Wauwatosa|Shorewood|WI\b)", lines[i]):
                cur["addr"] += ", " + lines[i]
                i += 1
            continue
        # otherwise a name line
        if cur is not None and not (cur.get("addr") or cur.get("phone") or cur.get("site") or cur.get("locations")):
            # the name wrapped onto a second line
            cur["name"] = (cur["name"] + " " + DIST.sub("", body)).strip()
            if dm:
                cur["miles"] = 0.1 if dm.group(2) else float(dm.group(1))
            continue
        if cur is not None and cur.get("phone") and not dm and not cur.get("site") and len(body.split()) <= 6 and body.lower().replace("’", "'").startswith(cur["name"].lower().replace("’", "'")[:8]):
            continue  # a hyperlink label repeating the name, no URL behind it in the text
        if cur is not None and body[:1].islower() and not dm:
            cur["note"] = (cur.get("note", "") + " " + body).strip()  # a description line, not a new place
            continue
        close()
        name = DIST.sub("", body).strip(" ,.")
        cur = {"name": name, "category": cat or "other"}
        if dm:
            cur["miles"] = 0.1 if dm.group(2) else float(dm.group(1))
    close()
    return places


def reach_for(miles):
    if miles is None:
        return None
    if miles <= 1.6:
        return "walk"
    if miles <= 6:
        return "bus"
    return "car"


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    src = Path(sys.argv[1])
    merge = "--merge" in sys.argv
    old = {}
    if merge and OUT.exists():
        for p in json.loads(OUT.read_text(encoding="utf-8")).get("places", []):
            old[p["id"]] = p
    places = parse(clean_lines(read_text(src)))
    labels = {key: label for _, key, label in CATEGORY}
    out, seen = [], set()
    for p in places:
        pid = slug(p["name"]) + ("-" + p["category"] if slug(p["name"]) in seen else "")
        seen.add(slug(p["name"]))
        rec = {
            "id": pid,
            "name": p["name"],
            "category": p["category"],
            "option": p["category"] in OPTION_CATEGORIES,
            "addr": p.get("addr", ""),
            "phone": p.get("phone", ""),
            "site": p.get("site", ""),
            "miles": p.get("miles"),
            "reach": reach_for(p.get("miles")),
            "fav": False,
            "note": p.get("note", ""),
        }
        if p.get("locations"):
            rec["locations"] = [l for l in p["locations"] if l.get("addr")]
            if rec["locations"]:
                nearest = min((l for l in rec["locations"] if l.get("miles") is not None), key=lambda l: l["miles"], default=None)
                if nearest:
                    rec["miles"], rec["reach"] = nearest["miles"], reach_for(nearest["miles"])
        if merge and pid in old:
            for k in ("fav", "note", "tags", "reach"):
                if k in old[pid]:
                    rec[k] = old[pid][k]
        out.append(rec)
    out.sort(key=lambda r: (r["category"], r["name"].lower()))
    payload = {
        "_about": "Standing options — places that are there any day. Seeded from UWM's 'What's Around Campus' directory "
                  "(Dean of Students, yearly PDF) by tools/milwaukee/import_whatsaround.py; distances are from campus, a "
                  "ten-minute walk from home. HAND-EDITED after import: set fav, write a note, fix a reach, add places. "
                  "The daily Action never writes this file. option=true marks the categories that are things to go and do; "
                  "the rest is the practical directory.",
        "categories": [{"key": key, "label": label, "option": key in OPTION_CATEGORIES} for _, key, label in CATEGORY],
        "source": src.name,
        "v": 1,
        "places": out,
    }
    OUT.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    from collections import Counter
    c = Counter(r["category"] for r in out)
    print(f"{len(out)} places -> {OUT}")
    for key, label in labels.items():
        print(f"  {label:24s} {c.get(key, 0):3d}")
    missing = [r["name"] for r in out if not r["addr"]]
    if missing:
        print("  no address:", missing[:12])
    return 0


if __name__ == "__main__":
    sys.exit(main())
