---
project: "Evidence Based Everything"
type: "policy"
status: "published"
draft: false
updated: 2026-05-01
---

# EBE - Taxonomy Policy

## 大分類

`10_Published/` 直下には10大分類だけを置く。記事は大分類直下ではなく、小分野ディレクトリ内に保存する。

## 小分野

小分野は記事作成時に必要な場合だけ作成する。形式は `{{日本語小分野名}}__{{english-slug}}/` とする。

## MOC

小分野MOC、大分類MOC、`60_MOCs/MOC - All Published.md`、`60_MOCs/MOC - Recently Updated.md` を更新する。

大分類MOCは、時系列・更新順よりも、読者が分野全体を理解しやすい体系的な構成と完全網羅性を優先する。概説、基礎概念、主要テーマ、小分野一覧、実践・応用、論争点・未解決問題、関連MOCへの導線などを必要に応じて配置し、公開済みの小分野・記事への到達経路を漏れなく保つ。

時系列・更新順は補助セクションとして扱い、MOC全体の主構造にしない。MOC更新時は対象大分類配下を走査し、リンク漏れ、重複、孤立記事、broken linkがないことを確認する。

## ログ

分類判断や移動を行った場合は `70_Logs/taxonomy_logs/` または `_working/migration_reports/` に記録する。
