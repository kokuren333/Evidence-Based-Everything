import { config } from "../config.js";
import type { Job } from "../types.js";
import type { JobStore } from "../queue/jobStore.js";

export type MocMaintenanceScope = "all" | "published" | "daily";

export async function enqueueMocMaintenanceJob(
  store: JobStore,
  input: {
    channelId: string;
    guildId: string | null;
    discordUserId: string;
    scope?: MocMaintenanceScope;
  },
): Promise<Job> {
  const scope = input.scope ?? "all";
  return store.create({
    query: buildMocMaintenanceQuery(scope),
    mode: "update",
    jobType: "moc_maintenance",
    discordUserId: input.discordUserId,
    channelId: input.channelId,
    guildId: input.guildId,
    model: config.codex.model,
    reasoningEffort: config.codex.reasoningEffort,
    mocMaintenance: { scope },
  });
}

function buildMocMaintenanceQuery(scope: MocMaintenanceScope): string {
  const targets =
    scope === "published"
      ? "10_Published and 60_MOCs for published articles"
      : scope === "daily"
        ? "11_Daily daily MOCs"
        : "10_Published, 11_Daily, and 60_MOCs";

  return [
    "Repair and rebuild the EBE Obsidian MOCs in bulk.",
    `Scope: ${scope}`,
    `Targets: ${targets}`,
    "",
    "Read AGENTS.md, .agents/skills/ebe-orchestrator/SKILL.md, .agents/skills/EBE-SHARED-CONTRACT.md, and .agents/skills/ebe-category-subfield-moc-manager/SKILL.md before editing.",
    "Scan the real files under the target directories, then update MOCs so every article is reachable.",
    "For 10_Published: create or update 10_Published/_MOC.md as the root published MOC, then rebuild category and subfield MOCs as systematic Obsidian maps, not append-only chronological lists. Include every category, every subfield, and every published article reachable from the relevant root/category/subfield MOC path. Update global MOCs in 60_MOCs when in scope.",
    "For 11_Daily: rebuild the root daily MOC plus field/month MOCs as useful indexes by field and date. Every daily briefing file must be linked from the appropriate field/month/date path.",
    "Check for stale links, duplicate links, missing links, orphaned articles, and missing _MOC.md files. Create or update only MOC/log files needed for this maintenance.",
    "Write all MOC files as UTF-8. Before finishing, scan generated MOCs for mojibake such as 縺, 繧, 繝, 譁, �, or ??? and repair any corrupted text.",
    "Write a taxonomy/MOC maintenance log under 70_Logs/taxonomy_logs/ with counts, changed files, and coverage verification.",
    "Do not edit automation/discord_bot files during this worker job.",
  ].join("\n");
}
