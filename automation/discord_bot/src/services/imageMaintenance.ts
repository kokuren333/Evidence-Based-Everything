import { config } from "../config.js";
import type { Job } from "../types.js";
import type { JobStore } from "../queue/jobStore.js";

export type ImageMaintenanceScope = "all" | "published" | "daily";

export async function enqueueImageMaintenanceJob(
  store: JobStore,
  input: {
    channelId: string;
    guildId: string | null;
    discordUserId: string;
    scope?: ImageMaintenanceScope;
  },
): Promise<Job> {
  const scope = input.scope ?? "all";
  return store.create({
    query: buildImageMaintenanceQuery(scope),
    mode: "update",
    jobType: "image_maintenance",
    discordUserId: input.discordUserId,
    channelId: input.channelId,
    guildId: input.guildId,
    model: config.codex.model,
    reasoningEffort: config.codex.reasoningEffort,
    imageMaintenance: { scope },
  });
}

function buildImageMaintenanceQuery(scope: ImageMaintenanceScope): string {
  const targets =
    scope === "published"
      ? "10_Published published articles"
      : scope === "daily"
        ? "11_Daily daily articles"
        : "10_Published and 11_Daily articles";

  return [
    "Inspect and repair EBE article image paths.",
    `Scope: ${scope}`,
    `Targets: ${targets}`,
    "",
    "Read AGENTS.md, .agents/skills/ebe-orchestrator/SKILL.md, .agents/skills/EBE-SHARED-CONTRACT.md, .agents/skills/ebe-imagegen-infographic/SKILL.md, and .agents/skills/news-skills/SKILL.md before editing.",
    "Scan Markdown image embeds in the target article directories: Obsidian image embeds like ![[...png]] and Markdown image links like ![alt](...).",
    "For every article image reference, verify that the referenced file resolves inside this Vault. Repair broken or bare/ambiguous article image embeds by replacing them with stable vault-relative paths, usually 50_Assets/Infographics/... or 50_Assets/Infographics/Daily/....",
    "For Daily news articles, normalize top infographic embeds to 50_Assets/Infographics/Daily/{yyyy-mm-dd}_{field-slug}.png when that file exists.",
    "For published evergreen articles, normalize infographic embeds to 50_Assets/Infographics/{filename}.png when that file exists.",
    "Do not generate new images unless a published article has no usable copied raster image and the relevant EBE imagegen rule requires one. Prefer repairing paths to existing vault assets.",
    "Do not edit unrelated article prose or Discord bot implementation files during this worker job.",
    "Write a maintenance log under 70_Logs/infographic_logs/ with counts for scanned files, repaired embeds, remaining failures, and verification results.",
    "Before finishing, run a verification pass and ensure no target article has a missing image path.",
  ].join("\n");
}
