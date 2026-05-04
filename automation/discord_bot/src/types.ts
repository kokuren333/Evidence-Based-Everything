export type JobStatus =
  | "queued"
  | "running"
  | "waiting_publish"
  | "publishing"
  | "succeeded"
  | "failed"
  | "failed_review_required"
  | "cancelled";

export type ArticleMode = "new" | "update";
export type JobType = "article" | "daily_news" | "moc_maintenance" | "image_maintenance" | "codex";

export interface DailyNewsMeta {
  date: string;
  yearMonth: string;
  fieldNumber: number;
  fieldName: string;
  fieldSlug: string;
  directoryName: string;
  targetPath: string;
}

export interface MocMaintenanceMeta {
  scope: "all" | "published" | "daily";
}

export interface ImageMaintenanceMeta {
  scope: "all" | "published" | "daily";
}

export interface Job {
  id: string;
  jobType?: JobType;
  query: string;
  mode: ArticleMode;
  status: JobStatus;
  discordUserId: string;
  channelId: string;
  guildId: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  finishedAt?: string;
  worktreePath?: string;
  branchName?: string;
  commitSha?: string;
  pushedCommitSha?: string;
  resultSummary?: string;
  errorMessage?: string;
  model: string;
  reasoningEffort: string;
  cancelRequested?: boolean;
  daily?: DailyNewsMeta;
  mocMaintenance?: MocMaintenanceMeta;
  imageMaintenance?: ImageMaintenanceMeta;
}

export interface ShellResult {
  code: number;
  stdout: string;
  stderr: string;
}

export interface BotState {
  queuePaused: boolean;
  updatedAt: string;
}
