"""Milwaukee desk builder.

Fetches Milwaukee headlines, the calendars of the organizations we follow,
and the citywide option generators (venues, aggregators, teams), and writes
the JSON files the page at milwaukee/ reads:

    milwaukee/data/news.json     latest local headlines (last 14 days)
    milwaukee/data/events.json   upcoming events (orgs + sources), normalized

Two registries are hand-edited and never written by this tool:

    milwaukee/data/orgs.json     the groups we like (their chips filter the page)
    milwaukee/data/sources.json  option generators: citywide calendars, venues, teams

Run:  python tools/milwaukee/build.py            (both files)
      python tools/milwaukee/build.py --news     (headlines only)
      python tools/milwaukee/build.py --events   (orgs + sources only)
      python tools/milwaukee/build.py -v         (per-item detail)

Rules it keeps:
  * stdlib only, so the GitHub Action and a laptop run the same code;
  * every feed fails soft (recorded in the file, shown on the page), but the
    run fails CLOSED when too little came back — an empty file is never
    written over a full one (doctrine: a check must prove it looked);
  * a file is rewritten only when its content changed, so quiet days commit
    nothing (`generated_at` is the time of the last change, not the last run).

Every event is normalized to:
    title, start ("YYYY-MM-DDTHH:MM" Milwaukee wall clock, or "YYYY-MM-DD"),
    end, all_day, time_unknown (the listing gave a day but no hour),
    url, where (venue), addr, zip, summary, tags,
    via ("org" | "source"), org | src (registry id), also (other registry ids
    that listed the same thing),
    kind (music theater comedy film art talks books markets outdoors food
          sports family community), reach (walk | bus | car | null),
    free (true | false | null).

Feed adapters (the `feed.type` field in either registry):
  tribe    The Events Calendar (WordPress) REST API — /wp-json/tribe/events/v1/events
  ics      an iCalendar URL (Google Calendar public ICS etc.); weekly/daily RRULEs expanded
  jsonld   a page carrying schema.org Event blocks in <script type="application/ld+json">
           (optional `pages`: more URLs to read; `home_only`: keep only events with a venue)
  boswell  boswellbooks.com/upcoming-events — dates live in the link paths
  mlb      MLB's public schedule API (`team_id`); home games only
  rss      a blog/news feed → "posts" on the roster card, not events
Any feed may carry `exclude`: a title regex that drops noisy entries.
"""
from __future__ import annotations

import json
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path
from xml.etree import ElementTree as ET

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
DATA = REPO / "milwaukee" / "data"
ORGS_JSON = DATA / "orgs.json"
SOURCES_JSON = DATA / "sources.json"
NEWS_JSON = DATA / "news.json"
EVENTS_JSON = DATA / "events.json"

USER_AGENT = "Mozilla/5.0 (compatible; milwaukee-desk/1.0; +https://github.com/stevenfrye30/workspace-hub)"
TIMEOUT = 20
CTX = ssl.create_default_context()

NEWS_DAYS = 14          # headline window
NEWS_PER_SOURCE = 12
HORIZON_DAYS = 60       # how far ahead events.json looks
EVENTS_PER_ORG = 80      # a registry entry may set its own "cap"
EVENTS_PER_SOURCE = 500
TRIBE_MAX_PAGES = 10
POSTS_DAYS = 45
POSTS_PER_ORG = 5
MIN_NEWS_SOURCES = 3    # fewer than this succeeding → refuse to write news.json

VERBOSE = "-v" in sys.argv

# ----------------------------------------------------------------- time zone
try:
    from zoneinfo import ZoneInfo
    MKE = ZoneInfo("America/Chicago")
except Exception:  # no tz database (bare Windows) — the US DST rule by hand
    from datetime import tzinfo

    class _Central(tzinfo):
        def _dst_bounds(self, y):
            mar = date(y, 3, 1)
            second_sun = mar + timedelta(days=(6 - mar.weekday()) % 7 + 7)
            nov = date(y, 11, 1)
            first_sun = nov + timedelta(days=(6 - nov.weekday()) % 7)
            return (datetime(second_sun.year, 3, second_sun.day, 2),
                    datetime(first_sun.year, 11, first_sun.day, 2))

        def utcoffset(self, dt):
            return timedelta(hours=-6) + self.dst(dt)

        def dst(self, dt):
            if dt is None:
                return timedelta(0)
            start, end = self._dst_bounds(dt.year)
            naive = dt.replace(tzinfo=None)
            return timedelta(hours=1) if start <= naive < end else timedelta(0)

        def tzname(self, dt):
            return "CDT" if self.dst(dt) else "CST"

    MKE = _Central()


def now_local() -> datetime:
    return datetime.now(timezone.utc).astimezone(MKE)


def local_iso(dt: datetime) -> str:
    """Wall-clock Milwaukee time, minute precision, no offset — the page
    treats these as local times and never converts."""
    if dt.tzinfo is not None:
        dt = dt.astimezone(MKE)
    return dt.strftime("%Y-%m-%dT%H:%M")


# ----------------------------------------------------------------- fetching
def fetch(url: str, accept: str = "*/*") -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": accept})
    with urllib.request.urlopen(req, timeout=TIMEOUT, context=CTX) as r:
        return r.read().decode("utf-8", "ignore")


def fetch_json(url: str):
    return json.loads(fetch(url, "application/json"))


# ----------------------------------------------------------------- text
def clean(s: str | None, limit: int | None = None) -> str:
    s = s or ""
    s = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", "", s)
    s = re.sub(r"<[^>]+>", " ", s)
    s = unescape(unescape(s))          # feeds double-encode entities routinely
    s = re.sub(r"(?<=\w)�(?=\w)", "’", s)  # mangled apostrophes
    s = s.replace("�", "")
    s = re.sub(r"\s+", " ", s).strip()
    if limit and len(s) > limit:
        cut = s[:limit].rsplit(" ", 1)[0]
        s = cut + "…"
    return s


def parse_date_any(s: str | None) -> datetime | None:
    """RFC 822 (RSS) or ISO 8601 (Atom / JSON-LD / Tribe) → aware UTC datetime."""
    if not s:
        return None
    s = s.strip()
    try:
        dt = parsedate_to_datetime(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except (TypeError, ValueError, IndexError):
        pass
    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=MKE)
        return dt.astimezone(timezone.utc)
    except ValueError:
        return None


# ----------------------------------------------------------------- RSS / Atom
def parse_feed(xml_text: str) -> list[dict]:
    """Namespace-agnostic RSS 2.0 / Atom → [{title, link, summary, published}]."""
    xml_text = re.sub(r'\sxmlns(:\w+)?="[^"]+"', "", xml_text)
    xml_text = re.sub(r"<(/?)\w+:", r"<\1", xml_text)
    xml_text = re.sub(r"\s\w+:(\w+)=", r" \1=", xml_text)
    root = ET.fromstring(xml_text)
    out = []
    for item in list(root.iter("item")) + list(root.iter("entry")):
        def txt(*tags):
            for t in tags:
                el = item.find(t)
                if el is not None and (el.text or "").strip():
                    return el.text
            return None
        link = txt("link")
        if not link:  # Atom: <link href=...>
            el = item.find("link")
            link = el.get("href") if el is not None else None
        out.append({
            "title": clean(txt("title")),
            "link": (link or "").strip(),
            "summary": clean(txt("description", "summary", "content"), 240),
            "published": parse_date_any(txt("pubDate", "published", "updated", "date")),
        })
    return out


# ----------------------------------------------------------------- headlines
# TMJ4's feed mixes national wire stories in; keep only what names the state.
WISCONSIN = re.compile(
    r"\b(wisconsin|milwaukee|waukesha|racine|kenosha|madison|green bay|ozaukee|washington county|"
    r"wauwatosa|tosa|west allis|brookfield|oak creek|glendale|shorewood|whitefish bay|cudahy|greenfield|"
    r"franklin|mequon|germantown|menomonee falls|packers|bucks|brewers|admirals|marquette|uwm|mcw|"
    r"we energies|mps\b|mmsd|fiserv|summerfest|state fair|lake michigan|badgers|\bwi\b|southeast(ern)? wisconsin)\b",
    re.I,
)
NEWS_SOURCES = [
    # (name, feed url, homepage, kind, keep-only regex or None)  kind: news | roundup | state
    ("Urban Milwaukee", "https://urbanmilwaukee.com/feed/", "https://urbanmilwaukee.com/", "news", None),
    ("Milwaukee NNS", "https://milwaukeenns.org/feed/", "https://milwaukeenns.org/", "news", None),
    ("Milwaukee Record", "https://milwaukeerecord.com/feed/", "https://milwaukeerecord.com/", "news", None),
    ("OnMilwaukee", "https://onmilwaukee.com/rss", "https://onmilwaukee.com/", "news", None),
    ("TMJ4", "https://www.tmj4.com/news.rss", "https://www.tmj4.com/", "news", WISCONSIN),
    ("Milwaukee Magazine", "https://www.milwaukeemag.com/feed/", "https://www.milwaukeemag.com/", "news", None),
    ("Milwaukee Independent", "https://www.milwaukeeindependent.com/feed/", "https://www.milwaukeeindependent.com/", "news", None),
    ("BizTimes", "https://biztimes.com/feed/", "https://biztimes.com/", "news", None),
    ("Shepherd Express", "https://shepherdexpress.com/upcoming-events/index.rss", "https://shepherdexpress.com/", "roundup", None),
    ("Wisconsin Examiner", "https://wisconsinexaminer.com/feed/", "https://wisconsinexaminer.com/", "state", None),
    ("Wisconsin Watch", "https://wisconsinwatch.org/feed/", "https://wisconsinwatch.org/", "state", None),
]

EVENT_HINTS = re.compile(
    r"\b(festival|fest\b|parade|concert|opens|kicks? off|returns?|tonight|this weekend|weekend|"
    r"marathon|race|opening day|ribbon[- ]cutting|celebration|exhibit|premiere|block party|"
    r"gallery night|fireworks|fair\b|taste of|takes place|market|tour|screening|lecture|"
    r"workshop|reading|book launch|panel|fundraiser|open house|doors open)\b",
    re.I,
)


def build_news() -> dict | None:
    since = datetime.now(timezone.utc) - timedelta(days=NEWS_DAYS)
    items, sources, seen_urls = [], [], set()
    for name, url, home, kind, keep_only in NEWS_SOURCES:
        try:
            got = parse_feed(fetch(url, "application/rss+xml, application/atom+xml, application/xml, text/xml, */*"))
        except (OSError, ET.ParseError, ValueError) as e:
            print(f"  news  {name:24s} ERROR {type(e).__name__}: {str(e)[:80]}", file=sys.stderr)
            sources.append({"name": name, "home": home, "kind": kind, "ok": False, "error": f"{type(e).__name__}: {str(e)[:120]}"})
            continue
        kept = 0
        for it in got:
            if not it["title"] or not it["link"]:
                continue
            if it["link"] in seen_urls or it["title"].lower().startswith("sponsored"):
                continue  # feeds repeat items; sponsored posts are ads
            seen_urls.add(it["link"])
            if it["published"] and it["published"] < since:
                continue
            if keep_only and not keep_only.search(it["title"] + " " + it["summary"]):
                continue  # a national story on a local station's feed
            items.append({
                "source": name,
                "kind": kind,
                "title": it["title"],
                "url": it["link"],
                "summary": it["summary"],
                "published": it["published"].isoformat() if it["published"] else None,
                "event": bool(EVENT_HINTS.search(it["title"] + " " + it["summary"])) or kind == "roundup",
            })
            kept += 1
            if kept >= NEWS_PER_SOURCE:
                break
        sources.append({"name": name, "home": home, "kind": kind, "ok": True, "count": kept})
        print(f"  news  {name:24s} {kept:3d} of {len(got)}")
    ok_sources = [s for s in sources if s["ok"]]
    if len(ok_sources) < MIN_NEWS_SOURCES:
        print(f"REFUSE: only {len(ok_sources)} news source(s) answered — not writing news.json", file=sys.stderr)
        return None
    items.sort(key=lambda x: x["published"] or "", reverse=True)
    return {"generated_at": None, "window_days": NEWS_DAYS, "sources": sources, "items": items}


# ----------------------------------------------------------------- event adapters
def _blank(title, start, **kw) -> dict:
    e = {"title": title, "start": start, "end": "", "all_day": False, "url": "", "where": "",
         "addr": "", "zip": "", "summary": "", "tags": [], "cost": None}
    e.update(kw)
    return e


def adapter_tribe(feed: dict, today: date, horizon: date) -> list[dict]:
    base = feed["url"]
    sep = "&" if "?" in base else "?"
    url = f"{base}{sep}per_page=50&start_date={today.isoformat()}&end_date={horizon.isoformat()}"
    out, pages = [], 0
    while url and pages < TRIBE_MAX_PAGES:
        d = fetch_json(url)
        for e in d.get("events", []):
            start = (e.get("start_date") or "").replace(" ", "T")[:16]
            end = (e.get("end_date") or "").replace(" ", "T")[:16]
            if not start:
                continue
            venue = e.get("venue") or {}
            if isinstance(venue, list):
                venue = venue[0] if venue else {}
            if not isinstance(venue, dict):
                venue = {}
            cats = [clean(c.get("name")) for c in (e.get("categories") or []) if isinstance(c, dict)]
            cats = [c for c in cats if not re.fullmatch(r"(featured( events?)?|general|events?|uncategorized|arts?\s*(&|and)\s*entertainment|entertainment)", c, re.I)]
            all_day = bool(e.get("all_day"))
            multi_day = all_day and end[:10] > start[:10]
            out.append(_blank(
                clean(e.get("title")),
                start[:10] if all_day else start,
                end=end[:10] if all_day else end,
                all_day=all_day and not multi_day,
                time_unknown=multi_day or (not all_day and start.endswith("T00:00")),
                run_through=end[:10] if multi_day else "",
                url=e.get("url") or "",
                where=clean(venue.get("venue") or ""),
                addr=clean(venue.get("address") or ""),
                zip=str(venue.get("zip") or "")[:5],
                city=clean(venue.get("city") or ""),
                summary=clean(e.get("excerpt") or e.get("description"), 200),
                tags=cats[:3],
                cost=clean(str(e.get("cost") or "")) or None,
            ))
        url = d.get("next_rest_url")
        pages += 1
    return out


_ICS_DT = re.compile(r"^(DTSTART|DTEND|EXDATE)(?:;([^:]*))?:(.+)$")


def _ics_unfold(text: str) -> list[str]:
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    out: list[str] = []
    for ln in lines:
        if ln[:1] in (" ", "\t") and out:
            out[-1] += ln[1:]
        else:
            out.append(ln)
    return out


def _ics_parse_dt(params: str | None, value: str):
    """→ (datetime local-aware | date, all_day)"""
    p = dict(kv.split("=", 1) for kv in (params or "").split(";") if "=" in kv)
    value = value.strip()
    if p.get("VALUE") == "DATE" or re.fullmatch(r"\d{8}", value):
        return date(int(value[:4]), int(value[4:6]), int(value[6:8])), True
    m = re.fullmatch(r"(\d{8})T(\d{6})(Z?)", value)
    if not m:
        return None, False
    ds, ts, z = m.groups()
    naive = datetime(int(ds[:4]), int(ds[4:6]), int(ds[6:8]), int(ts[:2]), int(ts[2:4]), int(ts[4:6]))
    if z:
        return naive.replace(tzinfo=timezone.utc).astimezone(MKE), False
    tzid = p.get("TZID")
    if tzid and tzid != "America/Chicago":
        try:
            from zoneinfo import ZoneInfo
            return naive.replace(tzinfo=ZoneInfo(tzid)).astimezone(MKE), False
        except Exception:
            pass
    return naive.replace(tzinfo=MKE), False


_WD = {"MO": 0, "TU": 1, "WE": 2, "TH": 3, "FR": 4, "SA": 5, "SU": 6}


def _ics_expand(start, rrule: str | None, exdates: set, today: date, horizon: date, all_day: bool) -> list:
    """Occurrences of one VEVENT inside [today, horizon]. Expands DAILY and
    WEEKLY rules (INTERVAL, BYDAY, COUNT, UNTIL); anything else contributes
    only its own DTSTART, honestly — no invented dates."""
    def d_of(x):
        return x if isinstance(x, date) and not isinstance(x, datetime) else x.date()

    def inside(x):
        return today <= d_of(x) <= horizon and d_of(x) not in exdates

    if not rrule:
        return [start] if inside(start) else []
    rule = dict(kv.split("=", 1) for kv in rrule.split(";") if "=" in kv)
    freq = rule.get("FREQ")
    if freq not in ("DAILY", "WEEKLY"):
        return [start] if inside(start) else []
    interval = max(1, int(rule.get("INTERVAL", "1")))
    count = int(rule["COUNT"]) if "COUNT" in rule else None
    until = None
    if "UNTIL" in rule:
        u, _ = _ics_parse_dt(None, rule["UNTIL"])
        until = d_of(u) if u else None
    bydays = [_WD[x[-2:]] for x in rule.get("BYDAY", "").split(",") if x[-2:] in _WD]
    occ, produced = [], 0
    cursor = start
    step = timedelta(days=interval) if freq == "DAILY" else timedelta(weeks=interval)
    guard = 0
    while d_of(cursor) <= horizon and guard < 400:
        guard += 1
        candidates = [cursor]
        if freq == "WEEKLY" and bydays:
            week_start = cursor - timedelta(days=cursor.weekday())
            candidates = [week_start + timedelta(days=w) for w in sorted(bydays)]
        for c in candidates:
            if d_of(c) < d_of(start):
                continue
            if until and d_of(c) > until:
                return occ
            produced += 1
            if count and produced > count:
                return occ
            if inside(c):
                occ.append(c)
        cursor = cursor + step
    return occ


def adapter_ics(feed: dict, today: date, horizon: date) -> list[dict]:
    lines = _ics_unfold(fetch(feed["url"], "text/calendar, */*"))
    out, cur = [], None
    for ln in lines:
        if ln == "BEGIN:VEVENT":
            cur = {"exdates": set()}
            continue
        if ln == "END:VEVENT" and cur is not None:
            start, all_day = cur.get("start", (None, False))
            if start is not None:
                end = cur.get("end", (None, False))[0]
                dur = (end - start) if end is not None and type(end) is type(start) else None
                for occ in _ics_expand(start, cur.get("rrule"), cur["exdates"], today, horizon, all_day):
                    o_end = occ + dur if dur else None
                    out.append(_blank(
                        clean(cur.get("summary")),
                        occ.isoformat() if all_day else local_iso(occ),
                        end=(o_end.isoformat() if all_day else local_iso(o_end)) if o_end else "",
                        all_day=all_day,
                        url=cur.get("url") or feed.get("link") or "",
                        where=clean(cur.get("location"), 120),
                        summary=clean(cur.get("description"), 200),
                    ))
            cur = None
            continue
        if cur is None:
            continue
        m = _ICS_DT.match(ln)
        if m:
            key, params, value = m.groups()
            if key == "EXDATE":
                for v in value.split(","):
                    d, _ = _ics_parse_dt(params, v)
                    if d is not None:
                        cur["exdates"].add(d if isinstance(d, date) and not isinstance(d, datetime) else d.date())
            else:
                cur["start" if key == "DTSTART" else "end"] = _ics_parse_dt(params, value)
            continue
        for key in ("SUMMARY", "URL", "LOCATION", "DESCRIPTION", "RRULE"):
            if ln.startswith(key + ":") or ln.startswith(key + ";"):
                val = ln.split(":", 1)[1]
                val = val.replace("\\n", " ").replace("\\,", ",").replace("\\;", ";")
                cur[key.lower()] = val
    return out


def _ld_events(blob: str) -> list[dict]:
    """schema.org Event objects from one ld+json block — parsed properly when
    the JSON is valid, and by field-regex when a site ships broken escapes
    (Woodland Pattern does)."""
    found = []
    try:
        d = json.loads(blob)
        stack = [d]
        while stack:
            x = stack.pop()
            if isinstance(x, dict):
                t = x.get("@type")
                types = t if isinstance(t, list) else [t]
                if any(isinstance(tt, str) and tt.endswith("Event") and tt != "BroadcastEvent" for tt in types):
                    found.append(x)
                stack.extend(v for v in x.values() if isinstance(v, (dict, list)))
            elif isinstance(x, list):
                stack.extend(x)
        return found
    except ValueError:
        pass
    for chunk in re.split(r'"@type"\s*:\s*"Event"', blob)[1:]:
        # Top-level fields only: peel the nested objects away first, or
        # location.name gets mistaken for the event's own name (Woodland
        # Pattern lists location before name).
        flat = chunk
        for _ in range(6):
            flat = re.sub(r"\{[^{}]*\}", "", flat)

        def f(key, src=flat):
            m = re.search(r'"%s"\s*:\s*"((?:[^"\\]|\\.)*)"' % key, src)
            return m.group(1).encode("utf-8").decode("unicode_escape", "ignore") if m else None
        loc = re.search(r'"location"\s*:\s*\{.*?"name"\s*:\s*"((?:[^"\\]|\\.)*)"', chunk, re.S)
        found.append({"name": f("name"), "startDate": f("startDate"), "endDate": f("endDate"),
                      "url": f("url"), "location": {"name": loc.group(1) if loc else ""}})
    return found


def _ld_offer_free(e: dict):
    if e.get("isAccessibleForFree") is True:
        return True
    offers = e.get("offers")
    if isinstance(offers, dict):
        offers = [offers]
    if isinstance(offers, list) and offers:
        prices = []
        for o in offers:
            if isinstance(o, dict):
                for k in ("price", "lowPrice"):
                    v = o.get(k)
                    if v not in (None, ""):
                        try:
                            prices.append(float(str(v).replace("$", "").replace(",", "")))
                        except ValueError:
                            pass
        if prices:
            return min(prices) == 0
    return None


def adapter_jsonld(feed: dict, today: date, horizon: date) -> list[dict]:
    out = []
    for page in [feed["url"]] + list(feed.get("pages") or []):
        html = fetch(page, "text/html")
        for blob in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.S):
            for e in _ld_events(blob.strip()):
                st = parse_date_any(e.get("startDate"))
                if not st or not e.get("name"):
                    continue
                en = parse_date_any(e.get("endDate"))
                raw = (e.get("startDate") or "").strip()
                date_only = bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", raw))
                loc = e.get("location")
                where = addr = zip_ = ""
                if isinstance(loc, dict):
                    where = clean(loc.get("name") or "", 120)
                    a = loc.get("address")
                    if isinstance(a, dict):
                        addr = clean(a.get("streetAddress") or "", 120)
                        zip_ = str(a.get("postalCode") or "")[:5]
                    elif isinstance(a, str):
                        addr = clean(a, 120)
                elif isinstance(loc, str):
                    where = clean(loc, 120)
                if feed.get("home_only") and not where:
                    continue
                out.append(_blank(
                    clean(e.get("name")),
                    st.astimezone(MKE).date().isoformat() if date_only else local_iso(st),
                    end=(en.astimezone(MKE).date().isoformat() if date_only else local_iso(en)) if en else "",
                    all_day=date_only,
                    time_unknown=date_only,
                    url=e.get("url") or feed.get("link") or "",
                    where=where, addr=addr, zip=zip_,
                    summary=clean(e.get("description"), 200) if isinstance(e.get("description"), str) else "",
                    free=_ld_offer_free(e),
                ))
    return out


def adapter_boswell(feed: dict, today: date, horizon: date) -> list[dict]:
    html = fetch(feed["url"], "text/html")
    base = "https://boswellbooks.com"
    out, seen = [], set()
    for m in re.finditer(r'<a[^>]+href="(/event/(\d{4}-\d{2}-\d{2})/[^"]+)"[^>]*>(.*?)</a>(.{0,400})', html, re.S):
        href, d, inner, after = m.groups()
        title = clean(inner)
        if not title or href in seen:
            continue
        seen.add(href)
        tags = [t for t in ("Offsite", "Ticketed", "Virtual") if re.search(t + r"\s+Event", after)]
        out.append(_blank(title, d, all_day=True, time_unknown=True, url=base + href, tags=tags,
                          free=(False if "Ticketed" in tags else None)))
    return out


def adapter_mlb(feed: dict, today: date, horizon: date) -> list[dict]:
    team = int(feed["team_id"])
    d = fetch_json(f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId={team}&startDate={today}&endDate={horizon}")
    out = []
    for day in d.get("dates", []):
        for g in day.get("games", []):
            home = g["teams"]["home"]["team"]
            away = g["teams"]["away"]["team"]
            if home.get("id") != team and feed.get("home_only", True):
                continue
            state = (g.get("status") or {}).get("detailedState", "")
            if re.search(r"cancel|postpone", state, re.I):
                continue
            st = parse_date_any(g.get("gameDate"))
            if not st:
                continue
            gt = g.get("gameType", "")
            tag = {"R": "regular season", "P": "postseason", "S": "spring", "E": "exhibition"}.get(gt, "")
            when = st.astimezone(MKE)
            out.append(_blank(
                f"{home['name'].split()[-1]} vs {away['name']}" if home.get("id") == team else f"{home['name']} at {away['name']}",
                local_iso(when),
                url=f"https://www.mlb.com/{feed.get('slug', 'brewers')}/schedule/{when.strftime('%Y-%m')}",
                where=(g.get("venue") or {}).get("name", ""),
                tags=[t for t in [tag, g.get("dayNight", "")] if t],
                free=False,
            ))
    return out


def adapter_rss_posts(feed: dict) -> list[dict]:
    since = datetime.now(timezone.utc) - timedelta(days=POSTS_DAYS)
    out = []
    for it in parse_feed(fetch(feed["url"], "application/rss+xml, application/atom+xml, application/xml, text/xml, */*")):
        if not it["title"] or not it["link"]:
            continue
        if it["published"] and it["published"] < since:
            continue
        out.append({"title": it["title"], "url": it["link"], "published": it["published"].isoformat() if it["published"] else None})
        if len(out) >= POSTS_PER_ORG:
            break
    return out


UWM_DEPT_LABEL = {
    "arts": "Peck School of the Arts", "planetarium": "Manfred Olson Planetarium", "libraries": "UWM Libraries",
    "studentaffairs": "Student Affairs & the Union", "freshwater": "School of Freshwater Sciences",
    "letters-science": "Letters & Science", "c21": "Center for 21st Century Studies", "sarup": "Architecture & Urban Planning",
    "history": "History", "english": "English", "graduateschool": "Graduate School", "philosophy": "Philosophy",
    "welcome": "Campus welcome events", "event-submission": "Campus", "publichealth": "Zilber School of Public Health",
    "set": "Student Experience & Talent", "hr": "Human Resources", "cetl": "Teaching & Learning", "nursing": "Nursing",
}


def adapter_uwm(feed: dict, today: date, horizon: date) -> list[dict]:
    """uwm.edu/events/ is an aggregate of department sub-sites, each a Tribe
    calendar at uwm.edu/<dept>/wp-json/tribe/events/v1/events — and the
    aggregate page shows only ten items per view, so read the departments
    directly. `depts` lists the sub-site slugs; each fails soft."""
    out, failed = [], []
    for slug in feed.get("depts") or []:
        try:
            got = adapter_tribe({"url": f"https://uwm.edu/{slug}/wp-json/tribe/events/v1/events"}, today, horizon)
        except (OSError, ValueError, KeyError, TypeError) as ex:
            failed.append(f"{slug}: {type(ex).__name__}")
            continue
        label = UWM_DEPT_LABEL.get(slug, slug)
        for e in got:
            e["tags"] = [label] + [t for t in e.get("tags") or [] if t != label][:2]
            e["dept"] = slug
        out.extend(got)
    if failed and not out:
        raise OSError("every department failed: " + ", ".join(failed))
    if failed:
        print(f"         uwm: {len(failed)} department(s) failed — {', '.join(failed)}", file=sys.stderr)
    return out


def adapter_eventbrite(feed: dict, today: date, horizon: date) -> list[dict]:
    """Eventbrite's listing pages embed window.__SERVER_DATA__ with full
    'destination_event' objects — start and end times, venue with zip, the
    category and subcategory, cancellation — far better than the page's
    JSON-LD, which carries dates only. `pages` lists the listing URLs to
    read (the main page plus category and this-week pages; each shows at
    most 20–60); events are deduped by id across them."""
    out, seen, failed = [], set(), []
    for page in feed.get("pages") or [feed["url"]]:
        try:
            html = fetch(page, "text/html")
            i = html.find("window.__SERVER_DATA__")
            if i < 0:
                failed.append(f"{page}: no data block")
                continue
            data, _ = json.JSONDecoder().raw_decode(html[html.find("{", i):])
        except (OSError, ValueError) as ex:
            failed.append(f"{page}: {type(ex).__name__}")
            continue
        stack = [data]
        while stack:
            x = stack.pop()
            if isinstance(x, dict):
                if x.get("_type") == "destination_event":
                    eid = x.get("id") or x.get("url")
                    if eid in seen or x.get("is_cancelled") or x.get("is_online_event"):
                        continue
                    seen.add(eid)
                    sd, st = x.get("start_date") or "", x.get("start_time") or ""
                    if not sd:
                        continue
                    ed, et = x.get("end_date") or "", x.get("end_time") or ""
                    venue = x.get("primary_venue") or {}
                    addr = venue.get("address") or {}
                    tags = []
                    for t in x.get("tags") or []:
                        if t.get("prefix") in ("EventbriteSubCategory", "EventbriteCategory"):
                            tags.append(clean(t.get("display_name") or ""))
                        elif t.get("prefix") == "EventbriteFormat" and (t.get("display_name") or "").startswith("Tour"):
                            tags.append("Tour")
                    ta = x.get("ticket_availability") or {}
                    free = True if (x.get("is_free") is True or ta.get("is_free") is True) else None
                    out.append(_blank(
                        clean(x.get("name")),
                        f"{sd}T{st[:5]}" if st else sd,
                        end=(f"{ed}T{et[:5]}" if ed and et else ed),
                        all_day=not st, time_unknown=not st,
                        url=x.get("url") or "",
                        where=clean(venue.get("name") or "", 120),
                        addr=clean(addr.get("address_1") or "", 120),
                        zip=str(addr.get("postal_code") or "")[:5],
                        city=clean(addr.get("city") or ""),
                        summary=clean(x.get("summary"), 200),
                        tags=[t for t in tags if t][:3],
                        free=free,
                    ))
                    continue
                stack.extend(v for v in x.values() if isinstance(v, (dict, list)))
            elif isinstance(x, list):
                stack.extend(x)
    if failed and not out:
        raise OSError("every Eventbrite page failed: " + ", ".join(failed))
    if failed:
        print(f"         eventbrite: {len(failed)} page(s) failed — {', '.join(failed)}", file=sys.stderr)
    return out


ADAPTERS = {"tribe": adapter_tribe, "ics": adapter_ics, "jsonld": adapter_jsonld, "boswell": adapter_boswell, "mlb": adapter_mlb, "uwm": adapter_uwm, "eventbrite": adapter_eventbrite}


# ----------------------------------------------------------------- normalization
KINDS = ["music", "theater", "comedy", "film", "art", "talks", "books", "markets", "outdoors", "food", "sports", "family", "community"]

# A listing's own category → kind, but only for categories that clearly mean
# one thing. Anything else ("Education", "Fundraiser", "Bradley Family
# Galleries", "Arts & Entertainment") is ignored and the title decides.
CATEGORY_KIND = [
    (r"^(comedy|improv|stand[- ]?up( comedy)?)$", "comedy"),
    (r"^(films?|cinema|movies?|screenings?|film series)$", "film"),
    (r"^(theat(er|re)|plays?|musicals?|opera|ballet|dance|broadway( series)?|\d\d-\d\d broadway series|milwaukee ballet|florentine opera)$", "theater"),
    (r"^(music|concerts?|live music|jazz|classical|symphony)$", "music"),
    (r"^(books?|author events?|readings?|poetry|literary|reading group|readshop)$", "books"),
    (r"^(lectures?|talks?|artist talks?|panels?|history|colloquium|seminars?|doors open|tours?)$", "talks"),
    (r"^(markets?|farmers'? markets?|bazaar|craft fair|makers market)$", "markets"),
    (r"^(environment|nature|outdoors?|gardening|hiking|biking|birding)$", "outdoors"),
    (r"^(food( (&|and) drink)?|drink|dining|beer|wine|tastings?)$", "food"),
    (r"^(sports?|athletics|games?)$", "sports"),
    (r"^(kids|family|families|family programs?|youth( \+ family)?|children|teens?|story ?time)$", "family"),
    (r"^(art|arts|gallery|exhibits?|exhibitions?|art studio|drop-in tours?|visual arts?)$", "art"),
    # Eventbrite's own category and subcategory names (subcategory is listed first, so it wins)
    (r"^(rock|pop|jazz|hip hop ?/ ?rap|country|electronic|folk|blues|classical|top 40|alternative|metal|indie|r&b|latin|reggae|edm ?/ ?electronic|singer ?/ ?songwriter|world|acoustic|americana|bluegrass|punk ?/ ?hardcore|psychedelic|dj ?/ ?dance|other music|experimental)$", "music"),
    (r"^(theatre|theater|musical|opera|ballet|dance|circus|orchestra|choir|performing & visual arts)$", "theater"),
    (r"^(fine art|painting|drawing & painting|craft|crafts|design|sculpture|photography|literary arts|jewelry|knitting|drawing)$", "art"),
    (r"^(film|tv|anime|film, media & entertainment)$", "film"),
    (r"^(beer|wine|spirits|food|drink|food & drink|cocktails?)$", "food"),
    (r"^(sports & fitness|running|cycling|fitness|walking|obstacles|golf|basketball|baseball|hockey|soccer|football|tennis|swimming & water sports|weightlifting|kickball|softball|volleyball|wrestling|lacrosse|rugby|exercise)$", "sports"),
    (r"^(travel & outdoor|hiking|climbing|kayaking|canoeing|rafting|camping|hunting|fishing)$", "outdoors"),
    (r"^(family & education|parenting|baby|kids|children|education|alumni|reunion)$", "family"),
    (r"^(science & technology|science|technology|high tech|biotech|robotics|medicine|social media|mobile)$", "talks"),
    (r"^(books|literary arts|poetry|writing)$", "books"),
    (r"^(comedy|stand[- ]?up)$", "comedy"),
]
# Title words → kind, in order: the unmistakable before the ambiguous. "tour"
# is deliberately NOT a music word (walking tours, Doors Open tours).
TITLE_KIND = [
    (r"\b(author|coauthors?|book club|book launch|book release|poetry|poet|novel|zine|reading group|in conversation with)\b", "books"),
    (r"\b(comedy|comedian|improv|stand[- ]?up|open mic comedy)\b", "comedy"),
    (r"\b(film|screening|cinema|movie|documentary|shorts)\b", "film"),
    (r"\b(theatre|theater|musical|opera|ballet|dance company|dance fest|a play\b|the play\b|broadway)\b", "theater"),
    (r"\b(concert|music|symphony|orchestra|quartet|septet|band|jazz|blues|choir|recital|dj\b|hip[- ]hop|punk|metal|album release|acoustic|singer|songwriter|rock\b|folk\b|soul\b|funk|reggae|bluegrass|live at|tribute|songbook|songs?\b|r&b)\b", "music"),
    (r"\b(paint|pottery|ceramic|craft night|drawing|sketch|watercolor|sip (and|&) paint|printmaking|collage)\b", "art"),
    (r"\b(walking tour|history tour|tour of|guided tour|doors open)\b", "talks"),
    (r"\b(market|farmers|bazaar|craft fair|craft show|crafts? sale|arts (&|and) crafts|vendor|makers|vintage|swap|flea|expo|card show)\b", "markets"),
    (r"\b(fish fry|beer|brew|tasting|dinner|brunch|lunch|food|wine|cocktail|taste of|pop-?up|supper|cook|bread|baking|bake|chef|pizza|taco|barbecue|bbq|chocolate)\b", "food"),
    (r"\b(yoga|pilates|fitness|meditation|sound bath|wellness|zumba|tai chi)\b", "community"),
    (r"\b(lecture|talk|panel|colloquium|discussion|symposium|conversation|forum|seminar|class\b|workshop|how to|101|summit|conference)\b", "talks"),
    (r"\b(hike|walk\b|bike|ride\b|paddle|kayak|birding|garden|nature|trail|cleanup|5k|10k|run club|prairie|orchid|plant sale|plant swap|harbor fest)\b", "outdoors"),
    (r"\b(board games?|game night|games night|trivia|bingo|karaoke|open mic)\b", "community"),
    (r"\b(vs\.?|versus|game|match|tournament|race|marathon|athletics|hockey|basketball|baseball|soccer|football)\b", "sports"),
    (r"\b(kids|family|story ?time|children|teen|youth|toddler)\b", "family"),
    (r"\b(gallery|exhibit|exhibition|sculpture|painting|arts?\b|artists?|drop-in art|slow art)\b", "art"),
]
# The kind a venue implies when the title says nothing ("Trayf", "Red Days").
VENUE_KIND = [
    (r"next act|pink'?s accessible theat|saber center|performing arts center|bombshell studio|milwaukee rep\b|skylight|broadway theatre center|stackner|quadracci|uihlein hall|vogel hall|todd wehr theat|youth arts center|theatre building|theater house|studio theatre|theatre$|theater$", "theater"),
    (r"pabst theater|riverside theater|turner hall ballroom|landmark credit union live|miller high life theat|the rave|eagles ballroom|cactus club|shank hall|cooperage|jackalope|bar centro|art bar|da bar|bradley symphony|x-ray arcade|linneman|back room|vivarium|summerfest|maier festival|fiserv forum|music hall|lounj|zelazo", "music"),
    (r"laughing tap|comedy caf|improv", "comedy"),
    (r"art museum|haggerty|grohmann|lynden|villa terrace|gallery|sculpture garden", "art"),
    (r"oriental theatre|avalon|times cinema|downer theatre", "film"),
    (r"library|historical society|museum", "talks"),
    (r"brewery|brewing|taproom|distill|winery|cidery|restaurant|kitchen|beer garden|caf[eé]|coffee", "food"),
    (r"zoo|domes|park\b|nature center|ecology center|trail", "outdoors"),
]
COMMUNITY_TITLE = re.compile(r"\b(fundraiser|gala|volunteer|meeting|town hall|rally|drive\b|open house|celebration|festival|fest\b|parade|speed dating|trivia|bingo|karaoke)\b", re.I)


def guess_kind(e: dict, reg: dict) -> str:
    default = reg.get("kind")
    if default in KINDS and reg.get("kind_strict"):
        return default  # everything Boswell lists is a book event, whatever the title says
    for tag in (e.get("tags") or []):
        for rx, k in CATEGORY_KIND:
            if re.fullmatch(rx, tag.strip(), re.I):
                return k
    t = e.get("title") or ""
    for rx, k in TITLE_KIND:
        if re.search(rx, t, re.I):
            return k
    where = e.get("where") or ""
    for rx, k in VENUE_KIND:
        if where and re.search(rx, where, re.I):
            return k
    # a bare name says nothing and the venue is unknown — try the blurb
    s = e.get("summary") or ""
    if s:
        for rx, k in TITLE_KIND:
            if re.search(rx, s, re.I):
                return k
    if default in KINDS:
        return default
    return "community"


# Reach from home (Cambridge Woods, Upper East Side): she does not drive.
WALK_ZIPS = {"53211"}
BUS_ZIPS = {"53202", "53203", "53204", "53207", "53233", "53205", "53212"}
WALK_STREETS = re.compile(
    r"\b(brady|farwell|oakland|downer|murray|cramer|bartlett|kenwood|hartford|locust|humboldt|fratney|bremen|"
    r"e\.? north ave|prospect|newberry|park pl|lake park|riverside park|bradford|clarke st|meinecke|center st)\b", re.I)
WALK_VENUES = re.compile(
    r"\b(uwm|uw[-–]milwaukee|curtin|boswell|oriental theatre|urban ecology center|riverside park|lake park|"
    r"woodland pattern|company brewing|riverwest|east side|cambridge woods|murray hill|downer|von trier|"
    r"beans & barley|comet caf|colectivo prospect|golda meir|milwaukee public library east|east branch|"
    r"east library|hubbard park|kilbourn reservoir|bradford beach|north point (lighthouse|water tower))\b", re.I)
BUS_VENUES = re.compile(
    r"\b(fiserv|panther arena|marcus|pabst|riverside theater|turner hall|milwaukee art museum|calatrava|"
    r"milwaukee public market|third ward|walker'?s point|bay view|downtown|east town|cathedral square|pere marquette|"
    r"lakefront brewery|discovery world|milwaukee public museum|central library|marquette|deer district|"
    r"harley|milwaukee rep|skylight|broadway theatre|cactus club|anodyne|historic mitchell|"
    r"schlitz park|brewery district|best place|no studios|milwaukee theatre|miller high life theatre|uihlein|"
    r"vogel|peck pavilion|summerfest|maier festival|the rave|eagles)\b", re.I)


def guess_reach(e: dict, default: str | None, strict: bool = False) -> str | None:
    blob = " ".join(x for x in (e.get("where"), e.get("addr")) if x)
    z = e.get("zip") or ""
    city = (e.get("city") or "").lower()
    if strict and default:  # a campus calendar: on campus unless the venue is out of town
        if re.search(r"\b(virtual|online|zoom|webinar|livestream)\b", blob + " " + (e.get("title") or ""), re.I):
            return "online"
        if city and city not in ("milwaukee", "") and city != "milwaukee, wi":
            return "car"
        t = e.get("title") or ""
        if re.search(r"\b(porcupine|door county|kettle moraine|devil'?s lake|wausau|madison|chicago|green bay|sheboygan|kohler|racine|kenosha)\b", t, re.I) \
                and re.search(r"\b(trip|camping|backpacking|weekend|hike|hiking|ride|tour|paddle|climb)\b", t, re.I):
            return "car"  # a trip out of town, not a talk about one
        return default
    if re.search(r"\b(virtual|online|zoom|webinar|livestream)\b", blob + " " + (e.get("title") or ""), re.I):
        return "online"
    if not blob:  # no venue given — a neighborhood in the title is the next best clue
        t = e.get("title") or ""
        if re.search(r"\b(east side|riverwest|downer|brady|cambridge woods|murray hill|uwm)\b", t, re.I):
            return "walk"
        if re.search(r"\b(bay view|third ward|downtown|walker'?s point|east town|harbor|deer district|bronzeville|brewery district)\b", t, re.I):
            return "bus"
    # named downtown venues first: "UW–Milwaukee Panther Arena" is a bus ride, not campus
    if BUS_VENUES.search(blob):
        return "bus"
    if WALK_VENUES.search(blob):
        return "walk"
    if z in WALK_ZIPS:
        return "walk"
    if z in BUS_ZIPS and WALK_STREETS.search(blob):
        return "walk"
    if z in BUS_ZIPS:
        return "bus"
    if z or (city and city != "milwaukee") or re.search(r"\b(wauwatosa|tosa|west allis|brookfield|waukesha|oak creek|glendale|shorewood|whitefish bay|greenfield|franklin|cudahy|racine|kenosha|madison|chicago)\b", blob, re.I):
        return "car"
    if default in ("walk", "bus", "car", "online"):
        return default
    return None


def guess_free(e: dict):
    if e.get("free") in (True, False):
        return e["free"]
    c = (e.get("cost") or "").strip()
    if c:
        if re.search(r"\bfree\b", c, re.I) or re.fullmatch(r"\$?\s*0(\.00)?", c):
            return True
        return False
    tags = [t.lower() for t in (e.get("tags") or [])]
    if any(re.fullmatch(r"free( event| admission| entry)?|pay[- ]what[- ]you[- ]wish( admission)?|no cover", t) for t in tags):
        return True
    if re.search(r"\bfree\b", e.get("title") or "", re.I) and not re.search(r"free (for|with) (members|admission)", e.get("title") or "", re.I):
        return True
    if any(re.search(r"ticketed|payment required|tickets? required", t) for t in tags):
        return False
    return None  # "Free for Members" / "Free with Admission" say nothing about us


def normalize(e: dict, reg: dict, via: str) -> dict:
    # Historic Milwaukee runs Doors Open registrations through Eventbrite as
    # "<site> - Sat @ 8:30 am": the hour lives in the title. Lift it out.
    m = re.search(r"\s+-\s+(sat|sun)\w*\s+@\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*$", e.get("title") or "", re.I)
    if m and reg["id"] == "eventbrite":
        h = int(m.group(2)) % 12 + (12 if m.group(4).lower() == "pm" else 0)
        e["start"] = e["start"][:10] + "T%02d:%s" % (h, m.group(3) or "00")
        e["all_day"] = False
        e["time_unknown"] = False
        e["title"] = e["title"][:m.start()].strip()
        e["tags"] = ["Doors Open"] + list(e.get("tags") or [])
    e["kind"] = guess_kind(e, reg)
    e["reach"] = guess_reach(e, reg.get("reach"), bool(reg.get("reach_strict")))
    e["free"] = guess_free(e)
    e["via"] = via
    e["org" if via == "org" else "src"] = reg["id"]
    for k in ("cost", "city", "dept"):
        e.pop(k, None)
    if not e.get("time_unknown"):
        e.pop("time_unknown", None)
    if not e.get("run_through"):
        e.pop("run_through", None)
    return e


def dedupe_key(e: dict) -> tuple:
    t = re.sub(r"[^a-z0-9]+", " ", (e["title"] or "").lower()).strip()
    t = re.sub(r"\b(the|a|an|at|in|of|and|with|milwaukee)\b", "", t)
    t = re.sub(r"\s+", " ", t).strip()
    return (t, e["start"][:10])


# ----------------------------------------------------------------- events
def _run_registry(entries: list[dict], via: str, today: date, horizon: date, events: list, posts: list, status: dict, cap: int):
    feed_backed = ok = 0
    for reg in entries:
        rid, feed = reg["id"], reg.get("feed")
        label = reg["name"][:28]
        if not feed:
            status[rid] = {"status": "link"}
            continue
        kind = feed.get("type")
        try:
            if kind == "rss":
                got = adapter_rss_posts(feed)
                for p in got:
                    p["org"] = rid
                posts.extend(got)
                status[rid] = {"status": "ok", "posts": len(got)}
                print(f"  {via:6s} {label:28s} {len(got):3d} posts")
                continue
            if kind not in ADAPTERS:
                raise ValueError(f"unknown feed type {kind!r}")
            feed_backed += 1
            got = ADAPTERS[kind](feed, today, horizon)
            if feed.get("exclude"):  # optional title regex for noisy calendars
                rx = re.compile(feed["exclude"], re.I)
                got = [e for e in got if not rx.search(e["title"])]
            if feed.get("exclude_categories"):  # optional: drop whole listing categories
                rx = re.compile(feed["exclude_categories"], re.I)
                got = [e for e in got if not any(rx.search(t) for t in (e.get("tags") or []))]
            kept, seen = [], set()
            for e in sorted(got, key=lambda e: e["start"]):
                day = e["start"][:10]
                if not (today.isoformat() <= day <= horizon.isoformat()):
                    continue
                key = (e["title"].lower(), e["start"])
                if key in seen or not e["title"]:
                    continue
                seen.add(key)
                kept.append(normalize(e, reg, via))
                if len(kept) >= int(reg.get("cap") or cap):
                    break
            events.extend(kept)
            ok += 1
            status[rid] = {"status": "ok", "count": len(kept), "raw": len(got)}
            print(f"  {via:6s} {label:28s} {len(kept):3d} events (of {len(got)} fetched)")
            if VERBOSE:
                for e in kept[:4]:
                    print(f"         {e['start']:16s} {e['kind']:9s} {str(e['reach']):5s} {e['title'][:52]}")
        except (OSError, ET.ParseError, ValueError, KeyError, TypeError) as ex:
            status[rid] = {"status": "error", "error": f"{type(ex).__name__}: {str(ex)[:120]}"}
            print(f"  {via:6s} {label:28s} ERROR {type(ex).__name__}: {str(ex)[:80]}", file=sys.stderr)
    return feed_backed, ok


def build_events() -> dict | None:
    orgs = json.loads(ORGS_JSON.read_text(encoding="utf-8"))["orgs"]
    sources = json.loads(SOURCES_JSON.read_text(encoding="utf-8"))["sources"] if SOURCES_JSON.exists() else []
    today = now_local().date()
    horizon = today + timedelta(days=HORIZON_DAYS)
    events, posts, status = [], [], {}
    fb1, ok1 = _run_registry(orgs, "org", today, horizon, events, posts, status, EVENTS_PER_ORG)
    fb2, ok2 = _run_registry(sources, "source", today, horizon, events, posts, status, EVENTS_PER_SOURCE)
    if (fb1 + fb2) and (ok1 + ok2) == 0:
        print("REFUSE: every event feed failed — not writing events.json", file=sys.stderr)
        return None
    if fb1 and ok1 == 0:
        print("REFUSE: every followed-org feed failed — not writing events.json", file=sys.stderr)
        return None

    # cross-registry dedupe: an org's own listing beats a citywide copy of it.
    # Two keys: the exact one (normalized title + day), and a looser one for
    # the same day at a followed org's own venue with the same opening words
    # — Eventbrite retitles Boswell's nights ("… - a Boswell Book Company event").
    org_names = {o["id"]: o["name"].lower() for o in orgs}
    merged, by_key, by_loose = [], {}, {}

    def loose_key(e):
        words = dedupe_key(e)[0].split()
        return (e["start"][:10], " ".join(words[:3])) if len(words) >= 3 else None

    def venue_org(e):
        where = (e.get("where") or "").lower()
        return next((oid for oid, nm in org_names.items() if nm and nm in where), None)

    def fold(keeper, e):
        other = e.get("org") or e.get("src")
        keeper.setdefault("also", [])
        if other not in keeper["also"]:
            keeper["also"].append(other)
        if keeper.get("free") is None and e.get("free") is not None:
            keeper["free"] = e["free"]
        if not keeper.get("reach") and e.get("reach"):
            keeper["reach"] = e["reach"]
        if keeper.get("time_unknown") and not e.get("time_unknown") and e["start"][:10] == keeper["start"][:10]:
            keeper["start"], keeper["all_day"], keeper["time_unknown"] = e["start"], False, False  # the copy knew the hour
            if e.get("end"):
                keeper["end"] = e["end"]

    for e in sorted(events, key=lambda e: (0 if e["via"] == "org" else 1, e["start"])):
        k = dedupe_key(e)
        mine = e.get("org") or e.get("src")
        if k in by_key and (by_key[k].get("org") or by_key[k].get("src")) != mine:
            fold(by_key[k], e)
            continue
        lk = loose_key(e)
        if e["via"] == "source" and lk and lk in by_loose:
            keeper = by_loose[lk]
            if keeper.get("org") and venue_org(e) == keeper["org"]:
                fold(keeper, e)
                continue
        by_key.setdefault(k, e)
        if lk and e["via"] == "org":
            by_loose.setdefault(lk, e)
        merged.append(e)
    for e in merged:  # time_unknown was popped in normalize(); a fold may have re-added it as False
        if e.get("time_unknown") is False:
            e.pop("time_unknown", None)
    dropped = len(events) - len(merged)
    merged.sort(key=lambda e: (e["start"], e.get("org") or e.get("src") or ""))
    posts.sort(key=lambda p: p["published"] or "", reverse=True)
    kinds = {k: sum(1 for e in merged if e["kind"] == k) for k in KINDS}
    reach = {k: sum(1 for e in merged if e["reach"] == k) for k in ("walk", "bus", "car")}
    reach["unknown"] = sum(1 for e in merged if not e["reach"])
    print(f"  merged {len(merged)} events ({dropped} duplicates folded); kinds {kinds}; reach {reach}")
    return {"generated_at": None, "horizon_days": HORIZON_DAYS, "orgs": status, "events": merged, "posts": posts,
            "counts": {"kinds": kinds, "reach": reach, "free": sum(1 for e in merged if e["free"] is True)}}


# ----------------------------------------------------------------- observances
OBS_JSON = DATA / "observances.json"
MULTIFAITH_URL = "https://uwm.edu/community-empowerment-institutional-inclusivity/campus-culture/multifaith-calendar/"
MONTHS = {m: i for i, m in enumerate(["january", "february", "march", "april", "may", "june", "july", "august",
                                        "september", "october", "november", "december"], 1)}


def _obs_date(month_name: str, day: str, year: int):
    return date(year, MONTHS[month_name.lower()], int(day))


def build_observances() -> dict | None:
    """UWM's multifaith calendar (July–June, one accordion panel per month;
    each item '<strong>Month D[-D | -Month D]: Name[—Begins at Sundown] (Tradition).</strong> note')
    → dated observances the page shows under its day headers."""
    html = fetch(MULTIFAITH_URL, "text/html")
    panels = re.findall(r'accordion--header">\s*([A-Z][a-z]+)\s+(\d{4})\s*</div>\s*<div class="uwm-p-accordion--panel">(.*?)</div>\s*</div>', html, re.S)
    items = []
    for month, year, body in panels:
        year = int(year)
        for strong, note in re.findall(r"<strong>(.*?)</strong>(.*?)(?=<strong>|</li>|</p>|$)", body, re.S):
            head = clean(strong)
            m = re.match(r"([A-Z][a-z]+)\s+(\d{1,2})(?:\s*[-–—]\s*(?:([A-Z][a-z]+)\s+)?(\d{1,2}))?\s*:\s*(.+)$", head)
            if not m:
                continue
            m1, d1, m2, d2, rest = m.groups()
            try:
                start = _obs_date(m1, d1, year)
                if d2:
                    em = m2 or m1
                    ey = year + (1 if MONTHS[em.lower()] < MONTHS[m1.lower()] else 0)
                    end = _obs_date(em, d2, ey)
                else:
                    end = start
            except (KeyError, ValueError):
                continue
            sundown = bool(re.search(r"begins at sundown", rest, re.I))
            rest = re.sub(r"\s*[-–—]?\s*begins at sundown\s*", " ", rest, flags=re.I)
            tm = re.search(r"\(([^)]+)\)\s*\.?\s*$", rest)
            tradition = clean(tm.group(1)) if tm else ""
            name = clean(rest[:tm.start()] if tm else rest).rstrip(".").strip(" .—–-")
            if not name:
                continue
            items.append({"name": name, "tradition": tradition, "start": start.isoformat(), "end": end.isoformat(),
                          "sundown": sundown, "note": clean(note, 220)})
    if len(items) < 10:
        print(f"REFUSE: multifaith page parsed to only {len(items)} observances — not writing observances.json", file=sys.stderr)
        return None
    items.sort(key=lambda o: o["start"])
    print(f"  {len(items)} observances from {len(panels)} months")
    return {"generated_at": None, "source": MULTIFAITH_URL, "observances": items}


# ----------------------------------------------------------------- writing
def write_if_changed(path: Path, payload: dict) -> bool:
    """Compare everything but generated_at; leave the file alone when equal."""
    if path.exists():
        try:
            old = json.loads(path.read_text(encoding="utf-8"))
            old.pop("generated_at", None)
            new = dict(payload)
            new.pop("generated_at", None)
            if old == new:
                print(f"  {path.name}: unchanged")
                return False
        except ValueError:
            pass
    payload["generated_at"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"  {path.name}: written ({path.stat().st_size // 1024} KB)")
    return True


def main() -> int:
    want_news = "--events" not in sys.argv
    want_events = "--news" not in sys.argv
    rc = 0
    if want_news:
        print("headlines")
        news = build_news()
        if news is None:
            rc = 1
        else:
            print(f"  {len(news['items'])} items from {sum(1 for s in news['sources'] if s['ok'])} sources")
            write_if_changed(NEWS_JSON, news)
    if want_events:
        print("events: followed organizations, then citywide sources")
        ev = build_events()
        if ev is None:
            rc = 1
        else:
            print(f"  {len(ev['events'])} events, {len(ev['posts'])} posts")
            write_if_changed(EVENTS_JSON, ev)
        print("observances: UWM multifaith calendar")
        try:
            obs = build_observances()
        except (OSError, ValueError) as ex:
            print(f"  ERROR {type(ex).__name__}: {str(ex)[:80]} — keeping the existing file", file=sys.stderr)
            obs = None
        if obs is not None:
            write_if_changed(OBS_JSON, obs)
        elif not OBS_JSON.exists():
            rc = 1
    return rc


if __name__ == "__main__":
    sys.exit(main())
