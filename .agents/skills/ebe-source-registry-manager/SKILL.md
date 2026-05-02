---
name: ebe-source-registry-manager
description: "Maintain URL-backed EBE source registries, stable source IDs, reference numbers, accessed dates, source notes, and synchronization between article reference lists and source registries."
---

# ebe-source-registry-manager

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

source registryを管理し、参照番号、URL、Accessed date、採用理由を安定させる。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. 各ソースに安定した番号を付ける。
2. URL、公開日、Accessed date、source noteを記録する。
3. 記事の参考ソース一覧と同期する。
4. 重複ソースを統合する。

## Must Not

- URLやAccessed dateを欠いたままpublish候補に渡さない。
- 番号を途中で無断再利用しない。
