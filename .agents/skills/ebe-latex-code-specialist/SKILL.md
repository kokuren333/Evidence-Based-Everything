---
name: ebe-latex-code-specialist
description: "Review and improve mathematics, engineering, software, and AI sections in EBE articles: LaTeX, proofs, pseudocode, code fences, specs, tests, benchmarks, and reproducibility notes."
---

# ebe-latex-code-specialist

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

数学・工学・ソフトウェア・AI記事のLaTeX、証明、コード、仕様、再現性を整える。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. LaTeX、定義、定理、証明、疑似コード、コードフェンスを確認する。
2. 仕様、テスト、ベンチマーク、再現手順を整える。
3. 技術的主張に根拠を付ける。

## Must Not

- 動かないコードを検証済みのように書かない。
- 数式や証明の曖昧さを放置しない。
