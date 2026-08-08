#!/usr/bin/env python3
"""Build archive/series.json — the index that lets a text find its siblings.

    python archive/build_series.py            # report only
    python archive/build_series.py --write    # write series.json

Why this exists
---------------
`shelves.md` links the FIRST part of each multi-part work, because a shelf is
an entrance and not an index. That was the whole click path: 148 of the 269
texts — Gita chapters 2-18, Brihadaranyaka books 1-6, Chandogya, Prasna,
Taittiriyaka and the rest — could only be reached by typing a URL. `entity.html`
had no idea a series existed.

What we can key on, and what we cannot
--------------------------------------
Every text carries front-matter, and it is rich, but none of it names the
individual work:

  part_of         264/269, 26 values — the SHELF, not the series. `upanishads`
                  alone holds 116 texts across a dozen different Upanishads,
                  `pali-canon` holds 43 unrelated suttas, `tanakh` 15 separate
                  books. Far too coarse to be a contents list.
  library_id      258/269, 37 values — the SOURCE EDITION
                  (`upanishads-muller-part2` = 105 texts). Also too coarse.
  library_chapter 201/269 — and NOT an order key. All 46 Brihadaranyaka parts
                  say `5`, all 28 Taittiriyaka parts say `5`, all 7 Maitrayana
                  parts say `6`: it is the chapter of the SBE volume the text
                  was taken from, not the text's position in its own work. It
                  happens to be the position only where a work maps 1:1 onto
                  chapters (Gita 1-18, Dhammapada 1-26).
  library_book    17/269 — the Bible/Tanakh book names, each a separate work.

So the series is DERIVED from the id, by stripping trailing positional
segments (`-book-1-part-2`, `-chapter-11`, `-prapathaka-6`, a bare `-2`), and
ordered by the numbers in the id — which is document order and agrees with the
titles ("Book 1, Part 2"). Nothing is renamed and no front-matter is invented;
if a `series:` key is ever added, this file should read it instead.

Part labels come from the titles: the common prefix across siblings is the
work's name, and what remains is the part ("Chapter 12 (Bhakti Yoga)"). That
keeps the reader's words rather than manufacturing "Part 12".
"""
import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
TEXTS = HERE / "texts"
OUT = HERE / "series.json"

# Trailing positional segments, innermost last: `-book-1-part-2` -> ``.
POS = re.compile(
    r"-(?:book|chapter|part|prapathaka|khanda|adhyaya|canto|section|volume|vol|valli|anuvaka)"
    r"-[0-9ivxlc]+$", re.I)
TRAILING_NUM = re.compile(r"-[0-9]+$")


def front_matter(text):
    m = re.match(r"^---\r?\n(.*?)\r?\n---", text, re.S)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).splitlines():
        if ":" not in line or re.match(r"^\s*[-#]", line):
            continue
        k, v = line.split(":", 1)
        fm[k.strip()] = v.strip().strip('"').strip("'")
    return fm


def work_key(stem):
    """Strip every trailing positional segment, then a bare trailing number."""
    w = stem
    while True:
        stripped = POS.sub("", w)
        if stripped == w:
            break
        w = stripped
    return TRAILING_NUM.sub("", w)


def order_key(stem):
    """Document order = the numbers in the id, in the order they appear."""
    nums = [int(n) for n in re.findall(r"[0-9]+", stem)]
    return (nums or [0], stem)


# Words that name a POSITION rather than the work. They belong to the part
# label ("Book 1, Part 2"), never to the work's name.
POS_WORD = re.compile(
    r"(?:,\s*)?\b(?:book|chapter|part|prapathaka|khanda|adhyaya|canto|section|volume|"
    r"vol|valli|anuvaka|tablet|sura|verses?|discourse)\b\s*[0-9ivxlc]*\s*[,:]?\s*$", re.I)


def common_prefix(titles):
    """The work's name = the longest shared opening of the sibling titles.

    Then backed off: the shared opening runs INTO the positional word, because
    every sibling says "…, Chapter". Left alone it produces a work called
    "Dhammapada, Chapter" whose parts are "1", "2" — so any trailing positional
    word (with its number) is handed back to the label, which is where the
    reader's own wording lives.
    """
    if len(titles) < 2:
        return ""
    pre = titles[0]
    for t in titles[1:]:
        i = 0
        while i < len(pre) and i < len(t) and pre[i] == t[i]:
            i += 1
        pre = pre[:i]
        if not pre:
            return ""
    # Never split mid-word.
    cut = max(pre.rfind(","), pre.rfind(" "))
    pre = pre[:cut + 1] if cut > 0 else ""
    # Hand back "…, Book 1, Part " one segment at a time.
    while True:
        shorter = POS_WORD.sub("", pre)
        if shorter == pre:
            break
        pre = shorter
    return pre


def build():
    if not TEXTS.is_dir():
        print(f"missing: {TEXTS}")
        return None
    recs = {}
    for p in sorted(TEXTS.glob("*.md")):
        fm = front_matter(p.read_text(encoding="utf-8", errors="replace"))
        recs[p.stem] = fm.get("title") or p.stem

    groups = defaultdict(list)
    for stem in recs:
        groups[work_key(stem)].append(stem)

    works = {}
    of = {}
    for key, members in sorted(groups.items()):
        if len(members) < 2:
            continue                      # a standalone text has no series
        members.sort(key=order_key)
        titles = [recs[m] for m in members]
        prefix = common_prefix(titles)
        name = prefix.rstrip(", ").strip() or key.replace("-", " ").title()
        parts = []
        for m in members:
            label = recs[m]
            if prefix and label.startswith(prefix):
                label = label[len(prefix):]
            label = label.lstrip(" ,")
            parts.append({"id": m, "label": label or recs[m]})
            of[m] = key
        works[key] = {"title": name, "parts": parts}
    return {
        "_doc": ("Generated by archive/build_series.py from the front-matter titles "
                 "in archive/texts/. `works` maps a derived work key to its ordered "
                 "parts; `of` maps a text id to its work. Multi-part works only — a "
                 "standalone text has no series and gets no contents list. Do not "
                 "hand-edit; re-run the script."),
        "works": works,
        "of": of,
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--write", action="store_true", help="write series.json")
    args = ap.parse_args()

    data = build()
    if data is None:
        return 1
    total = len(list(TEXTS.glob("*.md")))
    in_series = len(data["of"])
    print(f"{total} texts -> {len(data['works'])} multi-part works "
          f"covering {in_series} texts ({total - in_series} standalone)")
    for key, w in sorted(data["works"].items(), key=lambda kv: -len(kv[1]["parts"])):
        first = w["parts"][0]["label"]
        last = w["parts"][-1]["label"]
        print(f"   {w['title'][:38]:40} {len(w['parts']):3} parts   {first[:24]} … {last[:24]}")

    if not args.write:
        print("\nReport only. Add --write to build series.json.")
        return 0
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"\nwrote {OUT.name} ({OUT.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
