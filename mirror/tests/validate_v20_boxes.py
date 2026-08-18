# Mirror v20 — the box rail, drag-ordered dashboard, and Blood glucose.
# One check-block per acceptance item of the v20 spec, numbered A1–A10.
import json, subprocess, sys, time, atexit
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = str(Path(__file__).resolve().parents[2])
PORT = 8141
BASE = f"http://127.0.0.1:{PORT}/mirror/"
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
                       cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
atexit.register(srv.kill)
time.sleep(1.2)

PASS, FAIL = [], []
def ok(name, cond, extra=""):
    (PASS if cond else FAIL).append(name)
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else f"  -> {extra}"))

def st(page): return json.loads(page.evaluate("() => localStorage.getItem('mirror_v1')"))
def feed(page): return page.evaluate("() => [...document.querySelectorAll('#feed .row .tx')].map(e=>e.textContent)")
def order(page):
    return page.evaluate("() => [...document.querySelectorAll('#dailyGrid > .card')].filter(e => !e.hidden).map(e => e.dataset.box)")
def stored(page):
    return json.loads(page.evaluate("() => localStorage.getItem('mirror_layout_v1') || 'null'"))

CATALOGUE = ["food", "intake", "movement", "hygiene", "pulse", "glucose", "loggrid"]

def edit_on(page):
    """v21: the rail, the drag handles and the minus buttons only exist while
    editing, and edit mode is deliberately not persisted — so every reload in
    this suite has to ask for them back."""
    if page.locator("#editBtn").get_attribute("aria-pressed") != "true":
        page.click("#editBtn"); page.wait_for_timeout(150)

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    ctx = browser.new_context(timezone_id="America/Indiana/Indianapolis",
                              viewport={"width": 1280, "height": 900}, has_touch=True)
    page = ctx.new_page()
    console_errors, page_errors = [], []
    page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: page_errors.append(str(e)))
    page.goto(BASE, wait_until="load")
    page.wait_for_timeout(400)

    # ---- A1: header — title + day chip; strip gone; pop backdates and warns ----
    ok("A1: date strip gone", page.locator(".datestrip").count() == 0)
    # v22.1: the chip says the real date when following today, not the word.
    import re as _re
    ok("A1: Mirror + the real date beside it",
       "Mirror" in page.locator(".top .mid").inner_text()
       and _re.fullmatch(r"[A-Z][a-z]{2}, [A-Z][a-z]{2} \d{1,2}", page.locator("#dayBtn").inner_text()) is not None,
       page.locator("#dayBtn").inner_text())
    page.click("#dayBtn"); page.wait_for_timeout(150)
    page.click("#dYestRow"); page.wait_for_timeout(150)
    ok("A1: pop backdates", page.locator("#dayBtn").inner_text().startswith("Yesterday · "),
       page.locator("#dayBtn").inner_text())
    page.click("#dayBtn"); page.wait_for_timeout(150)
    warn = page.locator("#backdateWarn")
    ok("A1: pop still warns", not warn.is_hidden() and "Backdating" in warn.inner_text())
    d3 = page.evaluate("() => shiftDay(todayStr(), -3)")
    page.fill("#dPick", d3); page.dispatch_event("#dPick", "change"); page.wait_for_timeout(150)
    lbl = page.locator("#dayBtn").inner_text()
    ok("A1: explicit date label like Fri Aug 7", lbl not in ("Today", "Yesterday") and lbl[0].isupper(), lbl)
    page.click("#dayBtn"); page.wait_for_timeout(120); page.click("#dTodayRow"); page.wait_for_timeout(150)

    # ---- A2: rail — seven chips in catalogue order; toggling adds/removes ----
    # v21: the rail and the minimise buttons are edit-mode affordances — choosing
    # which boxes exist is editing, not logging — so this block edits first. The
    # fourth chip now reads the routine box's own name, which defaults to Upkeep.
    ok("A2: rail is absent until you edit", not page.locator(".rail").is_visible())
    page.click("#editBtn"); page.wait_for_timeout(150)
    ok("A2: editing shows the rail", page.locator(".rail").is_visible())
    chips = page.evaluate("""() => [...document.querySelectorAll('#railChips .railchip')]
      .map(b => b.textContent.replace(b.querySelector('.ic').textContent, '').trim())""")
    ok("A2: seven chips, catalogue order",
       chips == ["Food", "Intake", "Movement", "Upkeep", "How you are", "Blood glucose", "Checkups", "Also log"], str(chips))
    page.locator("#railChips .railchip", has_text="Upkeep").click(); page.wait_for_timeout(100)
    ok("A2: toggle removes the box", "hygiene" not in order(page))
    page.locator("#railChips .railchip", has_text="Upkeep").click(); page.wait_for_timeout(100)
    ok("A2: toggle restores the box", "hygiene" in order(page))

    # ---- A3: minimise greys the chip; reopening appends to the end ----
    page.locator("#foodCard .minb").click(); page.wait_for_timeout(100)
    chip = page.locator("#railChips .railchip", has_text="Food")
    ok("A3: minimised chip greys", chip.get_attribute("aria-pressed") == "false")
    chip.click(); page.wait_for_timeout(100)
    ok("A3: reopening appends to the end", order(page)[-1] == "food", str(order(page)))

    # ---- A4: drag with mouse + long-press; order survives reload; Alt+arrows ----
    page.evaluate("""() => {
      const src = document.getElementById('movementCard'), dst = document.getElementById('intakeCard');
      const dt = new DataTransfer();
      src.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }));
      src.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
      dst.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt }));
      dst.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
      src.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
    }""")
    page.wait_for_timeout(100)
    o = order(page)
    ok("A4: mouse drag reorders", o.index("movement") < o.index("intake"), str(o))
    before_reload = page.evaluate("() => [...document.querySelectorAll('#dailyGrid > .card')].map(e => e.dataset.box)")
    page.reload(wait_until="load"); page.wait_for_timeout(400)
    after_reload = page.evaluate("() => [...document.querySelectorAll('#dailyGrid > .card')].map(e => e.dataset.box)")
    ok("A4: order survives reload", before_reload == after_reload, f"{before_reload} vs {after_reload}")
    ok("A4: but edit mode does not survive it",
       page.locator("#editBtn").get_attribute("aria-pressed") == "false")
    edit_on(page)
    hy = page.locator("#hygieneCard").bounding_box()
    ink = page.locator("#intakeCard").bounding_box()
    page.evaluate("(p) => document.getElementById('hygieneCard').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 9, clientX: p.x, clientY: p.y }))",
                  {"x": hy["x"] + 8, "y": hy["y"] + 8})
    page.wait_for_timeout(450)
    page.evaluate("""(p) => {
      const el = document.getElementById('hygieneCard');
      el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'touch', pointerId: 9, clientX: p.x, clientY: p.y }));
      el.dispatchEvent(new PointerEvent('pointerup',   { bubbles: true, pointerType: 'touch', pointerId: 9, clientX: p.x, clientY: p.y }));
    }""", {"x": ink["x"] + 8, "y": ink["y"] + 8})
    page.wait_for_timeout(100)
    o = order(page)
    ok("A4: long-press drag reorders", o.index("hygiene") < o.index("intake"), str(o))
    page.locator("#glucoseCard h2").focus()
    page.keyboard.press("Alt+ArrowLeft"); page.wait_for_timeout(100)
    o2 = order(page)
    ok("A4: Alt+Left moves a focused box", o2.index("glucose") == o.index("glucose") - 1, f"{o} -> {o2}")

    # ---- A5: closing every box leaves the report band, no crash, no artifact ----
    edit_on(page)
    for bid in list(order(page)):
        page.locator(f"[data-box={bid}] .minb").click(); page.wait_for_timeout(40)
    ok("A5: all boxes closed", order(page) == [])
    ok("A5: grid leaves no artifact",
       page.evaluate("() => getComputedStyle(document.getElementById('dailyGrid')).display") == "none")
    ok("A5: Tracker and This week remain",
       page.locator("#feed").count() == 1 and page.locator("#drawerWeek").is_visible())
    ok("A5: no crash", not page_errors, "; ".join(page_errors[:2]))
    # reset layout for the rest
    page.evaluate("() => localStorage.removeItem('mirror_layout_v1')")
    page.reload(wait_until="load"); page.wait_for_timeout(400)

    # ---- A6: glucose logs on Enter and Log, one Tracker line, forever-copy, undo ----
    page.fill("#bgVal", "141"); page.press("#bgVal", "Enter"); page.wait_for_timeout(150)
    ok("A6: Enter logs", st(page)["body"]["glucose"][-1]["mgdl"] == 141)
    ok("A6: one Tracker line", [t for t in feed(page) if "Blood glucose" in t] == ["Blood glucose 141 mg/dL"])
    page.wait_for_timeout(1100)
    page.fill("#bgVal", "95"); page.click("#bgLog"); page.wait_for_timeout(150)
    ok("A6: Log logs", st(page)["body"]["glucose"][-1]["mgdl"] == 95)
    md = page.evaluate("() => buildDataMarkdown()")
    ok("A6: forever-copy carries it", "Blood glucose" in md and "141 mg/dL" in md)
    n0 = len(st(page)["body"]["glucose"])
    page.click("#undoBtn"); page.wait_for_timeout(120)
    ok("A6: undoes cleanly", len(st(page)["body"]["glucose"]) == n0 - 1)

    # ---- A7: 20 readings — same height, no scroll, no growth ----
    h0 = page.evaluate("() => Math.round(document.getElementById('glucoseCard').getBoundingClientRect().height*10)")
    page.evaluate("""() => {
      const s = JSON.parse(localStorage.getItem('mirror_v1'));
      for (let i = 0; i < 20; i++) s.body.glucose.push({ id: 'a7_'+i, mgdl: 90+i, at: localNowISO(),
        _src: 'manual', _at: nowISO(), _up: nowISO() });
      localStorage.setItem('mirror_v1', JSON.stringify(s));
    }""")
    page.reload(wait_until="load"); page.wait_for_timeout(400)
    h1 = page.evaluate("() => Math.round(document.getElementById('glucoseCard').getBoundingClientRect().height*10)")
    slot = page.evaluate("""() => { const s = document.getElementById('bgList');
      return { h: Math.round(s.getBoundingClientRect().height), ov: getComputedStyle(s).overflow, st: s.scrollTop }; }""")
    ok("A7: card height identical with 20 readings", h0 == h1, f"{h0} vs {h1}")
    ok("A7: 128px, overflow hidden, scrolls nothing", slot["h"] == 128 and slot["ov"] == "hidden" and slot["st"] == 0, str(slot))

    # ---- A8: mirror_layout_v1 absent from the forever-copy JSON ----
    page.evaluate("""() => { const l = loadLayout(); l.open.food = false; layout = l; saveLayout(); }""")
    fc = page.evaluate("() => JSON.stringify(state)")
    ok("A8: layout key not in the forever-copy", "mirror_layout_v1" not in fc and "loggrid" not in fc, "")

    # ---- A9: a v19 record opens in v20 — no glucose array, no console error ----
    v19 = st(page)
    del v19["body"]["glucose"]
    v19["__v"] = 19
    page.evaluate("(s) => localStorage.setItem('mirror_v1', JSON.stringify(s))", v19)
    console_errors.clear(); page_errors.clear()
    page.reload(wait_until="load"); page.wait_for_timeout(400)
    real = [e for e in console_errors if "foods.json" not in e and "favicon" not in e and "404" not in e]
    ok("A9: v19 blob opens clean", not real and not page_errors, "; ".join((real + page_errors)[:2]))
    page.evaluate("() => saveState()")
    s = st(page)
    ok("A9: glucose backfilled at v22", s["__v"] == 22 and s["body"]["glucose"] == [])

    # ---- A10: v20 forever-copy through self.html save keeps body.glucose ----
    page.fill("#bgVal", "133"); page.press("#bgVal", "Enter"); page.wait_for_timeout(150)
    before = st(page)
    page2 = ctx.new_page()
    p2err = []
    page2.on("pageerror", lambda e: p2err.append(str(e)))
    page2.goto(BASE + "self.html", wait_until="load")
    page2.wait_for_timeout(600)
    page2.evaluate("() => saveState()")
    page2.wait_for_timeout(150)
    after = json.loads(page2.evaluate("() => localStorage.getItem('mirror_v1')"))
    ok("A10: self.html keeps body.glucose",
       not p2err and after["body"].get("glucose") == before["body"]["glucose"], "; ".join(p2err[:2]))
    diffs = [k for k in before if k != "calendar"
             and json.dumps(before[k], sort_keys=True) != json.dumps(after.get(k), sort_keys=True)]
    ok("A10: full round-trip zero-diff", not diffs, str(diffs))

    ok("no page errors at the end", not page_errors, "; ".join(page_errors[:2]))
    browser.close()

print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
