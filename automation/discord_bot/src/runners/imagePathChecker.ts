import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export type ImagePathScope = "all" | "published" | "daily" | "forecasting";

interface ImageReference {
  articlePath: string;
  line: number;
  rawTarget: string;
}

interface ImageFinding extends ImageReference {
  reason: string;
}

const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);

export async function assertArticleImagePaths(cwd: string, scope: ImagePathScope = "all"): Promise<void> {
  const findings = await findArticleImagePathFindings(cwd, scope);
  if (findings.length > 0) {
    throw new Error(
      [
        `Article image path check failed: ${findings.length} unresolved image reference(s).`,
        ...findings
          .slice(0, 40)
          .map((finding) => `${finding.articlePath}:${finding.line}: ${finding.reason}: ${finding.rawTarget}`),
      ].join("\n"),
    );
  }
}

async function findArticleImagePathFindings(cwd: string, scope: ImagePathScope): Promise<ImageFinding[]> {
  const articleRoots =
    scope === "published"
      ? ["10_Published"]
      : scope === "daily"
        ? ["11_Daily"]
        : scope === "forecasting"
          ? ["12_Forecasting"]
          : ["10_Published", "11_Daily", "12_Forecasting"];
  const imageIndex = await buildImageIndex(cwd);
  const findings: ImageFinding[] = [];

  for (const root of articleRoots) {
    const absoluteRoot = path.join(cwd, root);
    if (!(await exists(absoluteRoot))) continue;
    for (const file of await listMarkdownFiles(absoluteRoot)) {
      if (path.basename(file).toLowerCase() === "_moc.md") continue;
      const text = await fs.readFile(file, "utf8");
      const articlePath = toVaultPath(cwd, file);
      for (const ref of extractImageReferences(text, articlePath)) {
        const resolution = resolveImageReference(cwd, file, ref.rawTarget, imageIndex);
        if (!resolution.ok) findings.push({ ...ref, reason: resolution.reason });
      }
    }
  }

  return findings;
}

function resolveImageReference(
  cwd: string,
  articleFile: string,
  rawTarget: string,
  imageIndex: Map<string, string[]>,
): { ok: true } | { ok: false; reason: string } {
  const target = normalizeTarget(rawTarget);
  if (!target) return { ok: false, reason: "empty image target" };
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return { ok: true };
  if (target.startsWith("#")) return { ok: true };

  const candidates = candidatePaths(cwd, articleFile, target);
  for (const candidate of candidates) {
    if (existsSyncLike(candidate)) return { ok: true };
  }

  if (!target.includes("/") && !target.includes("\\")) {
    const basenameMatches = imageIndex.get(target.toLowerCase()) ?? [];
    if (basenameMatches.length === 1) return { ok: false, reason: "basename-only image target; use a stable vault-relative path" };
    if (basenameMatches.length > 1) return { ok: false, reason: "ambiguous basename-only image target" };
  }

  return { ok: false, reason: "missing image file" };
}

function candidatePaths(cwd: string, articleFile: string, target: string): string[] {
  const normalized = target.replace(/\\/g, "/");
  const paths: string[] = [];
  if (path.isAbsolute(normalized)) {
    paths.push(normalized);
  } else {
    paths.push(path.resolve(cwd, normalized));
    paths.push(path.resolve(path.dirname(articleFile), normalized));
  }
  return [...new Set(paths)];
}

function normalizeTarget(rawTarget: string): string {
  return rawTarget
    .trim()
    .replace(/^<|>$/g, "")
    .split("#")[0]
    .split("|")[0]
    .split("?")[0]
    .trim();
}

function extractImageReferences(text: string, articlePath: string): ImageReference[] {
  const refs: ImageReference[] = [];
  const lines = text.split(/\r?\n/);

  lines.forEach((lineText, index) => {
    for (const match of lineText.matchAll(/!\[\[([^\]]+)\]\]/g)) {
      const target = match[1].trim();
      if (isImageTarget(target)) refs.push({ articlePath, line: index + 1, rawTarget: target });
    }
    for (const match of lineText.matchAll(/!\[[^\]]*]\(([^)]+)\)/g)) {
      const target = match[1].trim();
      if (isImageTarget(target)) refs.push({ articlePath, line: index + 1, rawTarget: target });
    }
  });

  return refs;
}

function isImageTarget(rawTarget: string): boolean {
  const clean = normalizeTarget(rawTarget).toLowerCase();
  return imageExtensions.has(path.extname(clean));
}

async function buildImageIndex(cwd: string): Promise<Map<string, string[]>> {
  const roots = ["00_Index", "10_Published", "11_Daily", "12_Forecasting", "50_Assets"];
  const index = new Map<string, string[]>();
  for (const root of roots) {
    const absoluteRoot = path.join(cwd, root);
    if (!(await exists(absoluteRoot))) continue;
    for (const file of await listFiles(absoluteRoot)) {
      if (!imageExtensions.has(path.extname(file).toLowerCase())) continue;
      const key = path.basename(file).toLowerCase();
      const values = index.get(key) ?? [];
      values.push(toVaultPath(cwd, file));
      index.set(key, values);
    }
  }
  return index;
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  return (await listFiles(dir)).filter((file) => path.extname(file).toLowerCase() === ".md");
}

async function listFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
    } else if (entry.isFile()) {
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

function existsSyncLike(file: string): boolean {
  return existsSync(file);
}

function toVaultPath(cwd: string, file: string): string {
  return path.relative(cwd, file).replace(/\\/g, "/");
}
