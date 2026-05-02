---
project: "Evidence Based Everything"
type: "policy"
status: "published"
draft: false
updated: 2026-05-01
---

# EBE - Artifact Lifecycle Policy

## Purpose

This policy defines where intermediate and durable artifacts belong in the EBE Vault. The boundary is lifecycle-based:

- `_working/` is the workspace for unpublished work.
- `20_EvidencePackets/`, `30_Sources/`, and `40_Claims/` are durable evidence stores for published or already-published articles.
- `70_Logs/` records events, audits, and operational decisions.

## Canonical Artifact States

| State | Meaning | Allowed roots |
|---|---|---|
| `working` | Provisional, incomplete, unreviewed, or being drafted | `_working/` |
| `blocked` | Gate failed or source coverage is insufficient | `_working/review_reports/`, `_working/research_insufficient/`, `70_Logs/` |
| `published_evidence` | Final evidence artifact attached to a published article | `20_EvidencePackets/`, `30_Sources/`, `40_Claims/` |
| `log` | Event record, audit result, generation trace, taxonomy/update decision | `70_Logs/` |
| `asset` | User-facing generated media referenced by a published article | `50_Assets/Infographics/` |

## `_working/`

Use `_working/` for all intermediate outputs before Publish Gate passes.

Canonical subdirectories:

- `_working/search_logs/`: search terms, databases, queries, inclusion/exclusion decisions.
- `_working/source_registries/`: provisional numbered source registries for a draft.
- `_working/sources/`: temporary source notes and extracted metadata.
- `_working/claim_tables/`: provisional claim-source tables.
- `_working/evidence_packets/`: draft evidence packets assembled before publish.
- `_working/drafts/`: draft article bodies and rewritten versions.
- `_working/infographic_briefs/`: source-grounded image briefs and prompts.
- `_working/review_reports/`: failed gate reports and fix reports.
- `_working/research_insufficient/`: reports explaining why publish quality could not be reached.
- `_working/migration_reports/`: reports for destructive or structural file operations.
- `_working/taxonomy_jobs/`: pending taxonomy work before final MOC updates.
- `_working/update_jobs/`: pending update work before final article replacement.

Do not treat `_working/` artifacts as publish-ready source of truth.

## Durable Evidence Stores

Write to these roots only after a publish/update succeeds, or when maintaining evidence for an existing published article.

- `20_EvidencePackets/`: final article-level evidence packet. It should connect article sections, key claims, accepted sources, rejected-but-relevant sources, contradictions, limitations, and publish/audit log paths.
- `30_Sources/`: final source notes. Each major source should record source ID, citation number, title, URL/DOI when available, accessed date, appraisal summary, and claims supported.
- `40_Claims/`: final claim notes or claim table. Each major claim should record claim ID, claim type, supporting sources, contrary sources, confidence/strength, applicability, and limitations.

These stores should not contain exploratory search notes, abandoned source candidates, rough drafts, or failed-gate artifacts. Keep those in `_working/`.

## Logs

Use `70_Logs/` for append-only operational records.

- `70_Logs/publish_logs/`: publish decisions, final paths, frontmatter checks, MOC updates.
- `70_Logs/citation_audits/`: citation audit outputs.
- `70_Logs/quality_audits/`: quality audit outputs.
- `70_Logs/infographic_logs/`: imagegen source path, Vault copy path, dimensions, file type, readability result.
- `70_Logs/taxonomy_logs/`: category/subfield and MOC decisions.
- `70_Logs/update_logs/`: article update decisions and diffs.

Legacy directories ending in `_audit_logs` are deprecated. New work should use `citation_audits/` and `quality_audits/`.

## Promotion Rule

When Publish Gate passes:

1. Save the article under `10_Published/{{category}}/{{subfield}}/{{title}}.md`.
2. Copy the final infographic into `50_Assets/Infographics/`.
3. Promote final evidence artifacts from `_working/` into `20_EvidencePackets/`, `30_Sources/`, and `40_Claims/`.
4. Write publish, citation, quality, infographic, and taxonomy logs under `70_Logs/`.
5. Update subfield, category, and global MOCs.

If Publish Gate fails, do not promote evidence artifacts into `20_EvidencePackets/`, `30_Sources/`, or `40_Claims/`; leave the work in `_working/` and write a failure report.
