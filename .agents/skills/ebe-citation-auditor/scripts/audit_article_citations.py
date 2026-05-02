from __future__ import annotations

import re
import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: audit_article_citations.py <article.md>", file=sys.stderr)
        return 2
    path = Path(sys.argv[1])
    text = path.read_text(encoding="utf-8")
    body_cites = {int(n) for n in re.findall(r"\[(\d+)\]", text)}
    ref_match = re.search(r"^## 参考ソース\s*(.*?)(?:^## |\Z)", text, flags=re.S | re.M)
    if not ref_match:
        print("FAIL: missing ## 参考ソース")
        return 1
    refs_block = ref_match.group(1)
    refs = {int(n) for n in re.findall(r"^\s*(\d+)\.\s+", refs_block, flags=re.M)}
    missing_refs = sorted(body_cites - refs)
    unused_refs = sorted(refs - body_cites)
    url_missing = []
    for line in refs_block.splitlines():
        m = re.match(r"\s*(\d+)\.\s+", line)
        if m and "URL:" not in line:
            url_missing.append(int(m.group(1)))
    if missing_refs or url_missing:
        print(f"FAIL: missing_refs={missing_refs} url_missing={url_missing} unused_refs={unused_refs}")
        return 1
    print(f"PASS: citations={sorted(body_cites)} refs={sorted(refs)} unused_refs={unused_refs}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
