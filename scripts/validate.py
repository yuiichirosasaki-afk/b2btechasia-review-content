#!/usr/bin/env python3
"""Validate article JSON files against the publishing rules.

Usage: python3 scripts/validate.py articles/2026-11-16 [more dirs or files]
Prints OK or a list of problems per file. Exit code 1 if any file fails.
"""
import json, re, sys, html
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parent.parent
CATEGORIES = {z["name"] for h in json.loads((Path(__file__).resolve().parent.parent / "taxonomy.json").read_text(encoding="utf-8"))["hubs"] for z in h["zones"]}
TYPES = {"analisis", "berita", "penjelasan"}
REQUIRED = ["slug", "title", "category", "articleType", "dek", "summaryHtml", "analysisHtml",
            "actionHtml", "sources", "seoTitle", "seoDescription", "publishAt", "language"]
ALLOWED_TAGS = {"p", "ul", "ol", "li", "h3", "strong", "em", "a", "b", "i", "br"}


def text(h):
    return html.unescape(re.sub(r"<[^>]+>", " ", h or "")).strip()


def words(h):
    return len(text(h).split())


def all_slugs(exclude):
    out = set()
    for p in (ROOT / "articles").glob("*/*.json"):
        if p.resolve() != exclude.resolve():
            out.add(p.stem)
    return out


def check(path):
    errs = []
    try:
        a = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        return [f"invalid JSON: {e}"]
    for k in REQUIRED:
        if not a.get(k):
            errs.append(f"missing {k}")
    if errs:
        return errs
    if a["slug"] != path.stem:
        errs.append("slug must equal file name")
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", a["slug"]) or len(a["slug"]) > 80:
        errs.append("slug format")
    if a["slug"] in all_slugs(path):
        errs.append("slug already used")
    if a["category"] not in CATEGORIES:
        errs.append(f"category {a['category']!r}")
    if a["articleType"] not in TYPES:
        errs.append(f"articleType {a['articleType']!r}")
    if a["language"] != "id":
        errs.append("language must be id")
    if len(a["seoTitle"]) > 60:
        errs.append(f"seoTitle {len(a['seoTitle'])} > 60")
    if len(a["seoDescription"]) > 155:
        errs.append(f"seoDescription {len(a['seoDescription'])} > 155")
    if not (30 <= len(a["title"]) <= 130):
        errs.append(f"title length {len(a['title'])}")
    if "<" in a["dek"] or "&" in a["dek"]:
        errs.append("dek must be plain text")
    try:
        dt = datetime.fromisoformat(a["publishAt"])
        if dt.utcoffset() is None or dt.utcoffset().total_seconds() != 7 * 3600:
            errs.append("publishAt must have +07:00")
    except Exception:
        errs.append("publishAt not ISO")
    src = a["sources"]
    if not isinstance(src, list) or len(src) < 2:
        errs.append("need at least 2 sources")
    else:
        for s in src:
            for k in ("name", "title", "url", "date"):
                if not s.get(k):
                    errs.append(f"source missing {k}")
            if s.get("url") and not s["url"].startswith("http"):
                errs.append("source url")
    body = " ".join(a.get(k, "") for k in ("summaryHtml", "analysisHtml", "actionHtml", "faqHtml"))
    for tag in re.findall(r"<\s*/?\s*([a-zA-Z0-9]+)", body):
        if tag.lower() not in ALLOWED_TAGS:
            errs.append(f"tag <{tag}> not allowed")
            break
    if "style=" in body:
        errs.append("inline style not allowed")
    own = words(a["analysisHtml"]) + words(a["actionHtml"]) + words(a.get("faqHtml", ""))
    summ = words(a["summaryHtml"])
    if own < summ:
        errs.append(f"original analysis ({own} words) shorter than summary ({summ})")
    if words(a["analysisHtml"]) < 200:
        errs.append(f"analysis too short ({words(a['analysisHtml'])} words, min 200)")
    if len(a["analysisHtml"].lower().split("<h3")) < 3:
        errs.append("analysis needs at least 2 <h3> sections")
    quotes = re.findall(r"[\"“]([^\"”]{3,})[\"”]", text(body))
    for q in quotes:
        if len(q.split()) >= 15:
            errs.append(f"quote too long ({len(q.split())} words)")
    if len(quotes) > len(src):
        errs.append(f"{len(quotes)} quotes but only {len(src)} sources")
    if "b2b tech asia" in text(body).lower():
        errs.append("do not mention B2B Tech Asia in body")
    en = a.get("en")
    if not isinstance(en, dict):
        errs.append("missing en (English version)")
    else:
        for k in ("title", "dek", "summaryHtml", "analysisHtml", "actionHtml", "dataFigure", "dataLabel", "seoTitle", "seoDescription"):
            if not en.get(k):
                errs.append(f"en missing {k}")
        if len(en.get("seoTitle", "")) > 60:
            errs.append(f"en.seoTitle {len(en['seoTitle'])} > 60")
        if len(en.get("seoDescription", "")) > 155:
            errs.append(f"en.seoDescription {len(en['seoDescription'])} > 155")
        if a.get("chart") and en.get("chart") and len(en["chart"].get("bars", [])) != len(a["chart"].get("bars", [])):
            errs.append("en.chart must have the same bars as chart")
        if "b2b tech asia" in text(" ".join(en.get(k, "") for k in ("summaryHtml", "analysisHtml", "actionHtml", "faqHtml"))).lower():
            errs.append("do not mention B2B Tech Asia in en body")
    return errs


def main():
    files = []
    for arg in sys.argv[1:] or ["articles"]:
        p = Path(arg)
        files += sorted(p.rglob("*.json")) if p.is_dir() else [p]
    bad = 0
    for f in files:
        e = check(f)
        print(f"{f}: {'OK' if not e else '; '.join(e)}")
        bad += bool(e)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
