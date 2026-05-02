import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { ensureDir } from "../utils/paths.js";

export async function writeRuntimeLog(name: string, content: string): Promise<string> {
  await ensureDir(config.paths.logDir);
  const file = path.join(config.paths.logDir, name);
  await fs.appendFile(file, content.endsWith("\n") ? content : `${content}\n`, "utf8");
  return file;
}

export async function writeJobLog(jobId: string, content: string): Promise<string> {
  const date = new Date().toISOString().slice(0, 10);
  return writeRuntimeLog(`${date}-${jobId}.log`, content);
}
