from __future__ import annotations

import re
import sys
from datetime import datetime
from pathlib import Path


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text or "subfield"


def main() -> int:
    if len(sys.argv) != 5:
        print("usage: create_subfield_stub.py <category_dir> <ja_name> <english_slug> <scope>", file=sys.stderr)
        return 2
    category_dir, ja_name, english_slug, scope = sys.argv[1:]
    subdir = Path("10_Published") / category_dir / f"{ja_name}__{slugify(english_slug)}"
    subdir.mkdir(parents=True, exist_ok=True)
    moc = subdir / "_MOC.md"
    if not moc.exists():
        now = datetime.now().strftime("%Y-%m-%d %H:%M JST")
        moc.write_text(f"""---
project: Evidence Based Everything
type: moc
moc_level: subfield
status: published
draft: false
category_id: "{category_dir[:2]}"
category_name: "{category_dir}"
subfield_name: "{ja_name}"
updated: "{now}"
---

# MOC - {ja_name}

## この小分野の範囲

{scope}

## 読む順番

まだ記事は登録されていない。

## 教科書的中核記事

## レビュー・総説的記事

## How-to / 実践記事

## 歴史・古典

## 関連 Claims

## 関連 Sources

## 未整備・今後作るべき記事
""", encoding="utf-8", newline="\n")
    (subdir / ".gitkeep").touch()
    print(subdir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
