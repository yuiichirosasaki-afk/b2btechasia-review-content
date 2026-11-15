#!/usr/bin/env python3
"""List articles from the last 30 days (to avoid repeating stories) and show which zones
have been covered in the last 7 days (to pick today's zones)."""
import json
from collections import Counter
from pathlib import Path
from datetime import datetime, timedelta, timezone

ROOT = Path(__file__).resolve().parent.parent
WIB = timezone(timedelta(hours=7))
now = datetime.now(WIB)
tax = json.loads((ROOT / "taxonomy.json").read_text(encoding="utf-8"))
rows, week = [], Counter()
for p in (ROOT / "articles").glob("*/*.json"):
    a = json.loads(p.read_text(encoding="utf-8"))
    t = datetime.fromisoformat(a["publishAt"])
    if t >= now - timedelta(days=30):
        rows.append((a["publishAt"][:10], a["category"], a["title"], ", ".join(a.get("tags", [])[:5])))
    if t >= now - timedelta(days=7):
        week[a["category"]] += 1
for r in sorted(rows, reverse=True):
    print(" | ".join(r))
print(f"({len(rows)} articles in the last 30 days)\n")
print("Zone coverage, last 7 days (fewest first within each hub):")
for h in tax["hubs"]:
    zs = sorted(h["zones"], key=lambda z: week[z["name"]])
    print(f"  {h['name']}: " + ", ".join(f"{z['name']} {week[z['name']]}" for z in zs))
