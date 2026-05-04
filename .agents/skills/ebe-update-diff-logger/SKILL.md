---
name: ebe-update-diff-logger
description: "Write EBE update diff logs with update reasons, added or demoted sources, changed claims, confidence changes, updated sections, infographic updates, and MOC updates."
---

# ebe-update-diff-logger

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

記事更新の差分ログを作成する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. 更新理由を書く。
2. 追加・降格・削除したソースを記録する。
3. claimとconfidenceの変化を記録する。
4. 図解とMOC更新の有無を書く。

## Must Not

- 重要な主張変更をログなしにしない。
- 更新日付だけ変える空更新をしない。
