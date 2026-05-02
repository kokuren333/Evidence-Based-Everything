import os from "node:os";
import { config } from "../config.js";

export async function canStartWorker(): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!config.resourceGuard.enabled) return { ok: true };

  const total = os.totalmem();
  const used = total - os.freemem();
  const memoryPercent = Math.round((used / total) * 100);
  if (memoryPercent >= config.resourceGuard.maxMemoryPercent) {
    return { ok: false, reason: `memory usage is ${memoryPercent}%` };
  }

  const cpuPercent = await sampleCpuPercent(750);
  if (cpuPercent >= config.resourceGuard.maxCpuPercent) {
    return { ok: false, reason: `CPU usage is ${cpuPercent}%` };
  }

  return { ok: true };
}

export async function resourceSnapshot(): Promise<{
  enabled: boolean;
  memoryPercent: number;
  cpuPercent: number;
  ok: boolean;
  reason?: string;
}> {
  const total = os.totalmem();
  const used = total - os.freemem();
  const memoryPercent = Math.round((used / total) * 100);
  const cpuPercent = await sampleCpuPercent(500);
  if (!config.resourceGuard.enabled) {
    return { enabled: false, memoryPercent, cpuPercent, ok: true };
  }
  if (memoryPercent >= config.resourceGuard.maxMemoryPercent) {
    return { enabled: true, memoryPercent, cpuPercent, ok: false, reason: `memory ${memoryPercent}%` };
  }
  if (cpuPercent >= config.resourceGuard.maxCpuPercent) {
    return { enabled: true, memoryPercent, cpuPercent, ok: false, reason: `CPU ${cpuPercent}%` };
  }
  return { enabled: true, memoryPercent, cpuPercent, ok: true };
}

function cpuSnapshot() {
  return os.cpus().map((cpu) => ({ ...cpu.times }));
}

async function sampleCpuPercent(delayMs: number): Promise<number> {
  const start = cpuSnapshot();
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  const end = cpuSnapshot();
  let idle = 0;
  let total = 0;
  for (let i = 0; i < end.length; i += 1) {
    const s = start[i];
    const e = end[i];
    const idleDelta = e.idle - s.idle;
    const totalDelta =
      e.user - s.user + (e.nice - s.nice) + (e.sys - s.sys) + idleDelta + (e.irq - s.irq);
    idle += idleDelta;
    total += totalDelta;
  }
  if (total <= 0) return 0;
  return Math.round(100 - (idle / total) * 100);
}
