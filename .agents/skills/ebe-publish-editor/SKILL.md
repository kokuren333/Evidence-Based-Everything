---
name: ebe-publish-editor
description: "Convert EBE drafts into publish-ready Obsidian Markdown articles with frontmatter, citations, references, historical context, modern understanding, limitations, infographic, update history, and publish gates."
---

# ebe-publish-editor

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

draftをpublish-ready候補へ改稿し、frontmatter、本文構成、参考ソースを整える。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. `config/article_templates.yml` のfrontmatter_requiredに同じキー・順序・型で従う。
2. legacy aliasesを使わない。
3. 冒頭にタイトル、図解、引用付きキャプションを置く。
4. 概要、見取り図、定義、歴史、現在の標準的理解、詳細、応用、限界、まとめ、参考ソース、更新履歴、更新日付を整える。
5. Gate未達なら `10_Published/` に出さない。

## Must Not

- `status: draft` の記事をpublishしない。
- URLなし参考ソースで主要claimを支えない。
- 更新履歴を忘れない。
