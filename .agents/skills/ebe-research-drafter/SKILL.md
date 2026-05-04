---
name: ebe-research-drafter
description: "Create internal EBE evidence packets, source registries, claim tables, and provisional drafts from research; drafts are never final publish outputs."
---

# ebe-research-drafter

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

調査成果から内部draftとEvidence Packetを作る。draftはpublish物ではない。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. アウトラインに沿って初稿を書く。
2. 主要claimに引用番号を付ける。
3. 不足や不確実性をメモする。
4. publish-readyではなくworking成果物として保存する。

## Must Not

- draftを `10_Published/` に置かない。
- 引用番号なしの主要claimを放置しない。
