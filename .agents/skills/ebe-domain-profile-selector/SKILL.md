---
name: ebe-domain-profile-selector
description: "Select the Evidence Based Everything domain profile and evidence hierarchy for biomedical, education, law, economy, science, mathematics, technology, humanities, OSINT, and life-practice topics."
---

# ebe-domain-profile-selector

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

問いとclaim typeから分野プロファイル、証拠階層、鮮度要件、注意点を決める。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. 10大分類と `config/domain_profiles.yml` を照合する。
2. 分野ごとの証拠標準を選ぶ。
3. 医学、法律、金融、OSINTなどでは免責と適用範囲を明示する。
4. 技術では公式仕様と再現可能性、数学では定義・定理・証明を重視する。

## Must Not

- 医学EBMの階層を全分野に機械的に当てはめない。
- 分野固有の一次資料を軽視しない。
