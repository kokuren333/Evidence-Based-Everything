---
name: ebe-quality-auditor
description: "Run the final EBE publish gate for grounding, citations, infographic, historical context, modernity, readability, domain-specific requirements, MOCs, update metadata, and block failed articles."
---

# ebe-quality-auditor

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

publish直前の最終品質監査を行う。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. frontmatter, grounding, citation, infographic, historical, modernity, readability, domain_specific, MOC, update gatesを確認する。
2. infographic gateでは、記事の画像が `50_Assets/Infographics/` のPNGラスターを参照し、そのPNGがimagegen出力からコピーされたことをログで確認する。
3. infographic gateでは、SVG/vector/code-native、PIL、matplotlib、PowerPoint、スクリーンショット、HTML/Canvasレンダリングなどの代替画像を失格にする。
4. 日本語ラベルが文字化け、`????`、豆腐文字、判読不能なら失格にする。
5. MOC gateでは、大分類MOCが時系列・更新順だけに偏らず、見やすい体系整理と完全網羅性を満たしているか確認する。
6. MOC gateでは、対象大分類配下の公開済み小分野・記事への到達経路、リンク漏れ、重複、孤立記事、broken linkを確認する。
7. 失敗時は `10_Published/` に出さず、理由と修正先を書く。
8. pass時だけpublisherへ渡す。

## Must Not

- 形式だけ見てclaim-source対応を省略しない。
- 図解なしを通さない。
- imagegen由来ではないPNGを通さない。
- 文字化けした図解を通さない。
- MOC未更新を通さない。
- 時系列・更新順だけで完全網羅性を確認できない大分類MOCを通さない。
