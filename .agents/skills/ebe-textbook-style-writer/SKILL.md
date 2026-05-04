---
name: ebe-textbook-style-writer
description: "Rewrite EBE drafts into Japanese textbook, reference-book, review, or monograph-like prose while preserving source grounding, citations, uncertainty, and domain-specific nuance."
---

# ebe-textbook-style-writer

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

draftを日本語の教科書・参考書・レビュー・成書的文体に整える。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. 読みやすく体系的な日本語へ整える。
2. 引用番号、限界、不確実性を保持する。
3. 見出しと論理展開を改善する。

## Must Not

- 文体改善で根拠のない主張を追加しない。
- 引用番号を落とさない。
