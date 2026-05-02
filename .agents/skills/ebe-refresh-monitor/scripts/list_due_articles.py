from __future__ import annotations

import re
import sys
from datetime import datetime, timedelta
from pathlib import Path


TTL_DAYS = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "180d": 180,
    "365d": 365,
}


def parse_frontmatter(text: str) -> dict[str, str]:
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    data = {}
    for line in text[3:end].splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            data[k.strip()] = v.strip().strip('"')
    return data


def parse_date(value: str) -> datetime | None:
    m = re.search(r"(\d{4}-\d{2}-\d{2})", value or "")
    if not m:
        return None
    return datetime.strptime(m.group(1), "%Y-%m-%d")


def main() -> int:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("10_Published")
    now = datetime.now()
    due = []
    for path in root.rglob("*.md"):
        if path.name == "_MOC.md":
            continue
        fm = parse_frontmatter(path.read_text(encoding="utf-8", errors="ignore"))
        ttl = fm.get("freshness_ttl", "")
        if ttl == "none":
            continue
        days = TTL_DAYS.get(ttl)
        updated = parse_date(fm.get("last_verified") or fm.get("updated", ""))
        if days is None or updated is None:
            due.append((str(path), "missing ttl/date"))
        elif updated + timedelta(days=days) < now:
            due.append((str(path), f"expired {ttl}"))
    for path, reason in due:
        print(f"{path}\t{reason}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
