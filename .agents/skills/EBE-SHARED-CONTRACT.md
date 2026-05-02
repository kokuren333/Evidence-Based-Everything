# EBE Shared Contract

This file centralizes rules inherited by every EBE Skill. Individual `SKILL.md` files should stay focused on role-specific behavior and must not duplicate this contract.

## Autonomous Completion

- For EBE tasks in this Vault, run the defined Skills workflow autonomously to completion without asking routine permission.
- Ask only when a missing decision would create material safety, legality, privacy, scope, or destructive-file risk that cannot be resolved by a conservative assumption.
- Do not ask routine permission to continue, research, draft, generate an infographic, audit citations, update MOCs, or publish after gates pass.
- If a gate fails, do not publish. Write the failure report and fix what can be fixed autonomously.

## Storage Rules

- Treat `_working/` as the only workspace for unpublished, provisional, failed-gate, or in-progress artifacts.
- Treat `20_EvidencePackets/`, `30_Sources/`, and `40_Claims/` as durable, article-linked evidence stores that are written only after an article passes Publish Gate or when updating an already-published article.
- Do not use `20_EvidencePackets/`, `30_Sources/`, or `40_Claims/` as scratch space during drafting.
- Put only publish-ready articles in `10_Published/`.
- Put drafts, temporary source notes, source registries, claim tables, evidence packet drafts, search logs, review reports, research-insufficient reports, migration reports, taxonomy jobs, update jobs, and infographic briefs in `_working/`.
- On successful publish, copy or promote the final evidence packet, source notes, and claim notes from `_working/` into `20_EvidencePackets/`, `30_Sources/`, and `40_Claims/` respectively; leave `_working/` copies as disposable build artifacts.
- Put event/audit logs in `70_Logs/`: publish logs in `70_Logs/publish_logs/`, citation audits in `70_Logs/citation_audits/`, quality audits in `70_Logs/quality_audits/`, infographic generation logs in `70_Logs/infographic_logs/`, taxonomy logs in `70_Logs/taxonomy_logs/`, and update logs in `70_Logs/update_logs/`.
- Put generated raster infographics in `50_Assets/Infographics/`.
- The canonical artifact lifecycle is documented in `00_Index/EBE - Artifact Lifecycle Policy.md`.
- Do not create a top-level `skills/` directory. The canonical Skills root is `.agents/skills/`.

## Grounding Rules

- Treat EBE as a knowledge compilation system, not a note generator.
- Ground factual, historical, causal, procedural, institutional, technical, mathematical, legal, medical, and OSINT claims in sources.
- Preserve numbered inline citations and URL-backed reference lists.
- Do not fabricate URLs, DOIs, papers, books, laws, cases, standards, or source claims.
- Do not use unread sources as support.
- If source coverage is insufficient for publish quality, create a report under `_working/research_insufficient/` instead of publishing.

## Required Article Workflow

```text
User question
  -> ebe-orchestrator
  -> ebe-question-classifier
  -> ebe-domain-profile-selector
  -> ebe-modern-source-discovery
  -> ebe-historical-source-discovery
  -> ebe-osint-verifier (when needed)
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

An article may be saved under `10_Published/` only when all conditions are met:

- `status: published`
- `draft: false`
- `publish_ready: true`
- Major claims are connected to sources.
- Inline numbered citations exist.
- Reference list has numbers, URLs, and Accessed dates.
- A Japanese raster infographic appears at the top.
- The infographic caption has citation numbers.
- Historical background/classical understanding is present.
- Current standard understanding is present.
- Limitations, disputes, and unresolved issues are present.
- Update history and updated date are present.
- Article is saved inside a subfield directory.
- Subfield MOC, category MOC, and global MOCs are updated.

## Taxonomy Rules

- `10_Published/` root contains only the 10 major category directories.
- Create subfields only when needed for actual articles.
- Subfield format: `{{日本語小分野名}}__{{english-slug}}/`.
- Article format: `{{日本語タイトル}}__{{english-slug}}.md`.
- Articles must not be placed directly under a major category.
- Log taxonomy decisions under `70_Logs/taxonomy_logs/`.

## MOC Reconstruction Rules

- Major category MOCs must prioritize readability, systematic overview, and complete coverage over chronology, update order, or simple append-only lists.
- A major category MOC should help readers understand the full category at a glance: include clear sections such as overview, foundations, main themes, subfield index, applications/practice, disputes/open questions, and related MOCs when they fit the category.
- Every published subfield and every published article under the category must be reachable from the major category MOC, either directly or through a clearly linked subfield MOC. No orphaned article or subfield is allowed.
- Chronological sections are allowed only as secondary aids, such as "recently updated" or historical background. They must not replace systematic coverage.
- When updating a MOC, scan the relevant category directory, subfield directories, article files, and existing MOC links; check for missing links, duplicates, stale links, and orphaned notes.
- If complete coverage cannot be verified, do not treat the MOC gate as passed. Write the gap report under `_working/review_reports/` or `70_Logs/taxonomy_logs/`, then fix what can be fixed autonomously.

## Infographic Rules

- Publish articles require a Japanese raster infographic generated through the actual `imagegen` tool.
- `ebe-infographic-brief-maker` creates the source-grounded brief.
- `ebe-imagegen-infographic` generates and verifies the image.
- The image used in the article must be copied from the imagegen output directory into `50_Assets/Infographics/`; leave the original generated file in place.
- Log the source imagegen path, copied Vault path, dimensions, file type, and readability result in `70_Logs/`.
- SVG, HTML/CSS, Canvas, Mermaid, ASCII, PIL, matplotlib, PowerPoint, screenshots, or any other code-generated or manually rendered substitute is not a valid publish infographic, even if the file extension is `.png`.
- If imagegen is unavailable, or if Japanese labels are garbled, replaced with `????`, or not readable, stop before publish and save the prompt/brief under `_working/infographic_briefs/`.

## Frontmatter Rules

- Published article frontmatter must follow `config/article_templates.yml` `publish_article.frontmatter_required` exactly: same keys, order, names, and expected scalar/list types.
- Use canonical split fields: `category_id`, `category_name`, `category_path`, `subfield_name`, `subfield_path`, `moc`, `has_infographic`, and `infographic_path`.
- Do not use legacy aliases such as `category`, `subfield`, `primary_category`, `primary_subfield`, `english_title`, or `infographic` in published articles.

## Canonical References

Read only the needed files:

- `AGENTS.md`
- `config/ebe.config.yml`
- `config/domain_profiles.yml`
- `config/category_profiles.yml`
- `config/article_templates.yml`
- `00_Index/EBE - Source Policy.md`
- `00_Index/EBE - Citation Policy.md`
- `00_Index/EBE - Infographic Policy.md`
- `00_Index/EBE - Taxonomy Policy.md`
- `00_Index/EBE - Update Policy.md`
- `00_Index/EBE - Artifact Lifecycle Policy.md`
- `00_Index/EBE - Style Guide.md`
