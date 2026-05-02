---
name: news-skills
description: "Create daily Evidence Based Everything news briefings under 11_Daily using live reliable sources, source appraisal, claim grounding, Japanese imagegen infographics, and a news-specific publish gate."
---

# news-skills

## Shared Contract

This Skill inherits `.agents/skills/EBE-SHARED-CONTRACT.md` unless this file defines a stricter daily-news rule. It is for daily news briefings, not evergreen textbook articles.

## Role

Create one daily briefing for a fixed news field. The article should help a reader understand what is worth reading today, why it matters, what is uncertain, and which reliable sources support the summary.

## Fixed Fields

Use these English field names and path segments exactly:

```text
01_Politics_International_Relations
02_Economy_Finance
03_Technology_AI
04_Science_Medicine_Life
05_Environment_Energy_Resources
06_Society_Population_Education
07_Culture_Media_Ideas
08_Law_Institutions_Ethics
09_Business_Industry_Innovation
10_Incidents_Risks_Safety
```

## Output Path

Save only to:

```text
11_Daily/{field_directory}/{yyyy-mm}/{yyyy-mm-dd}_{Field_Name}.md
```

Example:

```text
11_Daily/03_Technology_AI/2026-05/2026-05-02_Technology_AI.md
```

If the target file already exists, do not overwrite it. Stop and write a short reason to `_working/review_reports/` or `70_Logs/daily_news_logs/`.

## Source Discovery

Use live web/source discovery. The time window is yesterday through today in JST unless the prompt gives a specific date.

Prioritize primary or high-reliability sources:

- Government, courts, central banks, regulators, statistics agencies, international organizations.
- Company investor relations, official blogs, security advisories, standards bodies, preprint/paper pages when relevant.
- Reputable wire services and major domestic/international news organizations for fast-moving facts.
- Specialist outlets only when clearly identified as analysis, not primary fact.

Use both Japanese and non-Japanese sources when the field benefits from both. Avoid unsourced social-media claims unless the social-media post itself is the primary object of analysis.

## News Article Format

Use Japanese. Keep the tone concise, explanatory, and evidence-based.

Required structure:

```markdown
---
status: published
draft: false
publish_ready: true
type: daily_news
date: yyyy-mm-dd
field: Field_Name
updated: yyyy-mm-dd
---

![[daily-news-infographic.png]]

# yyyy-mm-dd Field Name Daily Briefing

## 今日読むべき要点

## 重要ニュース

## 背景と文脈

## 何がまだ不確かか

## 読む順番

## 参考ソース

## 更新履歴
```

Each important claim must have citation numbers in the body. Each source entry must include a URL and accessed date.

## Infographic

Every published daily briefing requires a Japanese infographic generated with the `imagegen` tool. Save the copied raster PNG under:

```text
50_Assets/Infographics/Daily/{yyyy-mm-dd}_{field-slug}.png
```

Insert the image at the top of the article with an Obsidian embed. Log the original generated image path, vault copy path, and readability check under `70_Logs/infographic_logs/`.

Do not substitute SVG, Mermaid, HTML/CSS, Canvas, matplotlib, PowerPoint, or screenshots for the publish infographic.

## Daily Publish Gate

Do not save under `11_Daily/` unless all conditions pass:

- frontmatter has `status: published`, `draft: false`, `publish_ready: true`, and `type: daily_news`.
- target file is under the exact daily path.
- target file did not already exist before this run.
- reliable sources were actually read or inspected.
- source list includes citation number, URL, and accessed date.
- main claims and all high-impact factual statements have citations.
- Japanese imagegen infographic is present at the top and readable.
- uncertainty/limits section exists.
- update history exists.

If the gate fails, leave the draft in `_working/` and log the reason.
