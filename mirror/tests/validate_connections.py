# Connections — the dashboard's cross-store engine (ported from self.html).
# Verifies the engine's judgments: outcome math, group thresholds, direction,
# substance signals, weekday card, empty state, and derived-not-stored.
import json, subprocess, sys, time, atexit
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = str(Path(__file__).resolve().parents[2])
PORT = 8137
BASE = f"http://127.0.0.1:{PORT}/mirror/"
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
                       cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
atexit.register(srv.kill)
time.sleep(1.2)

PASS, FAIL = [], []
def ok(name, cond, extra=""):
    (PASS if cond else FAIL).append(name)
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else f"  -> {extra}"))

ISO = "2026-08-01T00:00:00.000Z"

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    ctx = browser.new_context(timezone_id="America/Indiana/Indianapolis", viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    page_errors = []
    page.on("pageerror", lambda e: page_errors.append(str(e)))
    page.goto(BASE, wait_until="load")

    # ---- empty state first ----
    page.evaluate("() => localStorage.clear()")
    page.reload(wait_until="load"); page.wait_for_timeout(400)
    ok("empty record: gentle empty state",
       "starts talking back" in page.locator("#connCells").inner_text())
    ok("empty record: no felt-days count", page.locator("#sumConn").inner_text() == "")

    # ---- seed 30 felt days inside the 90-day window ----
    # moved days (15): mood 4 / energy 4  -> feel 4.0
    # rest days (15):  mood 3 / energy 3  -> feel 3.0   => 'Moved' Δ = +1.0
    # alcohol on 4 rest days                            => 'Drank' on-avg 3.0
    #   off-avg = (15*4 + 11*3)/26 = 3.577 -> 3.6, direction 'worse'
    # water 60 oz EVERY day => on-group only            => hidden (needs both ≥3)
    days = page.evaluate("() => Array.from({length: 30}, (_, i) => shiftDay(todayStr(), -(i + 1)))")
    moved = days[:15]
    rest = days[15:]
    alco = rest[:4]
    seed = {
        "__v": 19,
        "identity": {"values": [], "season": "", "reflections": [], "pulse": [], "journal": []},
        "body": {
            "food": [], "water": [{"id": f"w{i}", "date": d, "oz": 60, "_src": "m", "_at": ISO, "_up": ISO}
                                   for i, d in enumerate(days)],
            "sleep": [], "symptoms": [],
            "exercise": [{"id": f"e{i}", "date": d, "type": "Walk", "cat": "walk", "minutes": 20,
                          "_src": "m", "_at": ISO, "_up": ISO} for i, d in enumerate(moved)],
            "targets": {"kcal": 2200, "protein_g": 80, "water_oz": 64, "weight_lb": 180},
            "favoriteFoods": [], "customFoods": [], "meals": [], "checkins": [],
            "drinks": [], "hygiene": [], "exerciseTypes": [], "workouts": [],
            "substances": [{"id": f"a{i}", "date": d, "kind": "alcohol", "count": 1, "oz": 12,
                            "form": "beer", "_src": "m", "_at": ISO, "_up": ISO}
                           for i, d in enumerate(alco)],
        },
        "mind": {"books": [], "ideas": [], "questions": [], "quotes": []},
        "money": {"categories": [], "expenses": [], "income": [], "subscriptions": [], "netWorth": [], "goals": []},
        "relationships": {"people": [], "followUps": [], "giftIdeas": [], "birthdays": []},
        "daily": {"cards": ([{"id": f"c{i}", "date": d, "mood": 4, "energy": 4, "tags": [],
                              "_src": "m", "_at": ISO, "_up": ISO} for i, d in enumerate(moved)] +
                            [{"id": f"r{i}", "date": d, "mood": 3, "energy": 3, "tags": [],
                              "_src": "m", "_at": ISO, "_up": ISO} for i, d in enumerate(rest)])},
        "decisions": {"items": []}, "habits": {"items": []},
        "places": {"items": [], "days": {}}, "completion": {},
        "calendar": {"events": [], "integration": {}}, "home": {"widgets": []},
        "links": [], "_deleted": [],
    }
    page.evaluate("(s) => localStorage.setItem('mirror_v1', JSON.stringify(s))", seed)
    page.reload(wait_until="load"); page.wait_for_timeout(500)
    ok("loads clean with seeded record", not page_errors, "; ".join(page_errors[:2]))

    body = page.locator("#connCells").inner_text()

    # 'Moved': 4.0 vs 3.0, better, 15 vs 15
    ok("Moved surfaces with exact averages", "MOVED" in body and "4.0" in body and "3.0" in body, body[:400])
    moved_card = page.locator("#connCells .c", has_text="MOVED").first.inner_text()
    ok("Moved reads better · 15 vs 15", "better" in moved_card and "15 vs 15 days" in moved_card, moved_card)
    ok("Moved tinted good",
       page.locator("#connCells .c.good", has_text="MOVED").count() == 1)

    # 'Drank': on 3.0 vs off 3.6, worse, 4 vs 26
    drank = page.locator("#connCells .c", has_text="DRANK").first.inner_text()
    ok("Drank surfaces from the substance series", "3.0" in drank and "3.6" in drank, drank)
    ok("Drank reads worse · 4 vs 26", "worse" in drank and "4 vs 26 days" in drank, drank)
    ok("Drank tinted warn", page.locator("#connCells .c.warn", has_text="DRANK").count() == 1)

    # hydration hidden: every day is an on-day, so the off group is empty
    ok("one-sided signal stays silent", "HYDRATED" not in body, body)
    # no protein data at all -> silent
    ok("no-data signal stays silent", "PROTEIN" not in body, body)

    # hedging language on every association row
    n_assoc = page.locator("#connCells .c.good, #connCells .c.warn").count()
    n_hedge = page.locator("#connCells .c", has_text="A gentle association, not proof.").count()
    ok("every association hedges", n_assoc >= 2 and n_hedge == n_assoc, f"{n_assoc} vs {n_hedge}")

    # weekday card present (30 felt days -> at least 3 weekdays with 2+ days)
    ok("weekday card present", "WEEKDAY" in body)

    # the header counts felt days
    ok("felt-days count in the heading", "30 felt days" in page.locator("#sumConn").inner_text(),
       page.locator("#sumConn").inner_text())

    # derived, never stored: rendering wrote nothing
    st = json.loads(page.evaluate("() => localStorage.getItem('mirror_v1')"))
    ok("derived on read, stored nowhere",
       json.dumps(st, sort_keys=True) == json.dumps(json.loads(json.dumps(seed)), sort_keys=True))

    # sub-threshold difference stays silent: shrink the gap to 0.2 and re-check
    page.evaluate("""() => {
      const s = JSON.parse(localStorage.getItem('mirror_v1'));
      s.daily.cards.forEach((c) => { if (c.mood === 4) { c.mood = 3; c.energy = 3.4; } });
      localStorage.setItem('mirror_v1', JSON.stringify(s));
    }""")
    page.reload(wait_until="load"); page.wait_for_timeout(400)
    body2 = page.locator("#connCells").inner_text()
    ok("sub-0.35 difference stays silent", "MOVED" not in body2, body2[:300])

    ok("no page errors at the end", not page_errors, "; ".join(page_errors[:2]))
    browser.close()

print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
