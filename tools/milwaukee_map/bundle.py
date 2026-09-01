"""The one place that knows how milwaukee.html stores its app.

milwaukee.html is a BUNDLER file: the real app document (HTML+CSS+JS)
lives inside it as a single JSON string in the
<script type="__bundler/template"> block, and assets (Leaflet, fonts,
images) as gzip+base64 blobs in the __bundler/manifest block. Never edit
the file with text tools — extract the template, edit it, splice it back.

Every writer in this repo (and the terminal-side bake tool) goes through
this module, so the encoding rules live exactly once:

  * the template string starts at the literal  "<!DOCTYPE html>  and runs
    to the next unescaped double quote;
  * on encode, every "</" must become "<\\/" so the payload cannot
    terminate the host <script> element;
  * every write is round-trip proven — re-extract must equal what was
    written, or the write fails loudly.

Two marked, generated blocks inside the template belong to their tools —
never hand-edit inside them:
  // MKE_HEADLINES:BEGIN … END   (tools/milwaukee_events/refresh_map_events.py)
  // MKE_SEED:BEGIN … END        (projects/life/milwaukee/bake_map_data.py)
"""
from __future__ import annotations
import json
import re
from pathlib import Path

REPO = Path(__file__).parents[2]
MAP_HTML = REPO / "milwaukee.html"


def find_template(html: str) -> tuple[int, int]:
    """Span (i, j) of the template's JSON string literal, quotes included."""
    i = html.find('"<!DOCTYPE html>')
    if i == -1:
        raise SystemExit("REFUSE: bundler template string not found in milwaukee.html")
    j = i + 1
    esc = False
    while j < len(html):
        c = html[j]
        if esc:
            esc = False
        elif c == "\\":
            esc = True
        elif c == '"':
            break
        j += 1
    return i, j


def extract(path: Path = MAP_HTML) -> str:
    """The inner app document, decoded."""
    html = path.read_text(encoding="utf-8")
    i, j = find_template(html)
    return json.loads(html[i:j + 1])


def encode(inner: str) -> str:
    enc = json.dumps(inner, ensure_ascii=False).replace("</", "<\\/")
    if "</script" in enc.lower():
        raise SystemExit("REFUSE: encoded template still contains a script terminator")
    return enc


def write_inner(new_inner: str, path: Path = MAP_HTML) -> None:
    """Splice the inner document back and prove the round-trip."""
    html = path.read_text(encoding="utf-8")
    i, j = find_template(html)
    path.write_text(html[:i] + encode(new_inner) + html[j + 1:],
                    encoding="utf-8", newline="\n")
    if extract(path) != new_inner:
        raise SystemExit("FAIL: round-trip mismatch — restore milwaukee.html from git")


def replace_marked_block(inner: str, begin: str, end: str, block: str) -> str:
    """Swap exactly one BEGIN…END region; refuse on zero or many."""
    pattern = re.compile(re.escape(begin) + r".*?" + re.escape(end), re.S)
    hits = pattern.findall(inner)
    if len(hits) != 1:
        raise SystemExit(f"REFUSE: expected exactly one '{begin}' block, found {len(hits)}")
    return pattern.sub(lambda _: block, inner)
