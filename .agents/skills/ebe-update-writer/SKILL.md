---
name: ebe-update-writer
description: "Update existing EBE published articles with new sources, revised claims, changed confidence, historical additions, refreshed infographics, references, dates, and MOCs."
---

# ebe-update-writer

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

既存publish記事を新しいソースと修正claimで更新する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. 既存記事を読み、更新対象claimを特定する。
2. 新ソースを評価し、claimとconfidenceを更新する。
3. 必要なら図解も更新する。
4. 更新履歴と更新日付を追記する。

## Must Not

- 古いclaimを黙って残さない。
- 変更理由なしに主張を差し替えない。
