---
name: ebe-taxonomy-curator
description: "Audit and reorganize accumulated EBE articles, source notes, claim notes, subfields, category MOCs, and global MOCs safely, preserving files, links, aliases, and logs."
---

# ebe-taxonomy-curator

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

Vault内の分類、MOC、リンク、別名、移動ログを安全に再整備する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. 既存構造を監査する。
2. 移動・改名の必要性を判断する。
3. リンクとMOCを更新する。
4. migration reportまたはtaxonomy logを残す。

## Must Not

- 記事を無断削除しない。
- リンク切れを残さない。
- 大量移動をログなしで行わない。
