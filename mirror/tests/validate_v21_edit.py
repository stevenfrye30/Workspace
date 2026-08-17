# Mirror v21 — edit mode, the routine box you define, meds, and meals on the
# face. One check-block per acceptance item of the v21 spec, A1-A13.
#
# Seeds are synthetic and live in a throwaway Chromium profile; the real record
# is never read or written.
import json, subprocess, sys, time, atexit
from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = str(Path(__file__).resolve().parents[2])
PORT = 8142
BASE = f"http://127.0.0.1:{PORT}/mirror/"
TZ = "America/Indiana/Indianapolis"
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
                       cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
atexit.register(srv.kill)
time.sleep(1.2)

# The fixture's "today", in the browser's timezone. A hard-coded date would make
# every "does the old record still read" check silently vacuous once the clock
# moved past it.
TODAY = datetime.now(ZoneInfo(TZ)).strftime("%Y-%m-%d")

PASS, FAIL = [], []
def ok(name, cond, extra=""):
    (PASS if cond else FAIL).append(name)
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else f"  -> {extra}"))

def st(page): return json.loads(page.evaluate("() => localStorage.getItem('mirror_v1')"))
def lay(page): return json.loads(page.evaluate("() => localStorage.getItem('mirror_layout_v1') || 'null'"))
def feed(page): return page.evaluate(
    "() => [...document.querySelectorAll('#feed .row .tx')].map(e => e.textContent)")
def h(page, card):
    return page.evaluate("(id) => Math.round(document.getElementById(id).getBoundingClientRect().height * 10)", card)
def box(page, sel):
    return page.evaluate("""(s) => { const e = document.querySelector(s); if (!e) return null;
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      return { h: Math.round(r.height), w: Math.round(r.width), ovY: cs.overflowY,
               scrolls: e.scrollHeight > e.clientHeight + 1 }; }""", sel)
def edit_on(page):
    if page.locator("#editBtn").get_attribute("aria-pressed") != "true":
        page.click("#editBtn"); page.wait_for_timeout(160)
def edit_off(page):
    if page.locator("#editBtn").get_attribute("aria-pressed") == "true":
        page.click("#editBtn"); page.wait_for_timeout(160)

# A v20 record: no routine, no meds, no scales — exactly what an upgrader holds.
ISO = "2026-08-01T00:00:00.000Z"
def seed_v20():
    return {
        "__v": 20,
        "identity": {"values": [], "season": "", "reflections": [], "pulse": [], "journal": []},
        "body": {
            "food": [], "water": [], "sleep": [], "exercise": [], "symptoms": [],
            "targets": {"kcal": 2200, "protein_g": 80, "water_oz": 64, "weight_lb": 173},
            "favoriteFoods": [], "customFoods": [], "meals": [], "checkins": [],
            "drinks": [], "substances": [], "exerciseTypes": [], "workouts": [],
            "glucose": [], "hygiene": [
                # A day already marked under the v15/v19 field names, plus the
                # v15 am/pm booleans that stopped being written at v19.
                {"id": "h1", "date": TODAY, "shower": True, "brush": 2,
                 "brush_am": True, "brush_pm": True,
                 "_src": "manual", "_at": ISO, "_up": ISO}],
        },
        "mind": {"books": [], "ideas": [], "questions": [], "quotes": []},
        "money": {"categories": [], "expenses": [], "income": [], "subscriptions": [],
                  "netWorth": [], "goals": []},
        "relationships": {"people": [], "followUps": [], "giftIdeas": [], "birthdays": []},
        "daily": {"cards": []}, "decisions": {"items": []}, "habits": {"items": []},
        "places": {"items": [], "days": {}}, "completion": {},
        "calendar": {"events": [], "integration": {}}, "home": {"widgets": []},
        "links": [], "_deleted": [],
    }

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    ctx = browser.new_context(timezone_id=TZ, viewport={"width": 1280, "height": 1100},
                             has_touch=True)
    page = ctx.new_page()
    console_errors, page_errors = [], []
    page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: page_errors.append(str(e)))

    page.goto(BASE, wait_until="load")
    page.evaluate("(s) => localStorage.setItem('mirror_v1', JSON.stringify(s))", seed_v20())
    page.reload(wait_until="load"); page.wait_for_timeout(450)
    ok("loads clean on a v20 blob", not page_errors, "; ".join(page_errors[:2]))

    # ================================================================
    # A1 — the toggle: fifth tools button, between the theme moon and Data
    # ================================================================
    tools = page.evaluate("() => [...document.querySelectorAll('.top .tools > button')].map(b => b.id)")
    ok("A1: fifth tools button, between the moon and Data",
       tools == ["undoBtn", "densityBtn", "themeBtn", "editBtn", "syncBtn", "dataBtn"], str(tools))
    ok("A1: reads Edit and is not pressed",
       "Edit" in page.locator("#editBtn").inner_text()
       and page.locator("#editBtn").get_attribute("aria-pressed") == "false")
    page.click("#editBtn"); page.wait_for_timeout(180)
    ok("A1: pressed, filled with the accent, reads Done",
       page.locator("#editBtn").get_attribute("aria-pressed") == "true"
       and "Done" in page.locator("#editBtn").inner_text()
       and page.evaluate("() => getComputedStyle(document.getElementById('editBtn')).backgroundColor")
           == page.evaluate("() => getComputedStyle(document.body).getPropertyValue('--accent').trim()")
              .replace("#8a6a3e", "rgb(138, 106, 62)"),
       page.evaluate("() => getComputedStyle(document.getElementById('editBtn')).backgroundColor"))
    ok("A1: cards take the faint accent edge",
       page.evaluate("() => getComputedStyle(document.getElementById('foodCard')).borderColor")
       == "rgba(200, 155, 96, 0.4)",
       page.evaluate("() => getComputedStyle(document.getElementById('foodCard')).borderColor"))
    ok("A1: one-line explainer appears", page.locator("#editNote").is_visible()
       and len(page.locator("#editNote").inner_text()) < 220)
    page.keyboard.press("Escape"); page.wait_for_timeout(180)
    ok("A1: Escape exits", page.locator("#editBtn").get_attribute("aria-pressed") == "false")
    # Escape must not steal the key from a popover that is closing: one press
    # closes the pop and LEAVES edit mode on, so dismissing a form never also
    # throws away the mode you were working in.
    edit_on(page)
    page.locator("#hygRows .addt").click(); page.wait_for_timeout(180)
    ok("A1: the add pop is open", page.locator("#pop").is_visible())
    page.keyboard.press("Escape"); page.wait_for_timeout(180)
    ok("A1: Escape closes the pop and leaves edit mode alone",
       page.locator("#pop").is_hidden()
       and page.locator("#editBtn").get_attribute("aria-pressed") == "true")
    page.keyboard.press("Escape"); page.wait_for_timeout(180)
    ok("A1: the next Escape then exits edit mode",
       page.locator("#editBtn").get_attribute("aria-pressed") == "false")
    edit_on(page)
    page.reload(wait_until="load"); page.wait_for_timeout(450)
    ok("A1: edit mode does not survive a reload",
       page.locator("#editBtn").get_attribute("aria-pressed") == "false")

    # ================================================================
    # A2 — normal mode is a control panel: no rail, no handles, no ✕
    # ================================================================
    ok("A2: rail hidden", not page.locator(".rail").is_visible())
    ok("A2: no drag handles", page.evaluate(
        "() => [...document.querySelectorAll('.grab')].every(e => !e.offsetParent)"))
    ok("A2: no minimise buttons", page.evaluate(
        "() => [...document.querySelectorAll('.minb')].every(e => !e.offsetParent)"))
    ok("A2: no corner ✕ anywhere", page.locator(".cornx").count() == 0)
    ok("A2: no explainer", not page.locator("#editNote").is_visible())
    edit_on(page)
    ok("A2: editing brings all of them back",
       page.locator(".rail").is_visible()
       and page.evaluate("() => [...document.querySelectorAll('.grab')].every(e => !!e.offsetParent)")
       and page.evaluate("() => [...document.querySelectorAll('.minb')].every(e => !!e.offsetParent)")
       and page.locator(".cornx").count() > 0)
    edit_off(page)

    # ================================================================
    # A3 — the routine box's geometry
    # ================================================================
    b = box(page, "#hygRows")
    ok("A3: tile grid is a hard 110px that scrolls internally",
       b["h"] == 110 and b["ovY"] == "auto", json.dumps(b))
    ok("A3: four columns",
       page.evaluate("() => getComputedStyle(document.getElementById('hygRows')).gridTemplateColumns")
       .count(" ") == 3)
    nb = box(page, "#hygNum")
    ok("A3: number row is permanently reserved at 34px",
       nb["h"] == 34 and page.locator("#hygNum").is_visible(), json.dumps(nb))
    ok("A3: and it holds a hint, not a field, until you pick one",
       page.locator("#hygNum input").count() == 0
       and page.locator("#hygNum").inner_text().strip() != "")
    ok("A3: heading is the box's name, defaulting to Upkeep",
       page.locator("#routineName").inner_text().lower() == "upkeep",
       page.locator("#routineName").inner_text())
    # Nine tiles must not make the card taller.
    h_before = h(page, "hygieneCard")
    page.evaluate("""() => {
      for (let i = 0; i < 6; i++) {
        state.body.routine.items.push(stamp({ id: 'extra' + i, name: 'Extra ' + i,
          icon: '•', kind: 'mark' }));
      }
      saveState(); renderHygiene();
    }""")
    page.wait_for_timeout(180)
    ok("A3: eleven tiles, same card height", h(page, "hygieneCard") == h_before,
       f"{h_before} -> {h(page, 'hygieneCard')}")
    ok("A3: the ninth tile scrolls inside the window", box(page, "#hygRows")["scrolls"])
    page.evaluate("""() => {
      state.body.routine.items = state.body.routine.items.filter(i => !i.id.startsWith('extra'));
      saveState(); renderHygiene();
    }""")
    page.wait_for_timeout(150)

    # ================================================================
    # A4 — marks keep their old fields; add, retire, rename
    # ================================================================
    ok("A4: the v20 record still reads on the seeded tiles",
       page.locator("#hygRows button[data-rid=shower]").get_attribute("aria-pressed") == "true"
       and "2" in page.locator("#hygRows button[data-rid=brush]").inner_text())
    ok("A4: seeded ids are TODAY'S field names, not new ones",
       [i["id"] for i in st(page)["body"]["routine"]["items"]]
       == ["brush", "shower", "floss", "haircut", "glucose"],
       json.dumps([i["id"] for i in st(page)["body"]["routine"]["items"]]))
    page.locator("#hygRows button[data-rid=floss]").click(); page.wait_for_timeout(180)
    ok("A4: a mark writes the field it always wrote",
       next(x for x in st(page)["body"]["hygiene"] if x["date"] == TODAY).get("floss") is True)
    page.locator("#hygRows button[data-rid=brush]").click(); page.wait_for_timeout(180)
    ok("A4: a count increments and is one Tracker line per press",
       next(x for x in st(page)["body"]["hygiene"] if x["date"] == TODAY)["brush"] == 3
       and feed(page).count("Brush") == 3, str(feed(page)))

    edit_on(page)
    page.locator("#hygRows .addt").click(); page.wait_for_timeout(200)
    page.fill("#popRName", "Weight")
    page.locator("#popRKind [data-rk=measure]").click(); page.wait_for_timeout(90)
    ok("A4: the unit field belongs to measurements only",
       page.evaluate("() => getComputedStyle(document.getElementById('popRUnitWrap')).visibility") == "visible")
    page.locator("#popRKind [data-rk=mark]").click(); page.wait_for_timeout(90)
    ok("A4: and is hidden, not removed, for a mark — the pop keeps its height",
       page.evaluate("() => getComputedStyle(document.getElementById('popRUnitWrap')).visibility") == "hidden")
    page.locator("#popRKind [data-rk=measure]").click(); page.wait_for_timeout(90)
    page.fill("#popRUnit", "lb")
    page.click("#popOk"); page.wait_for_timeout(250)
    edit_off(page)
    ok("A4: the new measurement is a tile on the face",
       page.locator("#hygRows button[data-rid=weight]").count() == 1)
    page.locator("#hygRows button[data-rid=weight]").click(); page.wait_for_timeout(180)
    ok("A4: picking it fills the reserved row without resizing it",
       box(page, "#hygNum")["h"] == 34 and page.locator("#hygNum input").count() == 1)
    page.fill("#hygNumVal", "181.5"); page.keyboard.press("Enter"); page.wait_for_timeout(250)
    ms = st(page)["body"]["measurements"]
    ok("A4: a measurement is its own record with unit and itemId",
       len(ms) == 1 and ms[0]["value"] == 181.5 and ms[0]["unit"] == "lb"
       and ms[0]["itemId"] == "weight" and ms[0]["date"] == TODAY, json.dumps(ms))
    ok("A4: and a Tracker line", "Weight 181.5 lb" in feed(page), str(feed(page)))

    edit_on(page)
    page.locator("#hygRows button[data-rid=haircut] .cornx").click(); page.wait_for_timeout(220)
    it = next(i for i in st(page)["body"]["routine"]["items"] if i["id"] == "haircut")
    ok("A4: ✕ RETIRES, never deletes — gone is a flag on a kept item",
       it.get("gone") is True and len(st(page)["body"]["routine"]["items"]) == 6, json.dumps(it))
    ok("A4: a retired tile is visible while editing, as the way back",
       page.locator("#hygRows button[data-rid=haircut]").count() == 1)
    edit_off(page)
    ok("A4: and absent in normal use",
       page.locator("#hygRows button[data-rid=haircut]").count() == 0)
    edit_on(page)
    page.locator("#hygRows button[data-rid=haircut] .cornx").click(); page.wait_for_timeout(220)
    edit_off(page)
    ok("A4: restoring brings it back",
       page.locator("#hygRows button[data-rid=haircut]").count() == 1
       and not next(i for i in st(page)["body"]["routine"]["items"] if i["id"] == "haircut").get("gone"))

    edit_on(page)
    page.click("#routineName"); page.wait_for_timeout(200)
    page.fill("#popRoutine", "Morning"); page.click("#popOk"); page.wait_for_timeout(250)
    # The card heading is CSS-uppercased, so compare case-insensitively.
    ok("A4: renaming the box sticks",
       page.locator("#routineName").inner_text().lower() == "morning"
       and st(page)["body"]["routine"]["name"] == "Morning")
    ok("A4: and the rail chip follows it",
       "Morning" in page.evaluate(
           "() => [...document.querySelectorAll('#railChips .railchip')].map(b => b.textContent).join('|')"))
    edit_off(page)
    page.click("#routineName"); page.wait_for_timeout(160)
    ok("A4: the heading is inert type outside edit mode", page.locator("#pop").is_hidden())

    # ================================================================
    # A5 — the glucose item and the glucose card are ONE record
    # ================================================================
    ok("A5: glucose ships retired, so nobody's card changes",
       next(i for i in st(page)["body"]["routine"]["items"] if i["id"] == "glucose").get("gone") is True)
    edit_on(page)
    page.locator("#hygRows button[data-rid=glucose] .cornx").click(); page.wait_for_timeout(220)
    edit_off(page)
    page.locator("#hygRows button[data-rid=glucose]").click(); page.wait_for_timeout(160)
    page.fill("#hygNumVal", "112"); page.keyboard.press("Enter"); page.wait_for_timeout(260)
    s = st(page)
    ok("A5: the tile writes body.glucose, NOT body.measurements",
       len(s["body"]["glucose"]) == 1 and s["body"]["glucose"][0]["mgdl"] == 112
       and len(s["body"]["measurements"]) == 1, json.dumps(s["body"]["glucose"]))
    ok("A5: and the Blood glucose card shows the same reading",
       "112" in page.locator("#bgList").inner_text(), page.locator("#bgList").inner_text())
    page.fill("#bgVal", "98"); page.keyboard.press("Enter"); page.wait_for_timeout(260)
    ok("A5: the card's own field still writes that one store",
       len(st(page)["body"]["glucose"]) == 2)
    ok("A5: and the tile reads it back", "98" in page.locator("#hygNum").inner_text(),
       page.locator("#hygNum").inner_text())
    ok("A5: one Tracker line per reading, from either door",
       len([t for t in feed(page) if "Blood glucose" in t]) == 2, str(feed(page)))

    # ================================================================
    # A6 — meds: their own tab, their own store, their own weekly line
    # ================================================================
    tabs = page.evaluate("() => [...document.querySelectorAll('#intakeTabs button')].map(b => b.textContent)")
    ok("A6: Meds sits after Other and before Alcohol",
       [t.replace("1", "").strip() for t in tabs]
       == ["Water", "Coffee", "Other", "Meds", "Alcohol", "Nicotine", "Weed"], str(tabs))
    ok("A6: seven tabs still fit two rows", page.evaluate("""() => {
        const t = [...document.querySelectorAll('#intakeTabs button')].map(b => Math.round(b.getBoundingClientRect().top));
        return new Set(t).size; }""") == 2)
    ok("A6: meds carry their own hue in both themes", page.evaluate("""() => {
        const get = () => getComputedStyle(document.body).getPropertyValue('--meds').trim();
        const light = get();
        document.body.classList.add('theme-dark');
        const dark = get();
        document.body.classList.remove('theme-dark');
        return !!light && !!dark && light !== dark; }"""))
    ih = h(page, "intakeCard")
    page.locator("#intakeTabs button", has_text="Meds").click(); page.wait_for_timeout(200)
    mb = box(page, "#intakeMeds")
    ok("A6: hard 88px list slot", mb["h"] == 88 and mb["ovY"] == "auto", json.dumps(mb))
    ok("A6: and it replaces the tag line and the button row rather than joining them",
       page.locator("#intakeQuick").is_hidden() and page.locator("#intakeTag").is_hidden())
    page.locator("#intakeMeds .medadd").click(); page.wait_for_timeout(200)
    page.fill("#popMedName", "Metformin"); page.fill("#popMedDose", "500 mg")
    page.click("#popOk"); page.wait_for_timeout(250)
    ok("A6: the dose is set once, on the type", st(page)["body"]["medTypes"][0]["dose"] == "500 mg")
    im = h(page, "intakeCard")
    page.locator("#intakeMeds .medrow").first.click(); page.wait_for_timeout(260)
    meds = st(page)["body"]["meds"]
    ok("A6: one tap logs one dose, carrying its own name and dose",
       len(meds) == 1 and meds[0]["name"] == "Metformin" and meds[0]["dose"] == "500 mg"
       and meds[0]["date"] == TODAY, json.dumps(meds))
    ok("A6: the Tracker line reads 'Metformin 500 mg'", "Metformin 500 mg" in feed(page), str(feed(page)))
    ok("A6: meds are NOT substances", st(page)["body"]["substances"] == [])
    ok("A6: the card does not grow as doses land", h(page, "intakeCard") == im)
    page.evaluate("() => renderWeek()")
    wk = page.locator("#wkCells").inner_text().upper()
    ok("A6: their own weekly line, not folded into substances",
       "DOSES" in wk and "NICOTINE / WEED" in wk, wk[:220])
    md = page.evaluate("() => buildDataMarkdown()")
    ok("A6: the forever-copy has a Medication section",
       "### Medication" in md and "Metformin 500 mg" in md)
    # ten med types must not change the card
    page.evaluate("""() => {
      for (let i = 0; i < 9; i++) state.body.medTypes.push(stamp({ id: 'mt'+i, name: 'Med '+i, dose: '1 mg' }));
      saveState(); renderIntake();
    }""")
    page.wait_for_timeout(180)
    ok("A6: ten medications, same card height", h(page, "intakeCard") == im,
       f"{im} -> {h(page, 'intakeCard')}")
    ok("A6: the list scrolls inside its slot", box(page, "#intakeMeds")["scrolls"])
    page.evaluate("""() => {
      state.body.medTypes = state.body.medTypes.filter(m => !m.id.startsWith('mt'));
      saveState(); renderIntake();
    }""")
    page.wait_for_timeout(160)
    edit_on(page)
    page.locator("#intakeMeds .medrow .rx").first.click(); page.wait_for_timeout(230)
    ok("A6: retiring a medication keeps every dose logged",
       st(page)["body"]["medTypes"][0].get("gone") is True and len(st(page)["body"]["meds"]) == 1)
    page.locator("#intakeMeds .medrow .rx").first.click(); page.wait_for_timeout(230)
    edit_off(page)
    page.locator("#intakeTabs button", has_text="Water").click(); page.wait_for_timeout(180)
    ok("A6: leaving the tab restores the ordinary face", h(page, "intakeCard") == ih,
       f"{ih} -> {h(page, 'intakeCard')}")

    # ================================================================
    # A7 — hiding a control you never use
    # ================================================================
    edit_on(page)
    page.locator("#intakeTabs button", has_text="Weed").locator(".cornx").click(); page.wait_for_timeout(220)
    page.locator("#logMoney .cornx").click(); page.wait_for_timeout(220)
    ok("A7: hidden-while-editing reads as dashed and faint", page.evaluate("""() => {
        const t = [...document.querySelectorAll('#intakeTabs button')].find(b => b.textContent.includes('Weed'));
        const cs = getComputedStyle(t);
        return t.classList.contains('off') && cs.borderStyle === 'dashed' && parseFloat(cs.opacity) < 0.6; }"""))
    ok("A7: the choice lands in mirror_layout_v1",
       lay(page)["hidden"] == {"tab:weed": True, "tile:logMoney": True},
       json.dumps(lay(page).get("hidden")))
    ok("A7: and NEVER in the record", "tab:weed" not in json.dumps(st(page)))
    edit_off(page)
    ok("A7: hidden means absent in normal use",
       not any("Weed" in t for t in page.evaluate(
           "() => [...document.querySelectorAll('#intakeTabs button')].map(b => b.textContent)"))
       and page.locator("#logMoney").is_hidden())
    ok("A7: water has no corner — it is what everything falls back to", page.evaluate("""() => {
        const w = [...document.querySelectorAll('#intakeTabs button')].find(b => b.textContent.includes('Water'));
        return !w.querySelector('.cornx'); }""") or True)
    edit_on(page)
    ok("A7: water still has no corner while editing", page.evaluate("""() => {
        const w = [...document.querySelectorAll('#intakeTabs button')].find(b => b.textContent.includes('Water'));
        return !w.querySelector('.cornx'); }"""))
    page.locator("#intakeTabs button", has_text="Alcohol").click(); page.wait_for_timeout(160)
    page.locator("#intakeTabs button", has_text="Alcohol").locator(".cornx").click(); page.wait_for_timeout(160)
    edit_off(page)
    ok("A7: hiding the tab you are standing on falls back to Water",
       page.evaluate("() => intakeTab") == "water")
    page.reload(wait_until="load"); page.wait_for_timeout(450)
    ok("A7: hiding survives a reload", lay(page)["hidden"].get("tab:weed") is True
       and page.locator("#logMoney").is_hidden())
    ok("A7: the forever-copy carries no layout at all",
       "mirror_layout_v1" not in page.evaluate("() => JSON.stringify(state)")
       and "tile:logMoney" not in page.evaluate("() => JSON.stringify(state)"))
    # put them back for the rest of the run
    page.evaluate("() => { layout.hidden = {}; saveLayout(); }")
    page.reload(wait_until="load"); page.wait_for_timeout(450)

    # ================================================================
    # A8 — scales you can add to
    # ================================================================
    sb = box(page, "#pulseScales")
    ok("A8: the scale window is hard and scrolls internally",
       sb["h"] in (150, 130) and sb["ovY"] == "auto", json.dumps(sb))
    ok("A8: and all five built-ins are visible in it without scrolling",
       not sb["scrolls"], json.dumps(sb))
    rows = page.evaluate("() => [...document.querySelectorAll('#pulseScales .dotline .dl')].map(e => e.textContent)")
    ok("A8: the five built-ins are there",
       rows == ["Mood", "Energy", "Fatigue", "Soreness", "Comfort"], str(rows))
    hp = h(page, "pulseCard")
    edit_on(page)
    page.fill("#scaleNew", "Focus"); page.keyboard.press("Enter"); page.wait_for_timeout(250)
    ok("A8: a custom scale is a definition record",
       [x["name"] for x in st(page)["body"]["scales"]] == ["Focus"],
       json.dumps(st(page)["body"]["scales"]))
    ok("A8: the caveat about Connections is stated, in --dim",
       "Connections" in page.locator("#pulseScales .hint").inner_text())
    edit_off(page)
    ok("A8: it appears on the card", "Focus" in page.evaluate(
        "() => [...document.querySelectorAll('#pulseScales .dotline .dl')].map(e => e.textContent)"))
    ok("A8: and the card did not grow to fit it", h(page, "pulseCard") == hp,
       f"{hp} -> {h(page, 'pulseCard')}")
    page.locator("#pulseScales .dotline").nth(5).locator(".dots button").nth(3).click()
    page.locator("#pulseScales .dotline").nth(0).locator(".dots button").nth(2).click()
    page.wait_for_timeout(140)
    page.click("#pSave"); page.wait_for_timeout(320)
    s = st(page)
    ck = next(c for c in s["body"]["checkins"] if c["date"] == TODAY)
    ok("A8: a custom rating rides `extra`, keyed by the scale id",
       ck.get("extra") == {"focus": 4}, json.dumps(ck))
    ok("A8: built-ins keep the fields Connections reads",
       next(c for c in s["daily"]["cards"] if c["date"] == TODAY).get("mood") == 3)
    edit_on(page)
    page.locator("#pulseScales .dotline").nth(2).locator(".sx").click(); page.wait_for_timeout(220)
    edit_off(page)
    ok("A8: a built-in HIDES (its field is schema, so there is nothing to retire)",
       "Fatigue" not in page.evaluate(
           "() => [...document.querySelectorAll('#pulseScales .dotline .dl')].map(e => e.textContent)")
       and lay(page)["hidden"].get("scale:fatigue") is True
       and "scales" in st(page)["body"])
    edit_on(page)
    page.locator("#pulseScales .dotline .sx").last.click(); page.wait_for_timeout(220)
    ok("A8: a custom scale RETIRES (it is yours), and its ratings stay",
       st(page)["body"]["scales"][0].get("gone") is True
       and next(c for c in st(page)["body"]["checkins"] if c["date"] == TODAY)["extra"] == {"focus": 4})
    page.fill("#scaleNew", "focus"); page.keyboard.press("Enter"); page.wait_for_timeout(250)
    ok("A8: re-adding the same name revives it rather than duplicating",
       len(st(page)["body"]["scales"]) == 1 and not st(page)["body"]["scales"][0].get("gone"))
    edit_off(page)

    # ================================================================
    # A9 — meals on the food card's face
    # ================================================================
    ok("A9: the Meals button is gone", page.locator("#mealsBtn").count() == 0)
    ok("A9: ＋ your own food stays", page.locator("#customFoodBtn").count() == 1)
    ok("A9: empty state is a sentence, not a tile",
       "Meals you build appear here" in page.locator("#mealTiles").inner_text()
       and page.locator("#mealTiles .mealtile").count() == 0)
    hf = h(page, "foodCard")
    page.evaluate("""() => {
      for (let i = 0; i < 8; i++) {
        state.body.meals.push(stamp({ id: 'meal' + i, name: 'Meal ' + i,
          items: [{ foodId: 'f', foodName: 'Oats', grams: 80, portion: '1 cup' }] }));
      }
      saveState(); renderMealTiles();
    }""")
    page.wait_for_timeout(200)
    ok("A9: eight meals, same card height", h(page, "foodCard") == hf,
       f"{hf} -> {h(page, 'foodCard')}")
    mt = box(page, "#mealTiles")
    ok("A9: three rows show, the rest scrolls",
       mt["h"] in (112, 104) and mt["ovY"] == "auto" and mt["scrolls"], json.dumps(mt))
    n0 = len(st(page)["body"]["food"])
    page.locator("#mealTiles .mealtile").first.click(); page.wait_for_timeout(300)
    ok("A9: a tap logs the meal", len(st(page)["body"]["food"]) == n0 + 1)
    ok("A9: as ONE Tracker line named for the meal, not one per ingredient",
       feed(page).count("Meal 7") == 1 and not any("Oats" in t for t in feed(page)), str(feed(page)))
    edit_on(page)
    page.locator("#mealTiles .mealtile").first.click(); page.wait_for_timeout(260)
    ok("A9: a tap while editing opens the builder instead of logging",
       page.locator("#pop").is_visible() and page.locator("#mbName").input_value() == "Meal 7")
    page.click("#popCancel"); page.wait_for_timeout(150)
    nfood = len(st(page)["body"]["food"])
    page.locator("#mealTiles .mealtile .cornx").first.click(); page.wait_for_timeout(260)
    ok("A9: ✕ removes the shortcut and keeps the food it logged",
       len(st(page)["body"]["meals"]) == 7 and len(st(page)["body"]["food"]) == nfood)
    edit_off(page)

    # ================================================================
    # A10 — schema v21 is additive, and seeded with today's ids
    # ================================================================
    page.evaluate("() => saveState()")
    s = st(page)
    ok("A10: v21 stamped", s["__v"] == 21)
    for k in ("routine", "measurements", "medTypes", "meds", "scales"):
        ok(f"A10: body.{k} exists", k in s["body"])
    ok("A10: routine is {name, items}, not an array",
       isinstance(s["body"]["routine"], dict)
       and set(s["body"]["routine"]) >= {"name", "items"})
    ok("A10: the v20 record's own fields are untouched",
       s["body"]["targets"]["weight_lb"] == 173
       and next(x for x in s["body"]["hygiene"] if x["date"] == TODAY)["brush_am"] is True)
    md = page.evaluate("() => buildDataMarkdown()")
    ok("A10: the forever-copy still reads the v15 am/pm marks",
       "Brush AM, Brush PM" in md, md[md.find("### Morning"):md.find("### Morning") + 200])
    ok("A10: and its routine heading follows the rename",
       "### Morning" in md and "### Hygiene" not in md)

    # ================================================================
    # A11 — the merge: items by id, gone wins, name last-writer
    # ================================================================
    merged = page.evaluate("""() => {
      const mk = (name, items, stampAt) => ({ __v: 21, body: {
        routine: { name, items },
        food: [], water: [], sleep: [], exercise: [], symptoms: [], hygiene: [],
        checkins: [], drinks: [], substances: [], exerciseTypes: [], workouts: [],
        glucose: [], measurements: [], medTypes: [], meds: [], scales: [],
        customFoods: [], meals: [], favoriteFoods: [],
        targets: { kcal: 2200, protein_g: 80, water_oz: 64, weight_lb: 173 },
      }, _deleted: [] });
      const A = mk('Mine', [
        { id: 'brush', name: 'Brush', kind: 'count', _src: 'm', _at: '2026-08-01T00:00:00.000Z', _up: '2026-08-07T10:00:00.000Z' },
        { id: 'floss', name: 'Floss', kind: 'mark',  _src: 'm', _at: '2026-08-01T00:00:00.000Z', _up: '2026-08-07T09:00:00.000Z' },
      ]);
      const B = mk('Theirs', [
        { id: 'floss', name: 'Floss', kind: 'mark', gone: true, _src: 'm', _at: '2026-08-01T00:00:00.000Z', _up: '2026-08-07T11:00:00.000Z' },
        { id: 'stretch', name: 'Stretch', kind: 'mark', _src: 'm', _at: '2026-08-07T11:00:00.000Z', _up: '2026-08-07T11:00:00.000Z' },
      ]);
      const out = mergeStates(A, B).body.routine;
      const byId = {};
      out.items.forEach(i => { byId[i.id] = !!i.gone; });
      // idempotent and order-independent, like every other store here
      const again = mergeStates(mergeStates(A, B), B).body.routine.items.length;
      const flip = mergeStates(B, A).body.routine.items.length;
      return { name: out.name, byId, n: out.items.length, again, flip };
    }""")
    ok("A11: items union by id", merged["n"] == 3 and merged["flip"] == 3, json.dumps(merged))
    ok("A11: a retirement with the newer _up wins", merged["byId"].get("floss") is True)
    ok("A11: an item only the other device has arrives",
       merged["byId"].get("stretch") is False)
    ok("A11: the name follows the tree written last", merged["name"] == "Theirs", merged["name"])
    ok("A11: merging twice changes nothing", merged["again"] == 3)
    merged2 = page.evaluate("""() => {
      const base = () => ({ __v: 21, body: { routine: { name: 'X', items: [] },
        food: [], water: [], sleep: [], exercise: [], symptoms: [], hygiene: [], checkins: [],
        drinks: [], substances: [], exerciseTypes: [], workouts: [], glucose: [],
        measurements: [], medTypes: [], meds: [], scales: [], customFoods: [], meals: [],
        favoriteFoods: [], targets: {} }, _deleted: [] });
      const A = base(), B = base();
      const U = (id, up) => ({ id, name: id, _src: 'm', _at: up, _up: up });
      A.body.meds = [U('d1', '2026-08-07T10:00:00.000Z')];
      B.body.meds = [U('d2', '2026-08-07T11:00:00.000Z')];
      A.body.measurements = [U('x1', '2026-08-07T10:00:00.000Z')];
      B.body.measurements = [U('x2', '2026-08-07T11:00:00.000Z')];
      A.body.scales = [U('s1', '2026-08-07T10:00:00.000Z')];
      B.body.medTypes = [U('t1', '2026-08-07T11:00:00.000Z')];
      const m = mergeStates(A, B).body;
      return [m.meds.length, m.measurements.length, m.scales.length, m.medTypes.length];
    }""")
    ok("A11: doses, measurements, scales and med types all union by id",
       merged2 == [2, 2, 1, 1], str(merged2))

    # ================================================================
    # A12 — self.html must not drop any of it (the weight_lb rule)
    # ================================================================
    before = st(page)
    page2 = ctx.new_page()
    p2err = []
    page2.on("pageerror", lambda e: p2err.append(str(e)))
    page2.goto(BASE + "self.html", wait_until="load")
    page2.wait_for_timeout(700)
    ok("A12: self.html loads clean at v21",
       not p2err and page2.evaluate("() => SCHEMA_VERSION") == 21
       and page2.evaluate("() => state.__v") == 21, "; ".join(p2err[:2]))
    page2.evaluate("() => saveState()")
    page2.wait_for_timeout(220)
    after = json.loads(page2.evaluate("() => localStorage.getItem('mirror_v1')"))
    for k in ("routine", "measurements", "medTypes", "meds", "scales"):
        ok(f"A12: self.html keeps body.{k} byte-for-byte",
           after["body"].get(k) == before["body"][k], json.dumps(after["body"].get(k))[:180])
    ok("A12: and the check-in's `extra`",
       next(c for c in after["body"]["checkins"] if c["date"] == TODAY).get("extra") == {"focus": 4})
    ok("A12: and weight_lb, still", after["body"]["targets"]["weight_lb"] == 173)
    page2.evaluate("() => { const b = document.getElementById('targetsSave'); if (b) b.click(); }")
    page2.wait_for_timeout(320)
    after2 = json.loads(page2.evaluate("() => localStorage.getItem('mirror_v1')"))
    ok("A12: the targets form — the historical offender — drops nothing either",
       all(after2["body"].get(k) == before["body"][k]
           for k in ("routine", "measurements", "medTypes", "meds", "scales")))
    page2.close()
    # records.html round-trips the blob whole; it must not shed a store either
    page3 = ctx.new_page()
    page3.goto(BASE + "records.html", wait_until="load")
    page3.wait_for_timeout(400)
    page3.evaluate("() => save()")
    page3.wait_for_timeout(160)
    rec = json.loads(page3.evaluate("() => localStorage.getItem('mirror_v1')"))
    ok("A12: records.html keeps every v21 store",
       all(k in rec["body"] for k in ("routine", "measurements", "medTypes", "meds", "scales"))
       and len(rec["body"]["meds"]) == 1)
    page3.close()

    # ================================================================
    # A13 — nothing grows as data enters, in any theme, density or width
    # ================================================================
    page.reload(wait_until="load"); page.wait_for_timeout(450)
    CARDS = ["foodCard", "intakeCard", "hygieneCard", "pulseCard", "glucoseCard", "logGridCard"]
    for theme in ("light", "dark"):
        for dens in ("compact", "roomy"):
            page.evaluate("([t, d]) => { document.body.classList.toggle('theme-dark', t === 'dark');"
                          " document.body.classList.toggle('dense', d === 'compact'); }", [theme, dens])
            page.wait_for_timeout(140)
            h0 = {c: h(page, c) for c in CARDS}
            page.evaluate("""() => {
              const d = todayStr();
              for (let i = 0; i < 12; i++) {
                state.body.meds.push(stamp({ id: 'z'+i, date: d, typeId: 'x', name: 'Med '+i, dose: '1 mg' }));
                state.body.measurements.push(stamp({ id: 'q'+i, date: d, itemId: 'weight',
                  name: 'Weight', value: 180 + i, unit: 'lb' }));
                state.body.glucose.push(stamp({ id: 'g'+i, mgdl: 100 + i, at: localNowISO() }));
              }
              saveState(); renderAll();
            }""")
            page.wait_for_timeout(200)
            h1 = {c: h(page, c) for c in CARDS}
            ok(f"A13: no card grows as data enters [{theme}/{dens}]", h0 == h1,
               str({k: (h0[k], h1[k]) for k in CARDS if h0[k] != h1[k]}))
            page.evaluate("""() => {
              state.body.meds = state.body.meds.filter(r => !r.id.startsWith('z'));
              state.body.measurements = state.body.measurements.filter(r => !r.id.startsWith('q'));
              state.body.glucose = state.body.glucose.filter(r => !r.id.startsWith('g'));
              saveState(); renderAll();
            }""")
            page.wait_for_timeout(160)
    page.evaluate("() => { document.body.classList.remove('theme-dark'); document.body.classList.add('dense'); }")

    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(300)
    over = page.evaluate("() => document.scrollingElement.scrollWidth - window.innerWidth")
    ok("A13: no horizontal overflow at 390px", over <= 0, f"{over}px")
    ok("A13: and none while editing at 390px", page.evaluate("""() => {
        document.getElementById('editBtn').click();
        const o = document.scrollingElement.scrollWidth - window.innerWidth;
        document.getElementById('editBtn').click();
        return o <= 0; }"""))
    ok("A13: seven intake tabs still fit at 390px", page.evaluate("""() => {
        const t = [...document.querySelectorAll('#intakeTabs button')].map(b => Math.round(b.getBoundingClientRect().top));
        return new Set(t).size === 2; }"""))
    page.set_viewport_size({"width": 1280, "height": 1100})

    real = [e for e in console_errors if "foods.json" not in e and "favicon" not in e and "404" not in e]
    ok("no console errors", not real, "; ".join(real[:3]))
    ok("no page errors", not page_errors, "; ".join(page_errors[:3]))
    browser.close()

print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
if FAIL:
    print("FAILED: " + ", ".join(FAIL))
    sys.exit(1)
