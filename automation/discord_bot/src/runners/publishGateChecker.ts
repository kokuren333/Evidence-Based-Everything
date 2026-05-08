import { runGit } from "../utils/shell.js";

const durablePrefixes = [
  "10_Published/",
  "11_Daily/",
  "12_Forecasting/",
  "20_EvidencePackets/",
  "30_Sources/",
  "40_Claims/",
  "50_Assets/",
  "60_MOCs/",
  "70_Logs/",
];

export async function hasDurableArticleChanges(cwd: string): Promise<boolean> {
  const status = await runGit(cwd, ["-c", "core.quotepath=false", "status", "--porcelain=v1", "-z", "--untracked-files=all"]);
  const paths = status.stdout
    .split("\0")
    .filter(Boolean)
    .map((line) => line.slice(3).replace(/\\/g, "/"));
  return paths.some((file) => durablePrefixes.some((prefix) => file.startsWith(prefix)));
}
