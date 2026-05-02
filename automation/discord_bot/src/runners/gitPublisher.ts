import { config } from "../config.js";
import type { Job } from "../types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { quoteForShell, requireOk, runCommand, runGit } from "../utils/shell.js";

let publishLock: Promise<unknown> = Promise.resolve();

export async function commitWorkerChanges(job: Job): Promise<string> {
  if (!job.worktreePath) throw new Error("Job is missing worktreePath");
  await configureGitIdentity(job.worktreePath);
  await assertNoForbiddenPaths(job.worktreePath);

  await requireOk(await runGit(job.worktreePath, ["add", "."]), "git add in worker");
  await assertNoForbiddenStagedPaths(job.worktreePath);

  const hasChanges = await runGit(job.worktreePath, ["diff", "--cached", "--quiet"]);
  if (hasChanges.code === 0) {
    throw new Error("Codex completed but produced no committable changes.");
  }

  await requireOk(
    await runGit(job.worktreePath, ["commit", "-m", config.git.commitMessage], 180_000),
    "git commit in worker",
  );
  const rev = await runGit(job.worktreePath, ["rev-parse", "HEAD"]);
  await requireOk(rev, "git rev-parse worker HEAD");
  return rev.stdout.trim();
}

export async function publishWorkerBranch(job: Job): Promise<string> {
  return withPublishLock(async () => {
    if (!job.branchName) throw new Error("Job is missing branchName");
    if (!job.worktreePath) throw new Error("Job is missing worktreePath");
    await configureGitIdentity(config.paths.vaultRoot);
    await assertMainWorktreeClean();

    await requireOk(await runGit(config.paths.vaultRoot, ["checkout", config.git.branch]), "git checkout main branch");
    await requireOk(
      await runGit(config.paths.vaultRoot, ["pull", "--rebase", config.git.remote, config.git.branch], 240_000),
      "git pull --rebase",
    );
    await rebaseWorkerBranchForPublish(job);

    const merge = await runGit(
      config.paths.vaultRoot,
      ["merge", "--no-ff", job.branchName, "-m", config.git.commitMessage],
      240_000,
    );
    if (merge.code !== 0) {
      await runGit(config.paths.vaultRoot, ["merge", "--abort"], 120_000);
      throw new Error(`Merge conflict or merge failure for ${job.branchName}\n${merge.stderr || merge.stdout}`);
    }

    await assertNoForbiddenPaths(config.paths.vaultRoot);
    await requireOk(await runGit(config.paths.vaultRoot, ["push", config.git.remote, config.git.branch], 300_000), "git push");
    const rev = await runGit(config.paths.vaultRoot, ["rev-parse", "HEAD"]);
    await requireOk(rev, "git rev-parse published HEAD");
    return rev.stdout.trim();
  });
}

async function rebaseWorkerBranchForPublish(job: Job): Promise<void> {
  if (!job.worktreePath) throw new Error("Job is missing worktreePath");
  await configureGitIdentity(job.worktreePath);
  await requireOk(
    await runGit(job.worktreePath, ["fetch", config.git.remote, config.git.branch], 180_000),
    "git fetch before worker rebase",
  );

  const rebase = await runGit(job.worktreePath, ["rebase", `${config.git.remote}/${config.git.branch}`], 240_000);
  if (rebase.code !== 0) {
    const conflicts = await conflictedPaths(job.worktreePath);
    if (conflicts.length === 0 || !conflicts.every(isSharedMocPath)) {
      await runGit(job.worktreePath, ["rebase", "--abort"], 120_000);
      throw new Error(
        `Worker branch rebase failed for ${job.branchName}. Manual review required.\n${rebase.stderr || rebase.stdout}`,
      );
    }

    for (const file of conflicts) {
      await requireOk(await runGit(job.worktreePath, ["checkout", "--ours", "--", file]), `resolve MOC conflict ${file}`);
      await requireOk(await runGit(job.worktreePath, ["add", "--", file]), `stage resolved MOC conflict ${file}`);
    }

    const continued = await runGit(job.worktreePath, ["-c", "core.editor=true", "rebase", "--continue"], 240_000);
    if (continued.code !== 0) {
      await runGit(job.worktreePath, ["rebase", "--abort"], 120_000);
      throw new Error(`Could not continue worker rebase after MOC conflict resolution.\n${continued.stderr || continued.stdout}`);
    }

    await runMocRepair(job);
  }
}

async function runMocRepair(job: Job): Promise<void> {
  if (!job.worktreePath) throw new Error("Job is missing worktreePath");
  const prompt = [
    "このVaultのAGENTS.mdと .agents/skills/ebe-orchestrator/SKILL.md に従い、MOC/taxonomy repairだけを実行してください。",
    "",
    "目的:",
    "- 並列記事生成後の統合でMOCが古くならないように修復する。",
    "- 10_Published/ 配下の全記事と小分野を確認し、00_Index/、60_MOCs/、大分類MOC、小分野MOCのリンク漏れ、重複、孤立記事を修正する。",
    "",
    "禁止:",
    "- 新規記事を作成しない。",
    "- 既存記事本文を不用意に書き換えない。",
    "- 画像生成を行わない。",
    "- Discord Bot実装ファイルを変更しない。",
    "",
    `job_id: ${job.id}`,
    "",
  ].join("\n");
  const promptFile = path.join(job.worktreePath, "_working", "discord_jobs", `${job.id}-moc-repair-prompt.md`);
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
    timeoutMs: 1000 * 60 * 60 * 2,
  });
  const logFile = path.join(job.worktreePath, "_working", "discord_jobs", `${job.id}-moc-repair-output.log`);
  await fs.writeFile(logFile, `STDOUT\n${result.stdout}\n\nSTDERR\n${result.stderr}\n`, "utf8");
  if (result.code !== 0) {
    throw new Error(`MOC repair command failed (${result.code}). See ${logFile}`);
  }

  await assertNoForbiddenPaths(job.worktreePath);
  await requireOk(await runGit(job.worktreePath, ["add", "."]), "git add MOC repair changes");
  await assertNoForbiddenStagedPaths(job.worktreePath);
  const hasChanges = await runGit(job.worktreePath, ["diff", "--cached", "--quiet"]);
  if (hasChanges.code !== 0) {
    await requireOk(await runGit(job.worktreePath, ["commit", "-m", "Repair MOCs after article update"], 180_000), "git commit MOC repair");
  }
}

export async function debugSyncMain(): Promise<string> {
  return withPublishLock(async () => {
    await configureGitIdentity(config.paths.vaultRoot);
    await assertNoForbiddenPaths(config.paths.vaultRoot);
    await requireOk(
      await runGit(config.paths.vaultRoot, ["pull", "--rebase", "--autostash", config.git.remote, config.git.branch], 240_000),
      "git pull --rebase --autostash",
    );
    await requireOk(await runGit(config.paths.vaultRoot, ["add", "."]), "git add .");
    await assertNoForbiddenStagedPaths(config.paths.vaultRoot);
    const hasChanges = await runGit(config.paths.vaultRoot, ["diff", "--cached", "--quiet"]);
    if (hasChanges.code !== 0) {
      await requireOk(await runGit(config.paths.vaultRoot, ["commit", "-m", config.git.commitMessage], 180_000), "git commit");
    }
    await requireOk(await runGit(config.paths.vaultRoot, ["push", config.git.remote, config.git.branch], 300_000), "git push");
    const rev = await runGit(config.paths.vaultRoot, ["rev-parse", "HEAD"]);
    await requireOk(rev, "git rev-parse HEAD");
    return rev.stdout.trim();
  });
}

export async function gitStatus(): Promise<string> {
  const status = await runGit(config.paths.vaultRoot, ["-c", "core.quotepath=false", "status", "--short", "--branch"]);
  await requireOk(status, "git status");
  return status.stdout.trim() || "clean";
}

async function configureGitIdentity(cwd: string): Promise<void> {
  await requireOk(await runGit(cwd, ["config", "user.name", config.git.userName]), "git config user.name");
  await requireOk(await runGit(cwd, ["config", "user.email", config.git.userEmail]), "git config user.email");
}

async function assertMainWorktreeClean(): Promise<void> {
  const status = await runGit(config.paths.vaultRoot, [
    "-c",
    "core.quotepath=false",
    "status",
    "--porcelain=v1",
    "-z",
  ]);
  await requireOk(status, "git status --porcelain");
  if (status.stdout.length > 0) {
    throw new Error(`Main vault worktree must be clean before publishing worker branches:\n${status.stdout}`);
  }
}

async function assertNoForbiddenPaths(cwd: string): Promise<void> {
  const status = await runGit(cwd, [
    "-c",
    "core.quotepath=false",
    "status",
    "--porcelain=v1",
    "-z",
    "--untracked-files=all",
  ]);
  await requireOk(status, "git status preflight");
  const paths = parsePorcelainStatusPaths(status.stdout);
  const forbidden = paths.filter(isForbiddenPath);
  if (forbidden.length > 0) {
    throw new Error(`Forbidden paths detected. Refusing to continue:\n${forbidden.join("\n")}`);
  }
}

async function assertNoForbiddenStagedPaths(cwd: string): Promise<void> {
  const diff = await runGit(cwd, ["-c", "core.quotepath=false", "diff", "--cached", "--name-only", "-z"]);
  await requireOk(diff, "git diff --cached --name-only");
  const forbidden = parseNulPaths(diff.stdout).filter(isForbiddenPath);
  if (forbidden.length > 0) {
    throw new Error(`Forbidden staged paths detected. Refusing to commit:\n${forbidden.join("\n")}`);
  }
}

function parsePorcelainStatusPaths(output: string): string[] {
  const entries = output.split("\0").filter(Boolean);
  const paths: string[] = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (entry.length < 4) continue;
    const status = entry.slice(0, 2);
    const filePath = normalizeGitPath(entry.slice(3));
    if (filePath) paths.push(filePath);

    if (status.includes("R") || status.includes("C")) {
      index += 1;
    }
  }
  return paths;
}

function parseNulPaths(output: string): string[] {
  return output
    .split("\0")
    .map((value) => normalizeGitPath(value))
    .filter(Boolean);
}

function normalizeGitPath(rawPath: string): string {
  return rawPath.trim().replace(/\\/g, "/").replace(/^["']|["']$/g, "");
}

function isForbiddenPath(rawPath: string): boolean {
  const value = normalizeGitPath(rawPath);
  const lower = value.toLowerCase();
  if (lower === ".env" || lower.startsWith(".env.")) return true;
  if (lower.includes("/.env") || lower.endsWith("/.env")) return true;
  if (lower.includes("token") || lower.includes("secret")) return true;
  if (lower.endsWith(".pem") || lower.endsWith(".key") || lower.endsWith(".pfx")) return true;
  if (lower.startsWith(".codex/") || lower.includes("/.codex/")) return true;
  if (lower === "node_modules" || lower.includes("/node_modules/")) return true;
  if (lower.startsWith("automation/discord_bot/data/")) return true;
  if (lower.startsWith("automation/discord_bot/logs/")) return true;
  if (lower.startsWith("automation/discord_bot/.cache/")) return true;
  if (lower.startsWith("_working/") && !lower.endsWith("/.gitkeep")) return true;
  return false;
}

async function conflictedPaths(cwd: string): Promise<string[]> {
  const diff = await runGit(cwd, ["-c", "core.quotepath=false", "diff", "--name-only", "--diff-filter=U", "-z"]);
  await requireOk(diff, "git diff conflicted paths");
  return parseNulPaths(diff.stdout);
}

function isSharedMocPath(rawPath: string): boolean {
  const value = normalizeGitPath(rawPath).toLowerCase();
  return value.startsWith("00_index/") || value.startsWith("60_mocs/") || value.includes("moc");
}

async function withPublishLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = publishLock.then(fn, fn);
  publishLock = run.catch(() => undefined);
  return run;
}
