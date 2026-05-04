import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import type { Job } from "../types.js";
import { quoteForShell, runCommand } from "../utils/shell.js";

export async function runCodexForJob(job: Job, signal?: AbortSignal): Promise<void> {
  if (job.jobType === "codex") {
    await runCodexForRootQuery(job, signal);
    return;
  }

  if (!job.worktreePath) throw new Error("Job is missing worktreePath");
  const prompt = buildPrompt(job);
  const promptFile = path.join(job.worktreePath, "_working", "discord_jobs", `${job.id}-prompt.md`);
  await fs.mkdir(path.dirname(promptFile), { recursive: true });
  await fs.writeFile(promptFile, prompt, "utf8");

  const command = config.codex.commandTemplate
    .replaceAll("{model}", quoteForShell(job.model))
    .replaceAll("{effort}", quoteForShell(job.reasoningEffort))
    .replaceAll("{cwd}", quoteForShell(job.worktreePath))
    .replaceAll("{promptFile}", quoteForShell(promptFile));

  const result = await runCommand(command, {
    cwd: job.worktreePath,
    stdin: prompt,
    timeoutMs: 1000 * 60 * 60 * 6,
    signal,
  });

  const logFile = path.join(job.worktreePath, "_working", "discord_jobs", `${job.id}-codex-output.log`);
  await fs.writeFile(logFile, `STDOUT\n${result.stdout}\n\nSTDERR\n${result.stderr}\n`, "utf8");
  if (result.code !== 0) {
    throw new Error(`Codex command failed (${result.code}). See ${logFile}`);
  }
}

export async function runCodexForRootQuery(job: Job, signal?: AbortSignal): Promise<void> {
  const cwd = config.paths.vaultRoot;
  const prompt = buildPrompt(job);
  const jobDir = path.join(cwd, "_working", "discord_codex", job.id);
  const promptFile = path.join(jobDir, "prompt.md");
  await fs.mkdir(jobDir, { recursive: true });
  await fs.writeFile(promptFile, prompt, "utf8");

  const command = config.codex.commandTemplate
    .replaceAll("{model}", quoteForShell(job.model))
    .replaceAll("{effort}", quoteForShell(job.reasoningEffort))
    .replaceAll("{cwd}", quoteForShell(cwd))
    .replaceAll("{promptFile}", quoteForShell(promptFile));

  const result = await runCommand(command, {
    cwd,
    stdin: prompt,
    timeoutMs: 1000 * 60 * 60 * 6,
    signal,
  });

  const logFile = path.join(jobDir, "codex-output.log");
  await fs.writeFile(logFile, `STDOUT\n${result.stdout}\n\nSTDERR\n${result.stderr}\n`, "utf8");
  if (result.code !== 0) {
    throw new Error(`Codex command failed (${result.code}). See ${logFile}`);
  }
}

function buildPrompt(job: Job): string {
  if (job.jobType === "codex") {
    return [
      "Run this request from the Vault root directory with full Codex CLI permissions.",
      "Follow AGENTS.md and local instructions when they apply.",
      "",
      `job_type: ${job.jobType}`,
      `job_id: ${job.id}`,
      `discord_user_id: ${job.discordUserId}`,
      "",
      "User query:",
      job.query,
      "",
    ].join("\n");
  }

  if (job.jobType === "moc_maintenance") {
    const scope = job.mocMaintenance?.scope ?? "all";
    return [
      "Follow this Vault's AGENTS.md and the EBE MOC maintenance rules.",
      "",
      "Task: repair and rebuild Obsidian MOCs in bulk.",
      `job_type: ${job.jobType}`,
      `job_id: ${job.id}`,
      `scope: ${scope}`,
      "",
      "Required workflow:",
      "- Read AGENTS.md, .agents/skills/ebe-orchestrator/SKILL.md, .agents/skills/EBE-SHARED-CONTRACT.md, and .agents/skills/ebe-category-subfield-moc-manager/SKILL.md.",
      "- Scan the actual files under the requested scope before editing.",
      "- If scope is all or published, inspect 10_Published/ and 60_MOCs/. Create or update 10_Published/_MOC.md, then rebuild category and subfield MOCs so every published article is reachable by root/category/subfield, with no stale, duplicate, or orphaned links.",
      "- If scope is all or daily, inspect 11_Daily/. Rebuild the root daily MOC and field/month MOCs so every daily article is reachable by field and date.",
      "- Prefer systematic Obsidian maps over simple update-order lists. Date-based sections are appropriate for Daily MOCs.",
      "- Create missing _MOC.md files when needed.",
      "- Write all MOC files as UTF-8. Before finishing, scan generated MOCs for mojibake such as 縺, 繧, 繝, 譁, �, or ??? and repair any corrupted text.",
      "- Write a maintenance log under 70_Logs/taxonomy_logs/ with coverage counts, changed files, and verification results.",
      "- Do not edit automation/discord_bot files during this worker job.",
      "",
      "User request:",
      job.query,
      "",
    ].join("\n");
  }

  if (job.jobType === "daily_news") {
    if (!job.daily) throw new Error("Daily news job is missing daily metadata");
    return [
      "このVaultのAGENTS.md、.agents/skills/EBE-SHARED-CONTRACT.md、.agents/skills/news-skills/SKILL.md に従い、EBE Daily News workflowを自走完了してください。",
      "",
      "重要条件:",
      "- 通常の 10_Published/ 記事ではなく、ニュース用フォーマットで 11_Daily/ に保存する。",
      "- target file が既に存在する場合は、上書きせず停止し、理由をログに残す。",
      "- 前日まで + 当日のニュースを対象に、信頼できる国内外ソースをライブ調査する。",
      "- 主要claimはすべてソースに接続し、本文中に引用番号を入れる。",
      "- 参考ソースには番号、URL、Accessed date を入れる。",
      "- 日本語インフォグラフィックを imagegen で生成し、実ラスターPNGを 50_Assets/Infographics/Daily/ に保存し、記事冒頭にObsidian画像リンクで挿入する。",
      "- imagegenが使えない、または日本語ラベルが判読不能な場合は 11_Daily/ にpublishせず、_working/infographic_briefs/ に停止理由とpromptを保存する。",
      "- Discord Bot 実装ファイルは変更しない。",
      "",
      `job_type: ${job.jobType}`,
      `job_id: ${job.id}`,
      `daily_date: ${job.daily.date}`,
      `daily_field_number: ${job.daily.fieldNumber}`,
      `daily_field_name: ${job.daily.fieldName}`,
      `daily_field_slug: ${job.daily.fieldSlug}`,
      `target_file: ${job.daily.targetPath}`,
      "",
      "依頼:",
      job.query,
      "",
    ].join("\n");
  }

  return [
    "このVaultのAGENTS.mdと .agents/skills/ebe-orchestrator/SKILL.md に従い、Evidence Based Everything workflowを自走完了してください。",
    "",
    "重要条件:",
    "- 新規記事作成または更新として、必要なEBE Skillsを順に使う。",
    "- Publish Gateを満たした場合のみ 10_Published/ に保存する。",
    "- _working/ は一時作業場として使ってよいが、最終成果物は正式配置する。",
    "- 日本語インフォグラフィックが必要な場合はAGENTS.mdのimagegenルールに従う。",
    "- ユーザーへの途中許可確認は不要。安全性・合法性・破壊的変更リスクが未解決の場合だけ停止し、レポートを残す。",
    "- 実装基盤やDiscord Botのコードは変更しない。",
    "",
    `mode: ${job.mode}`,
    `job_id: ${job.id}`,
    "",
    "テーマ / クエリ:",
    job.query,
    "",
  ].join("\n");
}
