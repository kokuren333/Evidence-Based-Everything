import fs from "node:fs/promises";
import path from "node:path";

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export function safeJobId(): string {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `job-${stamp}-${suffix}`;
}

export function safeBranchName(jobId: string): string {
  return `bot/${jobId.replace(/[^A-Za-z0-9._-]/g, "-")}`;
}

export function safeWorktreePath(root: string, jobId: string): string {
  return path.join(root, jobId.replace(/[^A-Za-z0-9._-]/g, "-"));
}
