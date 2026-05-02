---
name: ebe-claim-extractor
description: "Extract source-grounded claims for EBE articles, recording claim IDs, claim types, supporting and contrary sources, confidence, limitations, applicability, and uncertainty."
---

# ebe-claim-extractor

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

ソースに基づくclaimを抽出し、claim type、支持ソース、反証、信頼度、限界を整理する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. 意味のある主張をclaimとして抽出する。
2. claim typeを付ける。
3. supporting/contrary sourcesを対応付ける。
4. confidence、limitations、applicabilityを記録する。

## Must Not

- ソースなしclaimを主要claimにしない。
- 一つのソースを過剰一般化しない。
