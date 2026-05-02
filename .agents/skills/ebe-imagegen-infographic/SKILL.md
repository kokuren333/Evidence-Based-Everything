---
name: ebe-imagegen-infographic
description: "Generate and verify Japanese top-of-article EBE infographics from infographic briefs using the default imagegen skill; SVG/vector/code-native substitutes are forbidden for publish infographics."
---

# ebe-imagegen-infographic

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

briefに基づき、publish記事用の日本語ラスターインフォグラフィックを生成・配置・検証する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. briefを読む。
2. imagegenで1枚のラスター画像を生成する。imagegen以外の描画手段で代替しない。
3. imagegenが保存した元PNGの絶対パスを確認する。
4. 元PNGを `50_Assets/Infographics/` にコピーする。元ファイルは削除しない。
5. コピー先ファイルがPNGラスターであること、サイズが0でないこと、記事から参照されていることを確認する。
6. 日本語ラベルが文字化け、`????`、豆腐文字、判読不能になっていないか目視またはOCRで確認する。
7. 生成元パス、コピー先、寸法、検証結果を `70_Logs/infographic_logs/` に記録する。
8. 記事に `![[50_Assets/Infographics/{{slug}}_infographic.png]]` を挿入する。
9. ラスター形式、ラベル可読性、根拠との一致を確認する。

## Must Not

- SVG/vector/code-native図解をpublish用に使わない。
- PIL、matplotlib、PowerPoint、スクリーンショット、HTMLレンダリング、Canvasレンダリングなどで作ったPNGをpublish用に使わない。
- 読めない日本語を放置しない。
- 生成画像をVault外だけに残さない。
- imagegen元パスを確認・記録せずにpublishしない。
