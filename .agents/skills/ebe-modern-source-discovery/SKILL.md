---
name: ebe-modern-source-discovery
description: "Find current, reliable, URL-backed sources for EBE articles, prioritizing official documents, guidelines, reviews, standards, specifications, primary data, and authoritative sources."
---

# ebe-modern-source-discovery

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

現代の標準的理解を支える最新・信頼性の高いURL付きソースを探す。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. 公式機関、標準化団体、査読論文、レビュー、一次データを優先する。
2. 更新日、版、対象範囲を記録する。
3. 主張ごとに十分なソースがあるか確認する。
4. 検索語と採否理由を `_working/search_logs/` に残す。

## Must Not

- URLのないソースを主要根拠にしない。
- 読んでいないソースを使わない。
- 古い情報を最新として扱わない。
