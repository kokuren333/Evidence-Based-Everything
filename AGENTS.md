# Evidence Based Everything Codex エージェント指示書

このディレクトリは Evidence Based Everything（EBE）の Obsidian Vault 兼 Codex Skills オーケストレーション環境である。ここでユーザーから問い、記事作成、記事更新、分類整理、引用監査、ソース調査、MOC整備、Vault運用に関する依頼を受けた場合、必ずこのファイルと `.agents/skills/` の EBE Skills を優先して使うこと。

## EBE Autonomous Completion Rule / 自走完了ルール

このVaultでEBE関連の依頼を受けた場合、Codexはユーザーに途中許可を求めず、`.agents/skills/` のEBE Skills定義とPublish Gateに厳密に従って完了まで自走する。

- 新規記事作成では、`ebe-orchestrator` から始め、必要な専門Skillを順に読み、source discovery、source appraisal、claim extraction、synthesis、contradiction check、outline、draft、textbook rewrite、category/subfield MOC、infographic brief、imagegen、publish edit、citation audit、quality audit、obsidian publisherまで進める。
- ユーザーへの確認は、テーマ・範囲・安全性・合法性・プライバシー・既存ファイル破壊リスクなどが未解決で、合理的な仮定では危険な場合に限る。
- 「進めてよいか」「publishしてよいか」「画像を作ってよいか」など、通常ワークフロー上の許可確認は不要。
- Publish Gateに合格した場合のみ `10_Published/` に保存する。
- Publish Gateに失敗した場合は `10_Published/` に置かず、失敗理由と修正先を `_working/review_reports/`、`_working/research_insufficient/`、または `70_Logs/` に記録し、修正可能なものは自走で修正する。
- imagegenが必要な記事では、`ebe-infographic-brief-maker` と `ebe-imagegen-infographic` に従い、imagegenツールが生成した実ラスターPNGを `50_Assets/Infographics/` にコピーして保存し、記事へObsidian画像リンクを挿入する。SVG、Mermaid、HTML/CSS、Canvas、PIL、matplotlib、PowerPoint、スクリーンショット、コード生成PNGなどの代替図解はpublish用インフォグラフィックとして禁止する。
- 既存ファイルの削除・移動・上書きは、必要性と安全性を確認し、ログを残す。ユーザー作成の無関係な変更は戻さない。

English summary: for EBE tasks in this Vault, Codex should run the defined Skills workflow autonomously to completion without asking routine permission. Ask only when a missing decision would create material safety, legality, privacy, scope, or destructive-file risk. Publish only after all gates pass.

## 最優先ルール

共通契約は `.agents/skills/EBE-SHARED-CONTRACT.md` に集約されている。各Skillはこの共通契約を継承し、個別の役割・入出力・禁止事項だけを定義する。


1. 正規のSkills配置は `.agents/skills/` である。
2. トップレベルの `skills/` は正規配置ではない。作成しない。
3. EBE関連の問いでは、まず `.agents/skills/ebe-orchestrator/SKILL.md` を読み、必要な専門Skillを選ぶ。
4. 記事テーマが明示されていない初期セットアップ依頼では、新規publish記事を作成しない。
5. `10_Published/` にはpublish-readyの記事だけを置く。
6. 中間生成物は `_working/` に置く。`20_EvidencePackets/`、`30_Sources/`、`40_Claims/` はpublish成功後または既存publish記事更新時の耐久証跡だけを置く。
7. Artifact lifecycleの正規定義は `00_Index/EBE - Artifact Lifecycle Policy.md` と `.agents/skills/EBE-SHARED-CONTRACT.md` に従う。
8. 生成記事、実ソースノート、claim note、画像、ログ、working成果物はGitに上げない設計で扱う。
9. 既存ファイルを削除・移動・上書きする場合は、目的と安全性を確認し、必要に応じて `_working/migration_reports/` または `70_Logs/` に記録する。
10. 各大分類MOCは、時系列・更新順よりも、読者が全体像を掴みやすい見やすさと完全網羅性を優先して再構成する。

## EBEの目的

EBEは、あらゆる問いをEvidence-Basedに扱い、医学的EBMの思想を全学問・実務・ライフワーク・OSINT・創作・技術・人文学に拡張する知識編纂システムである。

publish記事は、教科書的、参考書的、信頼できるレビュー的、成書的であることを目指す。歴史的観点、現代の標準的理解、実践・応用・限界、引用番号とURL付き参考ソース、日本語インフォグラフィック、更新履歴、更新日付を備える。

## 基本ルーティング

1. 依頼が新規記事作成、既存記事更新、分類整理、引用監査、ソース監査、MOC修復、Vault運用のどれかを判定する。
2. `.agents/skills/ebe-orchestrator/SKILL.md` を読む。
3. 必要な専門Skillを読む。

## 新規記事作成時の必須順序

```text
User question
  -> ebe-orchestrator
  -> ebe-question-classifier
  -> ebe-domain-profile-selector
  -> ebe-modern-source-discovery
  -> ebe-historical-source-discovery
  -> ebe-osint-verifier（必要な場合）
  -> ebe-source-appraiser
  -> ebe-source-registry-manager
  -> ebe-claim-extractor
  -> ebe-evidence-synthesizer
  -> ebe-contradiction-checker
  -> ebe-outline-architect
  -> ebe-research-drafter
  -> ebe-textbook-style-writer
  -> ebe-category-subfield-moc-manager
  -> ebe-infographic-brief-maker
  -> ebe-imagegen-infographic
  -> ebe-publish-editor
  -> ebe-citation-auditor
  -> ebe-quality-auditor
  -> ebe-obsidian-publisher
```

## Publish Gate

次の条件を満たさない記事は `10_Published/` に出力してはならない。

- `status: published`
- `draft: false`
- `publish_ready: true`
- 主要claimがsourceに接続されている
- 本文中に引用番号がある
- 参考ソースに番号、URL、Accessed dateがある
- 先頭に日本語インフォグラフィックがある
- 図解キャプションに引用番号がある
- 歴史的背景・古典的理解がある
- 現在の標準的理解がある
- 限界・論争点・未解決事項がある
- 更新履歴がある
- 更新日付がある
- 小分野ディレクトリ内に保存されている
- 小分野MOC、大分野MOC、全体MOCが更新されている

## 小分野ルール

`10_Published/` 直下には10大分類だけを初期作成する。小分野ディレクトリは初期状態では作らない。記事作成時に `ebe-category-subfield-moc-manager` が主分類と小分野を判断し、必要な場合だけ `{{日本語小分野名}}__{{english-slug}}/` 形式で小分野を作る。記事は必ず小分野ディレクトリ内に `{{日本語タイトル}}__{{english-slug}}.md` 形式で置く。

## 大分類MOC再構成方針

各大分類MOCは、時系列や更新順を主軸にせず、読者が分野全体を俯瞰しやすい体系的な構成を優先する。原則として、概説、基礎概念、主要テーマ、小分野一覧、実践・応用、論争点・未解決問題、関連MOCへの導線を必要に応じて配置し、収録済みの小分野・記事へのリンクを漏れなく含める。時系列・更新順は「最近更新」「歴史的背景」など補助セクションに限定し、完全網羅性を損なう場合は採用しない。

MOC更新時は、対象大分類配下の小分野ディレクトリ、記事、既存MOCリンクを確認し、リンク漏れ・重複・孤立記事がないことを確認する。完全網羅を検証できない場合はpublishせず、`_working/review_reports/` または `70_Logs/taxonomy_logs/` に不足箇所を記録して修正する。

## Grounding First

意味内容を持つ主張は原則としてソースに接続する。ソースなしの断定、記憶だけの説明、存在しないURL・DOI・論文・書籍・判例・規格の捏造、読んでいないソースの使用は禁止する。

## imagegen

publish記事には必ず日本語インフォグラフィックを置く。図解は `ebe-infographic-brief-maker` がbriefを作成し、`ebe-imagegen-infographic` がデフォルトの `imagegen` skillを使って生成する。生成後は、imagegenの保存先（例: `C:\Users\...\ .codex\generated_images\...\*.png`）から `50_Assets/Infographics/` にコピーし、元画像パス・Vault内コピー先・検証結果を `70_Logs/infographic_logs/` に記録する。imagegenが利用不能な場合、または日本語ラベルが文字化け・`????`・判読不能の場合は、図解なしでpublishせず、`_working/infographic_briefs/` にpromptと設計書を保存して停止する。
