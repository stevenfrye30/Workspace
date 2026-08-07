# Review-fix verification: one test per applied finding.
import json, subprocess, sys, time, atexit
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = str(Path(__file__).resolve().parents[2])
PORT = 8136
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

def st(page): return json.loads(page.evaluate("() => localStorage.getItem('mirror_v1')"))
def feed(page): return page.evaluate("() => [...document.querySelectorAll('#feed .row .tx')].map(e=>e.textContent)")

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    ctx = browser.new_context(timezone_id="America/Indiana/Indianapolis", viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    page_errors = []
    page.on("pageerror", lambda e: page_errors.append(str(e)))
    page.goto(BASE, wait_until="load")
    today = page.evaluate("() => todayStr()")

    # seed: weight 220; a lift chip; an out-of-range intensity record; a workout;
    # an 'other'-logged Kayak in history; ten lift moves for the scroll test
    seed = {
        "__v": 19,
        "body": {
            "targets": {"kcal": 2200, "protein_g": 80, "water_oz": 64, "weight_lb": 220},
            "exercise": [
                {"id": "bad1", "date": today, "cat": "run", "type": "Run", "minutes": 10,
                 "intensity": 6, "_src": "manual", "_at": ISO, "_up": ISO},
                {"id": "kay1", "date": today, "cat": "other", "type": "Kayak", "label": "Kayak",
                 "minutes": 30, "_src": "manual", "_at": ISO, "_up": ISO},
            ],
            "exerciseTypes": (
                [{"id": "sq", "name": "Squat", "cat": "lift", "_src": "m", "_at": ISO, "_up": ISO},
                 {"id": "ky", "name": "Kayak", "cat": "other", "_src": "m", "_at": ISO, "_up": ISO}] +
                [{"id": f"m{i}", "name": f"Move {i:02d}", "cat": "lift", "_src": "m", "_at": ISO, "_up": ISO}
                 for i in range(10)]),
            "workouts": [{"id": "w1", "name": "Leg day",
                          "items": [{"type": "Squat", "minutes": 20}, {"type": "Run", "minutes": 10}],
                          "_src": "m", "_at": ISO, "_up": ISO}],
            "food": [], "water": [], "sleep": [], "symptoms": [], "favoriteFoods": [],
            "customFoods": [], "meals": [], "checkins": [], "drinks": [], "substances": [], "hygiene": [],
        },
        "identity": {"values": [], "season": "", "reflections": [], "pulse": [], "journal": []},
        "mind": {"books": [], "ideas": [], "questions": [], "quotes": []},
        "money": {"categories": [], "expenses": [], "income": [], "subscriptions": [], "netWorth": [], "goals": []},
        "relationships": {"people": [], "followUps": [], "giftIdeas": [], "birthdays": []},
        "daily": {"cards": []}, "decisions": {"items": []}, "habits": {"items": []},
        "places": {"items": [], "days": {}}, "completion": {},
        "calendar": {"events": [], "integration": {}}, "home": {"widgets": []},
        "links": [], "_deleted": [],
    }
    page.evaluate("(s) => localStorage.setItem('mirror_v1', JSON.stringify(s))", seed)
    page.reload(wait_until="load")
    page.wait_for_timeout(400)

    # F4: intensity 6 record renders (clamped), page alive
    ok("F4: no crash on intensity 6", not page_errors, "; ".join(page_errors[:2]))
    f = feed(page)
    ok("F4: clamped to five dots", any("Run · 10 min · ●●●●●" in t for t in f), str(f))
    md = page.evaluate("() => buildDataMarkdown()")
    ok("F4: md builds", "Run · 10 min" in md)

    # F2: +new with different casing joins the existing chip
    page.click("[data-excat=lift]"); page.wait_for_timeout(80)
    page.locator(".mv.new").click(); page.wait_for_timeout(60)
    page.fill("#exNewName", "squat"); page.keyboard.press("Enter"); page.wait_for_timeout(100)
    sel = page.locator(".mv.sel").inner_text()
    ok("F2: 'squat' selects canonical 'Squat' chip", sel.startswith("Squat"), sel)
    page.evaluate("""() => {
      const r = [...document.querySelectorAll('#exSlot .exline')].find(x => x.textContent.includes('Reps'));
      r.querySelectorAll('.exchip')[3].click();
    }""")
    page.wait_for_timeout(60)
    ok("F2: reps land on the visible chip", "Squat ×25" in page.locator(".mv.sel").inner_text())
    ok("F2: no duplicate remembered record",
       len([r for r in st(page)["body"]["exerciseTypes"] if r["name"].lower() == "squat"]) == 1)

    # F15: scroll survives an accumulator tap (10 moves -> window scrolls)
    page.evaluate("() => { const w = document.querySelector('#exSlot .moveswin'); w.scrollTop = 40; }")
    page.evaluate("""() => {
      const t = [...document.querySelectorAll('#exSlot .exline')].find(x => x.textContent.includes('Time'));
      t.querySelectorAll('.exchip')[1].click();
    }""")
    page.wait_for_timeout(80)
    sc = page.evaluate("() => document.querySelector('#exSlot .moveswin').scrollTop")
    ok("F15: moves window keeps its scroll", sc == 40, str(sc))
    page.click("[data-excat=lift]"); page.wait_for_timeout(60)   # collapse

    # F12: delete Kayak (other) -> gone from builder list despite history
    page.click("[data-excat=other]"); page.wait_for_timeout(80)
    page.locator(".exedit").click(); page.wait_for_timeout(60)
    page.locator(".mv.del", has_text="Kayak").click(); page.wait_for_timeout(80)
    page.locator(".exedit").click(); page.wait_for_timeout(50)
    types = page.evaluate("() => exTypes()")
    ok("F12: deleted name gone from builder list", "Kayak" not in types, str(types))
    page.click("[data-excat=other]"); page.wait_for_timeout(50)

    # F14: typing over the name moves the gold highlight
    page.click("[data-excat=other]"); page.wait_for_timeout(80)
    # remember a chip first: log 'Pickleball'
    page.fill("#exOtherName", "Pickleball")
    page.evaluate("""() => {
      const t = [...document.querySelectorAll('#exSlot .exline')].find(x => x.textContent.includes('Time'));
      t.querySelectorAll('.exchip')[1].click();
    }""")
    page.wait_for_timeout(50)
    page.click("#exEnter"); page.wait_for_timeout(120)
    page.click("[data-excat=other]"); page.wait_for_timeout(80)
    page.locator(".mv", has_text="Pickleball").click(); page.wait_for_timeout(60)
    ok("F14: chip tap selects", page.locator(".mv.sel").count() == 1)
    page.locator("#exOtherName").fill("Kayaking")
    page.locator("#exOtherName").dispatch_event("input")
    page.wait_for_timeout(60)
    ok("F14: typing clears the stale gold chip", page.locator(".mv.sel").count() == 0)
    page.click("[data-excat=other]"); page.wait_for_timeout(50)

    # F10: weight change repaints an armed panel's estimate
    page.click("[data-excat=walk]"); page.wait_for_timeout(70)
    page.evaluate("""() => {
      const t = [...document.querySelectorAll('#exSlot .exline')].find(x => x.textContent.includes('Time'));
      t.querySelectorAll('.exchip')[3].click();   // +30
    }""")
    page.wait_for_timeout(60)
    k1 = page.locator("#exKcal").inner_text()
    page.click("#dataBtn"); page.wait_for_timeout(150)
    wi = page.locator("#dataActions input[type=number]")
    wi.fill("150"); wi.dispatch_event("change"); page.wait_for_timeout(100)
    page.evaluate("() => closePop()")
    k2 = page.locator("#exKcal").inner_text()
    ok("F10: armed estimate follows the new weight", k1 != k2 and k2, f"{k1} -> {k2}")
    page.click("[data-excat=walk]"); page.wait_for_timeout(50)

    # F5: one workout (2 rows) + 1 quick log -> weekly Movement counts 2 sessions... plus seed rows
    # seed already has 2 single rows (bad1, kay1) + Pickleball logged above = 3 singles
    page.click("#wkListBtn"); page.wait_for_timeout(150)
    page.locator("#wkList .mealrow", has_text="Leg day").locator("button", has_text="Add").click()
    page.wait_for_timeout(120); page.evaluate("() => closePop()")
    page.reload(wait_until="load"); page.wait_for_timeout(400)
    wk = page.locator("#wkCells").inner_text()
    seg = wk.split("MOVEMENT")[1][:16]
    ok("F5: weekly counts the workout once (4x total)", "4" in seg.split("·")[0], seg)

    # F11: Enter inside a builder minutes box saves the workout
    page.click("#wkBuildBtn"); page.wait_for_timeout(150)
    page.fill("#wkName", "Quick day")
    page.fill("#wkSearch", "Run"); page.wait_for_timeout(80)
    page.locator("#wkResults button", has_text="Run").first.click(); page.wait_for_timeout(80)
    mbox = page.locator("#wkItems .mealrow input").first
    mbox.fill("15")
    mbox.press("Enter"); page.wait_for_timeout(150)
    ok("F11: Enter in a minutes box saves and closes",
       page.evaluate("() => document.getElementById('pop').style.display") == "none"
       and any(w["name"] == "Quick day" for w in st(page)["body"]["workouts"]))

    # F3: edit survives the row object being replaced mid-edit (mock sync pull)
    page.click("#wkListBtn"); page.wait_for_timeout(150)
    page.locator("#wkList .mealrow", has_text="Quick day").locator("button", has_text="Edit").click()
    page.wait_for_timeout(120)
    page.evaluate("""() => {
      // simulate a background merge replacing every workout row object
      state.body.workouts = state.body.workouts.map((w) => JSON.parse(JSON.stringify(w)));
    }""")
    page.fill("#wkName", "Quick day B")
    page.click("#popOk"); page.wait_for_timeout(150)
    names = [w["name"] for w in st(page)["body"]["workouts"]]
    ok("F3: edit lands after object replacement", "Quick day B" in names and "Quick day" not in names, str(names))

    # F8: Overview label for a quick-log record
    lbl = page.evaluate("() => recordLabel({ cat:'lift', type:'Lift', moves:[{name:'Bench',reps:30}] }, 'exercise')")
    ok("F8: recordLabel reads the session", "Bench ×30" in lbl, lbl)

    # F9: focus ring inset — :focus-visible won't fire on programmatic focus,
    # so assert the rule itself via CSSOM.
    off = page.evaluate("""() => {
      for (const sheet of document.styleSheets) {
        for (const r of sheet.cssRules) {
          if (r.selectorText && r.selectorText.includes('.hyg button:focus-visible')) {
            return r.style.outlineOffset;
          }
        }
      }
      return null;
    }""")
    ok("F9: hygiene focus ring inset", off == "-3px", str(off))

    # ---- self.html fixes ----
    page2 = ctx.new_page()
    p2err = []
    page2.on("pageerror", lambda e: p2err.append(str(e)))
    page2.goto(BASE + "self.html", wait_until="load")
    page2.wait_for_timeout(600)
    # F1: targetsSave preserves weight_lb (150 set above)
    page2.evaluate("""() => {
      document.getElementById('tgtKcal').value = '2000';
      document.getElementById('tgtProtein').value = '90';
      document.getElementById('tgtWater').value = '72';
      document.getElementById('targetsSave').onclick();
    }""")
    page2.wait_for_timeout(150)
    t = json.loads(page2.evaluate("() => localStorage.getItem('mirror_v1')"))["body"]["targets"]
    ok("F1: self targetsSave keeps weight_lb", t.get("weight_lb") == 150 and t["kcal"] == 2000, json.dumps(t))
    # F6: timeline has no 'null min'
    tl = page2.evaluate("() => JSON.stringify(buildTimelineEvents())")
    ok("F6: timeline free of 'null min'", "null min" not in tl)
    # bonus: 'Last night' label gone from self
    t2 = page2.evaluate("() => document.body.innerText")
    ok("bonus: no 'Last night' in self.html", "Last night" not in t2)
    ok("self loads clean", not p2err, "; ".join(p2err[:2]))

    ok("no page errors at the end", not page_errors, "; ".join(page_errors[:2]))
    browser.close()

print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
