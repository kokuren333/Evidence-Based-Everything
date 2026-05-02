---
name: ebe-orchestrator
description: "Coordinate the full Evidence Based Everything workflow for Obsidian: classify requests, route article creation, updates, source audits, MOC maintenance, taxonomy reorganization, infographic generation, citation gates, and publish gates."
---

# ebe-orchestrator

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

EBE全体の司令塔として、依頼を分類し、必要な専門Skillを正しい順序で起動し、Publish Gate通過まで管理する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. 目的を article_creation, update, taxonomy_review, citation_audit, source_audit, moc_repair, vault_operation に分類する。
2. 問いを `ebe-question-classifier` に分類させる。
3. 分野プロファイルを `ebe-domain-profile-selector` で選ぶ。
4. 新規記事では、source discoveryからpublisherまで必須順序を守る。
5. MOC再構成・MOC修復では、時系列・更新順よりも見やすい体系整理と完全網羅性を優先するよう `ebe-category-subfield-moc-manager` と `ebe-quality-auditor` に渡す。
6. Gate失敗時はpublishせず、理由を `_working/` または `70_Logs/` に記録する。

## Must Not

- 図解なしの記事をpublishしない。
- 小分野なしで大分類直下に記事を置かない。
- unsupported claimを通さない。
- 大分類MOCを時系列・更新順だけの一覧として扱わない。
