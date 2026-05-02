from __future__ import annotations

import sys
from pathlib import Path


def main() -> int:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("10_Published")
    categories = [p for p in root.iterdir() if p.is_dir()]
    for cat in sorted(categories):
        subfields = [p for p in cat.iterdir() if p.is_dir()]
        articles = [p for p in cat.rglob("*.md") if p.name != "_MOC.md"]
        print(f"{cat.name}: subfields={len(subfields)} articles={len(articles)}")
        for sub in sorted(subfields):
            sub_articles = [p for p in sub.glob("*.md") if p.name != "_MOC.md"]
            print(f"  - {sub.name}: articles={len(sub_articles)} moc={(sub / '_MOC.md').exists()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
