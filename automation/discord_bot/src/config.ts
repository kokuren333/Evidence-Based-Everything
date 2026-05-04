import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const botRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(botRoot, ".env") });

function env(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function intEnv(name: string, fallback: number): number {
  const raw = env(name, String(fallback));
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid integer environment variable ${name}: ${raw}`);
  }
  return parsed;
}

function boolEnv(name: string, fallback: boolean): boolean {
  const raw = env(name, String(fallback));
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

function resolveBotPath(value: string): string {
  return path.isAbsolute(value) ? value : path.resolve(botRoot, value);
}

export const config = {
  botRoot,
  discord: {
    token: env("DISCORD_TOKEN"),
    clientId: env("DISCORD_CLIENT_ID"),
    guildId: env("DISCORD_GUILD_ID"),
    adminUserIds: new Set(
      env("DISCORD_ADMIN_USER_IDS")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  },
  paths: {
    vaultRoot: path.resolve(env("EBE_VAULT_ROOT")),
    worktreeRoot: path.resolve(env("EBE_WORKTREE_ROOT")),
    dataDir: resolveBotPath(env("EBE_BOT_DATA_DIR", "data")),
    logDir: resolveBotPath(env("EBE_BOT_LOG_DIR", "logs")),
  },
  workers: {
    maxWorkers: Math.max(1, intEnv("EBE_MAX_WORKERS", 4)),
    maxPublishers: Math.max(1, intEnv("EBE_MAX_PUBLISHERS", 1)),
    keepFailedWorktrees: boolEnv("EBE_KEEP_FAILED_WORKTREES", true),
    keepSuccessfulWorktrees: boolEnv("EBE_KEEP_SUCCESSFUL_WORKTREES", false),
  },
  codex: {
    model: env("CODEX_DEFAULT_MODEL", "gpt-5.5"),
    reasoningEffort: env("CODEX_DEFAULT_REASONING_EFFORT", "low"),
    commandTemplate: env(
      "CODEX_COMMAND_TEMPLATE",
      "codex exec --model {model} -c model_reasoning_effort={effort} --cd {cwd} --dangerously-bypass-approvals-and-sandbox -",
    ),
  },
  git: {
    remote: env("GIT_REMOTE", "origin"),
    branch: env("GIT_BRANCH", "main"),
    commitMessage: env("GIT_COMMIT_MESSAGE", "article update"),
    userName: env("GIT_BOT_USER_NAME", "ebe-discord-bot"),
    userEmail: env("GIT_BOT_USER_EMAIL", "ebe-discord-bot@example.invalid"),
  },
  resourceGuard: {
    enabled: boolEnv("EBE_RESOURCE_GUARD_ENABLED", true),
    maxMemoryPercent: intEnv("EBE_MAX_MEMORY_PERCENT", 85),
    maxCpuPercent: intEnv("EBE_MAX_CPU_PERCENT", 95),
  },
  dailyNews: {
    enabled: boolEnv("EBE_DAILY_NEWS_ENABLED", true),
    channelId: env("DISCORD_DAILY_NEWS_CHANNEL_ID", ""),
    hourJst: intEnv("EBE_DAILY_NEWS_HOUR_JST", 6),
    minuteJst: intEnv("EBE_DAILY_NEWS_MINUTE_JST", 0),
  },
};
