---
name: ebe-category-subfield-moc-manager
description: "Create and update EBE category, subfield directories, and MOCs when publishing Obsidian articles; choose one primary category, create subfields only when needed, update global MOCs, and write taxonomy logs."
---

# ebe-category-subfield-moc-manager

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

記事の主分類、小分野、保存先、MOC更新、taxonomy logを管理する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. 10大分類からprimary categoryを一つ選ぶ。
2. 既存小分野を確認する。
3. 必要な場合だけ `{{日本語小分野名}}__{{english-slug}}/` を作る。
4. 対象大分類配下の小分野ディレクトリ、記事、既存MOCリンクを走査し、リンク漏れ・重複・孤立記事を確認する。
5. 小分野MOC、大分類MOC、全体MOC、Recently Updatedを更新する。
6. 大分類MOCは時系列や更新順を主軸にせず、見やすく体系的で完全網羅的な構成にする。収録済み小分野・記事への到達経路を漏れなく置く。
7. `70_Logs/taxonomy_logs/` に分類判断、MOC更新方針、網羅性チェック結果を残す。

## Must Not

- 初期状態で小分野を大量作成しない。
- 大分類直下に記事を直接置かない。
- MOC更新を忘れない。
- 大分類MOCを時系列・更新順だけの一覧にしない。
- MOC内にリンク漏れ、重複、孤立記事を残さない。
