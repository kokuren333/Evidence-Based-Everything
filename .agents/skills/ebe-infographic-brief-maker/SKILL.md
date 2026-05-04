---
name: ebe-infographic-brief-maker
description: "Create a source-grounded Japanese infographic brief for EBE articles before image generation, using only article claims and cited source-backed concepts; briefs must require imagegen raster output and forbid SVG/vector/code-native substitutes."
---

# ebe-infographic-brief-maker

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

記事冒頭用の日本語インフォグラフィックbriefを作る。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. 目的、主要概念、関係、必須日本語ラベル、禁止事項、視覚スタイル、source basisを書く。
2. 記事内の根拠付きclaimだけを使う。
3. imagegenツールによる実生成ラスターPNG必須と明記する。
4. キャプション引用番号を記録する。
5. 禁止事項に、SVG/vector/code-nativeだけでなく、PIL、matplotlib、PowerPoint、スクリーンショット、手描きコード生成PNGの使用禁止を明記する。

## Must Not

- SVG、HTML、Mermaid、ASCII、PIL、matplotlib、PowerPoint、スクリーンショット、コード生成PNGなどの代替を許可しない。
- 未出典概念を入れない。
