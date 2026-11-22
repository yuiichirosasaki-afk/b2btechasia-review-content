#!/usr/bin/env python3
"""Build exhibitions.json (read by Wix every hour) from exhibitions/*.json."""
import datetime
import glob
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WIB = datetime.timezone(datetime.timedelta(hours=7))


def status(e, today):
    if e["dateStatus"] in ("tba", "cancelled"):
        return e["dateStatus"]
    start = datetime.date.fromisoformat(e["startDate"])
    end = datetime.date.fromisoformat(e["endDate"])
    if today < start:
        return "upcoming"
    if today <= end:
        return "ongoing"
    return "past"


def main():
    today = datetime.datetime.now(WIB).date()
    items = []
    for f in sorted(glob.glob(str(ROOT / "exhibitions" / "*.json"))):
        e = json.loads(Path(f).read_text())
        e["status"] = status(e, today)
        items.append(e)
    # upcoming/ongoing by date, then tba (A first), then past (newest first), cancelled last
    order = {"ongoing": 0, "upcoming": 0, "tba": 1, "past": 2, "cancelled": 3}
    items.sort(key=lambda e: (
        order[e["status"]],
        (e["startDate"] or "9999") if e["status"] in ("ongoing", "upcoming") else "",
        e["relevance"] if e["status"] == "tba" else "",
        "" if e["status"] != "past" else "".join(chr(255 - ord(c)) for c in e["startDate"]),
        e["name"],
    ))
    feed = {"generatedAt": datetime.datetime.now(WIB).isoformat(timespec="seconds"), "exhibitions": items}
    (ROOT / "exhibitions.json").write_text(json.dumps(feed, ensure_ascii=False, indent=1) + "\n")
    print(f"exhibitions.json: {len(items)} entries")


if __name__ == "__main__":
    main()
