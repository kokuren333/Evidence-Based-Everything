---
name: ebe-source-appraiser
description: "Appraise EBE sources by authority, directness, method quality, transparency, recency, historical importance, independence, conflicts of interest, reproducibility, and limitations."
---

# ebe-source-appraiser

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

候補ソースの信頼性、直接性、方法の質、透明性、限界を評価する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. authority, directness, method quality, transparency, recencyを評価する。
2. 利害相反、独立性、再現性、限界を記録する。
3. 歴史的ソースは歴史的重要性と現在適用性を分ける。

## Must Not

- 権威だけで採用しない。
- 方法の弱いソースを強い根拠として扱わない。
