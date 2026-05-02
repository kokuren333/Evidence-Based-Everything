import { config } from "../config.js";
import { commitWorkerChanges, publishWorkerBranch } from "../runners/gitPublisher.js";
import { assertMocIntegrity } from "../runners/mocIntegrityChecker.js";
import { hasDurableArticleChanges } from "../runners/publishGateChecker.js";
import { runCodexForJob } from "../runners/codexRunner.js";
import { createWorktree, removeWorktree } from "../runners/workspaceManager.js";
import { canStartWorker } from "../services/resourceGuard.js";
import { writeJobLog } from "../services/logWriter.js";
import type { Job } from "../types.js";
import type { JobStore } from "./jobStore.js";
import type { Notifier } from "../services/notifier.js";

interface ActiveWorker {
  jobId: string;
  startedAt: string;
  abortController: AbortController;
}

export class WorkerPool {
  private active = 0;
  private timer: NodeJS.Timeout | undefined;
  private activeWorkers = new Map<string, ActiveWorker>();

  constructor(
    private readonly store: JobStore,
    private readonly notifier: Notifier,
  ) {}

  start(): void {
    this.timer = setInterval(() => {
      void this.tick();
    }, 5000);
    void this.tick();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async tick(): Promise<void> {
    const state = await this.store.state();
    if (state.queuePaused) return;
    while (this.active < config.workers.maxWorkers) {
      const guard = await canStartWorker();
      if (!guard.ok) {
        await writeJobLog("resource-guard", `${new Date().toISOString()} ${guard.reason}`);
        return;
      }
      const job = await this.store.nextQueued();
      if (!job) return;
      this.active += 1;
      const abortController = new AbortController();
      this.activeWorkers.set(job.id, { jobId: job.id, startedAt: new Date().toISOString(), abortController });
      void this.runJob(job).finally(() => {
        this.active -= 1;
        this.activeWorkers.delete(job.id);
      });
    }
  }

  listActiveWorkers(): ActiveWorker[] {
    return [...this.activeWorkers.values()];
  }

  cancelActiveJob(jobId: string): boolean {
    const worker = this.activeWorkers.get(jobId);
    if (!worker) return false;
    worker.abortController.abort();
    return true;
  }

  async cleanupFailedWorktrees(olderThanDays: number, dryRun: boolean): Promise<string[]> {
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const jobs = await this.store.all();
    const targets = jobs.filter((job) => {
      if (!["failed", "failed_review_required", "cancelled"].includes(job.status)) return false;
      if (!job.worktreePath || !job.branchName) return false;
      const finishedAt = job.finishedAt ?? job.updatedAt;
      return new Date(finishedAt).getTime() <= cutoff;
    });
    const cleaned: string[] = [];
    for (const job of targets) {
      cleaned.push(`${job.id}: ${job.worktreePath}`);
      if (!dryRun) {
        await removeWorktree(job.worktreePath!, job.branchName!).catch((error) =>
          writeJobLog(job.id, `cleanup failed: ${error instanceof Error ? error.message : String(error)}`),
        );
        await this.store.update(job.id, {
          resultSummary: `Failed worktree cleanup ${new Date().toISOString()}`,
          worktreePath: undefined,
          branchName: undefined,
        });
      }
    }
    return cleaned;
  }

  private async runJob(initialJob: Job): Promise<void> {
    let job = initialJob;
    try {
      await this.notifier.jobStarted(job, this.active, config.workers.maxWorkers);
      await this.throwIfCancelled(job.id);
      const workspace = await createWorktree(job);
      job = await this.store.update(job.id, workspace);
      await writeJobLog(job.id, `Created worktree ${workspace.worktreePath} on ${workspace.branchName}`);

      await this.throwIfCancelled(job.id);
      const activeWorker = this.activeWorkers.get(job.id);
      await runCodexForJob(job, activeWorker?.abortController.signal);
      if (job.jobType === "moc_maintenance") {
        await assertMocIntegrity(job.worktreePath!);
      }
      await this.throwIfCancelled(job.id);
      if (!(await hasDurableArticleChanges(job.worktreePath!))) {
        throw new Error("Codex produced no durable EBE article artifacts outside ignored working/runtime paths.");
      }

      const commitSha = await commitWorkerChanges(job);
      job = await this.store.update(job.id, { status: "waiting_publish", commitSha });
      await writeJobLog(job.id, `Worker commit ${commitSha}`);

      await this.throwIfCancelled(job.id);
      job = await this.store.update(job.id, { status: "publishing" });
      const pushedCommitSha = await publishWorkerBranch(job);
      job = await this.store.update(job.id, {
        status: "succeeded",
        pushedCommitSha,
        finishedAt: new Date().toISOString(),
        resultSummary: "Published to private repository.",
      });

      if (!config.workers.keepSuccessfulWorktrees && job.worktreePath && job.branchName) {
        await removeWorktree(job.worktreePath, job.branchName);
      }
      await this.notifier.jobSucceeded(job);
    } catch (error) {
      const current = (await this.store.get(initialJob.id)) ?? job;
      const errorText = String(error);
      const failedStatus =
        errorText.toLowerCase().includes("cancelled") || errorText.toLowerCase().includes("aborted")
          ? "cancelled"
          : errorText.toLowerCase().includes("merge conflict")
            ? "failed_review_required"
            : "failed";
      const updated = await this.store.update(initialJob.id, {
        status: failedStatus,
        errorMessage: error instanceof Error ? error.message : String(error),
        finishedAt: new Date().toISOString(),
      });
      await writeJobLog(initialJob.id, `FAILED\n${updated.errorMessage ?? String(error)}`);
      if (!config.workers.keepFailedWorktrees && current.worktreePath && current.branchName) {
        await removeWorktree(current.worktreePath, current.branchName).catch(() => undefined);
      }
      await this.notifier.jobFailed(updated, error);
    }
  }

  private async throwIfCancelled(jobId: string): Promise<void> {
    const job = await this.store.get(jobId);
    if (job?.cancelRequested) {
      throw new Error("Job cancelled by administrator.");
    }
  }
}
