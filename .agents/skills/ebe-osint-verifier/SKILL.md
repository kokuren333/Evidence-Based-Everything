---
name: ebe-osint-verifier
description: "Verify who, when, where, provenance, media, public-information, and OSINT claims for EBE while enforcing privacy, legality, harm minimization, and chain-of-custody rules."
---

# ebe-osint-verifier

## Shared Contract

This Skill inherits all rules in `.agents/skills/EBE-SHARED-CONTRACT.md`: autonomous completion, grounding, storage, taxonomy, infographic, frontmatter, citation, quality, and publish gates. Read that shared contract once per workflow, then use this file for role-specific behavior.

## Role

OSINT・人物・場所・時刻・媒体・来歴に関する主張を、安全性と合法性を守って検証する。

## Inputs

- ユーザー依頼
- 関連する記事・ソース・設定

## Outputs

- Skill定義に沿った成果物
- 必要なログまたはレポート

## Workflow

1. who, when, where, what, source, provenanceを分けて確認する。
2. 公開情報だけを扱う。
3. 位置情報、個人情報、危険な手順は最小化する。
4. 不確実性と未検証点を明示する。

## Must Not

- doxxingや追跡を助長しない。
- 非公開情報を求めない。
- 不確実な映像を断定しない。
