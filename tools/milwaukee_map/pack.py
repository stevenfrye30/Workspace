"""Splice the edited inner document back into milwaukee.html.

    python tools/milwaukee_map/pack.py            <- _work/app_inner.html
    python tools/milwaukee_map/pack.py some.html  <- that path

Round-trip proven by bundle.write_inner; a failed proof leaves you to
restore from git. Smoke-test on localhost before committing:
    python -m http.server 8877  (from the repo root)
"""
import sys
from pathlib import Path

import bundle

src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent / "_work" / "app_inner.html"
new_inner = src.read_text(encoding="utf-8")
old_inner = bundle.extract()
bundle.write_inner(new_inner)
print(f"packed OK: inner {len(old_inner):,} -> {len(new_inner):,} chars; "
      f"{bundle.MAP_HTML.name} now {bundle.MAP_HTML.stat().st_size:,} bytes; round-trip proven")
