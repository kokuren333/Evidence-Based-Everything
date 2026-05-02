import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "../config.js";
import type { JobStore } from "../queue/jobStore.js";
import type { WorkerPool } from "../queue/workerPool.js";
import { gitStatus, debugSyncMain } from "../runners/gitPublisher.js";
import { assertAdmin } from "../services/accessControl.js";
import { enqueueDailyNewsJobs } from "../services/dailyNews.js";
import { enqueueMocMaintenanceJob } from "../services/mocMaintenance.js";
import { resourceSnapshot } from "../services/resourceGuard.js";
import type { Job } from "../types.js";

export function createDiscordClient(store: JobStore, getWorkerPool: () => WorkerPool): Client {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    try {
      if (interaction.commandName === "article") {
        const query = interaction.options.getString("query", true);
        const mode = (interaction.options.getString("mode") ?? "new") as "new" | "update";
        const job = await store.create({
          query,
          mode,
          discordUserId: interaction.user.id,
          channelId: interaction.channelId,
          guildId: interaction.guildId,
          model: config.codex.model,
          reasoningEffort: config.codex.reasoningEffort,
        });
        const queued = await store.countByStatus("queued");
        await interaction.reply(
          [
            "記事作成ジョブを受け付けました。",
            `job: \`${job.id}\``,
            `queued: \`${queued}\``,
            `workers: \`${config.workers.maxWorkers}\``,
            `model: \`${job.model} ${job.reasoningEffort}\``,
          ].join("\n"),
        );
      } else if (interaction.commandName === "job-status") {
        const jobId = interaction.options.getString("job_id", true);
        const job = await store.get(jobId);
        await interaction.reply(job ? formatJob(job) : `Job not found: \`${jobId}\``);
      } else if (interaction.commandName === "job-cancel") {
        assertAdmin(interaction.user.id);
        const jobId = interaction.options.getString("job_id", true);
        const job = await store.cancel(jobId);
        const aborted = getWorkerPool().cancelActiveJob(jobId);
        await interaction.reply(`cancel requested: \`${job.id}\` status=\`${job.status}\` active_abort=\`${aborted}\``);
      } else if (interaction.commandName === "job-retry") {
        assertAdmin(interaction.user.id);
        const jobId = interaction.options.getString("job_id", true);
        const job = await store.retry(jobId);
        await interaction.reply(`retry queued: \`${job.id}\` from \`${jobId}\``);
      } else if (interaction.commandName === "daily-news") {
        assertAdmin(interaction.user.id);
        const date = interaction.options.getString("date") ?? undefined;
        await interaction.deferReply();
        const result = await enqueueDailyNewsJobs(store, {
          channelId: interaction.channelId,
          guildId: interaction.guildId,
          discordUserId: interaction.user.id,
          date,
        });
        await interaction.editReply(
          [
            `daily news queued: \`${result.date}\``,
            `jobs: \`${result.jobs.length}\``,
            ...result.jobs.map((job) => `- \`${job.id}\` ${job.daily?.directoryName}`),
          ].join("\n"),
        );
      } else if (interaction.commandName === "moc-maintenance") {
        assertAdmin(interaction.user.id);
        const scope = (interaction.options.getString("scope") ?? "all") as "all" | "published" | "daily";
        const job = await enqueueMocMaintenanceJob(store, {
          channelId: interaction.channelId,
          guildId: interaction.guildId,
          discordUserId: interaction.user.id,
          scope,
        });
        const queued = await store.countByStatus("queued");
        await interaction.reply(
          [
            "MOC maintenance queued.",
            `job: \`${job.id}\``,
            `scope: \`${scope}\``,
            `queued: \`${queued}\``,
            `workers: \`${config.workers.maxWorkers}\``,
            `model: \`${job.model} ${job.reasoningEffort}\``,
          ].join("\n"),
        );
      } else if (interaction.commandName === "job-cleanup") {
        assertAdmin(interaction.user.id);
        const olderThanDays = interaction.options.getInteger("older_than_days") ?? 7;
        const dryRun = interaction.options.getBoolean("dry_run") ?? true;
        const cleaned = await getWorkerPool().cleanupFailedWorktrees(olderThanDays, dryRun);
        await interaction.reply(
          [
            dryRun ? "cleanup dry-run targets:" : "cleanup completed:",
            cleaned.length ? ["```text", cleaned.slice(0, 25).join("\n"), "```"].join("\n") : "No matching worktrees.",
          ].join("\n"),
        );
      } else if (interaction.commandName === "job-list") {
        const jobs = await store.recent(10);
        await interaction.reply(jobs.length ? jobs.map(formatJobLine).join("\n") : "No jobs yet.");
      } else if (interaction.commandName === "worker-list") {
        const workers = getWorkerPool().listActiveWorkers();
        await interaction.reply(
          workers.length
            ? workers.map((worker) => `\`${worker.jobId}\` started=${worker.startedAt}`).join("\n")
            : "No active workers.",
        );
      } else if (interaction.commandName === "queue-pause") {
        assertAdmin(interaction.user.id);
        const state = await store.setQueuePaused(true);
        await interaction.reply(`queue paused: \`${state.queuePaused}\``);
      } else if (interaction.commandName === "queue-resume") {
        assertAdmin(interaction.user.id);
        const state = await store.setQueuePaused(false);
        await interaction.reply(`queue paused: \`${state.queuePaused}\``);
      } else if (interaction.commandName === "git-status") {
        const status = await gitStatus();
        await interaction.reply(["```text", status.slice(0, 1800), "```"].join("\n"));
      } else if (interaction.commandName === "git-debug") {
        assertAdmin(interaction.user.id);
        const action = interaction.options.getString("action", true);
        if (action === "status") {
          const status = await gitStatus();
          await interaction.reply(["```text", status.slice(0, 1800), "```"].join("\n"));
        } else if (action === "all") {
          await interaction.deferReply();
          const sha = await debugSyncMain();
          await interaction.editReply(`git add/commit/push completed: \`${sha.slice(0, 12)}\``);
        }
      } else if (interaction.commandName === "bot-health") {
        const state = await store.state();
        const queued = await store.countByStatus("queued");
        const running = await store.countByStatus("running");
        const publishing = await store.countByStatus("publishing");
        const resource = await resourceSnapshot();
        const workers = getWorkerPool().listActiveWorkers();
        await interaction.reply(
          [
            "Bot is running.",
            `queue paused: \`${state.queuePaused}\``,
            `queued: \`${queued}\``,
            `running: \`${running}\``,
            `publishing: \`${publishing}\``,
            `max workers: \`${config.workers.maxWorkers}\``,
            `resource guard: \`${resource.enabled ? "on" : "off"} ${resource.ok ? "ok" : "blocked"}\``,
            `cpu: \`${resource.cpuPercent}%\``,
            `memory: \`${resource.memoryPercent}%\``,
            resource.reason ? `resource reason: \`${resource.reason}\`` : undefined,
            workers.length ? "workers:" : "workers: none",
            ...workers.map((worker) => `- \`${worker.jobId}\` started=${worker.startedAt}`),
          ]
            .filter(Boolean)
            .join("\n"),
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const body = ["Command failed.", "```text", message.slice(0, 1500), "```"].join("\n");
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(body);
      } else {
        await interaction.reply({ content: body, ephemeral: true });
      }
    }
  });

  return client;
}

function formatJob(job: Job): string {
  return [
    `job: \`${job.id}\``,
    `status: \`${job.status}\``,
    `mode: \`${job.mode}\``,
    job.jobType ? `type: \`${job.jobType}\`` : undefined,
    job.daily ? `daily: \`${job.daily.date} ${job.daily.directoryName}\`` : undefined,
    job.mocMaintenance ? `moc_scope: \`${job.mocMaintenance.scope}\`` : undefined,
    `created: \`${job.createdAt}\``,
    job.startedAt ? `started: \`${job.startedAt}\`` : undefined,
    job.finishedAt ? `finished: \`${job.finishedAt}\`` : undefined,
    job.worktreePath ? `worktree: \`${job.worktreePath}\`` : undefined,
    job.pushedCommitSha ? `commit: \`${job.pushedCommitSha.slice(0, 12)}\`` : undefined,
    job.errorMessage ? ["error:", "```text", job.errorMessage.slice(0, 1000), "```"].join("\n") : undefined,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatJobLine(job: Job): string {
  return `\`${job.id}\` ${job.status} ${job.jobType ?? "article"} ${job.mode} ${job.createdAt}`;
}
