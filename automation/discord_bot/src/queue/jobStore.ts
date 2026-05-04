import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import type {
  ArticleMode,
  BotState,
  DailyNewsMeta,
  ImageMaintenanceMeta,
  Job,
  JobStatus,
  JobType,
  MocMaintenanceMeta,
} from "../types.js";
import { ensureDir, safeJobId } from "../utils/paths.js";

interface StoreData {
  jobs: Job[];
  state?: BotState;
}

export class JobStore {
  private readonly file: string;
  private lock: Promise<unknown> = Promise.resolve();

  constructor(file = path.join(config.paths.dataDir, "jobs.json")) {
    this.file = file;
  }

  async init(): Promise<void> {
    await ensureDir(path.dirname(this.file));
    try {
      await fs.access(this.file);
    } catch {
      await fs.writeFile(this.file, JSON.stringify({ jobs: [], state: defaultState() }, null, 2), "utf8");
    }
  }

  async create(input: {
    query: string;
    mode: ArticleMode;
    discordUserId: string;
    channelId: string;
    guildId: string | null;
    model: string;
    reasoningEffort: string;
    jobType?: JobType;
    daily?: DailyNewsMeta;
    mocMaintenance?: MocMaintenanceMeta;
    imageMaintenance?: ImageMaintenanceMeta;
  }): Promise<Job> {
    return this.withLock(async () => {
      const data = await this.read();
      const now = new Date().toISOString();
      const job: Job = {
        id: safeJobId(),
        jobType: input.jobType ?? "article",
        query: input.query,
        mode: input.mode,
        status: "queued",
        discordUserId: input.discordUserId,
        channelId: input.channelId,
        guildId: input.guildId,
        createdAt: now,
        updatedAt: now,
        model: input.model,
        reasoningEffort: input.reasoningEffort,
        daily: input.daily,
        mocMaintenance: input.mocMaintenance,
        imageMaintenance: input.imageMaintenance,
      };
      data.jobs.push(job);
      await this.write(data);
      return job;
    });
  }

  async createMany(
    inputs: {
      query: string;
      mode: ArticleMode;
      discordUserId: string;
      channelId: string;
      guildId: string | null;
      model: string;
      reasoningEffort: string;
      jobType?: JobType;
      daily?: DailyNewsMeta;
      mocMaintenance?: MocMaintenanceMeta;
      imageMaintenance?: ImageMaintenanceMeta;
    }[],
  ): Promise<Job[]> {
    return this.withLock(async () => {
      const data = await this.read();
      const now = new Date().toISOString();
      const jobs = inputs.map((input) => ({
        id: safeJobId(),
        jobType: input.jobType ?? "article",
        query: input.query,
        mode: input.mode,
        status: "queued" as JobStatus,
        discordUserId: input.discordUserId,
        channelId: input.channelId,
        guildId: input.guildId,
        createdAt: now,
        updatedAt: now,
        model: input.model,
        reasoningEffort: input.reasoningEffort,
        daily: input.daily,
        mocMaintenance: input.mocMaintenance,
        imageMaintenance: input.imageMaintenance,
      }));
      data.jobs.push(...jobs);
      await this.write(data);
      return jobs;
    });
  }

  async all(): Promise<Job[]> {
    return (await this.read()).jobs;
  }

  async state(): Promise<BotState> {
    const data = await this.read();
    return data.state ?? defaultState();
  }

  async setQueuePaused(paused: boolean): Promise<BotState> {
    return this.withLock(async () => {
      const data = await this.read();
      data.state = { queuePaused: paused, updatedAt: new Date().toISOString() };
      await this.write(data);
      return data.state;
    });
  }

  async recent(limit = 10): Promise<Job[]> {
    const jobs = await this.all();
    return jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  }

  async get(id: string): Promise<Job | undefined> {
    return (await this.all()).find((job) => job.id === id);
  }

  async nextQueued(): Promise<Job | undefined> {
    return this.withLock(async () => {
      const data = await this.read();
      if (data.state?.queuePaused) return undefined;
      const job = data.jobs
        .filter((candidate) => candidate.status === "queued")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
      if (!job) return undefined;
      job.status = "running";
      job.startedAt = new Date().toISOString();
      job.cancelRequested = false;
      job.updatedAt = job.startedAt;
      await this.write(data);
      return job;
    });
  }

  async cancel(id: string): Promise<Job> {
    return this.withLock(async () => {
      const data = await this.read();
      const job = data.jobs.find((candidate) => candidate.id === id);
      if (!job) throw new Error(`Job not found: ${id}`);
      const now = new Date().toISOString();
      if (job.status === "queued") {
        job.status = "cancelled";
        job.finishedAt = now;
        job.errorMessage = "Cancelled before start.";
      } else if (["running", "waiting_publish", "publishing"].includes(job.status)) {
        job.cancelRequested = true;
        job.errorMessage = "Cancellation requested.";
      } else {
        throw new Error(`Job cannot be cancelled from status: ${job.status}`);
      }
      job.updatedAt = now;
      await this.write(data);
      return job;
    });
  }

  async retry(id: string): Promise<Job> {
    return this.withLock(async () => {
      const data = await this.read();
      const source = data.jobs.find((candidate) => candidate.id === id);
      if (!source) throw new Error(`Job not found: ${id}`);
      if (!["failed", "failed_review_required", "cancelled"].includes(source.status)) {
        throw new Error(`Only failed or cancelled jobs can be retried. Current status: ${source.status}`);
      }
      const now = new Date().toISOString();
      const job: Job = {
        id: safeJobId(),
        jobType: source.jobType ?? "article",
        query: source.query,
        mode: source.mode,
        status: "queued",
        discordUserId: source.discordUserId,
        channelId: source.channelId,
        guildId: source.guildId,
        createdAt: now,
        updatedAt: now,
        model: source.model,
        reasoningEffort: source.reasoningEffort,
        daily: source.daily,
        mocMaintenance: source.mocMaintenance,
        imageMaintenance: source.imageMaintenance,
        resultSummary: `Retry of ${source.id}`,
      };
      data.jobs.push(job);
      await this.write(data);
      return job;
    });
  }

  async recoverInterruptedJobs(): Promise<Job[]> {
    return this.withLock(async () => {
      const data = await this.read();
      const interrupted = data.jobs.filter((job) =>
        ["running", "waiting_publish", "publishing"].includes(job.status),
      );
      const now = new Date().toISOString();
      for (const job of interrupted) {
        job.status = "failed_review_required";
        job.finishedAt = now;
        job.updatedAt = now;
        job.errorMessage = "Bot restarted while this job was active. Review or retry the job.";
      }
      if (interrupted.length > 0) await this.write(data);
      return interrupted;
    });
  }

  async update(id: string, patch: Partial<Job>): Promise<Job> {
    return this.withLock(async () => {
      const data = await this.read();
      const job = data.jobs.find((candidate) => candidate.id === id);
      if (!job) throw new Error(`Job not found: ${id}`);
      Object.assign(job, patch, { updatedAt: new Date().toISOString() });
      await this.write(data);
      return job;
    });
  }

  async countByStatus(status: JobStatus): Promise<number> {
    return (await this.all()).filter((job) => job.status === status).length;
  }

  async dailyJobsForDate(date: string): Promise<Job[]> {
    return (await this.all()).filter((job) => job.jobType === "daily_news" && job.daily?.date === date);
  }

  private async read(): Promise<StoreData> {
    await this.init();
    const data = JSON.parse(await fs.readFile(this.file, "utf8")) as StoreData;
    data.state ??= defaultState();
    return data;
  }

  private async write(data: StoreData): Promise<void> {
    const tmp = `${this.file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(tmp, this.file);
  }

  private async withLock<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.lock.then(fn, fn);
    this.lock = run.catch(() => undefined);
    return run;
  }
}

function defaultState(): BotState {
  return { queuePaused: false, updatedAt: new Date().toISOString() };
}
