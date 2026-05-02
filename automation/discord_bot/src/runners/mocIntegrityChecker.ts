import fs from "node:fs/promises";
import path from "node:path";

const mocRoots = ["10_Published", "11_Daily", "60_MOCs"];
const mojibakePattern = /(縺|繧|繝|莠|蜑|螟|譁|驥|險|倶|ｮ|ｽ||�|\?{2,})/;

export async function assertMocIntegrity(cwd: string): Promise<void> {
  const findings: string[] = [];
  for (const root of mocRoots) {
    const absoluteRoot = path.join(cwd, root);
    if (!(await exists(absoluteRoot))) continue;
    for (const file of await listMocFiles(absoluteRoot)) {
      const text = await fs.readFile(file, "utf8");
      const lines = text.split(/\r?\n/);
      const badLineIndex = lines.findIndex((line) => mojibakePattern.test(line));
      if (badLineIndex >= 0) {
        findings.push(`${path.relative(cwd, file)}:${badLineIndex + 1}: ${lines[badLineIndex].slice(0, 140)}`);
      }
    }
  }

  if (findings.length > 0) {
    throw new Error(
      [
        "MOC integrity check failed: suspected mojibake found in generated MOCs.",
        ...findings.slice(0, 20),
      ].join("\n"),
    );
  }
}

async function listMocFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMocFiles(entryPath)));
    } else if (entry.isFile() && (entry.name === "_MOC.md" || entryPath.includes(`${path.sep}60_MOCs${path.sep}`))) {
      files.push(entryPath);
    }
  }
  return files;
}

async function exists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}
