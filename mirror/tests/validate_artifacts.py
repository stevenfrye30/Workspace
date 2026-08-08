# Generated-artifact drift check — the test that would have caught foods.js.
#
# For four months `nutrilens/foods.js` was a compiled copy of `foods.json` that
# nothing regenerated: the NutriLens page searched 1,270 foods while Mirror
# searched 1,472 out of the same folder, and no test noticed, because no test
# ever compared an artifact to its source. A 2026-08-08 audit found four more of
# the same shape by hand. This is that audit, automated.
#
# It does two kinds of work:
#   REGENERATE — copy a pipeline's tracked inputs into a temp dir, run the real
#                generator there, and diff against what the repo ships. This is
#                the strong form: it proves the shipped file IS the source's
#                output, not merely that both exist.
#   ASSERT     — invariants that keep the classes of rot found in that audit
#                from coming back (no second copy of a corpus, no embedded
#                snapshot of a file that sits beside it, the four hand-copied
#                search stemmers still agreeing).
#
# No browser needed and nothing in the repo is written: every regeneration
# happens inside a TemporaryDirectory. See CONVENTIONS.md "Generated artifacts"
# for the table this file enforces.
import filecmp
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]

PASS, FAIL, SKIP = [], [], []
def ok(name, cond, extra=""):
    (PASS if cond else FAIL).append(name)
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else f"  -> {extra}"))
def skip(name, why):
    SKIP.append(name)
    print(f"SKIP {name}  ({why})")


# ---------------------------------------------------------------- REGENERATE
def regen_images():
    """images/build.py from images/data/*.json — the one fully-tracked pipeline."""
    src = REPO / "images"
    if not (src / "build.py").exists() or not (src / "data").is_dir():
        skip("images: regenerate and diff", "build.py or data/ missing")
        return
    with tempfile.TemporaryDirectory() as td:
        work = Path(td) / "images"
        # Copy only what the build reads, so a stray output cannot mask a diff.
        work.mkdir(parents=True)
        shutil.copy2(src / "build.py", work / "build.py")
        shutil.copytree(src / "data", work / "data")
        if (src / "media").is_dir():
            shutil.copytree(src / "media", work / "media")
        # build.py writes into regions/ and artists/ but does not create them —
        # in the repo they already exist. Mirror the directory shape, empty, so
        # a real output can still never be mistaken for a copied one.
        for d in sorted(p for p in src.iterdir() if p.is_dir()):
            if d.name not in {"data", "media"}:
                (work / d.name).mkdir(exist_ok=True)
        r = subprocess.run([sys.executable, "build.py"], cwd=str(work),
                           capture_output=True, text=True)
        if r.returncode != 0:
            ok("images: build.py runs", False, (r.stderr or r.stdout)[-400:])
            return
        ok("images: build.py runs", True)

        expected = [p for p in src.rglob("*")
                    if p.is_file() and p.suffix in {".html", ".json"}
                    and "data" not in p.relative_to(src).parts]
        diffs, missing = [], []
        for p in expected:
            rel = p.relative_to(src)
            got = work / rel
            if not got.exists():
                missing.append(str(rel))
            elif not filecmp.cmp(p, got, shallow=False):
                diffs.append(str(rel))
        ok(f"images: {len(expected)} outputs regenerate byte-identically",
           not diffs and not missing,
           f"{len(diffs)} differ e.g. {diffs[:4]}; {len(missing)} not produced e.g. {missing[:4]}")


def regen_foods():
    """merge_extra.py must already have folded every curated record in."""
    src = REPO / "nutrilens"
    if not (src / "merge_extra.py").exists():
        skip("nutrilens: re-merge and diff", "merge_extra.py missing")
        return
    with tempfile.TemporaryDirectory() as td:
        work = Path(td) / "nutrilens"
        work.mkdir(parents=True)
        for n in ("merge_extra.py", "foods.json", "foods-extra.json"):
            shutil.copy2(src / n, work / n)
        r = subprocess.run([sys.executable, "merge_extra.py"], cwd=str(work),
                           capture_output=True, text=True)
        ok("nutrilens: merge_extra.py runs clean", r.returncode == 0,
           (r.stderr or r.stdout)[-400:])
        if r.returncode != 0:
            return
        # Idempotent: re-merging what is already merged must change nothing.
        ok("nutrilens: foods.json already holds every curated record "
           "(re-merge is a no-op)",
           filecmp.cmp(src / "foods.json", work / "foods.json", shallow=False),
           "re-running merge_extra.py changed foods.json — a curated record "
           "was added to foods-extra.json without merging")

        base = json.loads((src / "foods.json").read_text(encoding="utf-8"))
        extra = json.loads((src / "foods-extra.json").read_text(encoding="utf-8"))
        have = {f["id"] for f in base["foods"]}
        want = {f["id"] for f in extra["foods"]}
        ok(f"nutrilens: all {len(want)} curated ids present in foods.json",
           want <= have, f"absent: {sorted(want - have)[:8]}")
        print(f"     foods.json holds {len(base['foods'])} records")


# ------------------------------------------------------------------- ASSERT
def assert_one_food_corpus():
    """The original bug: two copies of one corpus with no build step."""
    ok("nutrilens: no second compiled copy of the library (foods.js)",
       not (REPO / "nutrilens" / "foods.js").exists(),
       "foods.js is back — it has no generator and will drift; the page should "
       "fetch foods.json")
    idx = (REPO / "nutrilens" / "index.html").read_text(encoding="utf-8", errors="replace")
    ok("nutrilens: the page fetches foods.json",
       "fetch('foods.json'" in idx or 'fetch("foods.json"' in idx)
    ok("nutrilens: the page no longer script-tags a compiled library",
       "src=\"foods.js\"" not in idx and "src='foods.js'" not in idx)
    for name, path in (("mirror", "mirror/index.html"), ("self", "mirror/self.html")):
        t = (REPO / path).read_text(encoding="utf-8", errors="replace")
        ok(f"{name}: still reads ../nutrilens/foods.json",
           "../nutrilens/foods.json" in t)


def assert_no_embedded_graph():
    """graph/viewer.html embedded a 13-node snapshot of the file beside it."""
    v = REPO / "graph" / "viewer.html"
    g = REPO / "graph" / "atlas_graph.json"
    if not v.exists() or not g.exists():
        skip("graph: viewer reads the canonical file", "viewer.html or atlas_graph.json missing")
        return
    txt = v.read_text(encoding="utf-8", errors="replace")
    ok("graph: viewer holds no embedded graph literal",
       not re.search(r"(?:const|let|var)\s+EMBEDDED_SAMPLE", txt),
       "an embedded snapshot is back; it will disagree with atlas_graph.json")
    ok("graph: viewer fetches atlas_graph.json", "atlas_graph.json" in txt)
    graph = json.loads(g.read_text(encoding="utf-8"))
    print(f"     atlas_graph.json: {len(graph['nodes'])} nodes / {len(graph['edges'])} edges")
    # Everything that claims to read the graph must read THIS file.
    for rel in ("graph/graph.js", "archive/entity.html"):
        p = REPO / rel
        if p.exists():
            ok(f"graph: {rel} reads atlas_graph.json",
               "atlas_graph.json" in p.read_text(encoding="utf-8", errors="replace"))


def assert_stemmers_agree():
    """Four pages hand-copy the plural rules; drift there is silent."""
    files = {
        "mirror/index.html": None, "mirror/self.html": None,
        "mirror/records.html": None, "nutrilens/index.html": None,
    }
    rules = {}
    for rel in files:
        p = REPO / rel
        if not p.exists():
            skip(f"stemmer in {rel}", "file missing")
            continue
        txt = p.read_text(encoding="utf-8", errors="replace")
        m = re.search(r"function singularWord\(w\)\s*\{(.*?)\n\}", txt, re.S)
        if not m:
            ok(f"stemmer present in {rel}", False, "no singularWord() found")
            continue
        # Normalise whitespace and comments so formatting is not drift.
        body = re.sub(r"//[^\n]*", "", m.group(1))
        body = re.sub(r"/\*.*?\*/", "", body, flags=re.S)
        rules[rel] = re.sub(r"\s+", " ", body).strip()
    if len(rules) < 2:
        return
    uniq = set(rules.values())
    ok(f"the {len(rules)} copies of singularWord() are identical", len(uniq) == 1,
       "they have drifted:\n" + "\n".join(f"    {k}: {v[:90]}…" for k, v in rules.items()))
    for rel, body in rules.items():
        ok(f"{rel} keeps the ss guard", "endsWith('ss')" in body)
        break


def assert_philosophy_embed():
    """The page carries its data inline; the sibling copy was the trap."""
    idx = REPO / "philosophy" / "index.html"
    if not idx.exists():
        skip("philosophy: embedded corpus", "index.html missing")
        return
    txt = idx.read_text(encoding="utf-8", errors="replace")
    m = re.search(r'<script id="app-data" type="application/json">(.*?)</script>', txt, re.S)
    ok("philosophy: app-data block present and valid JSON", bool(m))
    if not m:
        return
    try:
        data = json.loads(m.group(1))
    except json.JSONDecodeError as e:
        ok("philosophy: app-data parses", False, str(e))
        return
    n = len(data.get("philosophers", []))
    print(f"     philosophy embeds {n} philosophers")
    ok("philosophy: no dead sibling data.json beside the page",
       not (REPO / "philosophy" / "data.json").exists(),
       "data.json is back; nothing fetches it, so it can only drift")

    # If the out-of-repo source is reachable, compare. A fresh clone cannot.
    src = REPO.parent / "projects" / "culture" / "Philosophy" / "data.json"
    if not src.exists():
        skip("philosophy: embedded == projects source", "source outside the repo, not present")
        return
    source = json.loads(src.read_text(encoding="utf-8"))
    sn = {p.get("name") for p in source.get("philosophers", [])}
    en = {p.get("name") for p in data.get("philosophers", [])}
    ok(f"philosophy: embedded corpus matches its source ({len(en)} vs {len(sn)})",
       data == source,
       "missing from the page: " + ", ".join(sorted(sn - en)[:12]))


def main():
    print("=" * 72)
    print("REGENERATE — run the real generator into a temp dir and diff")
    print("=" * 72)
    regen_images()
    regen_foods()
    print()
    print("=" * 72)
    print("ASSERT — invariants that keep the 2026-08-08 rot from returning")
    print("=" * 72)
    assert_one_food_corpus()
    assert_no_embedded_graph()
    assert_stemmers_agree()
    assert_philosophy_embed()

    print(f"\n{len(PASS)} passed, {len(FAIL)} failed, {len(SKIP)} skipped")
    if FAIL:
        print("\nDRIFT: a shipped artifact no longer matches its source, or an "
              "invariant from CONVENTIONS.md \"Generated artifacts\" broke.")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
