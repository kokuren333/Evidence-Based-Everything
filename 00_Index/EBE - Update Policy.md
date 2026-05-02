---
project: "Evidence Based Everything"
type: "policy"
status: "published"
draft: false
updated: 2026-05-01
---

# EBE - Update Policy

## 鮮度

記事は `last_verified` と `freshness_ttl` を持つ。高揺動分野は短いTTLを使う。

## 更新手順

`ebe-refresh-monitor` で更新対象を検出し、必要なソース探索、claim修正、本文更新、引用監査、品質監査、更新差分ログを行う。

## 更新履歴

publish記事には更新履歴と更新日付を必ず残す。重要な主張変更、confidence変更、ソース追加・降格、図解更新を記録する。
