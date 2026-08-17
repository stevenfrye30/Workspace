# Mirror v18 — Movement card v3 + Intake fold removal: full acceptance.
# Playwright/Chromium, http.server on workspace-hub root, Indianapolis tz.
import json, subprocess, sys, time, atexit
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = str(Path(__file__).resolve().parents[2])
PORT = 8130
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
def seed_v17(today):
    return {
        "__v": 17,
        "identity": {"values": [], "season": "", "reflections": [], "pulse": [], "journal": []},
        "body": {
            "food": [], "water": [], "sleep": [],
            "exercise": [{"id": "ex1", "date": today, "type": "Walk", "minutes": 10,
                          "time": "08:00", "_src": "manual", "_at": ISO, "_up": ISO}],
            "symptoms": [], "targets": {"kcal": 2200, "protein_g": 80, "water_oz": 64},
            "favoriteFoods": [], "customFoods": [], "meals": [], "checkins": [],
            "drinks": [], "substances": [], "hygiene": [],
            "exerciseTypes": [
                {"id": "et1", "name": "Squat", "fav": True, "_src": "manual", "_at": ISO, "_up": ISO},
                {"id": "et2", "name": "Bench", "cat": "lift", "_src": "manual", "_at": ISO, "_up": ISO},
            ],
            "workouts": [{"id": "w1", "name": "Leg day",
                          "items": [{"type": "Squat", "minutes": 20}],
                          "_src": "manual", "_at": ISO, "_up": ISO}],
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
def face(page):
    """The card faces' exact boxes — movement AND intake."""
    return page.evaluate("""() => ['movementCard','intakeCard'].map(id => {
      const r = document.getElementById(id).getBoundingClientRect();
      return id + ':' + Math.round(r.x*10) + ',' + Math.round(r.y*10) + ',' + Math.round(r.width*10) + ',' + Math.round(r.height*10);
    }).join('|') + '|' + [...document.querySelectorAll('#exCats .excat')].map(b => {
      const q = b.getBoundingClientRect(); return Math.round(q.x*10)+','+Math.round(q.y*10)+','+Math.round(q.width*10)+','+Math.round(q.height*10);
    }).join('|')""")
def fits(page):
    return page.evaluate("() => { const s = document.getElementById('exSlot'); return s.scrollHeight <= s.clientHeight + 1; }")
def overflow_hidden(page):
    return page.evaluate("() => getComputedStyle(document.getElementById('exSlot')).overflow === 'hidden'")

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    ctx = browser.new_context(timezone_id="America/Indiana/Indianapolis", viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    console_errors, page_errors = [], []
    page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: page_errors.append(str(e)))

    page.goto(BASE, wait_until="load")
    today = page.evaluate("() => todayStr()")
    page.evaluate("(s) => localStorage.setItem('mirror_v1', JSON.stringify(s))", seed_v17(today))
    page.reload(wait_until="load")
    page.wait_for_timeout(400)
    ok("loads clean on a v17 blob", not page_errors, "; ".join(page_errors[:2]))

    # ---- item 1: intake static, fold gone ----
    ok("no exact-amount fold", page.locator("#intakeCard details").count() == 0)
    ih0 = page.evaluate("() => document.getElementById('intakeCard').getBoundingClientRect().height")
    page.locator("#intakeQuick button").first.click(); page.wait_for_timeout(120)
    for i in range(6):
        page.locator("#intakeTabs button").nth(i).click(); page.wait_for_timeout(50)
    ih1 = page.evaluate("() => document.getElementById('intakeCard').getBoundingClientRect().height")
    ok("intake card static through logging + every tab", ih0 == ih1, f"{ih0} vs {ih1}")

    # ---- migration ----
    page.evaluate("() => saveState()")
    s0 = st(page)
    ok("v22 stamped", s0["__v"] == 22)
    ok("weight_lb backfilled to 180", s0["body"]["targets"]["weight_lb"] == 180)

    # ---- THE GEOMETRY MATRIX: every state, byte-identical face ----
    # (per theme x density; the face string includes both cards and all 8 tiles)
    for theme in ("light", "dark"):
        for dense in (True, False):
            page.evaluate("(a) => { document.body.classList.toggle('theme-dark', a[0]); document.body.classList.toggle('dense', a[1]); }",
                          [theme == "dark", dense])
            page.wait_for_timeout(80)
            tag = f"[{theme}/{'compact' if dense else 'roomy'}]"
            g = face(page)
            states_ok = True; bad = ""
            ok(f"slot overflow hidden {tag}", overflow_hidden(page))
            for cat in ("walk", "run", "bike", "lift", "stretch", "other"):
                page.click(f"[data-excat={cat}]"); page.wait_for_timeout(70)
                if face(page) != g or not fits(page): states_ok = False; bad = cat + " open"; break
                if cat == "lift":
                    page.locator(".mv", has_text="Bench").click(); page.wait_for_timeout(60)   # moves selected
                    if face(page) != g or not fits(page): states_ok = False; bad = "lift selected"; break
                    page.locator(".mv.new").click(); page.wait_for_timeout(60)                 # + new open
                    if face(page) != g or not fits(page): states_ok = False; bad = "+new open"; break
                    page.keyboard.press("Escape"); page.wait_for_timeout(50)
                    page.locator(".exedit").click(); page.wait_for_timeout(60)                 # edit mode
                    if face(page) != g or not fits(page): states_ok = False; bad = "edit mode"; break
                    page.locator(".exedit").click(); page.wait_for_timeout(50)
                if cat == "other":
                    page.fill("#exOtherName", "Kayak"); page.wait_for_timeout(50)
                    if face(page) != g: states_ok = False; bad = "other typing"; break
                page.click(f"[data-excat={cat}]"); page.wait_for_timeout(50)                   # collapse
                if face(page) != g: states_ok = False; bad = cat + " collapsed"; break
            ok(f"face byte-identical across all states {tag}", states_ok, bad)
    page.evaluate("() => { document.body.classList.remove('theme-dark'); document.body.classList.add('dense'); }")
    page.wait_for_timeout(80)

    # ---- rapid taps accumulate exactly ----
    page.click("[data-excat=walk]"); page.wait_for_timeout(70)
    page.evaluate("""() => {
      const t = [...document.querySelectorAll('#exSlot .exline')].find(r => r.textContent.includes('Time'));
      const c = t.querySelectorAll('.exchip');
      c[1].click(); c[2].click();          // +5 +20 in one tick
    }""")
    page.wait_for_timeout(60)
    read = page.evaluate("() => [...document.querySelectorAll('#exSlot .exline')].find(r => r.textContent.includes('Time')).querySelector('.exread').textContent")
    ok("rapid +5 +20 = 25", read == "25m", read)

    # ---- one Enter = one record + one line, undoable; face constant ----
    gg = face(page)
    n0 = len(st(page)["body"]["exercise"])
    f0 = len(feed(page))
    page.click("#exEnter"); page.wait_for_timeout(150)
    s1 = st(page)
    ok("one Enter, one record", len(s1["body"]["exercise"]) == n0 + 1)
    ok("one new Tracker line", len(feed(page)) == f0 + 1)
    ok("record: walk 25 min + kcalEst", s1["body"]["exercise"][-1]["cat"] == "walk"
       and s1["body"]["exercise"][-1]["minutes"] == 25 and s1["body"]["exercise"][-1]["kcalEst"] > 0,
       json.dumps(s1["body"]["exercise"][-1]))
    ok("face constant after logging", face(page) == gg)
    page.click("#undoBtn"); page.wait_for_timeout(150)
    ok("Enter undoable", len(st(page)["body"]["exercise"]) == n0)

    # ---- lift full flow on the seeded chip ----
    page.click("[data-excat=lift]"); page.wait_for_timeout(70)
    page.locator(".mv", has_text="Bench").click(); page.wait_for_timeout(60)
    page.evaluate("""() => {
      const r = [...document.querySelectorAll('#exSlot .exline')].find(x => x.textContent.includes('Reps'));
      r.querySelectorAll('.exchip')[3].click();   // +25
    }""")
    page.wait_for_timeout(60)
    page.click("#exEnter"); page.wait_for_timeout(150)
    rec = st(page)["body"]["exercise"][-1]
    ok("lift session: one record with moves", rec["cat"] == "lift" and rec["moves"] == [{"name": "Bench", "reps": 25}], json.dumps(rec))
    # reps-only lift: the MET formula is per-minute, so no time = no estimate
    ok("reps-only lift has no kcalEst", "kcalEst" not in rec, json.dumps(rec))
    ok("lift Tracker line", any(t == "Lift · Bench ×25" for t in feed(page)), str(feed(page)))

    # ---- workouts unchanged: replay still fans out and collapses ----
    page.click("#wkListBtn"); page.wait_for_timeout(150)
    page.locator("#wkList .mealrow", has_text="Leg day").locator("button", has_text="Add").click()
    page.wait_for_timeout(120); page.evaluate("() => closePop()")
    s2 = st(page)
    wrows = [r for r in s2["body"]["exercise"] if r.get("workoutName") == "Leg day"]
    ok("workout replay unchanged (per-exercise rows)", len(wrows) == 1 and wrows[0]["type"] == "Squat", json.dumps(wrows))
    ok("workout Tracker line intact", any("Leg day" in t for t in feed(page)))
    page.click("#undoBtn"); page.wait_for_timeout(120)

    # ---- merge: gone beats absent; cat rides; newest _up wins ----
    merged = page.evaluate("""() => {
      const mk = (id, name, extra, up) => Object.assign({ id, name, _src:'manual', _at:'2026-08-01T00:00:00.000Z', _up: up }, extra);
      const mine = { __v: 18, body: { exerciseTypes: [
        mk('m1','Pistol squat',{cat:'lift'},'2026-08-07T10:00:00.000Z'),
        mk('m2','Neck',{cat:'stretch',gone:true},'2026-08-07T11:00:00.000Z'),
      ] }, _deleted: [] };
      const theirs = { __v: 18, body: { exerciseTypes: [
        mk('m2','Neck',{cat:'stretch'},'2026-08-06T00:00:00.000Z'),
        mk('m3','Rows',{cat:'lift'},'2026-08-05T00:00:00.000Z'),
      ] }, _deleted: [] };
      const out = mergeStates(mine, theirs);
      return out.body.exerciseTypes.map(r => r.id + ':' + r.name + ':' + (r.gone ? 'gone' : 'live')).sort();
    }""")
    ok("merge: union by id, gone wins by _up", merged == ["m1:Pistol squat:live", "m2:Neck:gone", "m3:Rows:live"], json.dumps(merged))

    # ---- forever-copy md carries the new shape ----
    md = page.evaluate("() => buildDataMarkdown()")
    ok("md exercise line uses the quick-log shape", "Lift · Bench ×25" in md, md[:0])

    # ---- 390px ----
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(250)
    over = page.evaluate("() => document.scrollingElement.scrollWidth - window.innerWidth")
    ok("no horizontal overflow at 390px", over <= 0, f"{over}px")
    page.click("[data-excat=lift]"); page.wait_for_timeout(80)
    ok("lift panel fits at 390px", fits(page))
    m390 = face(page)
    page.locator(".mv", has_text="Bench").click(); page.wait_for_timeout(60)
    ok("face constant at 390px through selection", face(page) == m390)
    page.click("[data-excat=lift]"); page.wait_for_timeout(60)
    page.set_viewport_size({"width": 1280, "height": 900})

    # ---- self.html round-trip: dashboard-written data byte-identical ----
    before = st(page)
    page2 = ctx.new_page()
    p2err = []
    page2.on("pageerror", lambda e: p2err.append(str(e)))
    page2.goto(BASE + "self.html", wait_until="load")
    page2.wait_for_timeout(600)
    page2.evaluate("() => saveState()")
    page2.wait_for_timeout(150)
    after = json.loads(page2.evaluate("() => localStorage.getItem('mirror_v1')"))
    ok("self.html loads clean at v22", not p2err and after.get("__v") == 22, "; ".join(p2err[:2]))
    diffs = []
    for k in before:
        if k == "calendar": continue      # self backfills integration defaults; documented config, not data
        if json.dumps(before[k], sort_keys=True) != json.dumps(after.get(k), sort_keys=True):
            diffs.append(k)
    ok("self.html round-trip zero-diff (all stores)", not diffs, str(diffs))
    md2 = page2.evaluate("() => buildDataMarkdown()")
    ok("self md: no 'null min', has body weight", "null min" not in md2 and "body weight 180 lb" in md2)

    # ---- console noise ----
    real = [e for e in console_errors if "foods.json" not in e and "favicon" not in e and "404" not in e]
    ok("no console errors", not real, "; ".join(real[:3]))
    ok("no page errors at the end", not page_errors, "; ".join(page_errors[:2]))
    browser.close()

print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
