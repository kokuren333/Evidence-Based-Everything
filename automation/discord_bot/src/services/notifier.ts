import type { Client } from "discord.js";
import type { Job } from "../types.js";

export class Notifier {
  constructor(private readonly client: Client) {}

  async send(channelId: string, message: string): Promise<void> {
    const channel = await this.client.channels.fetch(channelId);
    if (!channel || !("send" in channel)) return;
    await channel.send(message);
  }

  async jobStarted(job: Job, running: number, max: number): Promise<void> {
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
    const logHint = job.worktreePath
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
