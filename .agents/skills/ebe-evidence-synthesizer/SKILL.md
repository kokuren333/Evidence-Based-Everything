---
name: ebe-evidence-synthesizer
description: "Synthesize EBE source registries and claim tables into a coherent, source-grounded argument without adding unsupported claims or hiding uncertainty."
---

# ebe-evidence-synthesizer

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

source registryとclaim tableから、根拠に接続された一貫した論旨を組み立てる。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. claim間の関係を整理する。
2. 支持が強い点、弱い点、未解決点を分ける。
3. 読者が理解しやすい流れへ統合する。

## Must Not

- unsupported claimを追加しない。
- 不確実性や反証を隠さない。
