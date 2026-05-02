---
name: ebe-obsidian-publisher
description: "Save publish-ready EBE articles into Obsidian subfield directories, preserve backlinks, use Obsidian image links, update MOCs, and log published paths without bypassing quality gates."
---

# ebe-obsidian-publisher

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

品質監査を通過した記事をObsidian Vault内の正しい小分野へ保存し、MOCとログを更新する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. quality audit passを確認する。
2. 小分野ディレクトリへ保存する。
3. 画像リンクをObsidian形式に保つ。
4. 小分野MOC、大分類MOC、全体MOC、Recently Updatedを更新する。
5. 大分類MOCでは、時系列・更新順よりも見やすい体系整理と完全網羅性を優先し、公開済み小分野・記事への到達経路を漏れなく保つ。
6. publish logへパスとMOC更新結果を記録する。

## Must Not

- Gate失敗記事を保存しない。
- 既存記事を無断上書きしない。
- broken linkを残さない。
- 大分類MOCを時系列・更新順だけの一覧に劣化させない。
