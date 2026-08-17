# Mirror v19 round — full acceptance: intake sub-forms, sleep wording,
# hygiene brush, column order, movement regression, themes/densities/390.
import json, re, subprocess, sys, time, atexit
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = str(Path(__file__).resolve().parents[2])
PORT = 8135
BASE = f"http://127.0.0.1:{PORT}/mirror/"
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
                       cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
atexit.register(srv.kill)
time.sleep(1.2)

PASS, FAIL = [], []
def ok(name, cond, extra=""):
    (PASS if cond else FAIL).append(name)
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else f"  -> {extra}"))

BAD_WORDS = re.compile(r"\bnap\b|\bovernight\b|last night", re.I)
ISO = "2026-08-01T00:00:00.000Z"

def seed_v18(today, yesterday):
    return {
        "__v": 18,
        "identity": {"values": [], "season": "", "reflections": [], "pulse": [], "journal": []},
        "body": {
            "food": [], "water": [], "sleep": [
                {"id": "sl1", "date": today, "hours": 7.5, "quality": 4, "start": 23.5, "end": 7,
                 "kind": "overnight", "_src": "manual", "_at": ISO, "_up": ISO},
                {"id": "sl2", "date": today, "hours": 1, "start": 14, "end": 15,
                 "kind": "nap", "_src": "manual", "_at": ISO, "_up": ISO}],
            "exercise": [], "symptoms": [],
            "targets": {"kcal": 2200, "protein_g": 80, "water_oz": 64, "weight_lb": 180},
            "favoriteFoods": [], "customFoods": [], "meals": [], "checkins": [],
            "drinks": [], "substances": [
                {"id": "sub0", "date": today, "kind": "alcohol", "count": 1,
                 "_src": "manual", "_at": ISO, "_up": ISO}],
            "hygiene": [{"id": "hyg0", "date": yesterday, "brush_am": True, "brush_pm": True,
                         "floss": True, "_src": "manual", "_at": ISO, "_up": ISO}],
            "exerciseTypes": [{"id": "et2", "name": "Bench", "cat": "lift", "_src": "manual", "_at": ISO, "_up": ISO}],
            "workouts": [],
        },
        "mind": {"books": [], "ideas": [], "questions": [], "quotes": []},
        "money": {"categories": [], "expenses": [], "income": [], "subscriptions": [], "netWorth": [], "goals": []},
        "relationships": {"people": [], "followUps": [], "giftIdeas": [], "birthdays": []},
        "daily": {"cards": []}, "decisions": {"items": []}, "habits": {"items": []},
        "places": {"items": [], "days": {}}, "completion": {},
        "calendar": {"events": [], "integration": {}}, "home": {"widgets": []},
        "links": [], "_deleted": [],
    }

def st(page): return json.loads(page.evaluate("() => localStorage.getItem('mirror_v1')"))
def feed(page): return page.evaluate("() => [...document.querySelectorAll('#feed .row .tx')].map(e=>e.textContent)")
def intake_h(page): return page.evaluate("() => Math.round(document.getElementById('intakeCard').getBoundingClientRect().height*10)")
def move_face(page):
    return page.evaluate("""() => { const r = document.getElementById('movementCard').getBoundingClientRect();
      return Math.round(r.x*10)+','+Math.round(r.y*10)+','+Math.round(r.width*10)+','+Math.round(r.height*10); }""")
def hyg_h(page): return page.evaluate("() => Math.round(document.getElementById('hygieneCard').getBoundingClientRect().height*10)")

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    ctx = browser.new_context(timezone_id="America/Indiana/Indianapolis", viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    console_errors, page_errors = [], []
    page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: page_errors.append(str(e)))

    page.goto(BASE, wait_until="load")
    today = page.evaluate("() => todayStr()")
    yesterday = page.evaluate("() => shiftDay(todayStr(), -1)")
    page.evaluate("(s) => localStorage.setItem('mirror_v1', JSON.stringify(s))", seed_v18(today, yesterday))
    page.reload(wait_until="load")
    page.wait_for_timeout(400)
    ok("loads clean on a v18 blob", not page_errors, "; ".join(page_errors[:2]))
    page.evaluate("() => saveState()")
    ok("v21 stamped", st(page)["__v"] == 21)

    # ---- box order (v20 superseded the assigned columns with a user-ordered
    # flow grid; the fresh-profile default is the catalogue order) ----
    boxes = page.evaluate("() => [...document.querySelectorAll('#dailyGrid > .card')].map(k => k.dataset.box)")
    ok("default box order is the catalogue order",
       boxes == ["food", "intake", "movement", "hygiene", "pulse", "glucose", "loggrid"], str(boxes))

    # ---- intake heights across every tab and sub-form step, themes x densities ----
    for theme in ("light", "dark"):
        for dense in (True, False):
            page.evaluate("(a) => { document.body.classList.toggle('theme-dark', a[0]); document.body.classList.toggle('dense', a[1]); }",
                          [theme == "dark", dense])
            page.wait_for_timeout(60)
            hs = set()
            for name in ("Water", "Coffee", "Alcohol", "Nicotine", "Weed", "Other"):
                page.locator("#intakeTabs button", has_text=name).first.click(); page.wait_for_timeout(50)
                hs.add(intake_h(page))
            # sub-form steps
            page.locator("#intakeTabs button", has_text="Alcohol").first.click(); page.wait_for_timeout(50)
            page.locator("#intakeQuick button", has_text="Wine").click(); page.wait_for_timeout(60)
            hs.add(intake_h(page))
            page.locator("#intakeTag .chip").click(); page.wait_for_timeout(50)
            hs.add(intake_h(page))
            page.locator("#intakeTabs button", has_text="Nicotine").first.click(); page.wait_for_timeout(50)
            page.locator("#intakeQuick button", has_text="Vape").click(); page.wait_for_timeout(60)
            hs.add(intake_h(page))
            page.locator("#intakeTag .chip").click(); page.wait_for_timeout(50)
            ok(f"intake height identical across tabs+steps [{theme}/{'compact' if dense else 'roomy'}]",
               len(hs) == 1, str(hs))
    page.evaluate("() => { document.body.classList.remove('theme-dark'); document.body.classList.add('dense'); }")
    page.wait_for_timeout(80)

    # ---- alcohol / nicotine records ----
    page.locator("#intakeTabs button", has_text="Alcohol").first.click(); page.wait_for_timeout(50)
    page.locator("#intakeQuick button", has_text="Shot").click(); page.wait_for_timeout(60)
    page.locator("#intakeQuick button", has_text="+1.5").click(); page.wait_for_timeout(100)
    rec = st(page)["body"]["substances"][-1]
    ok("alcohol record: form+oz, count 1", rec["form"] == "shot" and rec["oz"] == 1.5 and rec["count"] == 1, json.dumps(rec))
    page.locator("#intakeTabs button", has_text="Nicotine").first.click(); page.wait_for_timeout(50)
    page.locator("#intakeQuick button", has_text="Zyn").click(); page.wait_for_timeout(60)
    page.locator("#intakeQuick button", has_text="+3").click(); page.wait_for_timeout(100)
    rec = st(page)["body"]["substances"][-1]
    ok("nicotine record: form, count 3", rec["form"] == "zyn" and rec["count"] == 3, json.dumps(rec))
    f = feed(page)
    ok("tracker: 1.5 oz shot / ×3 zyn / legacy alcohol reads as kind",
       any(t == "1.5 oz shot" for t in f) and any(t == "×3 zyn" for t in f) and any(t == "alcohol" for t in f), str(f))
    ok("legacy alcohol total counts 2 drinks",
       "2" in page.locator("#intakeTabs button", has_text="Alcohol").inner_text())

    # ---- sleep wording: seeded nap + overnight rows read as sleep only ----
    f = feed(page)
    sleeps = [t for t in f if "sleep" in t]
    ok("both sleep rows say only sleep", len(sleeps) == 2 and not any(BAD_WORDS.search(t) for t in f), str(sleeps))
    body_text = page.evaluate("() => document.body.innerText")
    m = BAD_WORDS.search(body_text)
    ok("no nap/overnight/last-night visible anywhere", not m, m.group(0) if m else "")
    md = page.evaluate("() => buildDataMarkdown()")
    ok("md free of the words", not BAD_WORDS.search(md), (BAD_WORDS.search(md) or [""])[0] if BAD_WORDS.search(md) else "")

    # ---- hygiene: brush presses, tracker lines, undo, legacy, height ----
    hh = hyg_h(page)
    brush = page.locator("#hygRows button[data-rid=brush]")
    brush.click(); page.wait_for_timeout(70)
    brush.click(); page.wait_for_timeout(70)
    ok("two presses -> brush:2", next(h for h in st(page)["body"]["hygiene"] if h["date"] == today)["brush"] == 2)
    ok("two Brush tracker lines", len([t for t in feed(page) if t == "Brush"]) == 2)
    ok("hygiene height static", hyg_h(page) == hh)
    page.click("#undoBtn"); page.wait_for_timeout(80)
    ok("undo removes one press", next(h for h in st(page)["body"]["hygiene"] if h["date"] == today)["brush"] == 1)
    md = page.evaluate("() => buildDataMarkdown()")
    ok("md: legacy am/pm still read + new counter", "Brush AM, Brush PM" in md and "Brush ×1" in md)

    # hygiene merge union
    merged = page.evaluate("""() => {
      const d = todayStr();
      const A = { __v:19, body:{ hygiene:[{ id:'a', date:d, brush:2, shower:true, _src:'m', _at:'2026-08-07T09:00:00.000Z', _up:'2026-08-07T10:00:00.000Z' }]}, _deleted:[] };
      const B = { __v:19, body:{ hygiene:[{ id:'b', date:d, floss:true, _src:'m', _at:'2026-08-07T08:00:00.000Z', _up:'2026-08-07T09:30:00.000Z' }]}, _deleted:[] };
      const h = mergeStates(A, B).body.hygiene.filter(x => x.date === d)[0];
      return h.brush === 2 && h.shower === true && h.floss === true;
    }""")
    ok("hygiene two-device merge unions fields", merged)

    # ---- movement regression: face static, rapid taps, one Enter ----
    g0 = move_face(page)
    page.click("[data-excat=run]"); page.wait_for_timeout(70)
    page.evaluate("""() => {
      const t = [...document.querySelectorAll('#exSlot .exline')].find(r => r.textContent.includes('Time'));
      const c = t.querySelectorAll('.exchip'); c[1].click(); c[2].click();
    }""")
    page.wait_for_timeout(60)
    read = page.evaluate("() => [...document.querySelectorAll('#exSlot .exline')].find(r => r.textContent.includes('Time')).querySelector('.exread').textContent")
    ok("movement rapid +5+20 = 25", read == "25m", read)
    n0 = len(st(page)["body"]["exercise"])
    page.click("#exEnter"); page.wait_for_timeout(120)
    ok("one Enter one record", len(st(page)["body"]["exercise"]) == n0 + 1)
    ok("movement face unmoved", move_face(page) == g0)
    page.click("#undoBtn"); page.wait_for_timeout(80)
    ok("enter undoable", len(st(page)["body"]["exercise"]) == n0)

    # weekly review: reload then check minutes cell exists (kcal appears when est present)
    page.click("[data-excat=walk]"); page.wait_for_timeout(60)
    page.evaluate("""() => {
      const t = [...document.querySelectorAll('#exSlot .exline')].find(r => r.textContent.includes('Time'));
      t.querySelectorAll('.exchip')[2].click();
    }""")
    page.wait_for_timeout(50)
    page.click("#exEnter"); page.wait_for_timeout(120)
    page.reload(wait_until="load"); page.wait_for_timeout(400)
    wk = page.locator("#wkCells").inner_text()
    ok("weekly review: minutes + kcal", "20 min" in wk and "kcal" in wk, wk[wk.find("MOVEMENT"):wk.find("MOVEMENT")+60])
    ok("weekly review: brushed counts old+new", "BRUSHED" in wk and "3" in wk.split("BRUSHED")[1][:6], wk.split("BRUSHED")[1][:14])

    # ---- 390px ----
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(250)
    over = page.evaluate("() => document.scrollingElement.scrollWidth - window.innerWidth")
    ok("no horizontal overflow at 390px", over <= 0, f"{over}px")
    ih = intake_h(page)
    page.locator("#intakeTabs button", has_text="Alcohol").first.click(); page.wait_for_timeout(60)
    page.locator("#intakeQuick button", has_text="Beer").click(); page.wait_for_timeout(60)
    ok("intake height static at 390px through a sub-form", intake_h(page) == ih)
    page.set_viewport_size({"width": 1280, "height": 900})

    # ---- self.html round-trip zero-diff + visible-word scan ----
    before = st(page)
    page2 = ctx.new_page()
    p2err = []
    page2.on("pageerror", lambda e: p2err.append(str(e)))
    page2.goto(BASE + "self.html", wait_until="load")
    page2.wait_for_timeout(600)
    page2.evaluate("() => saveState()")
    page2.wait_for_timeout(150)
    after = json.loads(page2.evaluate("() => localStorage.getItem('mirror_v1')"))
    ok("self.html loads clean at v21", not p2err and after.get("__v") == 21, "; ".join(p2err[:2]))
    diffs = [k for k in before if k != "calendar"
             and json.dumps(before[k], sort_keys=True) != json.dumps(after.get(k), sort_keys=True)]
    ok("self.html round-trip zero-diff", not diffs, str(diffs))
    t2 = page2.evaluate("() => document.body.innerText")
    m2 = BAD_WORDS.search(t2)
    ok("self.html visible text clean of the words", not m2, m2.group(0) if m2 else "")
    md2 = page2.evaluate("() => buildDataMarkdown()")
    ok("self md carries brush counter + forms", "Brush ×" in md2)

    real = [e for e in console_errors if "foods.json" not in e and "favicon" not in e and "404" not in e]
    ok("no console errors", not real, "; ".join(real[:3]))
    ok("no page errors at the end", not page_errors, "; ".join(page_errors[:2]))
    browser.close()

print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
