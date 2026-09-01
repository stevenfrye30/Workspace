"""Refresh the "On in Milwaukee" headlines baked into milwaukee.html.

Canonical copy — moved into the repo 2026-08-31 so the weekly GitHub
Action (.github/workflows/milwaukee-events.yml) and a human run the same
code. The old projects/life/milwaukee/calendar/refresh_map_events.py is
a forwarding stub.

The bundle mechanics (template extraction, encoding, round-trip proof)
live in tools/milwaukee_map/bundle.py — this tool only builds its
generated block:

    // MKE_HEADLINES:BEGIN ... // MKE_HEADLINES:END

It runs scrape.py (same folder; writes upcoming.json beside it,
gitignored), rebuilds the block, and rewrites the file ONLY when the
headline list itself changed — the fetched-date line alone never forces
a commit.

Run:  python tools/milwaukee_events/refresh_map_events.py
      ... --skip-scrape   (inject from the existing upcoming.json)
"""
from __future__ import annotations
import json
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from hashlib import md5
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "milwaukee_map"))
import bundle  # noqa: E402

UPCOMING = HERE / "upcoming.json"
BEGIN = "// MKE_HEADLINES:BEGIN"
END = "// MKE_HEADLINES:END"
N_ARTICLES = 8
# Date chips only; a fixed CST/CDT-ish offset is fine at day granularity.
MKE_TZ = timezone(timedelta(hours=-5))


def clean(s: str) -> str:
    # U+FFFD between word chars is almost always a mangled apostrophe
    # (upstream feeds ship pre-broken bytes); elsewhere just drop it.
    s = re.sub(r"(?<=\w)�(?=\w)", "’", s)
    s = s.replace("�", "")
    s = re.sub(r"[<>]", "", s)  # feed rows render via innerHTML
    return re.sub(r"\s+", " ", s).strip()


def chip(iso: str | None) -> str:
    if not iso:
        return ""
    return datetime.fromisoformat(iso).astimezone(MKE_TZ).strftime("%b %d").replace(" 0", " ")


def build_rows(data: dict) -> str:
    events = data.get("events") or []
    if not events:
        raise SystemExit("REFUSE: upcoming.json holds zero events — not writing an empty block")
    roundups = [e for e in events if e.get("kind") == "roundup" and e.get("published")]
    articles = [e for e in events if e.get("kind") == "article" and e.get("published")]
    roundups.sort(key=lambda e: e["published"], reverse=True)
    articles.sort(key=lambda e: e["published"], reverse=True)
    picked = roundups[:1] + articles[:N_ARTICLES]
    if not picked:
        raise SystemExit("REFUSE: nothing dated to pick — not writing an empty block")
    rows = []
    for e in picked:
        rows.append("  { id: %s, date: %s, what: %s, source: %s, url: %s }" % (
            json.dumps("h-" + md5((e.get("url") or e["title"]).encode("utf-8")).hexdigest()[:8]),
            json.dumps(chip(e.get("published"))),
            json.dumps(clean(e["title"])),
            json.dumps(clean(e.get("source") or "")),
            json.dumps(e.get("url") or ""),
        ))
    return "const MKE_HEADLINES = [\n" + ",\n".join(rows) + "\n];"


def main() -> int:
    if "--skip-scrape" not in sys.argv:
        print("scraping…")
        subprocess.run([sys.executable, str(HERE / "scrape.py")], check=True)

    data = json.loads(UPCOMING.read_text(encoding="utf-8"))
    rows = build_rows(data)

    inner = bundle.extract()

    # No-change detection: compare only the headline array — the fetched-date
    # line alone must never produce a weekly noise commit.
    current = re.search(re.escape(BEGIN) + r".*?" + re.escape(END), inner, re.S)
    old_rows = current and re.search(r"const MKE_HEADLINES = \[.*?\];", current.group(0), re.S)
    if old_rows and old_rows.group(0) == rows:
        print("headlines unchanged — leaving milwaukee.html untouched")
        return 0

    fetched = datetime.fromisoformat(data["generated_at"]).astimezone(MKE_TZ).strftime("%b %d, %Y").replace(" 0", " ")
    block = (
        f"{BEGIN} — generated block; refresh with tools/milwaukee_events/refresh_map_events.py. Do not hand-edit.\n"
        f"const MKE_HEADLINES_FETCHED = {json.dumps(fetched)};\n"
        f"{rows}\n"
        f"{END}"
    )
    bundle.write_inner(bundle.replace_marked_block(inner, BEGIN, END, block))
    n = len(re.findall(r"\{ id: \"h-", block))
    print(f"injected {n} headlines (fetched {data['generated_at'][:10]}) into {bundle.MAP_HTML.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
