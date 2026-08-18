# Mirror v22.1 — the date says the date, and the boxes pack.
# One check-block per acceptance item of the v22.1 spec, A1-A7 (A8 = run_all).
#
# Seeds are synthetic and live in a throwaway Chromium profile; the real record
# is never read or written.
import json, subprocess, sys, time, atexit
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = str(Path(__file__).resolve().parents[2])
PORT = 8144
BASE = f"http://127.0.0.1:{PORT}/mirror/"
TZ = "America/Indiana/Indianapolis"
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
                       cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
atexit.register(srv.kill)
time.sleep(1.2)

NOW = datetime.now(ZoneInfo(TZ))
def chipdate(d):
    """en-US 'Tue, Aug 18' — what toLocaleDateString(weekday/month short, day
    numeric) renders in the test browser's default locale."""
    return f"{d:%a}, {d:%b} {d.day}"
def md(d):
    return f"{d:%b} {d.day}"

PASS, FAIL = [], []
def ok(name, cond, extra=""):
    (PASS if cond else FAIL).append(name)
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else f"  -> {extra}"))

def rects(page):
    return page.evaluate("""() => [...document.querySelectorAll('#dailyGrid > .card')]
      .filter(e => !e.hidden).map(e => { const r = e.getBoundingClientRect();
        return { id: e.id, box: e.dataset.box, l: r.left, t: r.top, b: r.bottom, rr: r.right,
                 span: e.style.gridRowEnd }; })""")
def gap_of(page):
    return page.evaluate("() => parseFloat(getComputedStyle(document.getElementById('dailyGrid')).columnGap)")
def overlap(rs):
    for i in range(len(rs)):
        for j in range(i + 1, len(rs)):
            a, b = rs[i], rs[j]
            if a["l"] < b["rr"] - 1 and b["l"] < a["rr"] - 1 and a["t"] < b["b"] - 1 and b["t"] < a["b"] - 1:
                return f"{a['id']} overlaps {b['id']}"
    return ""
def col_gaps(rs):
    """Vertical gaps between column-neighbours, [(above, below, gap), ...]."""
    cols = {}
    for r in rs:
        cols.setdefault(round(r["l"]), []).append(r)
    out = []
    for _, items in cols.items():
        items.sort(key=lambda r: r["t"])
        for a, b in zip(items, items[1:]):
            out.append((a["id"], b["id"], b["t"] - a["b"]))
    return out
def packed(rs, g):
    """Masonry contract: every column-neighbour gap is g plus at most one 8px
    row of span slack (ceil rounding) — never a lake."""
    return [x for x in col_gaps(rs) if not (g - 1 <= x[2] <= g + 8 + 1)]
def order(page):
    return page.evaluate("() => [...document.querySelectorAll('#dailyGrid > .card')].map(e => e.dataset.box)")

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    ctx = browser.new_context(timezone_id=TZ, viewport={"width": 1280, "height": 1100},
                              has_touch=True)
    page = ctx.new_page()
    console_errors, page_errors = [], []
    page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: page_errors.append(str(e)))

    # ================================================================
    # A1 — the day chip says the real date
    # ================================================================
    page.goto(BASE, wait_until="load")
    page.evaluate("() => localStorage.clear()")
    page.reload(wait_until="load"); page.wait_for_timeout(450)
    ok("A1: the chip reads the real date on load",
       page.locator("#dayBtn").text_content() == chipdate(NOW),
       f"{page.locator('#dayBtn').text_content()!r} vs {chipdate(NOW)!r}")
    page.click("#dayBtn"); page.wait_for_timeout(150)
    page.click("#dYestRow"); page.wait_for_timeout(200)
    ok("A1: yesterday names itself and its date",
       page.locator("#dayBtn").text_content() == "Yesterday · " + md(NOW - timedelta(days=1)),
       page.locator("#dayBtn").text_content())
    page.click("#dayBtn"); page.wait_for_timeout(150)
    warn = page.locator("#backdateWarn")
    ok("A1: the backdate warning still lives in the pop and still warns",
       not warn.is_hidden() and "Backdating" in warn.inner_text())
    d5 = page.evaluate("() => shiftDay(todayStr(), -5)")
    page.fill("#dPick", d5); page.dispatch_event("#dPick", "change"); page.wait_for_timeout(200)
    ok("A1: an older day keeps the existing backdated label",
       page.locator("#dayBtn").text_content() == chipdate(NOW - timedelta(days=5)),
       page.locator("#dayBtn").text_content())
    page.click("#dayBtn"); page.wait_for_timeout(120)
    page.click("#dTodayRow"); page.wait_for_timeout(200)
    ok("A1: the chip keeps its ellipsis guard",
       page.evaluate("""() => { const cs = getComputedStyle(document.getElementById('dayBtn'));
         return cs.textOverflow === 'ellipsis' && cs.overflow === 'hidden' && cs.maxWidth !== 'none'; }"""))

    # Midnight rollover, on its own page with a fake clock: park at 23:59 and
    # let the app's own minute-interval carry the chip across the day line.
    page2 = ctx.new_page()
    base_night = datetime(2026, 9, 1, 23, 59, 0)
    page2.clock.install(time=base_night)
    page2.goto(BASE, wait_until="load"); page2.wait_for_timeout(300)
    before = page2.locator("#dayBtn").text_content()
    page2.clock.fast_forward("03:00")
    page2.wait_for_timeout(200)
    after = page2.locator("#dayBtn").text_content()
    ok("A1: midnight rollover updates the chip",
       before == chipdate(base_night) and after == chipdate(base_night + timedelta(days=1)),
       f"{before!r} -> {after!r}")
    page2.close()

    # ================================================================
    # A2 — a short card's column keeps flowing: no lake under Upkeep
    # ================================================================
    # Pin an order that puts tall Food and short Upkeep side by side.
    page.evaluate("""() => localStorage.setItem('mirror_layout_v1', JSON.stringify({
      order: ['food', 'hygiene', 'intake', 'movement', 'pulse', 'glucose', 'checkups', 'loggrid'],
      open: { food: true, hygiene: true, intake: true, movement: true, pulse: true,
              glucose: true, checkups: true, loggrid: true } }))""")
    page.reload(wait_until="load"); page.wait_for_timeout(500)
    g = gap_of(page)
    rs = rects(page)
    hyg = next(r for r in rs if r["box"] == "hygiene")
    food = next(r for r in rs if r["box"] == "food")
    below = min((r for r in rs if abs(r["l"] - hyg["l"]) < 2 and r["t"] > hyg["t"]),
                key=lambda r: r["t"])
    ok("A2: Food is the taller of the pair (the premise)", food["b"] > hyg["b"] + g + 9)
    ok("A2: the box below Upkeep starts one gap under Upkeep, not under Food",
       g - 1 <= below["t"] - hyg["b"] <= g + 9 and below["t"] < food["b"],
       f"gap {below['t'] - hyg['b']:.1f}, food bottom {food['b']:.1f}, below top {below['t']:.1f}")
    ok("A2: every column packs — no lake anywhere", packed(rs, g) == [] and overlap(rs) == "",
       str(packed(rs, g)) + " " + overlap(rs))
    ok("A2: every open card carries a span", all(r["span"].startswith("span ") for r in rs),
       str([r["span"] for r in rs]))

    # ================================================================
    # A3 — drag still works; spans travel with the cards
    # ================================================================
    page.click("#editBtn"); page.wait_for_timeout(150)
    page.evaluate("""() => {
      const src = document.getElementById('movementCard'), dst = document.getElementById('hygieneCard');
      const dt = new DataTransfer();
      src.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }));
      src.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
      dst.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt }));
      dst.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
      src.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
    }""")
    page.wait_for_timeout(150)
    o = order(page)
    ok("A3: mouse drag reorders", o.index("movement") < o.index("hygiene"), str(o))
    rs = rects(page)
    ok("A3: packed and un-overlapped after the drop",
       packed(rs, gap_of(page)) == [] and overlap(rs) == "", str(packed(rs, gap_of(page))))
    page.locator("#glucoseCard h2").focus()
    page.keyboard.press("Alt+ArrowLeft"); page.wait_for_timeout(150)
    o2 = order(page)
    ok("A3: Alt+arrows still move a focused box", o2.index("glucose") == o.index("glucose") - 1,
       f"{o} -> {o2}")
    page.click("#editBtn"); page.wait_for_timeout(150)
    page.reload(wait_until="load"); page.wait_for_timeout(500)
    ok("A3: the order survives reload, packed",
       order(page) == o2 and packed(rects(page), gap_of(page)) == [],
       f"{order(page)} vs {o2}")

    # ================================================================
    # A4 — open/close and edit mode re-pack without overlap
    # ================================================================
    page.click("#editBtn"); page.wait_for_timeout(150)
    page.locator("#railChips .railchip", has_text="Food").click(); page.wait_for_timeout(200)
    rs = rects(page)
    ok("A4: closing a box re-packs the rest",
       all(r["box"] != "food" for r in rs) and packed(rs, gap_of(page)) == [] and overlap(rs) == "",
       str(packed(rs, gap_of(page))))
    page.locator("#railChips .railchip", has_text="Food").click(); page.wait_for_timeout(200)
    rs = rects(page)
    ok("A4: reopening appends and re-packs",
       order(page)[-1] == "food" and packed(rs, gap_of(page)) == [] and overlap(rs) == "")
    # Edit mode is already on: the grown cards must not overlap the row below.
    rs = rects(page)
    ok("A4: edit-mode heights pack without overlap",
       packed(rs, gap_of(page)) == [] and overlap(rs) == "", str(packed(rs, gap_of(page))))
    page.click("#editBtn"); page.wait_for_timeout(200)
    rs = rects(page)
    ok("A4: and leaving edit mode re-packs again",
       packed(rs, gap_of(page)) == [] and overlap(rs) == "")

    # ================================================================
    # A5 — density toggles the gap in the formula
    # ================================================================
    g_before = gap_of(page)
    page.click("#densityBtn"); page.wait_for_timeout(250)
    g_after = gap_of(page)
    rs = rects(page)
    ok("A5: the toggle changes the gap the spans are computed from",
       {g_before, g_after} == {10.0, 12.0}, f"{g_before} -> {g_after}")
    ok("A5: re-packed at the new gap",
       packed(rs, g_after) == [] and overlap(rs) == "", str(packed(rs, g_after)))
    page.click("#densityBtn"); page.wait_for_timeout(250)
    ok("A5: and back", gap_of(page) == g_before
       and packed(rects(page), g_before) == [])

    # ================================================================
    # A6 — one phone column: user order, no overlap
    # ================================================================
    page.set_viewport_size({"width": 375, "height": 800}); page.wait_for_timeout(350)
    rs = rects(page)
    ok("A6: a single column at 375", len({round(r['l']) for r in rs}) == 1)
    stored = page.evaluate("() => JSON.parse(localStorage.getItem('mirror_layout_v1')).order")
    shown = [r["box"] for r in sorted(rs, key=lambda r: r["t"])]
    ok("A6: cards remain in user order", shown == [b for b in stored if b in shown],
       f"{shown} vs {stored}")
    ok("A6: packed, no overlap", packed(rs, gap_of(page)) == [] and overlap(rs) == "",
       str(packed(rs, gap_of(page))))
    page.set_viewport_size({"width": 1280, "height": 1100}); page.wait_for_timeout(350)

    # ================================================================
    # A7 — the invariant's hard internal heights are untouched
    # ================================================================
    hard = page.evaluate("""() => ({
      ck: Math.round(document.querySelector('.ckslot').getBoundingClientRect().height),
      hyg: Math.round(document.querySelector('.hyg').getBoundingClientRect().height),
      num: Math.round(document.querySelector('.hygnum').getBoundingClientRect().height),
      bg: Math.round(document.querySelector('.bgslot').getBoundingClientRect().height),
    })""")
    ok("A7: hard slots hold — 170 / 110 / 34 / 128",
       hard == {"ck": 170, "hyg": 110, "num": 34, "bg": 128}, json.dumps(hard))
    page.click("#editBtn"); page.wait_for_timeout(150)
    ok("A7: the edit-mode footer says Today, not Tracker",
       page.locator("#ckFoot").text_content() == "Retiring keeps every past completion in Today.",
       page.locator("#ckFoot").text_content())
    page.click("#editBtn"); page.wait_for_timeout(150)

    err = [e for e in console_errors if "foods.json" not in e and "favicon" not in e]
    ok("no console errors", not err, "; ".join(err[:3]))
    ok("no page errors", not page_errors, "; ".join(page_errors[:3]))

    browser.close()

print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
