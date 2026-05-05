import fs from "node:fs/promises";
import path from "node:path";

const checkedRoots = ["10_Published", "11_Daily", "60_MOCs"];
const mojibakePattern = /(縺|繧|繝|譁|邵|郢|隴|鬩|髫|陷|陞|莠|螳|蛹|蜿|遘|謾|闔|�|\?{3,})/;

export async function assertMocIntegrity(cwd: string): Promise<void> {
  const findings: string[] = [];
  for (const root of checkedRoots) {
    const absoluteRoot = path.join(cwd, root);
    if (!(await exists(absoluteRoot))) continue;
    for (const file of await listMarkdownFiles(absoluteRoot)) {
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
        "Vault content integrity check failed: suspected mojibake found in Markdown output.",
        ...findings.slice(0, 20),
      ].join("\n"),
    );
  }
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
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
