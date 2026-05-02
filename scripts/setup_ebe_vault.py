from __future__ import annotations

import re
import sys
from datetime import datetime
from pathlib import Path
from textwrap import dedent
from zoneinfo import ZoneInfo


ROOT = Path.cwd()
JST = ZoneInfo("Asia/Tokyo")
NOW = datetime.now(JST)
DATE = NOW.strftime("%Y-%m-%d")
DATETIME = NOW.strftime("%Y-%m-%d %H:%M JST")
STAMP = NOW.strftime("%Y%m%d%H%M%S")
OVERWRITE_GENERATED = "--overwrite-generated" in sys.argv


CATEGORIES = [
    {
        "id": "01",
        "directory": "01_Life_Health_Medicine",
        "label_ja": "生命・健康・医学",
        "scope": "医学、公衆衛生、栄養、睡眠、運動、薬理、疾患、臨床判断、生命科学、健康行動を扱う。医学的 EBM、レビュー、ガイドライン、リスク、限界、適用条件を重視する。",
        "related": "02_Mind_Education_Human_Development, 05_Nature_Science_Environment, 07_Technology_Engineering_Computing_AI",
    },
    {
        "id": "02",
        "directory": "02_Mind_Education_Human_Development",
        "label_ja": "心理・教育・人間発達",
        "scope": "心理学、認知科学、教育、学習、発達、メンタルヘルス、行動科学、意思決定、習慣形成、人間理解を扱う。実験研究、メタ分析、教育研究、発達研究、個人差、文化差を重視する。",
        "related": "01_Life_Health_Medicine, 08_Humanities_History_Culture_Arts, 10_Life_Design_Practice_Creative_Work",
    },
    {
        "id": "03",
        "directory": "03_Society_Policy_Law_Governance",
        "label_ja": "社会・政策・法・ガバナンス",
        "scope": "社会制度、政策、法律、行政、国際関係、政治、倫理、規制、ガバナンス、公共政策を扱う。一次法令、判例、政策文書、政府資料、制度依存性、法域を重視する。",
        "related": "04_Economy_Business_Work, 08_Humanities_History_Culture_Arts, 09_Information_Media_OSINT_Security",
    },
    {
        "id": "04",
        "directory": "04_Economy_Business_Work",
        "label_ja": "経済・ビジネス・仕事",
        "scope": "経済、金融、経営、会計、マーケティング、スタートアップ、産業分析、労働、組織、キャリア、生産性を扱う。データ、統計、企業資料、制度、実務上の制約、利害関係を重視する。",
        "related": "03_Society_Policy_Law_Governance, 07_Technology_Engineering_Computing_AI, 10_Life_Design_Practice_Creative_Work",
    },
    {
        "id": "05",
        "directory": "05_Nature_Science_Environment",
        "label_ja": "自然科学・環境",
        "scope": "物理、化学、生物、地球科学、環境、気候、宇宙、エネルギー、生態、科学史を扱う。再現性、実験、観測、測定、理論、レビュー、環境影響を重視する。",
        "related": "01_Life_Health_Medicine, 06_Mathematics_Logic_Formal_Systems, 08_Humanities_History_Culture_Arts",
    },
    {
        "id": "06",
        "directory": "06_Mathematics_Logic_Formal_Systems",
        "label_ja": "数学・論理・形式体系",
        "scope": "数学、統計、論理、形式手法、証明、アルゴリズム理論、計算理論、圏論、最適化、数理モデルを扱う。定義、定理、証明、反例、LaTeX、形式的厳密性を重視する。",
        "related": "05_Nature_Science_Environment, 07_Technology_Engineering_Computing_AI",
    },
    {
        "id": "07",
        "directory": "07_Technology_Engineering_Computing_AI",
        "label_ja": "技術・工学・コンピューティング・AI",
        "scope": "工学、ソフトウェア、AI、機械学習、データサイエンス、ロボティクス、ネットワーク、セキュリティ技術、システム設計、プログラミングを扱う。仕様書、コード、ベンチマーク、再現性、実装、設計トレードオフを重視する。",
        "related": "06_Mathematics_Logic_Formal_Systems, 09_Information_Media_OSINT_Security, 04_Economy_Business_Work",
    },
    {
        "id": "08",
        "directory": "08_Humanities_History_Culture_Arts",
        "label_ja": "人文・歴史・文化・芸術",
        "scope": "歴史、哲学、文学、宗教、文化、芸術、言語、思想史、メディア史、人文学一般を扱う。一次資料、史料批判、解釈の複数性、文脈、研究史を重視する。",
        "related": "03_Society_Policy_Law_Governance, 05_Nature_Science_Environment, 10_Life_Design_Practice_Creative_Work",
    },
    {
        "id": "09",
        "directory": "09_Information_Media_OSINT_Security",
        "label_ja": "情報・メディア・OSINT・セキュリティ",
        "scope": "OSINT、メディアリテラシー、情報検証、調査報道、サイバーセキュリティ、プロパガンダ、偽情報、画像・動画検証、ソース追跡、情報倫理を扱う。provenance、source、date、location、archive、chain of custody、公開情報倫理を重視する。",
        "related": "03_Society_Policy_Law_Governance, 07_Technology_Engineering_Computing_AI, 08_Humanities_History_Culture_Arts",
    },
    {
        "id": "10",
        "directory": "10_Life_Design_Practice_Creative_Work",
        "label_ja": "ライフデザイン・実践・創作",
        "scope": "ライフワーク、実践知、創作、執筆、研究習慣、個人知識管理、意思決定、生活設計、学習設計、プロジェクト運営を扱う。研究知見、実践可能性、個人文脈、価値観、N-of-1、習慣化、反省ログを重視する。",
        "related": "02_Mind_Education_Human_Development, 04_Economy_Business_Work, 08_Humanities_History_Culture_Arts",
    },
]


SKILL_ORDER = [
    "ebe-orchestrator",
    "ebe-question-classifier",
    "ebe-domain-profile-selector",
    "ebe-category-subfield-moc-manager",
    "ebe-modern-source-discovery",
    "ebe-historical-source-discovery",
    "ebe-osint-verifier",
    "ebe-source-appraiser",
    "ebe-source-registry-manager",
    "ebe-claim-extractor",
    "ebe-evidence-synthesizer",
    "ebe-contradiction-checker",
    "ebe-outline-architect",
    "ebe-research-drafter",
    "ebe-textbook-style-writer",
    "ebe-infographic-brief-maker",
    "ebe-imagegen-infographic",
    "ebe-publish-editor",
    "ebe-citation-auditor",
    "ebe-obsidian-publisher",
    "ebe-refresh-monitor",
    "ebe-update-writer",
    "ebe-update-diff-logger",
    "ebe-taxonomy-curator",
    "ebe-latex-code-specialist",
    "ebe-quality-auditor",
]


SKILL_SPECS = {
    "ebe-orchestrator": {
        "title": "EBE Orchestrator",
        "description": "Coordinate the full Evidence Based Everything workflow for Obsidian: classify requests, route article creation, updates, source audits, MOC maintenance, taxonomy reorganization, infographic generation, citation gates, and publish gates.",
        "role": "EBE 全体の司令塔として、ユーザー要求を読み、記事作成・更新・MOC整備・分類再編・ソース監査のどれかを判定し、必要な skill を正しい順序で起動する。",
        "inputs": ["ユーザー要求", "既存記事または Vault 状態", "config/ebe.config.yml", "00_Index の各ポリシー"],
        "outputs": ["実行計画", "必要な skill への引き継ぎ", "publish gate の可否判断", "不足時の review report"],
        "workflow": [
            "目的を article_creation, update, taxonomy_review, citation_audit, source_audit, moc_repair のいずれかに分類する。",
            "5W1H と claim types を ebe-question-classifier に判定させる。",
            "domain profile と evidence standard を ebe-domain-profile-selector に選ばせる。",
            "新規記事では modern source discovery, historical source discovery, source appraisal, registry, claim extraction, synthesis, contradiction check, outline, draft, textbook rewrite, category/subfield MOC, infographic brief, imagegen, publish edit, citation audit, quality audit, publisher の順序を守る。",
            "更新では refresh monitor, source discovery, update writer, diff logger を使う。",
            "publish gate に失敗したら 10_Published へ書かず、_working/review_reports または _working/research_insufficient に理由を残す。",
        ],
        "must_not": ["図解なしの記事を publish する", "小分野なしで大分野直下に記事を置く", "unsupported claim を通す"],
    },
    "ebe-question-classifier": {
        "title": "EBE Question Classifier",
        "description": "Classify EBE user questions by 5W1H, article intent, claim types, and expected evidence needs before any research or writing begins.",
        "role": "問いを 5W1H、claim type、記事目的に分解し、以後の evidence workflow に渡す。",
        "inputs": ["original question", "user constraints", "existing article when present"],
        "outputs": ["question_type", "claim_types", "article_type_candidate", "research_risk_notes"],
        "workflow": [
            "question_type を what, why, how_to, who, when, where, mixed から選ぶ。",
            "claim_types を definitional, factual, causal, procedural, historical, comparative, attributional, normative, predictive, technical, mathematical から選ぶ。",
            "問いが複合的な場合は primary と secondary を分ける。",
            "時間依存、法域依存、医療・法務・金融・OSINT安全性などの高リスク条件を記録する。",
        ],
        "must_not": ["分類だけで factual claim を確定する", "未調査の背景説明を付け足す"],
    },
    "ebe-domain-profile-selector": {
        "title": "EBE Domain Profile Selector",
        "description": "Select the Evidence Based Everything domain profile and evidence hierarchy for biomedical, education, law, economy, science, mathematics, technology, humanities, OSINT, and life-practice topics.",
        "role": "問いと claim type から分野別 evidence profile を選び、必要なソース階層と注意点を決める。",
        "inputs": ["question classification", "topic summary", "category candidates"],
        "outputs": ["domain_profile", "evidence_focus", "evidence_standard", "freshness_ttl_candidate", "domain cautions"],
        "workflow": [
            "10 の大分野と domain_profiles.yml を照合する。",
            "主分類と evidence profile がずれる場合は、教育的主眼を優先して理由を残す。",
            "医学・法務・金融・OSINTなどでは免責と適用範囲を明示する。",
            "数学では定義・定理・証明・標準教科書、技術では仕様・公式ドキュメント・再現可能コードを重視する。",
        ],
        "must_not": ["医学 EBM の階層を全分野に機械的に当てはめる", "分野固有の一次資料を軽視する"],
    },
    "ebe-category-subfield-moc-manager": {
        "title": "EBE Category Subfield MOC Manager",
        "description": "Create and update EBE category, subfield directories, and MOCs when publishing Obsidian articles; choose one primary category, create subfields only when needed, update global MOCs, and write taxonomy logs.",
        "role": "記事作成時に大分野と小分野を決め、必要な小分野ディレクトリと MOC を作成・更新する。",
        "inputs": ["article title", "question", "claim table", "domain profile", "existing 10_Published tree"],
        "outputs": ["category_id", "subfield_name", "subfield_path", "updated MOCs", "taxonomy log"],
        "workflow": [
            "10 大分野から primary category を1つ選び、必要なら secondary categories を frontmatter に記録する。",
            "既存小分野一覧を確認し、自然な既存小分野があれば使う。",
            "適切な小分野がなければ {{日本語小分野名}}__{{english-slug}} 形式で新規作成する。",
            "小分野 _MOC.md、大分野 _MOC.md、60_MOCs/MOC - All Published.md、MOC - Recently Updated.md を更新する。",
            "70_Logs/taxonomy_logs に分類理由と更新ファイルを書く。",
        ],
        "must_not": ["初期状態で小分野を大量作成する", "分類不明のまま publish する", "大分野直下に記事を直接置く", "MOC 更新を忘れる"],
    },
    "ebe-modern-source-discovery": {
        "title": "EBE Modern Source Discovery",
        "description": "Find current, reliable, URL-backed sources for EBE articles, prioritizing official documents, guidelines, reviews, standards, specifications, primary data, and recent scholarship.",
        "role": "現在の標準的理解と最新情報を裏付ける信頼できるソースを探索する。",
        "inputs": ["question classification", "domain profile", "evidence focus"],
        "outputs": ["candidate modern sources", "excluded sources", "search log entries"],
        "workflow": [
            "公式文書、最新ガイドライン、最新レビュー、システマティックレビュー、標準教科書、学会・政府・標準化団体資料、査読論文、技術仕様、一次資料を優先する。",
            "必要に応じて日本語と英語の両方で検索し、更新日・公開日・版を確認する。",
            "信頼性の低いまとめサイト、出所不明コンテンツ、広告目的のページを除外し、理由を検索ログに残す。",
            "_working/search_logs/{{slug}}_search_log.md に query, language, result used, notes を記録する。",
        ],
        "must_not": ["読んでいないソースを採用する", "URL を捏造する", "最新性が重要なテーマを記憶だけで扱う"],
    },
    "ebe-historical-source-discovery": {
        "title": "EBE Historical Source Discovery",
        "description": "Find historical, classical, and landmark sources for EBE articles, including origin texts, older theories, turning points, historiography, and shifts from older to current understanding.",
        "role": "古典的理解、歴史的変遷、旧説、転換点を調べ、歴史セクションの材料を作る。",
        "inputs": ["topic", "modern source set", "domain profile"],
        "outputs": ["historical source candidates", "landmark source notes", "old-vs-current comparison"],
        "workflow": [
            "概念の初出に近い資料、古典論文、古典的教科書、歴史的転換点の文献、研究史・制度史・技術史・思想史を探す。",
            "古い理解と現在の理解の違いを claim 単位で整理する。",
            "旧説が現在どう扱われているかを、現代ソースと照合して確認する。",
            "landmark source を source registry に渡し、歴史セクションの drafting notes を作る。",
        ],
        "must_not": ["古典資料だけで現在の標準的理解を断定する", "歴史的文脈を現在の基準だけで単純化する"],
    },
    "ebe-osint-verifier": {
        "title": "EBE OSINT Verifier",
        "description": "Verify who, when, where, provenance, media, public-information, and OSINT claims for EBE while enforcing privacy, legality, harm minimization, and chain-of-custody constraints.",
        "role": "Who / When / Where / 情報検証 / メディア / OSINT 系 claim を検証する。",
        "inputs": ["OSINT-related claims", "candidate sources", "media metadata when available"],
        "outputs": ["verification notes", "ethical risk notes", "chain-of-custody summary"],
        "workflow": [
            "provenance, source identity, date, location, archive, metadata, chain of custody, manipulation risk, ethical risk を確認する。",
            "アーカイブ URL、取得日時、元ソースと転載の関係を記録する。",
            "公開情報倫理、プライバシー、危害最小化を優先する。",
            "危害リスクが高い claim は publish しないか、抽象化・削除する。",
        ],
        "must_not": ["非公開情報の取得", "違法アクセス", "ドキシング", "個人への危害につながる調査", "ストーキング的調査"],
    },
    "ebe-source-appraiser": {
        "title": "EBE Source Appraiser",
        "description": "Appraise EBE sources by authority, directness, method quality, transparency, recency, historical importance, independence, conflicts of interest, reproducibility, and limitations.",
        "role": "候補ソースの信頼性を評価し、claim に使える強度と限界を明確にする。",
        "inputs": ["candidate sources", "domain profile", "claim candidates"],
        "outputs": ["source appraisal table", "reliability assessment", "limitations"],
        "workflow": [
            "authority, directness, method_quality, transparency, recency, historical_importance, independence, conflict_of_interest, reproducibility を 0-5 で評価する。",
            "医学・法務・数学・技術・人文学・OSINTなど、分野別の評価軸を domain profile に合わせる。",
            "主要根拠にできるソース、補助的にしか使えないソース、除外するソースを分ける。",
            "限界と適用範囲を claim extractor に渡す。",
        ],
        "must_not": ["権威だけで直接性や方法の弱さを隠す", "利益相反を無視する"],
    },
    "ebe-source-registry-manager": {
        "title": "EBE Source Registry Manager",
        "description": "Maintain URL-backed EBE source registries, stable source IDs, reference numbers, accessed dates, source notes, and synchronization between article references and source files.",
        "role": "すべての使用ソースを整理し、source_id と reference_number を管理する。",
        "inputs": ["appraised sources", "existing source registry", "article slug"],
        "outputs": ["_working/source_registries/{{slug}}_source_registry.yml", "30_Sources source notes", "numbered reference list"],
        "workflow": [
            "source_id を SRC-0001 形式で付け、本文 reference_number と対応させる。",
            "title, authors_or_organization, source_type, url, publication_date, updated_date, accessed_date, language, reliability_assessment, limitations, used_for_claims を記録する。",
            "URL のない資料は主要根拠として使わず、必要なら公式カタログ・DOI・図書館・デジタルアーカイブ URL を探す。",
            "更新時は既存 reference number を可能な限り維持し、新規ソースは原則末尾に追加する。",
        ],
        "must_not": ["存在しない URL, DOI, 書籍, 論文を作る", "参考ソース一覧と registry を不一致のままにする"],
    },
    "ebe-claim-extractor": {
        "title": "EBE Claim Extractor",
        "description": "Extract source-grounded claims for EBE articles, recording claim IDs, claim types, supporting and contrary sources, confidence, limitations, applicability, and article section candidates.",
        "role": "記事本文を書く前に、ソースから claim table を作る。",
        "inputs": ["source registry", "appraised sources", "question classification"],
        "outputs": ["_working/claim_tables/{{slug}}_claim_table.yml", "claim notes when needed"],
        "workflow": [
            "claim_id, statement, claim_type, question_type, domain_profile, supporting_sources, contrary_sources, confidence, confidence_reason, applicability, limitations, used_in_article を記録する。",
            "source の直接引用ではなく、記事に使える最小主張単位へ整理する。",
            "支持ソースと contrary source を分け、confidence を high, moderate, low, very_low で付ける。",
            "unsupported claim は publish-editor に渡さず、調査不足または削除候補として記録する。",
        ],
        "must_not": ["source にない claim を作る", "相関を因果 claim として抽出する", "数学 claim の条件を省く"],
    },
    "ebe-evidence-synthesizer": {
        "title": "EBE Evidence Synthesizer",
        "description": "Synthesize EBE source registries and claim tables into a coherent, source-grounded argument without adding unsupported claims or hiding uncertainty.",
        "role": "claim table と source registry から記事の中核論旨を合成する。",
        "inputs": ["claim table", "source registry", "domain profile", "question classification"],
        "outputs": ["synthesis notes", "confidence summary", "article thesis candidate"],
        "workflow": [
            "claim を定義、歴史、現代理解、応用、限界へ配置する。",
            "ソース間の一致、不一致、時代差、方法差、適用範囲差を明示する。",
            "reader が理解しやすい順序に並べ、outline architect に渡す。",
            "不確実性・反証・適用条件を主論旨に組み込む。",
        ],
        "must_not": ["source にない主張を追加する", "不確実性を隠す", "反証を無視する"],
    },
    "ebe-contradiction-checker": {
        "title": "EBE Contradiction Checker",
        "description": "Search for and integrate contrary evidence, limitations, reproducibility issues, old-versus-new theory differences, unresolved disputes, and overclaiming risks in EBE articles.",
        "role": "反証・異説・限界を探し、過剰主張を防ぐ。",
        "inputs": ["major claims", "source registry", "historical notes", "modern evidence notes"],
        "outputs": ["contradiction report", "limits section notes", "claims to weaken or remove"],
        "workflow": [
            "主要 claim ごとに反証・批判・異説・再現性問題・適用不可条件を確認する。",
            "古い説と新しい説の差分を確認し、転換点を記録する。",
            "専門家間の見解差や制度差・文脈差を抽出する。",
            "過剰主張は source 追加、弱める、削除、不確実性明示、publish 中止のいずれかへ回す。",
        ],
        "must_not": ["支持ソースだけで記事を閉じる", "限界セクションを形式的な短文で済ませる"],
    },
    "ebe-outline-architect": {
        "title": "EBE Outline Architect",
        "description": "Design textbook-like EBE article outlines with narrative flow, historical context, modern understanding, 5W1H coverage, applications, limitations, summary, and infographic concept slots.",
        "role": "読み物として成立する章立てを作る。",
        "inputs": ["synthesis notes", "claim table", "source registry", "question type"],
        "outputs": ["title candidates", "article outline", "infographic concept list", "section-to-claim map"],
        "workflow": [
            "タイトル案、概要構成、定義、歴史的背景、現在の標準的理解、What/Why/How/Who、応用、限界、まとめを設計する。",
            "記事の主題に応じて節名は調整してよいが、必須節を落とさない。",
            "主要 claim と参照番号がどの節で使われるかを対応させる。",
            "単なる箇条書きではなく、導入から結論までの流れを作る。",
        ],
        "must_not": ["本文で使う claim を outline で追加創作する", "歴史や限界を後付けの飾りにする"],
    },
    "ebe-research-drafter": {
        "title": "EBE Research Drafter",
        "description": "Create internal EBE evidence packets, source registries, claim tables, and provisional drafts from research; drafts are never final publish outputs.",
        "role": "調査結果をもとに、内部 draft と evidence packet を作る。",
        "inputs": ["outline", "source registry", "claim table", "synthesis notes", "contradiction report"],
        "outputs": ["20_EvidencePackets/{{slug}}_evidence_packet.md", "_working/evidence_packets/{{slug}}_evidence_packet.md", "_working/source_registries/{{slug}}_source_registry.yml", "_working/claim_tables/{{slug}}_claim_table.yml", "_working/drafts/{{slug}}_provisional_draft.md"],
        "workflow": [
            "evidence packet に original question, article goal, domain profile, category/subfield candidate, source summary, claim table, historical notes, modern evidence notes, contradictions, drafting notes を入れる。",
            "provisional draft は publish ではなく、publish-editor に渡す内部成果物として保存する。",
            "draft 内の主要 claim には仮の引用番号を入れ、unsupported claim は明示して publish-editor に渡さない。",
            "十分なソースがない場合は _working/research_insufficient に不足レポートを作る。",
        ],
        "must_not": ["draft を 10_Published に置く", "draft: false にする", "調査不足を隠して次工程へ進める"],
    },
    "ebe-textbook-style-writer": {
        "title": "EBE Textbook Style Writer",
        "description": "Rewrite EBE drafts into Japanese textbook, reference-book, review, or monograph-like prose while preserving source grounding, citations, uncertainty, and domain-specific notation.",
        "role": "draft を教科書・参考書・成書的な読み物に整える。",
        "inputs": ["provisional draft", "outline", "claim table", "source registry", "domain profile"],
        "outputs": ["polished article body candidate", "style notes"],
        "workflow": [
            "日本語として自然で体系的、段階的、読み応えのある文章にする。",
            "導入から結論まで流れを作り、単なる箇条書きで終わらせない。",
            "根拠のない断定を避け、重要概念は定義・範囲・隣接概念との差分を丁寧に説明する。",
            "claim と引用番号の対応を崩さず、publish-editor に渡す。",
        ],
        "must_not": ["軽いブログ調に寄せすぎる", "読みやすさのために根拠や限界を省く"],
    },
    "ebe-infographic-brief-maker": {
        "title": "EBE Infographic Brief Maker",
        "description": "Create a source-grounded Japanese infographic brief for EBE articles before image generation, using only article claims and cited source-backed concepts.",
        "role": "imagegen 用の図解設計書を作る。",
        "inputs": ["claim table", "source registry", "article outline", "main concepts"],
        "outputs": ["_working/infographic_briefs/{{slug}}_brief.md"],
        "workflow": [
            "title, purpose, main_concepts, relationships, must_include_labels, must_not_include, style, source_basis を YAML 風に整理する。",
            "図解に入れる概念は本文の主要 claim と参考ソースに対応させる。",
            "日本語ラベル、教科書的トーン、clean infographic、educated general reader 向けにする。",
            "画像キャプションで使う引用番号候補を記録する。",
        ],
        "must_not": ["ソースにない概念を図解に入れる", "本文にない claim を図解に入れる", "誇張した因果矢印を入れる"],
    },
    "ebe-imagegen-infographic": {
        "title": "EBE Imagegen Infographic",
        "description": "Generate and verify Japanese top-of-article EBE infographics from infographic briefs using the default imagegen skill; block publishing when image generation is unavailable or text is unreadable.",
        "role": "infographic brief をもとに、デフォルトの imagegen skill で日本語インフォグラフィックを生成する。",
        "inputs": ["_working/infographic_briefs/{{slug}}_brief.md", "article title", "source-backed concept list"],
        "outputs": ["50_Assets/Infographics/{{slug}}_infographic.png", "image verification notes"],
        "workflow": [
            "imagegen skill を使って 1 枚の日本語インフォグラフィックを生成する。",
            "画像は 50_Assets/Infographics に保存し、記事では Obsidian 形式 ![[...]] で参照する。",
            "日本語が読めるか、主要概念が本文と一致するか、ソース未確認概念がないか、複雑すぎないかを確認する。",
            "imagegen が使えない場合は publish を停止し、brief と prompt を _working/infographic_briefs に保存する。",
        ],
        "must_not": ["図解なしの記事を publish する", "読めない日本語を通す", "画像内で未確認主張を追加する"],
    },
    "ebe-publish-editor": {
        "title": "EBE Publish Editor",
        "description": "Convert EBE drafts into publish-ready Obsidian Markdown articles with frontmatter, citations, references, historical context, modern understanding, limitations, infographic, update history, and publish gates.",
        "role": "draft を publish-ready な最終記事に改稿する。",
        "inputs": ["polished body candidate", "infographic path", "source registry", "claim table", "category/subfield path"],
        "outputs": ["publish-ready article markdown candidate", "frontmatter", "reference list"],
        "workflow": [
            "frontmatter に project, title, status: published, draft: false, publish_ready: true, review_status, article_type, created, updated, last_verified, freshness_ttl, question, question_type, claim_types, category, subfield, confidence, infographic, source_count, claim_count, tags を入れる。",
            "本文先頭にタイトル、インフォグラフィック、引用番号付きキャプションを置く。",
            "概要、要点、定義、歴史的背景、現在の標準的理解、詳説、応用、限界、まとめ、参考ソース、更新履歴、更新日時を整える。",
            "主要 claim に引用番号を付け、参考ソースを番号と URL と Accessed date 付きで整える。",
            "publish gate を通らない場合は 10_Published に出さない。",
        ],
        "must_not": ["status: draft の記事を publish する", "参考ソース URL なしで主要 claim を支える", "更新履歴を省く"],
    },
    "ebe-citation-auditor": {
        "title": "EBE Citation Auditor",
        "description": "Audit EBE article citations, numbered references, URL presence, claim-source correspondence, duplicate references, infographic captions, and write citation audit logs before publishing.",
        "role": "引用の整合性を監査する。",
        "inputs": ["article markdown candidate", "source registry", "claim table"],
        "outputs": ["70_Logs/citation_audit_logs/{{slug}}_{{date}}.md", "pass/fail result", "fix list"],
        "workflow": [
            "本文中の引用番号が参考ソース一覧に存在するか確認する。",
            "参考ソース一覧の番号が本文に使われているか確認する。",
            "全参考ソースに URL と Accessed date があるか確認する。",
            "claim と source の対応、重複、画像キャプションの引用番号を確認する。",
            "失敗時は publish を止め、修正可能なら publish-editor または source-registry-manager へ戻す。",
        ],
        "must_not": ["URL 捏造を見逃す", "キャプションの無引用を通す"],
    },
    "ebe-obsidian-publisher": {
        "title": "EBE Obsidian Publisher",
        "description": "Save publish-ready EBE articles into Obsidian subfield directories, preserve backlinks, use Obsidian image links, update MOCs, and log published paths without bypassing quality gates.",
        "role": "最終記事を Obsidian Vault に保存する。",
        "inputs": ["publish-ready article", "category path", "subfield path", "MOC update plan", "quality audit result"],
        "outputs": ["10_Published/{{category}}/{{subfield}}/{{title}}__{{slug}}.md", "updated MOCs", "publish log"],
        "workflow": [
            "quality-auditor pass を確認してから保存する。",
            "記事を小分野ディレクトリに保存し、大分野直下には置かない。",
            "画像リンクは ![[50_Assets/Infographics/{{slug}}_infographic.png]] 形式にする。",
            "小分野 MOC、大分野 MOC、60_MOCs/MOC - All Published.md、MOC - Recently Updated.md を更新する。",
            "保存後に記事パスをログへ記録する。",
        ],
        "must_not": ["gate 失敗記事を保存する", "既存記事を無断上書きする", "broken link を残す"],
    },
    "ebe-refresh-monitor": {
        "title": "EBE Refresh Monitor",
        "description": "Detect EBE articles needing updates from updated, last_verified, freshness_ttl, domain volatility, and create update jobs for stale or rapidly changing topics.",
        "role": "記事の更新必要性を監視する。",
        "inputs": ["10_Published article frontmatter", "config/update_policy.yml"],
        "outputs": ["_working/update_jobs/{{slug}}_update_job.yml", "stale article list"],
        "workflow": [
            "updated, last_verified, freshness_ttl を読む。",
            "rapidly_changing 7d, software_ai_tools 30d, law_policy 30d, medical_guideline 90d, business_market 30d, scientific_review 180d, history_humanities 365d, mathematics_foundational none を基準に期限切れを判定する。",
            "更新が必要な記事について update job を作り、更新理由と必要調査を記録する。",
            "必要に応じて taxonomy review も推奨する。",
        ],
        "must_not": ["TTL none の基礎数学記事を無意味に期限切れ扱いする", "更新理由なしで本文を変更する"],
    },
    "ebe-update-writer": {
        "title": "EBE Update Writer",
        "description": "Update existing EBE published articles with new sources, revised claims, changed confidence, historical additions, refreshed infographics, references, timestamps, and update history entries.",
        "role": "新情報を反映して記事を更新する。",
        "inputs": ["existing article", "existing source registry", "new sources", "new claim table", "update job"],
        "outputs": ["updated article candidate", "updated source registry", "update summary"],
        "workflow": [
            "既存記事と source registry を読み、新ソースと既存 claim を比較する。",
            "古典・歴史セクションの更新も必要なら確認する。",
            "本文、参考ソース、引用番号、confidence、図解の要否を更新する。",
            "更新履歴に日時、追加ソース、更新節、confidence 変更、図解更新の有無を書く。",
            "更新日時と last_verified を更新する。",
        ],
        "must_not": ["既存 reference number を不要に崩す", "更新内容を履歴に書かない", "古い claim を無言で消す"],
    },
    "ebe-update-diff-logger": {
        "title": "EBE Update Diff Logger",
        "description": "Write EBE update diff logs with update reasons, added or demoted sources, changed claims, confidence changes, updated sections, infographic updates, and MOC updates.",
        "role": "更新差分を記録する。",
        "inputs": ["old article", "new article", "source registry diff", "claim diff", "update writer summary"],
        "outputs": ["70_Logs/update_logs/{{slug}}_{{date}}.md"],
        "workflow": [
            "更新日時、更新理由、追加ソース、削除・降格ソース、変更 claim、confidence 変更、更新節、図解更新の有無、MOC 更新の有無を書く。",
            "大幅改稿で参考ソース番号を再整理した場合は明記する。",
            "後から監査できるよう、ファイルパスと変更前後の要約を残す。",
        ],
        "must_not": ["本文だけ変更してログを残さない", "confidence 変更を隠す"],
    },
    "ebe-taxonomy-curator": {
        "title": "EBE Taxonomy Curator",
        "description": "Audit and reorganize accumulated EBE articles, source notes, claim notes, subfields, category MOCs, and global MOCs safely, preserving files, links, aliases, and taxonomy logs.",
        "role": "既存知見・記事・source note・claim note・MOC を精査し、小分野や MOC を再整備する。",
        "inputs": ["10_Published tree", "article frontmatter", "category MOCs", "subfield MOCs", "30_Sources", "40_Claims"],
        "outputs": ["reorganized taxonomy", "updated MOCs", "70_Logs/taxonomy_logs taxonomy update log"],
        "workflow": [
            "全 published article frontmatter、大分野 MOC、小分野 MOC を読む。",
            "必要に応じて source note と claim note を読み、トピック・claim・参照ソース・読者導線でクラスタリングする。",
            "肥大化、過疎、重複、曖昧な小分野を検出する。",
            "分割・統合・改名・移動を安全に提案し、実行時は wikilink と Markdown link を更新する。",
            "古い小分野 MOC は _archive/old_mocs に保存し、taxonomy log に変更前後と理由を書く。",
        ],
        "must_not": ["記事を削除する", "ログなしに分類変更する", "破損リンクを残す", "既存MOCを無断消去する"],
    },
    "ebe-latex-code-specialist": {
        "title": "EBE LaTeX Code Specialist",
        "description": "Review and improve mathematics, engineering, software, and AI sections in EBE articles: LaTeX, proofs, pseudocode, code fences, specs, tests, benchmarks, and technical source grounding.",
        "role": "数学・工学・ソフトウェア記事で LaTeX、コード、擬似コード、仕様表を整える。",
        "inputs": ["technical article sections", "claim table", "source registry", "code snippets when present"],
        "outputs": ["corrected technical sections", "test notes", "technical citation notes"],
        "workflow": [
            "数式記法、定義、命題、定理、補題、証明、証明スケッチ、反例を確認する。",
            "コードブロックには言語指定を付け、実行可能コードは可能な範囲でテストする。",
            "擬似コード、仕様表、API 使用例、設計トレードオフを明確にする。",
            "技術 claim に公式仕様、ドキュメント、論文、ベンチマーク、実験ログなどの根拠を付ける。",
        ],
        "must_not": ["未検証コードを動作確認済みと書く", "数式の条件を省く", "仕様にない挙動を断定する"],
    },
    "ebe-quality-auditor": {
        "title": "EBE Quality Auditor",
        "description": "Run the final EBE publish gate for grounding, citations, infographic, historical context, modernity, readability, domain-specific requirements, MOCs, update metadata, and block failed articles.",
        "role": "publish 直前の最終品質監査を行う。",
        "inputs": ["publish-ready candidate", "source registry", "claim table", "citation audit", "MOC status", "infographic status"],
        "outputs": ["pass/fail quality report", "_working/review_reports/{{slug}}_quality_report.md"],
        "workflow": [
            "grounding_gate, citation_gate, infographic_gate, historical_gate, modernity_gate, readability_gate, domain_specific_gate, moc_gate, update_gate を確認する。",
            "失敗時は 10_Published に出さず、失敗理由と修正先 skill を review report に書く。",
            "修正可能なら該当 skill に戻し、修正不能なら research_insufficient report を作る。",
            "pass 時のみ obsidian publisher に渡す。",
        ],
        "must_not": ["形式だけ見て claim-source 対応を確認しない", "図解なしを許す", "MOC 未更新を通す"],
    },
}


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def normalize_template(content: str) -> str:
    normalized = dedent(content).strip("\n") + "\n"
    for _ in range(8):
        lines = normalized.splitlines()
        first = next((line for line in lines if line.strip()), "")
        indent = len(first) - len(first.lstrip(" "))
        if indent <= 0:
            break
        prefix = " " * indent
        normalized = "\n".join(line[indent:] if line.startswith(prefix) else line for line in lines) + "\n"
    return normalized


def safe_write(path: Path, content: str, created: list[str], preserved: list[str]) -> None:
    ensure_dir(path.parent)
    normalized = normalize_template(content)
    if path.exists():
        if OVERWRITE_GENERATED:
            path.write_text(normalized, encoding="utf-8", newline="\n")
            created.append(str(path.relative_to(ROOT)) + " (updated)")
            return
        if path.read_text(encoding="utf-8", errors="ignore") == normalized:
            preserved.append(str(path.relative_to(ROOT)) + " (unchanged)")
            return
        preserved.append(str(path.relative_to(ROOT)) + " (existing preserved)")
        report_dir = ROOT / "_working" / "migration_reports"
        ensure_dir(report_dir)
        report = report_dir / f"{STAMP}_preserved_existing_file.md"
        with report.open("a", encoding="utf-8") as fh:
            fh.write(f"- Preserved existing file, did not overwrite: {path.relative_to(ROOT)}\n")
        return
    path.write_text(normalized, encoding="utf-8", newline="\n")
    created.append(str(path.relative_to(ROOT)))


def touch_gitkeep(path: Path, created: list[str]) -> None:
    ensure_dir(path)
    gitkeep = path / ".gitkeep"
    if not gitkeep.exists():
        gitkeep.write_text("", encoding="utf-8")
        created.append(str(gitkeep.relative_to(ROOT)))


def frontmatter(**items: str) -> str:
    lines = ["---"]
    for key, value in items.items():
        lines.append(f'{key}: "{value}"')
    lines.append("---")
    return "\n".join(lines)


def category_moc(cat: dict[str, str]) -> str:
    return f"""
    ---
    project: Evidence Based Everything
    type: moc
    moc_level: category
    status: published
    draft: false
    category_id: "{cat['id']}"
    category_name: "{cat['label_ja']}"
    updated: "{DATETIME}"
    ---

    # MOC - {cat['label_ja']}

    ## この大分野の範囲

    {cat['scope']}

    ## 小分野

    初期状態では小分野ディレクトリを作成しない。記事作成時に `ebe-category-subfield-moc-manager` が必要な小分野を作成し、ここに追加する。

    ## 主要記事

    まだ記事は登録されていない。

    ## 最近更新された記事

    まだ記事は登録されていない。

    ## 関連する大分野

    {cat['related']}

    ## 分類ログ

    - {DATETIME}: 初期 MOC を作成。小分野は未作成。
    """


def index_docs() -> dict[str, str]:
    skill_lines = "\n".join([f"- [[../.agents/skills/{name}/SKILL|{name}]]" for name in SKILL_ORDER])
    category_lines = "\n".join([f"- [[../10_Published/{c['directory']}/_MOC|{c['label_ja']}]]" for c in CATEGORIES])
    return {
        "00_Index/EBE - Home.md": f"""
        {frontmatter(project="Evidence Based Everything", type="home", status="published", draft="false", updated=DATETIME)}

        # Evidence Based Everything - Home

        Evidence Based Everything（EBE）は、あらゆる問いを Evidence-Based に扱い、医学的 EBM の思想を全学問・実務・ライフワーク・OSINT・創作・技術・人文学へ拡張するための Obsidian 向け知識編纂システムである。

        EBE の成果物は単なるメモではない。`10_Published/` に置く記事は、教科書・参考書・信頼できるレビュー・成書として読める publish-ready Markdown とする。

        ## 入口

        - [[EBE - Global MOC]]
        - [[EBE - Skill Map]]
        - [[EBE - Style Guide]]
        - [[EBE - Citation Policy]]
        - [[EBE - Source Policy]]
        - [[EBE - Infographic Policy]]
        - [[EBE - Update Policy]]
        - [[EBE - Taxonomy Policy]]
        - [[EBE - Confidence Scale]]

        ## Published 大分野

        {category_lines}

        ## 絶対原則

        - Grounding First: 意味内容を持つ主張はソースに接続する。
        - Publish Quality Only: `10_Published/` には publish-ready の記事だけを置く。
        - Infographic First: publish 記事先頭には日本語インフォグラフィックを置く。
        - Citation Required: 本文引用番号と URL 付き参考ソースを必須とする。
        - Updateable Knowledge: 更新日時と更新履歴を必須とする。
        """,
        "00_Index/EBE - Global MOC.md": f"""
        {frontmatter(project="Evidence Based Everything", type="moc", moc_level="global", status="published", draft="false", updated=DATETIME)}

        # EBE - Global MOC

        ## 10 大分野

        {category_lines}

        ## 横断 MOC

        - [[../60_MOCs/MOC - All Published]]
        - [[../60_MOCs/MOC - All Sources]]
        - [[../60_MOCs/MOC - All Claims]]
        - [[../60_MOCs/MOC - Recently Updated]]

        ## 運用ポリシー

        - [[EBE - Source Policy]]
        - [[EBE - Citation Policy]]
        - [[EBE - Infographic Policy]]
        - [[EBE - Update Policy]]
        - [[EBE - Taxonomy Policy]]
        - [[EBE - Confidence Scale]]

        ## 未整備の論点

        記事作成や taxonomy review の過程で、今後作るべき中核記事をここに追加する。
        """,
        "00_Index/EBE - Style Guide.md": f"""
        {frontmatter(project="Evidence Based Everything", type="policy", status="published", draft="false", updated=DATETIME)}

        # EBE - Style Guide

        ## 文体

        EBE の publish 記事は、教科書・参考書・信頼できるレビュー・成書として読める日本語で書く。単なる要約、薄い箇条書き、検索結果の寄せ集め、断片メモにしてはならない。

        ## 必須構造

        - タイトル
        - 日本語インフォグラフィック
        - 引用番号付きキャプション
        - 概要
        - この記事の要点
        - 定義と全体像
        - 歴史的背景・古典的理解
        - 現在の標準的理解
        - What / Why / How / Who を含む詳説
        - 応用・実践上の含意
        - 限界・論争点・未解決事項
        - まとめ
        - 参考ソース
        - 更新履歴
        - 更新日時

        ## 分野別記法

        数学・論理では LaTeX、定義、定理、証明、反例を適切に使う。工学・ソフトウェア・AI では言語指定付きコードブロック、擬似コード、仕様表、再現手順、ベンチマーク比較を使う。医学・法律・OSINT では適用条件、限界、安全性、法域、倫理を明示する。
        """,
        "00_Index/EBE - Citation Policy.md": f"""
        {frontmatter(project="Evidence Based Everything", type="policy", status="published", draft="false", updated=DATETIME)}

        # EBE - Citation Policy

        ## 本文引用

        本文中の根拠箇所には番号形式の引用を付ける。

        ```markdown
        睡眠不足は注意機能や実行機能に影響することが報告されている [1][2]。
        ```

        ## 参考ソース形式

        ```markdown
        ## 参考ソース

        1. 著者または組織名. タイトル. 公開年または更新日. URL: https://example.com. Accessed: YYYY-MM-DD.
        ```

        ## 必須条件

        - 参考ソースには原則 URL を付ける。
        - 書籍でも出版社ページ、DOI、WorldCat、Google Books、大学出版会、学会ページなど安定 URL を探す。
        - URL のない資料は主要根拠にしない。
        - 本文引用番号と参考ソース一覧は一致させる。
        - 更新時は既存番号を可能な限り維持し、新規ソースを末尾へ追加する。
        - 大幅改稿で再番号付けする場合は更新履歴に明記する。
        """,
        "00_Index/EBE - Source Policy.md": f"""
        {frontmatter(project="Evidence Based Everything", type="policy", status="published", draft="false", updated=DATETIME)}

        # EBE - Source Policy

        ## Grounding First

        事実主張、歴史的主張、因果主張、方法論的主張、制度的主張、人物・組織に関する主張、技術仕様に関する主張、数学・工学・医学・法学・歴史・OSINT に関する主張は、必ずソースに基づける。

        ## 最新ソース探索

        優先順位は、公式文書、最新ガイドライン、最新レビュー、システマティックレビュー、標準教科書・成書、学会・政府・標準化団体資料、査読論文、技術仕様、一次資料、権威ある解説とする。

        ## 歴史・古典ソース探索

        初出に近い資料、古典論文、古典的教科書、歴史的転換点の文献、過去の標準説、旧理論、研究史、技術史、制度史、思想史を探す。

        ## 反証・異説探索

        支持ソースだけでなく、反証、批判、異説、限界、再現性問題、古い説の修正、適用できない条件、誤用例、論争点を探す。

        ## 禁止

        ソースなしの断定、記憶だけの説明、未確認 URL・DOI・論文・書籍・判例の捏造、読んでいないソースの使用を禁止する。
        """,
        "00_Index/EBE - Infographic Policy.md": f"""
        {frontmatter(project="Evidence Based Everything", type="policy", status="published", draft="false", updated=DATETIME)}

        # EBE - Infographic Policy

        ## 必須条件

        すべての publish 記事は、記事先頭に日本語インフォグラフィックを 1 枚置く。画像は `50_Assets/Infographics/` に保存する。

        ## 生成手順

        1. `ebe-infographic-brief-maker` が source-backed brief を作る。
        2. `ebe-imagegen-infographic` がデフォルトの `imagegen` skill を使って画像を生成する。
        3. 日本語の可読性、本文 claim との一致、未確認概念の混入、複雑さを確認する。
        4. 文字化け・誤字・未確認 claim があれば再生成する。

        ## 図解に含めるもの

        主要概念、概念間の関係、歴史から現在への流れ、実践への接続、限界や注意点。

        ## 図解に含めないもの

        ソースにない主張、本文にない claim、誇張表現、未確認の因果関係、存在しない分類、読者を誤導する矢印、過度に細かい情報。

        ## imagegen 不可時

        imagegen skill が利用不能な場合は publish 直前で停止し、`_working/infographic_briefs/` に prompt と図解設計書を保存する。図解なしの記事を publish してはならない。
        """,
        "00_Index/EBE - Update Policy.md": f"""
        {frontmatter(project="Evidence Based Everything", type="policy", status="published", draft="false", updated=DATETIME)}

        # EBE - Update Policy

        ## 必須

        publish 記事は `updated`, `last_verified`, `freshness_ttl`, `更新履歴`, `更新日時` を持つ。

        ## TTL

        - rapidly_changing: 7d
        - software_ai_tools: 30d
        - law_policy: 30d
        - medical_guideline: 90d
        - business_market: 30d
        - scientific_review: 180d
        - history_humanities: 365d
        - mathematics_foundational: none

        ## 更新時に行うこと

        既存記事、既存 source registry、新ソース、古典・歴史セクション、既存 claim と新 claim、参考ソース番号、図解更新要否、MOC 更新要否を確認する。

        ## 更新履歴形式

        ```markdown
        - 2026-05-01 21:30 JST: 初版公開。主要ソース [1][2][3] に基づいて作成。
        - 2026-06-10 09:15 JST: 新しいレビュー [8] を追加し、「現在の標準的理解」と「限界」の節を更新。C-0004 の confidence を moderate から low に変更。
        ```
        """,
        "00_Index/EBE - Taxonomy Policy.md": f"""
        {frontmatter(project="Evidence Based Everything", type="policy", status="published", draft="false", updated=DATETIME)}

        # EBE - Taxonomy Policy

        ## 初期状態

        `10_Published/` 直下には 10 の大分野だけを作成する。小分野ディレクトリは初期状態では作成しない。

        ## 小分野作成

        記事作成時、`ebe-category-subfield-moc-manager` は主題、問い、claim table、domain profile を読み、primary category を 1 つ選ぶ。既存小分野が適切なら使い、なければ `{{日本語小分野名}}__{{english-slug}}/` 形式で作成する。

        ## 記事配置

        記事ファイルは `{{日本語タイトル}}__{{english-slug}}.md` 形式で、小分野ディレクトリ内に置く。大分野直下に記事を直接置かない。

        ## MOC 更新

        publish または更新時は、小分野 MOC、大分野 MOC、`60_MOCs/MOC - All Published.md`、必要に応じて `MOC - Recently Updated.md` を更新する。

        ## 再整備

        `ebe-taxonomy-curator` は既存記事・source note・claim note・MOC を精査し、肥大化、過疎、重複、曖昧な小分野を分割・統合・改名・移動する。記事は削除せず、古い MOC は `_archive/old_mocs/` に保存し、`70_Logs/taxonomy_logs/` に理由と変更前後を残す。
        """,
        "00_Index/EBE - Confidence Scale.md": f"""
        {frontmatter(project="Evidence Based Everything", type="policy", status="published", draft="false", updated=DATETIME)}

        # EBE - Confidence Scale

        ## high

        結論が大きく変わる可能性は低い。複数の信頼できるソース、直接性の高さ、反証や限界の確認、対象文脈への適用可能性が必要。

        ## moderate

        結論は妥当だが、条件や新情報により修正され得る。信頼できるソースがあり、一部に限界があり、適用範囲に注意が必要。

        ## low

        暫定的な理解として扱うべき。ソースが限定的、間接的根拠が多い、反証や異説が十分に整理されていない。

        ## very_low

        断定不可。単一ソース、出所不明、未検証、重要な矛盾が未解決。

        ## 運用

        confidence は frontmatter、claim table、本文の限界説明に反映する。
        """,
        "00_Index/EBE - Skill Map.md": f"""
        {frontmatter(project="Evidence Based Everything", type="skill_map", status="published", draft="false", updated=DATETIME)}

        # EBE - Skill Map

        ## Article Creation Workflow

        ```text
        User question
          -> ebe-orchestrator
          -> ebe-question-classifier
          -> ebe-domain-profile-selector
          -> ebe-modern-source-discovery
          -> ebe-historical-source-discovery
          -> ebe-osint-verifier (必要な場合)
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

        ## Update Workflow

        ```text
        refresh request or freshness_ttl expiration
          -> ebe-refresh-monitor
          -> ebe-modern-source-discovery
          -> ebe-historical-source-discovery (必要な場合)
          -> ebe-source-appraiser
          -> ebe-source-registry-manager
          -> ebe-claim-extractor
          -> ebe-contradiction-checker
          -> ebe-update-writer
          -> ebe-infographic-brief-maker (必要な場合)
          -> ebe-imagegen-infographic (必要な場合)
          -> ebe-citation-auditor
          -> ebe-quality-auditor
          -> ebe-obsidian-publisher
          -> ebe-update-diff-logger
        ```

        ## Taxonomy Reorganization Workflow

        ```text
        taxonomy review request
          -> ebe-taxonomy-curator
          -> read published article frontmatter and MOCs
          -> cluster articles by theme, claim, source, reader path
          -> apply safe reorganization
          -> update links, MOCs, and taxonomy logs
          -> run quality audit for broken links
        ```

        ## Skills

        {skill_lines}
        """,
    }


def config_docs() -> dict[str, str]:
    categories_yaml = "\n".join(
        [
            f'  - id: "{c["id"]}"\n    directory: "{c["directory"]}"\n    label_ja: "{c["label_ja"]}"'
            for c in CATEGORIES
        ]
    )
    return {
        "config/ebe.config.yml": f"""
        project:
          name: Evidence Based Everything
          abbreviation: EBE
          language: ja
          timezone: Asia/Tokyo
          default_article_status: published
          default_draft_flag: false

        output:
          format: obsidian_markdown
          article_quality: textbook_reference_review
          citation_style: numbered_urls
          require_infographic: true
          infographic_language: Japanese
          require_update_history: true
          require_updated_at: true
          require_historical_context: true
          require_modern_sources: true
          prohibit_ungrounded_claims: true

        published_categories:
        {categories_yaml}

        subfields:
          create_initially: false
          create_on_article_publish: true
          directory_pattern: "{{{{ja_name}}}}__{{{{english_slug}}}}"
          require_subfield_moc: true
          update_parent_moc: true
          update_global_moc: true

        references:
          require_numbered_references: true
          require_urls: true
          require_accessed_date: true
          require_inline_reference_numbers: true
          allow_uncited_key_claims: false

        infographics:
          enabled: true
          generation_skill: imagegen
          required_position: top_after_title
          storage_directory: 50_Assets/Infographics
          require_brief: true
          require_caption_with_citations: true
          regenerate_if_text_unreadable: true

        updates:
          require_updated_at: true
          require_update_history: true
          preserve_reference_numbers_when_possible: true
          append_new_references_when_possible: true
          log_update_diffs: true

        quality_gates:
          grounding_gate: true
          citation_gate: true
          infographic_gate: true
          historical_gate: true
          modernity_gate: true
          readability_gate: true
          domain_specific_gate: true
          moc_gate: true
          update_gate: true
        """,
        "config/domain_profiles.yml": """
        domain_profiles:
          biomedical_health:
            evidence_focus: [guideline, systematic_review, randomized_trial, observational_study, clinical_context]
            cautions: [no_individual_medical_advice, distinguish_intervention_from_observation, state_applicability]
          mind_education:
            evidence_focus: [meta_analysis, experiment, longitudinal_study, educational_research, individual_difference]
            cautions: [avoid_overgeneralizing, state_population_and_context, note_cultural_difference]
          law_policy:
            evidence_focus: [primary_law, case_law, regulation, official_guidance, jurisdiction]
            cautions: [state_jurisdiction, state_effective_date, no_legal_advice]
          economy_business:
            evidence_focus: [official_statistics, company_filings, economic_data, industry_report, empirical_study]
            cautions: [state_period, separate_data_from_interpretation, disclose_conflicts]
          natural_science:
            evidence_focus: [experiment, observation, theory, review, measurement]
            cautions: [state_measurement_limits, distinguish_model_from_observation, discuss_reproducibility]
          mathematics_formal:
            evidence_focus: [definition, theorem, proof, counterexample, standard_textbook]
            cautions: [state_assumptions, define_notation, avoid_informal_only_claims]
          technology_engineering:
            evidence_focus: [specification, documentation, benchmark, reproducible_code, design_tradeoff]
            cautions: [state_version, test_when_possible, distinguish_spec_from_implementation]
          humanities_history:
            evidence_focus: [primary_source, source_criticism, monograph, historiography, interpretive_context]
            cautions: [avoid_single_interpretation_as_final, state_translation_limits, identify_source_position]
          osint_information:
            evidence_focus: [provenance, source, date, location, archive, chain_of_custody]
            cautions: [harm_minimization, privacy, no_doxxing, public_information_only]
          life_design_practice:
            evidence_focus: [research_evidence, feasibility, personal_context, values, n_of_1_feedback]
            cautions: [separate_general_evidence_from_personal_choice, encourage_iteration, avoid_universal_prescription]
        """,
        "config/category_profiles.yml": "\n".join(
            [
                f'{c["directory"]}:\n  id: "{c["id"]}"\n  label_ja: "{c["label_ja"]}"\n  scope: "{c["scope"]}"\n  subfields_create_initially: false\n'
                for c in CATEGORIES
            ]
        ),
        "config/citation_policy.yml": """
        citation_policy:
          inline_style: numbered_brackets
          examples: ["[1]", "[1][2]"]
          require_reference_section: true
          require_urls: true
          require_accessed_date: true
          first_publish_numbering: first_appearance_order
          update_numbering: preserve_existing_when_possible
          unsupported_claim_actions:
            - add_source
            - weaken_claim
            - delete_claim
            - mark_uncertain
            - stop_publish_and_write_research_insufficient_report
        """,
        "config/confidence_scale.yml": """
        confidence:
          high:
            meaning: 結論が大きく変わる可能性は低い
            requirements:
              - 複数の信頼できるソース
              - 直接性が高い
              - 反証や限界が確認されている
              - 対象文脈に適用可能
          moderate:
            meaning: 結論は妥当だが、条件や新情報により修正され得る
            requirements:
              - 信頼できるソースがある
              - 一部に限界がある
              - 適用範囲に注意が必要
          low:
            meaning: 暫定的な理解として扱うべき
            requirements:
              - ソースが限定的
              - 間接的根拠が多い
              - 反証や異説が十分に整理されていない
          very_low:
            meaning: 断定不可
            requirements:
              - 単一ソース
              - 出所不明
              - 未検証
              - 重要な矛盾が未解決
        """,
        "config/article_templates.yml": """
        publish_article:
          frontmatter_required:
            - project
            - title
            - status
            - draft
            - publish_ready
            - review_status
            - article_type
            - created
            - updated
            - last_verified
            - freshness_ttl
            - question
            - question_type
            - claim_types
            - category_id
            - category_name
            - category_path
            - subfield_name
            - subfield_path
            - moc
            - domain_profile
            - evidence_standard
            - confidence
            - confidence_reason
            - has_infographic
            - infographic_path
            - source_count
            - claim_count
            - references_style
          body_sections:
            - 概要
            - この記事の要点
            - 定義と全体像
            - 歴史的背景・古典的理解
            - 現在の標準的理解
            - 詳説
            - 応用・実践上の含意
            - 限界・論争点・未解決事項
            - まとめ
            - 参考ソース
            - 更新履歴
            - 更新日時
        """,
        "config/update_policy.yml": """
        ttl:
          rapidly_changing: 7d
          software_ai_tools: 30d
          law_policy: 30d
          medical_guideline: 90d
          business_market: 30d
          scientific_review: 180d
          history_humanities: 365d
          mathematics_foundational: none
        update_rules:
          preserve_reference_numbers_when_possible: true
          append_new_references_when_possible: true
          log_update_diffs: true
          update_infographic_when_core_claims_change: true
        """,
        "config/taxonomy_policy.yml": """
        taxonomy:
          initial_subfields: false
          primary_category_required: true
          secondary_categories_allowed: true
          article_must_be_inside_subfield: true
          subfield_directory_pattern: "{{ja_name}}__{{english_slug}}"
          article_filename_pattern: "{{ja_title}}__{{english_slug}}.md"
          require_subfield_moc: true
          require_category_moc_update: true
          require_global_moc_update: true
          require_taxonomy_log: true
          destructive_changes: forbidden
        """,
        "config/infographic_policy.yml": """
        infographic:
          required: true
          language: Japanese
          generator_skill: imagegen
          brief_skill: ebe-infographic-brief-maker
          generation_skill: ebe-imagegen-infographic
          storage_directory: 50_Assets/Infographics
          article_position: top_after_title
          caption_requires_citations: true
          block_publish_if_missing: true
          allowed_content:
            - major_concepts
            - concept_relationships
            - historical_to_modern_flow
            - practice_connection
            - limits_and_cautions
          forbidden_content:
            - unsupported_claims
            - claims_not_in_article
            - exaggerated_causality
            - non_existing_categories
            - misleading_arrows
        """,
    }


def standard_readmes() -> dict[str, str]:
    return {
        "20_EvidencePackets/README.md": """
        # 20_EvidencePackets

        Publish 記事ごとの evidence packet を保存する。記事生成時には同内容の作業コピーを `_working/evidence_packets/` に置き、公開記事の根拠、claim、限界、歴史的背景、drafting notes を追跡できるようにする。
        """,
        "30_Sources/README.md": """
        # 30_Sources

        EBE で使用した source note を保存する。すべての主要ソースには source_id、reference_number、URL、accessed_date、信頼性評価、限界、used_for_claims を記録する。
        """,
        "40_Claims/README.md": """
        # 40_Claims

        EBE の claim note を保存する。publish 記事の主要 claim は source に接続し、claim_id、claim_type、supporting_sources、contrary_sources、confidence、applicability、limitations を持つ。
        """,
        "50_Assets/README.md": """
        # 50_Assets

        図解、ダイアグラム、添付資料を保存する。publish 記事の冒頭インフォグラフィックは `50_Assets/Infographics/` に置く。
        """,
        "60_MOCs/MOC - All Published.md": f"""
        {frontmatter(project="Evidence Based Everything", type="moc", moc_level="all_published", status="published", draft="false", updated=DATETIME)}

        # MOC - All Published

        ## 大分野

        {chr(10).join([f"- [[../10_Published/{c['directory']}/_MOC|{c['label_ja']}]]" for c in CATEGORIES])}

        ## すべての記事

        まだ publish 記事は登録されていない。記事作成時に `ebe-obsidian-publisher` が更新する。
        """,
        "60_MOCs/MOC - All Sources.md": f"""
        {frontmatter(project="Evidence Based Everything", type="moc", moc_level="all_sources", status="published", draft="false", updated=DATETIME)}

        # MOC - All Sources

        `30_Sources/` に作成された source note を一覧化する。記事作成・更新時に `ebe-source-registry-manager` が更新する。
        """,
        "60_MOCs/MOC - All Claims.md": f"""
        {frontmatter(project="Evidence Based Everything", type="moc", moc_level="all_claims", status="published", draft="false", updated=DATETIME)}

        # MOC - All Claims

        `40_Claims/` に作成された claim note を一覧化する。claim table 作成時に `ebe-claim-extractor` が更新候補を出す。
        """,
        "60_MOCs/MOC - Recently Updated.md": f"""
        {frontmatter(project="Evidence Based Everything", type="moc", moc_level="recently_updated", status="published", draft="false", updated=DATETIME)}

        # MOC - Recently Updated

        最近更新された publish 記事を更新日時順に記録する。記事作成・更新時に `ebe-obsidian-publisher` と `ebe-update-diff-logger` が更新する。
        """,
    }


def skill_markdown(name: str, spec: dict[str, object]) -> str:
    inputs = "\n".join([f"- {x}" for x in spec["inputs"]])
    outputs = "\n".join([f"- {x}" for x in spec["outputs"]])
    workflow = "\n".join([f"{i + 1}. {x}" for i, x in enumerate(spec["workflow"])])
    must_not = "\n".join([f"- {x}" for x in spec["must_not"]])
    common = """
    ## Common EBE Contract

    - Treat EBE as a knowledge compilation system, not a note generator.
    - Never place insufficient work in `10_Published/`.
    - Keep drafts and intermediate artifacts in `_working/`.
    - Ground factual, historical, causal, procedural, institutional, technical, mathematical, legal, medical, and OSINT claims in sources.
    - Preserve numbered citations and URL-backed reference lists.
    - Require a Japanese infographic for every publish article.
    - Require `status: published`, `draft: false`, update history, and updated timestamp for publish output.
    - Respect existing files. Do not delete or move existing articles without a migration or taxonomy log.

    ## Canonical References

    Read only the needed files:

    - `config/ebe.config.yml`
    - `config/domain_profiles.yml`
    - `config/category_profiles.yml`
    - `00_Index/EBE - Source Policy.md`
    - `00_Index/EBE - Citation Policy.md`
    - `00_Index/EBE - Infographic Policy.md`
    - `00_Index/EBE - Taxonomy Policy.md`
    - `00_Index/EBE - Update Policy.md`
    - `00_Index/EBE - Style Guide.md`
    """
    return f"""
    ---
    name: {name}
    description: "{spec['description']}"
    ---

    # {spec['title']}

    ## Role

    {spec['role']}

    ## Inputs

    {inputs}

    ## Outputs

    {outputs}

    ## Workflow

    {workflow}

    ## Must Not

    {must_not}

    {common}
    """


def script_files() -> dict[str, str]:
    return {
        ".agents/skills/ebe-citation-auditor/scripts/audit_article_citations.py": r'''
        from __future__ import annotations

        import re
        import sys
        from pathlib import Path


        def main() -> int:
            if len(sys.argv) != 2:
                print("usage: audit_article_citations.py <article.md>", file=sys.stderr)
                return 2
            path = Path(sys.argv[1])
            text = path.read_text(encoding="utf-8")
            body_cites = {int(n) for n in re.findall(r"\[(\d+)\]", text)}
            ref_match = re.search(r"^## 参考ソース\s*(.*?)(?:^## |\Z)", text, flags=re.S | re.M)
            if not ref_match:
                print("FAIL: missing ## 参考ソース")
                return 1
            refs_block = ref_match.group(1)
            refs = {int(n) for n in re.findall(r"^\s*(\d+)\.\s+", refs_block, flags=re.M)}
            missing_refs = sorted(body_cites - refs)
            unused_refs = sorted(refs - body_cites)
            url_missing = []
            for line in refs_block.splitlines():
                m = re.match(r"\s*(\d+)\.\s+", line)
                if m and "URL:" not in line:
                    url_missing.append(int(m.group(1)))
            if missing_refs or url_missing:
                print(f"FAIL: missing_refs={missing_refs} url_missing={url_missing} unused_refs={unused_refs}")
                return 1
            print(f"PASS: citations={sorted(body_cites)} refs={sorted(refs)} unused_refs={unused_refs}")
            return 0


        if __name__ == "__main__":
            raise SystemExit(main())
        ''',
        ".agents/skills/ebe-refresh-monitor/scripts/list_due_articles.py": r'''
        from __future__ import annotations

        import re
        import sys
        from datetime import datetime, timedelta
        from pathlib import Path


        TTL_DAYS = {
            "7d": 7,
            "30d": 30,
            "90d": 90,
            "180d": 180,
            "365d": 365,
        }


        def parse_frontmatter(text: str) -> dict[str, str]:
            if not text.startswith("---"):
                return {}
            end = text.find("\n---", 3)
            if end == -1:
                return {}
            data = {}
            for line in text[3:end].splitlines():
                if ":" in line:
                    k, v = line.split(":", 1)
                    data[k.strip()] = v.strip().strip('"')
            return data


        def parse_date(value: str) -> datetime | None:
            m = re.search(r"(\d{4}-\d{2}-\d{2})", value or "")
            if not m:
                return None
            return datetime.strptime(m.group(1), "%Y-%m-%d")


        def main() -> int:
            root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("10_Published")
            now = datetime.now()
            due = []
            for path in root.rglob("*.md"):
                if path.name == "_MOC.md":
                    continue
                fm = parse_frontmatter(path.read_text(encoding="utf-8", errors="ignore"))
                ttl = fm.get("freshness_ttl", "")
                if ttl == "none":
                    continue
                days = TTL_DAYS.get(ttl)
                updated = parse_date(fm.get("last_verified") or fm.get("updated", ""))
                if days is None or updated is None:
                    due.append((str(path), "missing ttl/date"))
                elif updated + timedelta(days=days) < now:
                    due.append((str(path), f"expired {ttl}"))
            for path, reason in due:
                print(f"{path}\t{reason}")
            return 0


        if __name__ == "__main__":
            raise SystemExit(main())
        ''',
        ".agents/skills/ebe-category-subfield-moc-manager/scripts/create_subfield_stub.py": r'''
        from __future__ import annotations

        import re
        import sys
        from datetime import datetime
        from pathlib import Path


        def slugify(text: str) -> str:
            text = text.lower()
            text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
            return text or "subfield"


        def main() -> int:
            if len(sys.argv) != 5:
                print("usage: create_subfield_stub.py <category_dir> <ja_name> <english_slug> <scope>", file=sys.stderr)
                return 2
            category_dir, ja_name, english_slug, scope = sys.argv[1:]
            subdir = Path("10_Published") / category_dir / f"{ja_name}__{slugify(english_slug)}"
            subdir.mkdir(parents=True, exist_ok=True)
            moc = subdir / "_MOC.md"
            if not moc.exists():
                now = datetime.now().strftime("%Y-%m-%d %H:%M JST")
                moc.write_text(f"""---
project: Evidence Based Everything
type: moc
moc_level: subfield
status: published
draft: false
category_id: "{category_dir[:2]}"
category_name: "{category_dir}"
subfield_name: "{ja_name}"
updated: "{now}"
---

# MOC - {ja_name}

## この小分野の範囲

{scope}

## 読む順番

まだ記事は登録されていない。

## 教科書的中核記事

## レビュー・総説的記事

## How-to / 実践記事

## 歴史・古典

## 関連 Claims

## 関連 Sources

## 未整備・今後作るべき記事
""", encoding="utf-8", newline="\n")
            (subdir / ".gitkeep").touch()
            print(subdir)
            return 0


        if __name__ == "__main__":
            raise SystemExit(main())
        ''',
        ".agents/skills/ebe-taxonomy-curator/scripts/taxonomy_inventory.py": r'''
        from __future__ import annotations

        import sys
        from pathlib import Path


        def main() -> int:
            root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("10_Published")
            categories = [p for p in root.iterdir() if p.is_dir()]
            for cat in sorted(categories):
                subfields = [p for p in cat.iterdir() if p.is_dir()]
                articles = [p for p in cat.rglob("*.md") if p.name != "_MOC.md"]
                print(f"{cat.name}: subfields={len(subfields)} articles={len(articles)}")
                for sub in sorted(subfields):
                    sub_articles = [p for p in sub.glob("*.md") if p.name != "_MOC.md"]
                    print(f"  - {sub.name}: articles={len(sub_articles)} moc={(sub / '_MOC.md').exists()}")
            return 0


        if __name__ == "__main__":
            raise SystemExit(main())
        ''',
        ".agents/skills/ebe-orchestrator/scripts/validate_vault_structure.py": r'''
        from __future__ import annotations

        import sys
        from pathlib import Path


        REQUIRED = [
            "00_Index",
            "10_Published",
            "20_EvidencePackets",
            "30_Sources",
            "40_Claims",
            "50_Assets/Infographics",
            "60_MOCs",
            "70_Logs/update_logs",
            "_working/drafts",
            "_archive/old_mocs",
            "config/ebe.config.yml",
            ".agents/skills/ebe-orchestrator/SKILL.md",
        ]


        def main() -> int:
            root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
            missing = [p for p in REQUIRED if not (root / p).exists()]
            if missing:
                print("FAIL: missing")
                for p in missing:
                    print(f"- {p}")
                return 1
            print("PASS: EBE vault structure baseline exists")
            return 0


        if __name__ == "__main__":
            raise SystemExit(main())
        ''',
    }


def gitignore() -> str:
    return """
    # Evidence Based Everything generated knowledge artifacts
    # Keep infrastructure, policies, configs, root MOCs, and .gitkeep files.

    # Preserve corrected repo-local skills, ignore aborted legacy top-level skill output.
    /skills/

    # Generated published articles live inside future subfield directories.
    /10_Published/*/*/*
    !/10_Published/*/*/.gitkeep

    /20_EvidencePackets/*
    !/20_EvidencePackets/README.md
    !/20_EvidencePackets/.gitkeep

    /30_Sources/*
    !/30_Sources/README.md
    !/30_Sources/.gitkeep

    /40_Claims/*
    !/40_Claims/README.md
    !/40_Claims/.gitkeep

    /50_Assets/Infographics/*
    !/50_Assets/Infographics/.gitkeep
    /50_Assets/Diagrams/*
    !/50_Assets/Diagrams/.gitkeep
    /50_Assets/Attachments/*
    !/50_Assets/Attachments/.gitkeep

    /70_Logs/update_logs/*
    !/70_Logs/update_logs/.gitkeep
    /70_Logs/taxonomy_logs/*
    !/70_Logs/taxonomy_logs/.gitkeep
    /70_Logs/citation_audit_logs/*
    !/70_Logs/citation_audit_logs/.gitkeep
    /70_Logs/quality_audit_logs/*
    !/70_Logs/quality_audit_logs/.gitkeep

    /_working/**/*
    !/_working/**/
    !/_working/**/.gitkeep

    /_archive/superseded_articles/*
    !/_archive/superseded_articles/.gitkeep
    /_archive/old_mocs/*
    !/_archive/old_mocs/.gitkeep
    /_archive/deprecated_sources/*
    !/_archive/deprecated_sources/.gitkeep

    # Obsidian local state
    /.obsidian/workspace*.json
    /.obsidian/cache
    /.trash/

    # Python validation cache
    __pycache__/
    *.pyc
    """


def write_all() -> tuple[list[str], list[str]]:
    created: list[str] = []
    preserved: list[str] = []

    if (ROOT / "skills").exists():
        ensure_dir(ROOT / "_working" / "migration_reports")
        existing_reports = list((ROOT / "_working" / "migration_reports").glob("*_legacy_top_level_skills_preserved.md"))
        report = ROOT / "_working" / "migration_reports" / f"{STAMP}_legacy_top_level_skills_preserved.md"
        if not existing_reports and not report.exists():
            report.write_text(
                "The interrupted earlier setup created a top-level `skills/` directory. "
                "The corrected EBE setup preserves it without deletion and creates canonical skills under `.agents/skills/`.\n",
                encoding="utf-8",
                newline="\n",
            )
            created.append(str(report.relative_to(ROOT)))

    base_dirs = [
        "00_Index",
        "10_Published",
        "20_EvidencePackets",
        "30_Sources",
        "40_Claims",
        "50_Assets/Infographics",
        "50_Assets/Diagrams",
        "50_Assets/Attachments",
        "60_MOCs",
        "70_Logs/update_logs",
        "70_Logs/taxonomy_logs",
        "70_Logs/citation_audit_logs",
        "70_Logs/quality_audit_logs",
        "_working/drafts",
        "_working/evidence_packets",
        "_working/source_registries",
        "_working/claim_tables",
        "_working/search_logs",
        "_working/review_reports",
        "_working/infographic_briefs",
        "_working/update_jobs",
        "_working/taxonomy_jobs",
        "_working/migration_reports",
        "_working/research_insufficient",
        "_archive/superseded_articles",
        "_archive/old_mocs",
        "_archive/deprecated_sources",
        "config",
        ".agents/skills",
        "scripts",
    ]
    for d in base_dirs:
        ensure_dir(ROOT / d)

    keep_dirs = [
        "20_EvidencePackets",
        "30_Sources",
        "40_Claims",
        "50_Assets/Infographics",
        "50_Assets/Diagrams",
        "50_Assets/Attachments",
        "70_Logs/update_logs",
        "70_Logs/taxonomy_logs",
        "70_Logs/citation_audit_logs",
        "70_Logs/quality_audit_logs",
        "_working/drafts",
        "_working/evidence_packets",
        "_working/source_registries",
        "_working/claim_tables",
        "_working/search_logs",
        "_working/review_reports",
        "_working/infographic_briefs",
        "_working/update_jobs",
        "_working/taxonomy_jobs",
        "_working/migration_reports",
        "_working/research_insufficient",
        "_archive/superseded_articles",
        "_archive/old_mocs",
        "_archive/deprecated_sources",
    ]
    for d in keep_dirs:
        touch_gitkeep(ROOT / d, created)

    safe_write(ROOT / ".gitignore", gitignore(), created, preserved)

    for rel, content in index_docs().items():
        safe_write(ROOT / rel, content, created, preserved)
    for rel, content in config_docs().items():
        safe_write(ROOT / rel, content, created, preserved)
    for rel, content in standard_readmes().items():
        safe_write(ROOT / rel, content, created, preserved)

    for cat in CATEGORIES:
        cat_dir = ROOT / "10_Published" / cat["directory"]
        ensure_dir(cat_dir)
        safe_write(cat_dir / "_MOC.md", category_moc(cat), created, preserved)

    for name in SKILL_ORDER:
        skill_dir = ROOT / ".agents" / "skills" / name
        ensure_dir(skill_dir)
        safe_write(skill_dir / "SKILL.md", skill_markdown(name, SKILL_SPECS[name]), created, preserved)

    for rel, content in script_files().items():
        safe_write(ROOT / rel, content, created, preserved)

    return created, preserved


def main() -> int:
    created, preserved = write_all()
    print("EBE setup completed")
    print(f"created={len(created)}")
    for p in created:
        print(f"CREATE {p}")
    print(f"preserved={len(preserved)}")
    for p in preserved:
        print(f"PRESERVE {p}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
