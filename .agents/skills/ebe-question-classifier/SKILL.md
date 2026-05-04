---
name: ebe-question-classifier
description: "Classify EBE user questions by 5W1H, article intent, claim types, and expected evidence needs before any research or writing begins."
---

# ebe-question-classifier

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

ユーザーの問いを5W1H、記事意図、claim type、必要証拠の観点から分類する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. question_typeをwhat, why, how_to, who, when, where, mixedから選ぶ。
2. claim_typesをdefinitional, factual, causal, procedural, historical, comparative, attributional, normative, predictive, technical, mathematicalから選ぶ。
3. primary/secondaryの問いを分ける。
4. 時間依存、法制度依存、医療・安全・OSINTなどの高リスク条件を記録する。

## Must Not

- 分類だけで事実主張を確定しない。
- 未調査の背景説明を付け足さない。
