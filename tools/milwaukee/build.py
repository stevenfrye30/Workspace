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
EVENTS_PER_ORG = 40
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
NEWS_SOURCES = [
    # (name, feed url, homepage, kind)  kind: news | roundup | state
    ("Urban Milwaukee", "https://urbanmilwaukee.com/feed/", "https://urbanmilwaukee.com/", "news"),
    ("Milwaukee NNS", "https://milwaukeenns.org/feed/", "https://milwaukeenns.org/", "news"),
    ("Milwaukee Record", "https://milwaukeerecord.com/feed/", "https://milwaukeerecord.com/", "news"),
    ("OnMilwaukee", "https://onmilwaukee.com/rss", "https://onmilwaukee.com/", "news"),
    ("TMJ4", "https://www.tmj4.com/news.rss", "https://www.tmj4.com/", "news"),
    ("Milwaukee Magazine", "https://www.milwaukeemag.com/feed/", "https://www.milwaukeemag.com/", "news"),
    ("Milwaukee Independent", "https://www.milwaukeeindependent.com/feed/", "https://www.milwaukeeindependent.com/", "news"),
    ("BizTimes", "https://biztimes.com/feed/", "https://biztimes.com/", "news"),
    ("Shepherd Express", "https://shepherdexpress.com/upcoming-events/index.rss", "https://shepherdexpress.com/", "roundup"),
    ("Wisconsin Examiner", "https://wisconsinexaminer.com/feed/", "https://wisconsinexaminer.com/", "state"),
    ("Wisconsin Watch", "https://wisconsinwatch.org/feed/", "https://wisconsinwatch.org/", "state"),
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
    for name, url, home, kind in NEWS_SOURCES:
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
            out.append(_blank(
                clean(e.get("title")),
                start[:10] if all_day else start,
                end=end[:10] if all_day else end,
                all_day=all_day,
                time_unknown=(not all_day and start.endswith("T00:00")),
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


ADAPTERS = {"tribe": adapter_tribe, "ics": adapter_ics, "jsonld": adapter_jsonld, "boswell": adapter_boswell, "mlb": adapter_mlb}


# ----------------------------------------------------------------- normalization
KINDS = ["music", "theater", "comedy", "film", "art", "talks", "books", "markets", "outdoors", "food", "sports", "family", "community"]

# a listing's own category names → kind (checked first)
CATEGORY_KIND = [
    (r"comedy|improv|stand[- ]?up", "comedy"),
    (r"film|cinema|movie|screening", "film"),
    (r"theat|musical|opera|ballet|dance", "theater"),
    (r"music|concert|band|jazz|orchestra|choir", "music"),
    (r"book|author|poet|literar|reading group|readshop", "books"),
    (r"lecture|talk|panel|class|workshop|history|colloquium|seminar|education", "talks"),
    (r"market|bazaar|fair\b|craft", "markets"),
    (r"environment|nature|outdoor|garden|hik|bike|birding|park", "outdoors"),
    (r"food|drink|brew|dinner|tasting|wine|beer|fish fry", "food"),
    (r"sport|game|athletic|run\b|race", "sports"),
    (r"kid|family|story ?time|children|teen|youth", "family"),
    (r"art\b|arts\b|gallery|exhibit|studio|tour", "art"),
    (r"fundrais|volunteer|community|civic|health|business|pets|meeting|forum", "community"),
]
# title words → kind (checked second; order matters — the specific before the broad)
TITLE_KIND = [
    (r"\b(comedy|comedian|improv|stand[- ]?up|open mic comedy)\b", "comedy"),
    (r"\b(film|screening|cinema|movie|documentary|shorts)\b", "film"),
    (r"\b(theatre|theater|musical|opera|ballet|dance company|a play\b|the play\b)\b", "theater"),
    (r"\b(concert|live music|symphony|orchestra|quartet|band|jazz|blues|choir|recital|dj\b|hip[- ]hop|punk|metal|album release|tour\b|acoustic|singer|songwriter|rock\b|folk\b|soul\b|funk|reggae|bluegrass|live at)\b", "music"),
    (r"\b(paint|pottery|ceramic|craft night|drawing|sketch|watercolor|sip (and|&) paint|printmaking|collage)\b", "art"),
    (r"\b(author|book club|book launch|poetry|poet|reading|novel|zine|storytime with)\b", "books"),
    (r"\b(lecture|talk|panel|colloquium|discussion|symposium|conversation|forum|seminar|class\b|workshop|how to|101)\b", "talks"),
    (r"\b(market|farmers|bazaar|craft fair|makers|vintage|swap|flea)\b", "markets"),
    (r"\b(hike|walk\b|bike|ride\b|paddle|kayak|birding|garden|nature|trail|cleanup|5k|10k|run club|prairie|orchid|plant)\b", "outdoors"),
    (r"\b(fish fry|beer|brew|tasting|dinner|brunch|food|wine|cocktail|taste of|pop-?up|supper|cook)\b", "food"),
    (r"\b(vs\.?|versus|game|match|tournament|race|marathon|athletics|hockey|basketball|baseball|soccer|football)\b", "sports"),
    (r"\b(kids|family|story ?time|children|teen|youth|toddler)\b", "family"),
    (r"\b(gallery|exhibit|exhibition|sculpture|painting|art\b|artist|drop-in art|tours?:)\b", "art"),
    (r"\b(fundraiser|gala|volunteer|meeting|town hall|rally|drive\b|open house|celebration|festival|fest\b|parade)\b", "community"),
]


GENERIC_CATEGORY = re.compile(r"^(arts?\s*(&|and)\s*entertainment|entertainment|things to do|special events?|other|misc\w*)$", re.I)


def guess_kind(e: dict, default: str | None) -> str:
    # a catch-all category says nothing — let the title decide instead
    text_tags = " ".join(t for t in (e.get("tags") or []) if not GENERIC_CATEGORY.match(t))
    for rx, k in CATEGORY_KIND:
        if text_tags and re.search(rx, text_tags, re.I):
            return k
    t = e.get("title") or ""
    for rx, k in TITLE_KIND:
        if re.search(rx, t, re.I):
            return k
    # a bare name ("Bilmuri", "Trayf", "Red Days") says nothing — try the blurb
    s = e.get("summary") or ""
    if s:
        for rx, k in TITLE_KIND:
            if re.search(rx, s, re.I):
                return k
    return default if default in KINDS else "community"


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
    r"public market|third ward|walker'?s point|bay view|downtown|east town|cathedral square|pere marquette|"
    r"lakefront brewery|discovery world|milwaukee public museum|central library|marquette|deer district|"
    r"harley|milwaukee rep|skylight|broadway theatre|cactus club|anodyne|historic mitchell|"
    r"schlitz park|brewery district|best place|no studios|milwaukee theatre|miller high life theatre|uihlein|"
    r"vogel|peck pavilion|summerfest|maier festival|the rave|eagles)\b", re.I)


def guess_reach(e: dict, default: str | None) -> str | None:
    blob = " ".join(x for x in (e.get("where"), e.get("addr")) if x)
    z = e.get("zip") or ""
    city = (e.get("city") or "").lower()
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
    if default in ("walk", "bus", "car"):
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
    tags = " ".join(e.get("tags") or [])
    if re.search(r"\bfree\b", tags + " " + (e.get("title") or ""), re.I):
        return True
    if re.search(r"\bticketed\b", tags, re.I):
        return False
    return None


def normalize(e: dict, reg: dict, via: str) -> dict:
    e["kind"] = guess_kind(e, reg.get("kind"))
    e["reach"] = guess_reach(e, reg.get("reach"))
    e["free"] = guess_free(e)
    e["via"] = via
    e["org" if via == "org" else "src"] = reg["id"]
    for k in ("cost", "city"):
        e.pop(k, None)
    if not e.get("time_unknown"):
        e.pop("time_unknown", None)
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
                if len(kept) >= cap:
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

    # cross-registry dedupe: an org's own listing beats a citywide copy of it
    merged, by_key = [], {}
    for e in sorted(events, key=lambda e: (0 if e["via"] == "org" else 1, e["start"])):
        k = dedupe_key(e)
        if k in by_key:
            keeper = by_key[k]
            other = e.get("org") or e.get("src")
            keeper.setdefault("also", [])
            if other not in keeper["also"]:
                keeper["also"].append(other)
            if not keeper.get("free") and e.get("free") is not None and keeper.get("free") is None:
                keeper["free"] = e["free"]
            if not keeper.get("reach") and e.get("reach"):
                keeper["reach"] = e["reach"]
            continue
        by_key[k] = e
        merged.append(e)
    dropped = len(events) - len(merged)
    merged.sort(key=lambda e: (e["start"], e.get("org") or e.get("src") or ""))
    posts.sort(key=lambda p: p["published"] or "", reverse=True)
    kinds = {k: sum(1 for e in merged if e["kind"] == k) for k in KINDS}
    reach = {k: sum(1 for e in merged if e["reach"] == k) for k in ("walk", "bus", "car")}
    reach["unknown"] = sum(1 for e in merged if not e["reach"])
    print(f"  merged {len(merged)} events ({dropped} duplicates folded); kinds {kinds}; reach {reach}")
    return {"generated_at": None, "horizon_days": HORIZON_DAYS, "orgs": status, "events": merged, "posts": posts,
            "counts": {"kinds": kinds, "reach": reach, "free": sum(1 for e in merged if e["free"] is True)}}


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
    return rc


if __name__ == "__main__":
    sys.exit(main())
