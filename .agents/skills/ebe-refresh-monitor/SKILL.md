---
name: ebe-refresh-monitor
description: "Detect EBE articles needing updates from updated, last_verified, freshness_ttl, domain volatility, and create update jobs for stale or rapidly changing topics."
---

# ebe-refresh-monitor

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

記事の鮮度を監視し、更新が必要な記事を検出する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. updated, last_verified, freshness_ttlを確認する。
2. 高揺動分野は短いTTLを適用する。
3. 更新理由と必要ソースを記録する。

## Must Not

- 古い記事を最新として扱わない。
- 更新必要性をログなしで放置しない。
