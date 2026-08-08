# archive/ series navigation (lives here so run_all.py picks it up).
# Series navigation: contents list, current part marked, prev/next, and the
# whole point — every text reachable by clicking.
import json, subprocess, sys, time, atexit
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
PORT = 8161
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
                       cwd=str(ROOT), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
atexit.register(srv.kill)
time.sleep(1.3)
BASE = f"http://127.0.0.1:{PORT}/archive/entity.html?id="

PASS, FAIL = [], []
def ok(n, c, e=""):
    (PASS if c else FAIL).append(n)
    print(("PASS " if c else "FAIL ") + n + ("" if c else f"  -> {e}"))

series = json.loads((ROOT / "archive" / "series.json").read_text(encoding="utf-8"))

with sync_playwright() as pw:
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 950})

    def load(tid):
        p = ctx.new_page()
        errs = []
        p.on("pageerror", lambda e: errs.append(str(e)))
        p.on("console", lambda m: errs.append("console: " + m.text[:110]) if m.type == "error" else None)
        p.goto(BASE + tid, wait_until="load", timeout=30000)
        p.wait_for_timeout(2200)
        return p, errs

    # --- a middle part of the biggest series ---
    p, errs = load("brihadaranyaka-upanishad-book-3-part-1")
    ok("middle part loads clean", not errs, "; ".join(errs[:2]))
    ok("contents list present", p.locator(".text-series").count() == 1)
    n = p.locator(".text-series li").count()
    ok("lists all 46 parts", n == 46, str(n))
    # The label is CSS-uppercased, like every other metadata heading here.
    head = p.locator(".text-series h2").inner_text()
    ok("work title in the heading", "brihadaranyaka" in head.lower(), head)
    ok("heading is uppercased like its siblings",
       p.evaluate("() => getComputedStyle(document.querySelector('.text-series h2')).textTransform")
       == "uppercase")
    here = p.locator(".text-series li.ts-here")
    ok("exactly one part marked as current", here.count() == 1, str(here.count()))
    ok("the marked part is this one", here.inner_text().strip() == "Book 3, Part 1", here.inner_text())
    ok("the current part is NOT a link", here.locator("a").count() == 0)
    ok("aria-current set", here.get_attribute("aria-current") == "true")
    # prev/next
    ok("prev/next present", p.locator(".text-series-nav").count() == 1)
    prev = p.locator(".text-series-nav .tsn-prev a").inner_text()
    nxt = p.locator(".text-series-nav .tsn-next a").inner_text()
    ok("prev is Book 2, Part 6", prev == "Book 2, Part 6", prev)
    ok("next is Book 3, Part 2", nxt == "Book 3, Part 2", nxt)
    # the reading itself is untouched
    ok("the text still renders", "Primary" in p.evaluate("() => document.body.innerText")
       or len(p.evaluate("() => document.body.innerText")) > 2000)
    p.close()

    # --- first part: no previous, has next ---
    p, errs = load("bhagavad-gita-chapter-1")
    ok("first part loads clean", not errs, "; ".join(errs[:2]))
    ok("first part has no Previous", p.locator(".text-series-nav .tsn-prev").count() == 0)
    ok("first part has Next", p.locator(".text-series-nav .tsn-next a").inner_text() == "Chapter 2 (Sankhya Yoga)")
    ok("gita lists 18 chapters", p.locator(".text-series li").count() == 18)
    p.close()

    # --- last part: has previous, no next ---
    p, errs = load("bhagavad-gita-chapter-18")
    ok("last part has Previous", p.locator(".text-series-nav .tsn-prev").count() == 1)
    ok("last part has no Next", p.locator(".text-series-nav .tsn-next").count() == 0)
    p.close()

    # --- a standalone text gets nothing ---
    p, errs = load("book-of-jonah")
    ok("standalone loads clean", not errs, "; ".join(errs[:2]))
    ok("standalone has no contents list", p.locator(".text-series").count() == 0)
    ok("standalone has no prev/next", p.locator(".text-series-nav").count() == 0)
    p.close()

    # --- clicking through actually navigates ---
    p, errs = load("prasna-upanishad-part-1")
    p.locator(".text-series-nav .tsn-next a").click()
    p.wait_for_timeout(2200)
    ok("Next navigates to part 2", "prasna-upanishad-part-2" in p.url, p.url)
    ok("and part 2 marks itself", p.locator(".text-series li.ts-here").inner_text().strip() == "Part 2",
       p.locator(".text-series li.ts-here").inner_text())
    # a contents-list link works too
    p.locator(".text-series a.ts-link").nth(3).click()
    p.wait_for_timeout(2200)
    ok("a contents link navigates", "prasna-upanishad-part-" in p.url, p.url)
    p.close()

    # --- REACHABILITY: every text in every series is linked from its siblings ---
    checked = 0
    unreachable = []
    for key, work in series["works"].items():
        entry = work["parts"][0]["id"]
        p = ctx.new_page()
        p.goto(BASE + entry, wait_until="load", timeout=30000)
        p.wait_for_timeout(1800)
        hrefs = p.evaluate("""() => [...document.querySelectorAll('.text-series a.ts-link')]
            .map(a => new URL(a.getAttribute('href'), location.href).searchParams.get('id'))""")
        marked = p.locator(".text-series li.ts-here").count()
        reach = set(hrefs) | ({entry} if marked else set())
        want = {q["id"] for q in work["parts"]}
        missing = want - reach
        if missing:
            unreachable.append((key, sorted(missing)[:3]))
        checked += len(want)
        p.close()
    ok(f"all {checked} series texts reachable from their work's entry",
       not unreachable, str(unreachable[:3]))
    b.close()

print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
