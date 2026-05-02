from __future__ import annotations

import sys
from pathlib import Path


REQUIRED = [
    "00_Index",
    "10_Published",
    "20_EvidencePackets",
    "30_Sources",
    "40_Claims",
    "50_Assets/Infographics",
    "60_MOCs",
    "70_Logs/update_logs",
    "_working/drafts",
    "_archive/old_mocs",
    "config/ebe.config.yml",
    ".agents/skills/ebe-orchestrator/SKILL.md",
]


def main() -> int:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    missing = [p for p in REQUIRED if not (root / p).exists()]
    if missing:
        print("FAIL: missing")
        for p in missing:
            print(f"- {p}")
        return 1
    print("PASS: EBE vault structure baseline exists")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
