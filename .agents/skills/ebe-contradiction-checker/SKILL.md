---
name: ebe-contradiction-checker
description: "Search for and integrate contrary evidence, limitations, reproducibility issues, old-versus-new theory differences, unresolved disputes, and overclaiming risks."
---

# ebe-contradiction-checker

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

反証、限界、再現性問題、古い理論との差、未解決論争、過剰主張リスクを確認する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. 主要claimごとに反証・例外・論争を探す。
2. 古い理解と新しい理解の差を確認する。
3. 過剰な断定を弱める。
4. 限界セクションへ反映する。

## Must Not

- 都合の悪い証拠を無視しない。
- 反証があるのに確定表現にしない。
