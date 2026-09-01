"""Extract milwaukee.html's inner app document for editing.

    python tools/milwaukee_map/unpack.py            -> _work/app_inner.html
    python tools/milwaukee_map/unpack.py some.html  -> that path

_work/ is gitignored; edit the extracted file, then repack with pack.py.
ALWAYS `git pull` first — the weekly events Action also commits.
"""
import sys
from pathlib import Path

import bundle

out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent / "_work" / "app_inner.html"
out.parent.mkdir(parents=True, exist_ok=True)
inner = bundle.extract()
out.write_text(inner, encoding="utf-8", newline="\n")
print(f"extracted {len(inner):,} chars -> {out}")
