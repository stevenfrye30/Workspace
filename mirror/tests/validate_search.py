# Search: plural folding in BOTH apps that read the food library — mirror's
# tokenRank/aliases and nutrilens' filterSort are separate implementations — plus
# guards that the literal matches which already worked did not regress.
# Port 8144.
import subprocess, sys, time, atexit
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = str(Path(__file__).resolve().parents[2])
PORT = 8144
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
                       cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
atexit.register(srv.kill)
time.sleep(1.0)

PASS, FAIL = [], []
def ok(name, cond, extra=""):
    (PASS if cond else FAIL).append(name)
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else f"  -> {extra}"))

with sync_playwright() as pw:
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 900})

    # ---- Mirror ----
    p = ctx.new_page()
    errs = []
    p.on("pageerror", lambda e: errs.append(str(e)))
    p.goto(f"http://127.0.0.1:{PORT}/mirror/", wait_until="load")
    p.wait_for_timeout(300)
    p.evaluate("() => loadFoods()")
    p.wait_for_timeout(1800)
    ok("mirror loads clean", not errs, "; ".join(errs[:2]))

    # the stemmer itself
    stems = p.evaluate("""() => ({
      cashews: singularWord('cashews'), pistachios: singularWord('pistachios'),
      potatoes: singularWord('potatoes'), cherries: singularWord('cherries'),
      peaches: singularWord('peaches'), grapes: singularWord('grapes'),
      olives: singularWord('olives'), fries: singularWord('fries'),
      sandwiches: singularWord('sandwiches'), eggs: singularWord('eggs'),
      glass: singularWord('glass'), rice: singularWord('rice'), oats: singularWord('oats'),
    })""")
    want = {"cashews": "cashew", "pistachios": "pistachio", "potatoes": "potato",
            "cherries": "cherry", "peaches": "peach", "grapes": "grape",
            "olives": "olive", "fries": "fry", "sandwiches": "sandwich",
            "eggs": "egg", "glass": "glass", "rice": "rice", "oats": "oat"}
    for k, v in want.items():
        ok(f"stem {k} -> {v}", stems[k] == v, stems[k])

    def top(q, n=3):
        return p.evaluate("(q) => searchFoods(q).slice(0, %d).map(f => f.name)" % n, q)

    # the audit's plural misses now resolve
    for q, expect in [("cashews", "cashew"), ("pistachios", "pistachio"),
                      ("mashed potatoes", "mashed"), ("walnuts", "walnut"),
                      ("almonds", "almond"), ("grapes", "grape")]:
        hits = top(q)
        ok(f"query {q!r} finds it", any(expect in h.lower() for h in hits), str(hits))

    # singular query against a plural name (the other direction)
    for q, expect in [("cherry", "cherr"), ("strawberry", "strawberr"), ("olive", "olive")]:
        hits = top(q)
        ok(f"singular {q!r} reaches the plural row", any(expect in h.lower() for h in hits), str(hits))

    # nothing regressed: things that already worked still rank first
    for q, expect in [("boiled egg", "boiled"), ("cheddar", "cheddar"), ("banana", "banana"),
                      ("chicken breast", "chicken"), ("oreo", "sandwich"), ("popcorn", "popcorn"),
                      ("mayo", "mayonnaise"), ("bbq sauce", "barbecue")]:
        hits = top(q)
        ok(f"unregressed {q!r}", any(expect in h.lower() for h in hits), str(hits))

    # a stem must not invent a match out of nothing
    ok("nonsense still finds nothing", p.evaluate("() => searchFoods('zzzzq').length") == 0)
    ok("mirror clean after searching", not errs, "; ".join(errs[:2]))

    # ---- NutriLens ----
    p2 = ctx.new_page()
    e2 = []
    p2.on("pageerror", lambda e: e2.append(str(e)))
    p2.goto(f"http://127.0.0.1:{PORT}/nutrilens/", wait_until="load")
    p2.wait_for_timeout(700)
    ok("nutrilens loads clean", not e2, "; ".join(e2[:2]))
    def nl(q):
        p2.fill("#search", q)
        p2.dispatch_event("#search", "input")
        p2.wait_for_timeout(220)
        return p2.locator("#status").inner_text()
    s = nl("cashews")
    ok("nutrilens finds cashews", not s.startswith("0 "), s)
    s = nl("cherry")
    ok("nutrilens finds cherry", not s.startswith("0 "), s)
    s = nl("banana")
    ok("nutrilens unregressed on banana", not s.startswith("0 "), s)
    s = nl("zzzzq")
    ok("nutrilens still empty on nonsense", s.startswith("0 "), s)
    ok("nutrilens clean after searching", not e2, "; ".join(e2[:2]))
    b.close()

print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
