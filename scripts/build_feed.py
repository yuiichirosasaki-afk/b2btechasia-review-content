#!/usr/bin/env python3
"""Rebuild feed.json from articles/ (last 30 days by publishAt, newest first)."""
import json
from pathlib import Path
from datetime import datetime, timedelta, timezone

ROOT = Path(__file__).resolve().parent.parent
WIB = timezone(timedelta(hours=7))
DAYS = 30

now = datetime.now(WIB)
items = []
for p in (ROOT / "articles").glob("*/*.json"):
    a = json.loads(p.read_text(encoding="utf-8"))
    if datetime.fromisoformat(a["publishAt"]) >= now - timedelta(days=DAYS):
        items.append(a)
items.sort(key=lambda a: a["publishAt"], reverse=True)
feed = {"generatedAt": now.isoformat(timespec="seconds"), "site": "B2B Tech Asia Review", "articles": items}
(ROOT / "feed.json").write_text(json.dumps(feed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"feed.json: {len(items)} articles")
