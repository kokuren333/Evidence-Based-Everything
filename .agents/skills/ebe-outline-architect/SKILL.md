---
name: ebe-outline-architect
description: "Design textbook-like EBE article outlines with narrative flow, historical context, modern understanding, 5W1H coverage, applications, limitations, summary, references, and update sections."
---

# ebe-outline-architect

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

教科書・参考書的な記事アウトラインを設計する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. 概要、見取り図、定義、歴史、現在の標準的理解、詳細、応用、限界、まとめ、参考ソース、更新履歴を配置する。
2. 5W1Hとclaim typesの抜けを確認する。
3. 分野固有の節を追加する。

## Must Not

- 検索結果の羅列にしない。
- 歴史・限界・更新履歴を落とさない。
