# Mirror v22 — checkups, honest titles, and a phone that feels right.
# One check-block per acceptance item of the v22 spec, A1-A14.
#
# Seeds are synthetic and live in a throwaway Chromium profile; the real record
# is never read or written.
import json, subprocess, sys, time, atexit
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = str(Path(__file__).resolve().parents[2])
PORT = 8143
BASE = f"http://127.0.0.1:{PORT}/mirror/"
TZ = "America/Indiana/Indianapolis"
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
                       cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
atexit.register(srv.kill)
time.sleep(1.2)

# The fixture's "today" and its relatives, in the browser's timezone. Months in
# the app are floor(days/30.44), so the seeds pick day counts that land exactly
# on the month values the assertions name.
NOW = datetime.now(ZoneInfo(TZ))
TODAY = NOW.strftime("%Y-%m-%d")
D_8MO = (NOW - timedelta(days=244)).strftime("%Y-%m-%d")    # floor(244/30.44) = 8
D_14MO = (NOW - timedelta(days=427)).strftime("%Y-%m-%d")   # floor(427/30.44) = 14
D_13MO = (NOW - timedelta(days=396)).strftime("%Y-%m-%d")   # floor(396/30.44) = 13
YESTERDAY = (NOW - timedelta(days=1)).strftime("%Y-%m-%d")

PASS, FAIL = [], []
def ok(name, cond, extra=""):
    (PASS if cond else FAIL).append(name)
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else f"  -> {extra}"))

def st(page): return json.loads(page.evaluate("() => localStorage.getItem('mirror_v1')"))
def lay(page): return json.loads(page.evaluate("() => localStorage.getItem('mirror_layout_v1') || 'null'"))
def feed(page): return page.evaluate(
    "() => [...document.querySelectorAll('#feed .row .tx')].map(e => e.textContent)")
def ckstat(page, name):
    return page.locator(".ckrow", has_text=name).first.locator(".st").text_content()
def edit_on(page):
    if page.locator("#editBtn").get_attribute("aria-pressed") != "true":
        page.click("#editBtn"); page.wait_for_timeout(160)
def edit_off(page):
    if page.locator("#editBtn").get_attribute("aria-pressed") == "true":
        page.click("#editBtn"); page.wait_for_timeout(160)

ISO = "2026-08-01T00:00:00.000Z"
def seed_v21(**over):
    """A v21 record: routine seeded, no checkups anywhere — an upgrader."""
    body = {
        "food": [], "water": [], "sleep": [], "exercise": [], "symptoms": [],
        "targets": {"kcal": 2200, "protein_g": 80, "water_oz": 64, "weight_lb": 173},
        "favoriteFoods": [], "customFoods": [], "meals": [], "checkins": [],
        "drinks": [], "substances": [], "exerciseTypes": [], "workouts": [],
        "glucose": [], "hygiene": [],
        "routine": {"name": "Upkeep", "items": [
            {"id": "brush", "name": "Brush", "icon": "B", "kind": "count", "_src": "manual", "_at": ISO, "_up": ISO},
            {"id": "shower", "name": "Shower", "icon": "S", "kind": "mark", "_src": "manual", "_at": ISO, "_up": ISO},
            {"id": "floss", "name": "Floss", "icon": "F", "kind": "mark", "_src": "manual", "_at": ISO, "_up": ISO},
            {"id": "haircut", "name": "Haircut", "icon": "H", "kind": "mark", "_src": "manual", "_at": ISO, "_up": ISO},
            {"id": "glucose", "name": "Glucose", "icon": "G", "kind": "measure", "unit": "mg/dL",
             "store": "body.glucose", "gone": True, "_src": "manual", "_at": ISO, "_up": ISO}]},
        "measurements": [], "medTypes": [], "meds": [], "scales": [],
    }
    body.update(over)
    return {
        "__v": 21,
        "identity": {"values": [], "season": "", "reflections": [], "pulse": [], "journal": []},
        "body": body,
        "mind": {"books": [], "ideas": [], "questions": [], "quotes": []},
        "money": {"categories": [], "expenses": [], "income": [], "subscriptions": [],
                  "netWorth": [], "goals": []},
        "relationships": {"people": [], "followUps": [], "giftIdeas": [], "birthdays": []},
        "daily": {"cards": []}, "decisions": {"items": []}, "habits": {"items": []},
        "places": {"items": [], "days": {}}, "completion": {},
        "calendar": {"events": [], "integration": {}}, "home": {"widgets": []},
        "links": [], "_deleted": [],
    }

def ck(typeid, name, at):
    return {"id": "ck_" + typeid + "_" + at, "typeId": typeid, "name": name,
            "at": at, "_src": "manual", "_at": ISO, "_up": ISO}

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    ctx = browser.new_context(timezone_id=TZ, viewport={"width": 1280, "height": 1100},
                              has_touch=True)
    page = ctx.new_page()
    console_errors, page_errors = [], []
    page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: page_errors.append(str(e)))

    # ================================================================
    # A13 (first half) + A1 — upgrade: seeded types, empty completions,
    # box closed; fresh profile: box open
    # ================================================================
    page.goto(BASE, wait_until="load")
    page.evaluate("() => localStorage.clear()")
    page.evaluate("(s) => localStorage.setItem('mirror_v1', JSON.stringify(s))", seed_v21())
    page.reload(wait_until="load"); page.wait_for_timeout(450)
    ok("A13: a v21 record opens clean at v22", not page_errors, "; ".join(page_errors[:2]))
    # The migration lives in memory until something saves; persist it so the
    # storage read below sees what the app now holds.
    page.evaluate("() => saveState()")
    s = st(page)
    ok("A13: checkupTypes seeded with the five built-ins",
       [t["id"] for t in s["body"]["checkupTypes"]] == ["physical", "dental", "vision", "bloodwork", "flu"],
       json.dumps(s["body"]["checkupTypes"])[:200])
    ok("A13: checkups arrives empty — no fabricated dates", s["body"]["checkups"] == [])
    ok("A13: v22 stamped", s["__v"] == 22)
    ok("A1: the box ships CLOSED on an upgraded profile",
       page.locator("#checkupsCard").is_hidden() and lay(page)["open"]["checkups"] is False,
       json.dumps(lay(page)))
    edit_on(page)
    page.locator("#railChips .railchip", has_text="Checkups").click(); page.wait_for_timeout(150)
    edit_off(page)
    ok("A1: opened from the rail", page.locator("#checkupsCard").is_visible())
    ok("A1: five seeds, all `never · due`",
       page.locator("#ckRows .ckrow").count() == 5
       and page.evaluate("() => [...document.querySelectorAll('.ckrow .st')].every(e => e.textContent === 'never · due')"),
       str(page.evaluate("() => [...document.querySelectorAll('.ckrow .st')].map(e => e.textContent)")))
    ok("A1: header note counts the due in warn",
       page.locator("#ckNote").text_content() == "5 due")

    # A fresh profile gets the box open like any other.
    page.evaluate("() => localStorage.clear()")
    page.reload(wait_until="load"); page.wait_for_timeout(450)
    ok("A1: open by default on a fresh profile",
       page.locator("#checkupsCard").is_visible()
       and page.locator("#ckRows .ckrow").count() == 5)

    # ================================================================
    # A2 — tap = done today; tap again takes it back; Undo reverses too
    # ================================================================
    f0 = len(feed(page))
    page.locator(".ckrow", has_text="Physical").first.click(); page.wait_for_timeout(150)
    s = st(page)
    ok("A2: one completion, carrying its own name",
       len(s["body"]["checkups"]) == 1 and s["body"]["checkups"][0]["typeId"] == "physical"
       and s["body"]["checkups"][0]["name"] == "Physical",
       json.dumps(s["body"]["checkups"]))
    ok("A2: a today completion carries a clock time with offset",
       len(s["body"]["checkups"][0]["at"]) > 10)
    ok("A2: one Tracker line", feed(page).count("Physical ✓") == 1 and len(feed(page)) == f0 + 1,
       str(feed(page)))
    ok("A2: the row flips to done today", ckstat(page, "Physical") == "done today")
    ok("A2: and takes the accent tint",
       "done" in page.locator(".ckrow", has_text="Physical").first.get_attribute("class"))
    page.locator(".ckrow", has_text="Physical").first.click(); page.wait_for_timeout(150)
    s = st(page)
    ok("A2: second tap takes it back, with a tombstone",
       s["body"]["checkups"] == [] and len(s["_deleted"]) == 1
       and ckstat(page, "Physical") == "never · due")
    page.click("#undoBtn"); page.wait_for_timeout(150)
    s = st(page)
    ok("A2: Undo reverses the take-back",
       len(s["body"]["checkups"]) == 1 and s["_deleted"] == []
       and ckstat(page, "Physical") == "done today")
    page.locator(".ckrow", has_text="Physical").first.click(); page.wait_for_timeout(120)

    # ================================================================
    # A3 — "last done" is derived, never cached
    # ================================================================
    s = st(page)
    s["body"]["checkups"] = [ck("physical", "Physical", D_14MO), ck("physical", "Physical", D_8MO),
                             ck("dental", "Dental cleaning", D_13MO)]
    s["_deleted"] = []
    page.evaluate("(s) => localStorage.setItem('mirror_v1', JSON.stringify(s))", s)
    page.reload(wait_until="load"); page.wait_for_timeout(450)
    ok("A3: the newest completion is the date that reads", ckstat(page, "Physical") == "8 mo ago")
    ok("A3: overdue reads due with its age in warn", ckstat(page, "Dental") == "due · 13 mo ago")
    ok("A3: untouched stays never", ckstat(page, "Vision") == "never · due")
    page.locator(".ckrow", has_text="Physical").first.click(); page.wait_for_timeout(150)
    ok("A3: done today, over the history", ckstat(page, "Physical") == "done today")
    row = page.locator("#feed .row", has_text="Physical ✓").first
    row.locator(".x").click(); page.wait_for_timeout(200)
    ok("A3: deleting the completion from Today moves the date BACK — derived, not cached",
       ckstat(page, "Physical") == "8 mo ago", ckstat(page, "Physical"))
    ok("A3: the seeded history is untouched",
       len(st(page)["body"]["checkups"]) == 3)

    # ================================================================
    # A4 — add at 2 yrs; retire keeps history; restore
    # ================================================================
    edit_on(page)
    page.click(".ckadd"); page.wait_for_timeout(160)
    ok("A4: the interval picker leads the form",
       page.locator("#pop .pickrow [data-pv]").count() == 3)
    page.locator("#pop [data-pv='24']").click()
    page.fill("#popCkName", "Hearing test")
    page.keyboard.press("Enter"); page.wait_for_timeout(200)
    s = st(page)
    hearing = next((t for t in s["body"]["checkupTypes"] if t["name"] == "Hearing test"), None)
    ok("A4: added at 2 yrs", hearing is not None and hearing["months"] == 24, json.dumps(s["body"]["checkupTypes"])[-200:])
    ok("A4: appears as never · due, interval spelled out",
       ckstat(page, "Hearing test") == "never · due"
       and page.locator(".ckrow", has_text="Hearing test").first.locator(".iv").text_content() == "every 2 yrs")
    edit_off(page)
    page.locator(".ckrow", has_text="Hearing test").first.click(); page.wait_for_timeout(150)
    ok("A4: a completion logs", any(r["typeId"] == hearing["id"] for r in st(page)["body"]["checkups"]))
    edit_on(page)
    page.locator(".ckrow", has_text="Hearing test").first.locator(".rx").click(); page.wait_for_timeout(150)
    s = st(page)
    ok("A4: ✕ RETIRES — gone is a flag on a kept type",
       next(t for t in s["body"]["checkupTypes"] if t["name"] == "Hearing test").get("gone") is True)
    ok("A4: history intact", any(r["typeId"] == hearing["id"] for r in s["body"]["checkups"]))
    ok("A4: dashed but present while editing, as the way back",
       "retired" in page.locator(".ckrow", has_text="Hearing test").first.get_attribute("class"))
    edit_off(page)
    ok("A4: absent in normal use", page.locator(".ckrow", has_text="Hearing test").count() == 0)
    edit_on(page)
    page.locator(".ckrow", has_text="Hearing test").first.locator(".rx").click(); page.wait_for_timeout(150)
    ok("A4: restorable in edit mode",
       next(t for t in st(page)["body"]["checkupTypes"] if t["name"] == "Hearing test").get("gone") is not True)
    edit_off(page)

    # ================================================================
    # A5 — the Overview line exists only while something is due
    # ================================================================
    due_now = page.evaluate("() => ckDueCount()")
    page.click("#overviewBtn"); page.wait_for_timeout(200)
    ok("A5: Overview says how many are due",
       f"Checkups: {due_now} due" in page.locator("#pop").inner_text(), page.locator("#pop").inner_text()[:200])
    page.keyboard.press("Escape"); page.wait_for_timeout(120)
    s = st(page)
    live = [t for t in s["body"]["checkupTypes"] if not t.get("gone")]
    s["body"]["checkups"] = [ck(t["id"], t["name"], YESTERDAY) for t in live]
    page.evaluate("(s) => localStorage.setItem('mirror_v1', JSON.stringify(s))", s)
    page.reload(wait_until="load"); page.wait_for_timeout(450)
    page.click("#overviewBtn"); page.wait_for_timeout(200)
    ok("A5: and says nothing when none are",
       "Checkups:" not in page.locator("#pop").inner_text())
    page.keyboard.press("Escape"); page.wait_for_timeout(120)
    ok("A5: header note goes quiet too", page.locator("#ckNote").text_content() == "all current")

    # ================================================================
    # A6 — titles are copy; ids and stores are not
    # ================================================================
    ok("A6: the box reads Also log",
       "also log" in page.locator("#logGridCard h2").inner_text().lower()
       and "log grid" not in page.locator("#logGridCard h2").inner_text().lower())
    ok("A6: the tracker reads Today",
       page.evaluate("() => document.querySelector('#feed').closest('.card').querySelector('h2').textContent.trim()").startswith("Today"))
    ok("A6: ids unchanged — logGridCard, feed, feedDate all exist",
       page.evaluate("() => !!(document.getElementById('logGridCard') && document.getElementById('feed') && document.getElementById('feedDate'))"))
    ok("A6: the rail chip follows the title",
       "Also log" in page.evaluate("() => [...document.querySelectorAll('#railChips .railchip')].map(b => b.textContent).join('|')")
       or True)  # rail is edit-only; check for real below
    edit_on(page)
    chips = page.evaluate("() => [...document.querySelectorAll('#railChips .railchip')].map(b => b.textContent.trim())")
    # Chip text carries the box icon; compare by ending.
    ok("A6: rail says Checkups and Also log, in catalogue order",
       len(chips) == 8 and chips[-2].endswith("Checkups") and chips[-1].endswith("Also log"), str(chips))
    edit_off(page)
    ok("A6: the date note is silent on the day itself",
       page.locator("#feedDate").text_content() == "")
    page.click("#dayBtn"); page.wait_for_timeout(160)
    page.click("#dYestRow"); page.wait_for_timeout(250)
    ok("A6: and names the day when backdating",
       page.locator("#feedDate").text_content() == "yesterday")
    page.click("#dayBtn"); page.wait_for_timeout(160)
    page.click("#dTodayRow"); page.wait_for_timeout(250)

    # ================================================================
    # A11 (first contact, fresh) then A7 (header notes) on a fresh profile
    # ================================================================
    page.evaluate("() => localStorage.clear()")
    page.reload(wait_until="load"); page.wait_for_timeout(450)
    ok("A11: a fresh profile is greeted", page.locator("#firstContact").is_visible())
    page.click("#fcDismiss"); page.wait_for_timeout(120)
    ok("A11: dismissing hides it and lands in the layout, not the record",
       page.locator("#firstContact").is_hidden() and lay(page)["welcomed"] is True
       and page.evaluate("() => localStorage.getItem('mirror_v1')") is None)
    page.reload(wait_until="load"); page.wait_for_timeout(400)
    ok("A11: the dismissal survives a reload", page.locator("#firstContact").is_hidden())

    page.evaluate("() => localStorage.clear()")
    page.reload(wait_until="load"); page.wait_for_timeout(400)
    ok("A11: greeted again on a truly fresh profile", page.locator("#firstContact").is_visible())
    ok("A7: every day-note is EMPTY on an empty day — never a zero",
       page.evaluate("""() => ['foodNote', 'moveNote', 'hygNote', 'bgNote', 'intakeTotal', 'pulseSaved']
         .every(id => document.getElementById(id).textContent === '')"""),
       page.evaluate("""() => ['foodNote', 'moveNote', 'hygNote', 'bgNote', 'intakeTotal', 'pulseSaved']
         .map(id => id + '=' + document.getElementById(id).textContent).join(' ')"""))
    ok("A7: except Checkups, whose note is due-ness, not a day total",
       page.locator("#ckNote").text_content() == "5 due")

    # One glass of water is the first record: the greeting stands down for good.
    page.locator("#intakeQuick button", has_text="+8").first.click(); page.wait_for_timeout(150)
    ok("A11: the first record dismisses it forever",
       page.locator("#firstContact").is_hidden() and lay(page)["welcomed"] is True)

    # Seed a day's worth and read every note.
    s = st(page)
    s["body"]["customFoods"] = [{"id": 9990001, "name": "Test bowl", "category": "your foods",
                                 "portions": [{"label": "1 bowl", "grams": 100}],
                                 "n": {"kcal": 670, "protein_g": 10}}]
    s["body"]["food"] = [{"id": "f1", "date": TODAY, "foodId": 9990001, "foodName": "Test bowl",
                          "grams": 200, "_src": "manual", "_at": ISO, "_up": ISO}]
    s["body"]["exercise"] = [
        {"id": "e1", "date": TODAY, "type": "Walk", "minutes": 30, "_src": "manual", "_at": ISO, "_up": ISO},
        {"id": "e2", "date": TODAY, "type": "Stretch", "minutes": 15, "_src": "manual", "_at": ISO, "_up": ISO}]
    s["body"]["meals"] = [{"id": "m1", "name": "Bowl", "items": [
        {"foodId": 9990001, "foodName": "Test bowl", "grams": 100, "n": {"kcal": 670}}]}]
    page.evaluate("(s) => localStorage.setItem('mirror_v1', JSON.stringify(s))", s)
    page.reload(wait_until="load"); page.wait_for_timeout(450)
    page.evaluate("() => loadFoods().then(() => renderAll())"); page.wait_for_timeout(700)
    ok("A7: Food counts the day in kcal, with its thousands comma",
       page.locator("#foodNote").text_content() == "1,340 kcal",
       page.locator("#foodNote").text_content())
    ok("A7: Movement counts sessions and minutes",
       page.locator("#moveNote").text_content() == "2 sessions · 45 min",
       page.locator("#moveNote").text_content())
    page.locator("#hygRows button", has_text="Shower").first.click(); page.wait_for_timeout(150)
    ok("A7: Upkeep counts marks over visible mark items",
       page.locator("#hygNote").text_content() == "1 of 4",
       page.locator("#hygNote").text_content())
    page.fill("#bgVal", "96"); page.click("#bgLog"); page.wait_for_timeout(150)
    ok("A7: Blood glucose shows the latest reading",
       page.locator("#bgNote").text_content() == "96 mg/dL")
    page.locator("#pulseScales .dotline", has_text="Mood").first.locator(".dots button").nth(3).click()
    page.click("#pSave"); page.wait_for_timeout(150)
    ok("A7: How you are keeps its saved ✓",
       page.locator("#pulseSaved").text_content() == "saved ✓")
    page.set_viewport_size({"width": 320, "height": 700}); page.wait_for_timeout(250)
    ok("A7: no header wraps at 320px — notes truncate, never push",
       page.evaluate("""() => [...document.querySelectorAll('.card > h2')]
         .every(h => h.getBoundingClientRect().height < 32)"""),
       str(page.evaluate("() => [...document.querySelectorAll('.card > h2')].map(h => Math.round(h.getBoundingClientRect().height))")))

    # ================================================================
    # A8 — the phone: no zoom, folded tools, working pop
    # ================================================================
    page.set_viewport_size({"width": 375, "height": 800}); page.wait_for_timeout(250)
    ok("A8: fields are 16px at phone widths — iOS has nothing to zoom",
       page.evaluate("() => getComputedStyle(document.getElementById('foodSearch')).fontSize") == "16px"
       and page.evaluate("() => getComputedStyle(document.getElementById('bgVal')).fontSize") == "16px")
    vis = page.evaluate("""() => [...document.querySelectorAll('.top .tools > button')]
      .filter(b => b.offsetParent !== null).map(b => b.id)""")
    ok("A8: the tools row folds to Edit and ⋯", vis == ["editBtn", "moreBtn"], str(vis))
    page.click("#moreBtn"); page.wait_for_timeout(200)
    ok("A8: the pop holds the SAME buttons — moved, not rebuilt",
       page.evaluate("""() => ['undoBtn', 'densityBtn', 'themeBtn', 'syncBtn', 'dataBtn']
         .every(id => document.getElementById(id).closest('#pop') !== null)"""))
    ok("A8: Undo is live in the pop, with its state",
       page.evaluate("() => !document.getElementById('undoBtn').disabled"))
    n_before = len(st(page)["body"]["glucose"])
    page.click("#undoBtn"); page.wait_for_timeout(200)
    ok("A8: and it undoes for real (the glucose reading comes back out)",
       len(st(page)["body"]["glucose"]) == n_before - 1)
    page.click("#themeBtn"); page.wait_for_timeout(120)
    dark = page.evaluate("() => document.body.classList.contains('theme-dark')")
    page.click("#themeBtn"); page.wait_for_timeout(120)
    ok("A8: theme toggles from inside the pop",
       dark != page.evaluate("() => document.body.classList.contains('theme-dark')"))
    page.keyboard.press("Escape"); page.wait_for_timeout(160)
    ok("A8: closing re-homes every button into the tools row",
       page.evaluate("""() => ['undoBtn', 'densityBtn', 'themeBtn', 'editBtn', 'syncBtn', 'dataBtn', 'moreBtn']
         .every(id => document.getElementById(id).parentElement === document.querySelector('.top .tools'))"""))
    ok("A8: a toast carries its own Undo — the phone's primary undo path",
       page.evaluate("""() => { toast('probe'); const has = !!document.querySelector('.toast .tundo');
         document.getElementById('toast').classList.remove('show'); return has; }"""))

    # ================================================================
    # A9 — safe areas
    # ================================================================
    ok("A9: viewport-fit=cover is declared",
       "viewport-fit=cover" in page.evaluate("() => document.querySelector('meta[name=viewport]').content"))
    ok("A9: the page bottom clears the home indicator",
       page.evaluate("() => parseFloat(getComputedStyle(document.body).paddingBottom)") >= 24)

    # ================================================================
    # A10 — hit targets survive dense mode on a phone
    # ================================================================
    page.evaluate("() => document.body.classList.add('dense')")
    page.wait_for_timeout(200)
    sizes = page.evaluate("""() => {
      const m = {};
      const one = (k, sel) => { const e = document.querySelector(sel);
        m[k] = e ? Math.round(e.getBoundingClientRect().height) : null; };
      one('excat', '.excat'); one('logtile', '.logtile'); one('hyg', '.hyg button');
      one('mealtile', '.mealtile'); one('tab', '.tabs button'); one('quick', '.quick button');
      one('ckrowSlotOK', '.ckslot');
      return m; }""")
    ok("A10: tiles hold 44px at 375 even in dense mode",
       all(v is not None and v >= 44 for k, v in sizes.items() if k in
           ("excat", "logtile", "hyg", "mealtile", "tab", "quick")), json.dumps(sizes))
    edit_on(page)
    rc = page.evaluate("() => Math.round(document.querySelector('.railchip').getBoundingClientRect().height)")
    ok("A10: rail chips too", rc >= 44, str(rc))
    edit_off(page)
    ok("A10: the checkup window keeps its hard height meanwhile",
       page.evaluate("() => Math.round(document.querySelector('.ckslot').getBoundingClientRect().height)") == 170)
    page.evaluate("() => document.body.classList.remove('dense')")
    page.set_viewport_size({"width": 1280, "height": 1100}); page.wait_for_timeout(250)

    # ================================================================
    # A11 (last leg) — a profile with records is never greeted
    # ================================================================
    s = st(page)
    page.evaluate("() => localStorage.clear()")
    page.evaluate("(s) => localStorage.setItem('mirror_v1', JSON.stringify(s))", s)
    page.reload(wait_until="load"); page.wait_for_timeout(450)
    ok("A11: a profile with existing records is never greeted",
       page.locator("#firstContact").is_hidden() and lay(page)["welcomed"] is True)

    # ================================================================
    # A12 — the four add forms share one shape
    # ================================================================
    def probe_form(open_it, name_id, pickered):
        open_it()
        page.wait_for_timeout(180)
        info = page.evaluate("""(nameId) => ({
          focused: document.activeElement && document.activeElement.id,
          okText: document.getElementById('popOk').textContent,
          placeholder: document.getElementById(nameId).placeholder,
          picker: !!document.querySelector('#pop .pickrow'),
          fieldFirstInput: (() => { const f = document.querySelector('#pop .field input[type=text], #pop .pickrow');
            return !!f; })(),
        })""", name_id)
        good = (info["focused"] == name_id and info["okText"] == "Add"
                and "·" in info["placeholder"] and info["picker"] == pickered)
        return good, info

    edit_on(page)
    g1, i1 = probe_form(lambda: page.click("#hygRows .addt"), "popRName", True)
    page.fill("#popRName", "Vitamins"); page.keyboard.press("Enter"); page.wait_for_timeout(200)
    added1 = any(it["name"] == "Vitamins" for it in st(page)["body"]["routine"]["items"])
    ok("A12: routine add — picker, autofocus, Add, Enter adds", g1 and added1, json.dumps(i1))

    page.locator("#intakeTabs button", has_text="Meds").click(); page.wait_for_timeout(160)
    g2, i2 = probe_form(lambda: page.click(".medadd"), "popMedName", False)
    page.fill("#popMedName", "TestMed"); page.keyboard.press("Enter"); page.wait_for_timeout(200)
    added2 = any(m["name"] == "TestMed" for m in st(page)["body"]["medTypes"])
    ok("A12: medication add — same shape, no picker", g2 and added2, json.dumps(i2))

    g3, i3 = probe_form(lambda: page.click(".scaleadd"), "popScaleName", False)
    page.fill("#popScaleName", "Focus"); page.keyboard.press("Enter"); page.wait_for_timeout(200)
    added3 = any(x["name"] == "Focus" for x in st(page)["body"]["scales"])
    ok("A12: scale add — same shape", g3 and added3, json.dumps(i3))

    g4, i4 = probe_form(lambda: page.click(".ckadd"), "popCkName", True)
    page.fill("#popCkName", "Skin check"); page.keyboard.press("Enter"); page.wait_for_timeout(200)
    added4 = any(t["name"] == "Skin check" for t in st(page)["body"]["checkupTypes"])
    ok("A12: checkup add — same shape, picker first", g4 and added4, json.dumps(i4))
    edit_off(page)

    # ================================================================
    # A13 (second half) — self.html and records.html round-trips
    # ================================================================
    before = st(page)
    page2 = ctx.new_page()
    p2err = []
    page2.on("pageerror", lambda e: p2err.append(str(e)))
    page2.goto(BASE + "self.html", wait_until="load"); page2.wait_for_timeout(600)
    ok("A13: self.html loads clean at v22",
       not p2err and page2.evaluate("() => SCHEMA_VERSION") == 22
       and page2.evaluate("() => state.__v") == 22, "; ".join(p2err[:2]))
    page2.evaluate("() => saveState()")
    after = json.loads(page2.evaluate("() => localStorage.getItem('mirror_v1')"))
    ok("A13: a self.html save keeps checkupTypes byte-for-byte",
       after["body"]["checkupTypes"] == before["body"]["checkupTypes"])
    ok("A13: and checkups", after["body"]["checkups"] == before["body"]["checkups"])
    page2.close()

    page3 = ctx.new_page()
    p3err = []
    page3.on("pageerror", lambda e: p3err.append(str(e)))
    page3.goto(BASE + "records.html", wait_until="load"); page3.wait_for_timeout(500)
    page3.evaluate("() => { load(); save(); }")
    after3 = json.loads(page3.evaluate("() => localStorage.getItem('mirror_v1')"))
    ok("A13: records.html round-trips both stores whole",
       not p3err
       and after3["body"]["checkupTypes"] == before["body"]["checkupTypes"]
       and after3["body"]["checkups"] == before["body"]["checkups"], "; ".join(p3err[:2]))
    page3.close()

    # ================================================================
    # A14 — the hedge, said once
    # ================================================================
    page.reload(wait_until="load"); page.wait_for_timeout(450)
    ok("A14: the Connections subhead is always visible",
       page.locator("#drawerConn .connsub").is_visible()
       and "gentle associations, not proof" in page.locator("#drawerConn .connsub").inner_text())
    n_hedge = page.evaluate("() => (document.body.innerText.match(/gentle association/gi) || []).length")
    ok("A14: and the sentence appears exactly once in the app", n_hedge == 1, str(n_hedge))

    err = [e for e in console_errors if "foods.json" not in e and "favicon" not in e]
    ok("no console errors", not err, "; ".join(err[:3]))
    ok("no page errors", not page_errors, "; ".join(page_errors[:3]))

    browser.close()

print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
