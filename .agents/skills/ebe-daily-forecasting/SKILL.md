---
name: ebe-daily-forecasting
description: "Create daily EBE Forecasting articles under 12_Forecasting using source-informed cultural context, current news or seasonal facts, imagegen raster images, and a forecasting-specific publish gate."
---

# ebe-daily-forecasting

## Shared Contract

This Skill inherits `.agents/skills/EBE-SHARED-CONTRACT.md` where compatible. This is not an Evidence-Based claim article workflow: it creates entertainment and lifestyle-advice forecasting content, but it must still be grounded in inspected sources for cultural, seasonal, news, and theory context.

## Role

Create exactly one daily forecasting article for one fixed forecasting type. The article should feel current, researched, and varied from day to day. It must not be a generic reusable template.

## Fixed Types

Use these type names, slugs, and filenames exactly:

```text
zodiac       -> zodiac.md
blood-type   -> blood-type.md
eto          -> eto.md
mbti         -> mbti.md
lucky-action -> lucky-action.md
```

## Output Path

Save only to:

```text
12_Forecasting/daily/{yyyy}/{mm}/{yyyy-mm-dd}/{filename}
```

If the target file already exists, do not overwrite it. Stop and write a short reason to `12_Forecasting/logs/` or `_working/review_reports/`.

## Source Discovery

Use live web/source discovery. The normal time window is yesterday through today in JST unless the prompt gives a specific date.

Collect and inspect sources before writing. Suitable sources include:

- Official calendar, seasonal, weather, astronomy, culture, museum, library, almanac, and public institution pages.
- Current news from reliable media when it gives useful public context for the day.
- Primary or reliable explanatory sources about astrology history, eto/junishi culture, blood-type personality culture, MBTI limitations, personality typology, wellbeing, habit formation, color psychology, and daily routine research.
- For MBTI, use careful language: personality type content is self-reflection entertainment, not diagnosis or validated individual prediction.

Do not invent sources. Do not cite a source you did not inspect.

## Image Requirement

Every published forecasting article requires one Japanese infographic or visual card generated with the `imagegen` tool. Save the copied raster PNG under:

```text
50_Assets/Forecasting/{yyyy-mm-dd}_{type}.png
```

Insert the image at the top of the article with an Obsidian embed:

```markdown
![[50_Assets/Forecasting/{yyyy-mm-dd}_{type}.png]]
```

Log original generated image path, vault copy path, and readability check under `70_Logs/infographic_logs/`.

Do not substitute SVG, Mermaid, HTML/CSS, Canvas, matplotlib, PowerPoint, or screenshots for the publish image.

## Article Requirements

Use Japanese. Tone should be warm, practical, and lightweight. It may be playful, but it must not make deterministic claims.

All articles must include:

- Frontmatter with `category: "Forecasting"`, `type`, `date`, `created`, `updated`, `draft: false`, `publish: true`.
- Top image embed.
- A short note explaining that this is entertainment/lifestyle content, not medical, legal, financial, or life-decision advice.
- Source-informed context section explaining what today’s article uses as background, with citation numbers.
- Daily recommendations or readings appropriate to the type.
- A section on uncertainty/limits.
- Related links block.
- Source list with citation number, URL, and accessed date.
- Update history.

## Type-Specific Content

### zodiac

Cover 12 signs: 牡羊座, 牡牛座, 双子座, 蟹座, 獅子座, 乙女座, 天秤座, 蠍座, 射手座, 山羊座, 水瓶座, 魚座.

For each sign include: 総合運, 恋愛運, 仕事運・勉強運, 金運, 対人運, ラッキーカラー, ラッキーアイテム, 今日の一言.

### blood-type

Cover A型, B型, O型, AB型.

Treat blood-type fortune as a Japanese popular-culture lens, not a biological claim. Avoid essentialist language.

For each type include: 総合運, 恋愛運, 仕事運, 対人運, ラッキーアクション, 今日気をつけたいこと.

### eto

Cover 子年, 丑年, 寅年, 卯年, 辰年, 巳年, 午年, 未年, 申年, 酉年, 戌年, 亥年.

Use eto/junishi as cultural symbolism and seasonal reflection, not destiny.

For each include: 総合運, 仕事運・勝負運, 金運, 家庭運・対人運, 開運行動, 避けたい行動, 今日の一言.

### mbti

Cover all 16 types: INTJ, INTP, ENTJ, ENTP, INFJ, INFP, ENFJ, ENFP, ISTJ, ISFJ, ESTJ, ESFJ, ISTP, ISFP, ESTP, ESFP.

MBTI must not be presented as medical, psychological diagnosis, validated prediction, or hierarchy. Treat it as a self-reflection prompt.

For each include: 今日の総合テーマ, 仕事・勉強で意識したいこと, 人間関係のポイント, 恋愛・親密な関係でのヒント, 今日の落とし穴, 今日の開運アクション, 一言メッセージ.

### lucky-action

For all readers. It should be grounded in current day context, seasonal cues, and practical wellbeing or habit research.

Include: 今日の全体テーマ, 今日の開運アクション, ラッキーカラー, ラッキーアイテム, ラッキーフード, ラッキースポット, 今日避けたい行動, 夜に振り返りたいこと, 今日の一言.

## Variation Rules

- Check nearby existing files for the same type when available.
- Avoid repeating yesterday’s headline, leading metaphor, lucky color, lucky item, and action framing.
- Prefer concrete day-specific context: holidays, seasonal markers, weather/climate context, public events, recent news, lunar/astronomical context, or cultural anniversaries.
- Do not write purely generic boilerplate.

## Related Links Block

Use this block at the end:

```markdown
## 関連する今日の運勢

- [[zodiac|今日の12星座占い]]
- [[blood-type|今日の血液型占い]]
- [[eto|今日の干支占い]]
- [[mbti|今日のMBTI別アドバイス]]
- [[lucky-action|今日の開運アクション]]
```

## Forecasting Publish Gate

Do not save under `12_Forecasting/daily/` unless all conditions pass:

- Target file is under the exact forecasting path.
- Target file did not already exist before this run.
- Reliable sources were actually inspected.
- Source list includes citation number, URL, and accessed date.
- Current context/theory/cultural background claims have citations.
- Japanese imagegen raster image exists at the top and is readable.
- The article avoids deterministic, medical, legal, investment, gambling, and major-life-decision advice.
- MBTI and blood-type content include non-diagnostic/non-essentialist framing.
- Related links, limits, and update history exist.

If the gate fails, leave the draft in `_working/` and log the reason.
