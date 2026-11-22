#!/usr/bin/env python3
"""Validate exhibitions/*.json (see EXHIBITIONS.md). Usage: validate_exhibitions.py [files...]"""
import datetime
import glob
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
TAX = json.loads((ROOT / "taxonomy.json").read_text())
ZONES = {z["name"] for h in TAX["hubs"] for z in h["zones"]}
ALLOWED_TAGS = {"p", "ul", "ol", "li", "h3", "strong", "em", "a"}
AGGREGATORS = {
    "10times.com", "showsbee.com", "expomap.ru", "eventseye.com", "tradefairdates.com",
    "cantonfair.net", "clocate.com", "ntradeshows.com", "expobeds.com", "happeningnext.com",
    "luminik.io", "wokeey.com", "beri.net", "dealroom.co", "crunchbase.com", "linkedin.com",
    "eventbrite.com", "infosec-conferences.com", "neventum.com", "jufair.com", "exhibitionsforyou.com",
    "conferenceindex.org", "allconferencealert.com", "eventbrowse.com", "globy.com",
}
REQUIRED = ["slug", "seriesId", "name", "isOwnEvent", "country", "city", "venue", "organizer",
            "startDate", "endDate", "dateStatus", "zones", "relevance", "exhibitors", "visitors",
            "admission", "lastEdition", "officialUrl", "sources", "verifiedAt", "id", "en", "ja"]
LANG_LIMITS = {"id": (60, 155), "en": (60, 155), "ja": (40, 120)}


class Tags(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = set()

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        if any(k == "style" for k, _ in attrs):
            self.tags.add("style-attr")


def is_aggregator(url):
    host = (urlparse(url).hostname or "").lower()
    return any(host == d or host.endswith("." + d) for d in AGGREGATORS)


def date_or_none(v, field, errs):
    if v is None:
        return None
    try:
        return datetime.date.fromisoformat(v)
    except (TypeError, ValueError):
        errs.append(f"{field} is not YYYY-MM-DD")
        return None


def check(path):
    errs = []
    try:
        e = json.loads(Path(path).read_text())
    except Exception as ex:  # noqa: BLE001
        return [f"invalid JSON: {ex}"]
    missing = [k for k in REQUIRED if k not in e]
    if missing:
        return [f"missing: {', '.join(missing)}"]

    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*-20\d\d", e["slug"]) or len(e["slug"]) > 80:
        errs.append("slug must be lowercase-hyphens ending with the year, <= 80 chars")
    if Path(path).stem != e["slug"]:
        errs.append("file name must be <slug>.json")
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", str(e["seriesId"])):
        errs.append("seriesId must be lowercase-hyphens")
    if e["country"] != "Indonesia":
        errs.append("country must be Indonesia")
    if e["relevance"] not in ("A", "B"):
        errs.append("relevance must be A or B")
    if e["admission"] not in ("free", "paid", "mixed", "unknown"):
        errs.append("admission must be free/paid/mixed/unknown")
    if not isinstance(e["zones"], list) or not 1 <= len(e["zones"]) <= 4:
        errs.append("zones: 1-4 entries")
    else:
        bad = [z for z in e["zones"] if z not in ZONES]
        if bad:
            errs.append(f"unknown zones: {bad}")

    start = date_or_none(e["startDate"], "startDate", errs)
    end = date_or_none(e["endDate"], "endDate", errs)
    ds = e["dateStatus"]
    if ds == "confirmed":
        if not (start and end):
            errs.append("confirmed needs startDate and endDate")
        elif end < start:
            errs.append("endDate before startDate")
        elif (end - start).days > 10:
            errs.append("event longer than 10 days?")
    elif ds == "tba":
        if e["startDate"] is not None or e["endDate"] is not None:
            errs.append("tba: startDate and endDate must be null")
    elif ds != "cancelled":
        errs.append("dateStatus must be confirmed/tba/cancelled")
    year = e["slug"][-4:]
    if start and str(start.year) != year:
        errs.append(f"startDate year {start.year} does not match slug year {year}")

    verified = date_or_none(e["verifiedAt"], "verifiedAt", errs)
    if verified and verified > datetime.date.today() + datetime.timedelta(days=1):
        errs.append("verifiedAt is in the future")

    for k in ("exhibitors", "visitors"):
        v = e[k]
        if v is not None and not (isinstance(v, dict) and isinstance(v.get("value"), int)
                                  and v.get("edition") and str(v.get("sourceUrl", "")).startswith("http")):
            errs.append(f"{k} must be null or {{value:int, edition, sourceUrl}}")
        elif v is not None and is_aggregator(v["sourceUrl"]):
            errs.append(f"{k}.sourceUrl is an aggregator site")
    le = e["lastEdition"]
    if le is not None:
        if not isinstance(le, dict):
            errs.append("lastEdition must be null or an object")
        else:
            date_or_none(le.get("startDate"), "lastEdition.startDate", errs)
            date_or_none(le.get("endDate"), "lastEdition.endDate", errs)

    if not str(e["officialUrl"]).startswith("http"):
        errs.append("officialUrl missing")
    elif is_aggregator(e["officialUrl"]):
        errs.append("officialUrl is an aggregator site")
    src = e["sources"]
    if not isinstance(src, list) or not 1 <= len(src) <= 5:
        errs.append("sources: 1-5 entries")
    else:
        for s in src:
            if not all(s.get(k) for k in ("name", "title", "url")):
                errs.append("each source needs name, title, url")
            elif is_aggregator(s["url"]):
                errs.append(f"aggregator source not allowed: {s['url']}")
        hosts = {(urlparse(s.get("url", "")).hostname or "").removeprefix("www.") for s in src}
        if (urlparse(e["officialUrl"]).hostname or "").removeprefix("www.") not in hosts:
            errs.append("the official site must be one of the sources")

    for lang, (tmax, dmax) in LANG_LIMITS.items():
        t = e[lang]
        if not isinstance(t, dict):
            errs.append(f"{lang} must be an object")
            continue
        for k in ("summaryHtml", "faqHtml", "seoTitle", "seoDescription"):
            if not t.get(k):
                errs.append(f"{lang}.{k} missing")
        if len(t.get("seoTitle", "")) > tmax:
            errs.append(f"{lang}.seoTitle {len(t.get('seoTitle', ''))} > {tmax}")
        if len(t.get("seoDescription", "")) > dmax:
            errs.append(f"{lang}.seoDescription {len(t.get('seoDescription', ''))} > {dmax}")
        if t.get("faqHtml", "").lower().count("<h3") < 2:
            errs.append(f"{lang}.faqHtml needs 2-4 questions")
        for k in ("summaryHtml", "faqHtml"):
            p = Tags()
            p.feed(t.get(k, ""))
            bad = p.tags - ALLOWED_TAGS
            if bad:
                errs.append(f"{lang}.{k} has disallowed HTML: {sorted(bad)}")
        body = t.get("summaryHtml", "") + t.get("faqHtml", "")
        if re.search(r"insufficient|TODO|lorem", body, re.I):
            errs.append(f"{lang}: leftover working text")
        if not e["isOwnEvent"] and re.search(r"B2B Tech Asia", body, re.I):
            errs.append(f"{lang}: do not mention VRI B2B Tech Asia in other events' text")
    return errs


def main():
    files = sys.argv[1:] or sorted(glob.glob(str(ROOT / "exhibitions" / "*.json")))
    if not files:
        print("no exhibition files yet")
        return 0
    slugs, failed = {}, 0
    for f in files:
        errs = check(f)
        try:
            s = json.loads(Path(f).read_text()).get("slug")
            if s in slugs:
                errs.append(f"duplicate slug (also {slugs[s]})")
            slugs[s] = f
        except Exception:  # noqa: BLE001
            pass
        name = Path(f).name
        if errs:
            failed += 1
            print(f"FAIL {name}: " + "; ".join(errs))
        else:
            print(f"OK   {name}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
