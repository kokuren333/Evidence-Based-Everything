---
name: ebe-citation-auditor
description: "Audit EBE article citations, numbered references, URL presence, claim-source correspondence, duplicate references, infographic captions, and write citation audit logs before publishing."
---

# ebe-citation-auditor

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

引用番号、参考ソース、claim-source対応、図解キャプション引用を監査する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. 本文の引用番号が参考ソース一覧に存在するか確認する。
2. 参考ソース番号が本文で使われているか確認する。
3. 全参考ソースにURLとAccessed dateがあるか確認する。
4. claim-source対応と図解キャプション引用を確認する。
5. 失敗時はpublishを止め、修正可能なものは戻す。

## Must Not

- URL捏造を見逃さない。
- 図解キャプションの無引用を通さない。
