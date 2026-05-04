import type { Client } from "discord.js";
import type { Job } from "../types.js";

export class Notifier {
  constructor(private readonly client: Client) {}

  async send(channelId: string, message: string): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel || !("send" in channel)) {
        console.warn(`Discord notification skipped; channel is not sendable: ${channelId}`);
        return;
      }
      await channel.send(message);
    } catch (error) {
      console.warn(`Discord notification failed for channel ${channelId}: ${formatDiscordError(error)}`);
    }
  }

  async jobStarted(job: Job, running: number, max: number): Promise<void> {
    if (job.jobType === "codex") {
      await this.send(
        job.channelId,
        [
          "Codex root query started.",
          `job: \`${job.id}\``,
          `slot: \`${running}/${max}\``,
          `model: \`${job.model} ${job.reasoningEffort}\``,
          `started: \`${formatJst(new Date())}\``,
        ].join("\n"),
      );
      return;
    }

    await this.send(
      job.channelId,
      [
        "記事作成を開始しました。",
        `job: \`${job.id}\``,
        `slot: \`${running}/${max}\``,
        `model: \`${job.model} ${job.reasoningEffort}\``,
        `started: \`${formatJst(new Date())}\``,
      ].join("\n"),
    );
  }

  async jobSucceeded(job: Job): Promise<void> {
    if (job.jobType === "codex") {
      await this.send(
        job.channelId,
        [
          "Codex root query completed.",
          `job: \`${job.id}\``,
          `log: \`_working\\discord_codex\\${job.id}\\codex-output.log\``,
        ].join("\n"),
      );
      return;
    }

    await this.send(
      job.channelId,
      [
        "記事作成とprivate repoへのpushが完了しました。",
        `job: \`${job.id}\``,
        job.pushedCommitSha ? `commit: \`${job.pushedCommitSha.slice(0, 12)}\`` : undefined,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  async jobFailed(job: Job, error: unknown): Promise<void> {
    const message = error instanceof Error ? error.message : String(error);
    const logHint =
      job.jobType === "codex"
        ? `_working\\discord_codex\\${job.id}\\codex-output.log`
        : job.worktreePath
          ? `${job.worktreePath}\\_working\\discord_jobs\\${job.id}-codex-output.log`
          : undefined;
    await this.send(
      job.channelId,
      [
        "記事作成ジョブが失敗しました。",
        `job: \`${job.id}\``,
        logHint ? `log: \`${logHint}\`` : undefined,
        "```text",
        message.slice(0, 1200),
        "```",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
}

function formatDiscordError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function formatJst(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}
