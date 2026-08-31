"""Milwaukee events scraper.

Pulls upcoming/recent event coverage from a few live local sources and writes
upcoming.json next to this script. upcoming.html reads that file.

Run: python scrape.py
Add sources by appending to SOURCES.
"""

from __future__ import annotations
import json
import re
import ssl
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path
from xml.etree import ElementTree as ET

HERE = Path(__file__).parent
OUT_JSON = HERE / "upcoming.json"
USER_AGENT = "Mozilla/5.0 (compatible; MKE-calendar-prototype/0.1)"
CTX = ssl.create_default_context()


def fetch(url: str, timeout: int = 15) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read().decode("utf-8", "ignore")


def strip_html(s: str) -> str:
    s = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", "", s)
    s = re.sub(r"<[^>]+>", " ", s)
    s = unescape(s)
    return re.sub(r"\s+", " ", s).strip()


def parse_rfc822(s: str | None) -> str | None:
    if not s:
        return None
    try:
        dt = parsedate_to_datetime(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat()
    except (TypeError, ValueError):
        return None


def parse_rss(xml_text: str) -> list[dict]:
    # Strip namespaces (declarations + prefixes) for simpler traversal
    xml_text = re.sub(r'\sxmlns(:\w+)?="[^"]+"', "", xml_text)
    xml_text = re.sub(r"<(/?)\w+:", r"<\1", xml_text)
    xml_text = re.sub(r'\s\w+:(\w+)=', r" \1=", xml_text)
    root = ET.fromstring(xml_text)
    items = []
    for item in root.iter("item"):
        def txt(tag: str) -> str | None:
            el = item.find(tag)
            return el.text if el is not None and el.text else None

        items.append({
            "title": txt("title"),
            "link": txt("link"),
            "description": strip_html(txt("description") or ""),
            "date_iso": parse_rfc822(txt("pubDate")),
            "author": txt("creator"),
        })
    return items


# -------- source adapters --------

def shepherd_brew_city_buzz() -> list[dict]:
    """Weekly curated event roundups by Shepherd Express."""
    items = parse_rss(fetch("https://shepherdexpress.com/upcoming-events/index.rss"))
    out = []
    for it in items:
        title = it["title"] or ""
        # dated week ranges look like "April 16-April 22, 2026"
        m = re.search(r"([A-Z][a-z]+ \d{1,2})\s*[-–]\s*([A-Z][a-z]+ \d{1,2}),\s*(\d{4})", title)
        out.append({
            "title": title,
            "source": "Shepherd Express",
            "kind": "roundup",
            "week_range": f"{m.group(1)}–{m.group(2)}, {m.group(3)}" if m else None,
            "url": it["link"],
            "summary": it["description"],
            "published": it["date_iso"],
        })
    return out


ARTICLE_EVENT_HINTS = re.compile(
    r"\b(festival|fest|parade|concert|opens|kicks? off|returns?|tonight|weekend|"
    r"marathon|run|race|opening day|ribbon[- ]cutting|celebration|exhibit|"
    r"premiere|block party|gallery night|fireworks|brunch|fair|ride|"
    r"taste of|happens|takes place)\b",
    re.I,
)


def generic_filtered_rss(name: str, url: str, max_items: int = 25) -> list[dict]:
    items = parse_rss(fetch(url))
    out = []
    for it in items:
        title = (it["title"] or "").strip()
        desc = it["description"] or ""
        blob = f"{title}\n{desc}"
        if not ARTICLE_EVENT_HINTS.search(blob):
            continue
        out.append({
            "title": title,
            "source": name,
            "kind": "article",
            "week_range": None,
            "url": it["link"],
            "summary": desc[:400],
            "published": it["date_iso"],
        })
        if len(out) >= max_items:
            break
    return out


SOURCES = [
    ("Shepherd Brew City Buzz", shepherd_brew_city_buzz, ()),
    ("Urban Milwaukee (filtered)", generic_filtered_rss,
        ("Urban Milwaukee", "https://urbanmilwaukee.com/feed/")),
    ("OnMilwaukee (filtered)", generic_filtered_rss,
        ("OnMilwaukee", "https://onmilwaukee.com/rss")),
]


def main() -> int:
    all_items: list[dict] = []
    errors: list[dict] = []
    for label, fn, args in SOURCES:
        try:
            got = fn(*args)
            all_items.extend(got)
            print(f"  {label:32s} {len(got):3d} items")
        except (OSError, ET.ParseError, ValueError) as e:  # OSError: URLError + socket timeouts
            print(f"  {label:32s} ERROR {type(e).__name__}: {e}", file=sys.stderr)
            errors.append({"source": label, "error": f"{type(e).__name__}: {e}"})

    all_items.sort(key=lambda x: x.get("published") or "", reverse=True)

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(all_items),
        "errors": errors,
        "events": all_items,
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nWrote {len(all_items)} items to {OUT_JSON}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
