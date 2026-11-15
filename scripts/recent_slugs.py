#!/usr/bin/env python3
"""List articles from the last 30 days: date, category, title (to avoid repeating stories)."""
import json
from pathlib import Path
from datetime import datetime, timedelta, timezone

ROOT = Path(__file__).resolve().parent.parent
WIB = timezone(timedelta(hours=7))
cut = datetime.now(WIB) - timedelta(days=30)
rows = []
for p in (ROOT / "articles").glob("*/*.json"):
    a = json.loads(p.read_text(encoding="utf-8"))
    if datetime.fromisoformat(a["publishAt"]) >= cut:
        rows.append((a["publishAt"][:10], a["category"], a["title"], ", ".join(a.get("tags", [])[:5])))
for r in sorted(rows, reverse=True):
    print(" | ".join(r))
print(f"({len(rows)} articles in the last 30 days)")
