import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import type { Job } from "../types.js";
import type { JobStore } from "../queue/jobStore.js";
import type { Notifier } from "./notifier.js";

export interface DailyNewsField {
  number: number;
  name: string;
  slug: string;
  directoryName: string;
}

export const dailyNewsFields: DailyNewsField[] = [
  field(1, "Politics_International_Relations", "politics-international-relations"),
  field(2, "Economy_Finance", "economy-finance"),
  field(3, "Technology_AI", "technology-ai"),
  field(4, "Science_Medicine_Life", "science-medicine-life"),
  field(5, "Environment_Energy_Resources", "environment-energy-resources"),
  field(6, "Society_Population_Education", "society-population-education"),
  field(7, "Culture_Media_Ideas", "culture-media-ideas"),
  field(8, "Law_Institutions_Ethics", "law-institutions-ethics"),
  field(9, "Business_Industry_Innovation", "business-industry-innovation"),
  field(10, "Incidents_Risks_Safety", "incidents-risks-safety"),
];

export interface DailyNewsEnqueueResult {
  date: string;
  jobs: Job[];
  skippedReason?: string;
}

export async function enqueueDailyNewsJobs(
  store: JobStore,
  input: {
    channelId: string;
    guildId: string | null;
    discordUserId: string;
    date?: string;
    force?: boolean;
  },
): Promise<DailyNewsEnqueueResult> {
  const date = input.date ?? currentJstDate();
  assertIsoDate(date);
  const yearMonth = date.slice(0, 7);
  const targetPaths = dailyNewsFields.map((newsField) => dailyNewsTargetPath(newsField, date));
  const existingFile = await firstExistingVaultPath(targetPaths);
  if (existingFile && !input.force) {
    throw new Error(`Daily news already exists for ${date}: ${existingFile}`);
  }

  const existingJobs = (await store.dailyJobsForDate(date)).filter(
    (job) => !["failed", "failed_review_required", "cancelled"].includes(job.status),
  );
  if (existingJobs.length > 0 && !input.force) {
    throw new Error(`Daily news jobs already exist for ${date}: ${existingJobs.map((job) => job.id).join(", ")}`);
  }

  const jobs: Job[] = [];
  for (const newsField of dailyNewsFields) {
    const targetPath = dailyNewsTargetPath(newsField, date);
    const job = await store.create({
      query: buildDailyNewsQuery(newsField, date, targetPath),
      mode: "new",
      jobType: "daily_news",
      discordUserId: input.discordUserId,
      channelId: input.channelId,
      guildId: input.guildId,
      model: config.codex.model,
      reasoningEffort: config.codex.reasoningEffort,
      daily: {
        date,
        yearMonth,
        fieldNumber: newsField.number,
        fieldName: newsField.name,
        fieldSlug: newsField.slug,
        directoryName: newsField.directoryName,
        targetPath,
      },
    });
    jobs.push(job);
  }
  return { date, jobs };
}

export function startDailyNewsScheduler(store: JobStore, notifier: Notifier): NodeJS.Timeout | undefined {
  if (!config.dailyNews.enabled) return undefined;
  if (!config.dailyNews.channelId) {
    console.warn("Daily news scheduler is enabled but DISCORD_DAILY_NEWS_CHANNEL_ID is empty; scheduler not started.");
    return undefined;
  }

  let lastTriggeredDate = "";
  const tick = async () => {
    const now = jstParts(new Date());
    if (now.hour !== config.dailyNews.hourJst || now.minute !== config.dailyNews.minuteJst) return;
    if (lastTriggeredDate === now.date) return;
    lastTriggeredDate = now.date;
    try {
      const result = await enqueueDailyNewsJobs(store, {
        channelId: config.dailyNews.channelId,
        guildId: config.discord.guildId,
        discordUserId: "daily-news-scheduler",
        date: now.date,
      });
      await notifier.send(
        config.dailyNews.channelId,
        `daily news queued: \`${result.date}\` jobs=\`${result.jobs.length}\``,
      );
    } catch (error) {
      await notifier.send(
        config.dailyNews.channelId,
        `daily news schedule skipped/failed: \`${now.date}\`\n\`\`\`text\n${String(error).slice(0, 1200)}\n\`\`\``,
      );
    }
  };

  void tick();
  return setInterval(() => void tick(), 60_000);
}

export function dailyNewsTargetPath(newsField: DailyNewsField, date: string): string {
  return [
    "11_Daily",
    newsField.directoryName,
    date.slice(0, 7),
    `${date}_${newsField.name}.md`,
  ].join("/");
}

function field(number: number, name: string, slug: string): DailyNewsField {
  return {
    number,
    name,
    slug,
    directoryName: `${String(number).padStart(2, "0")}_${name}`,
  };
}

function buildDailyNewsQuery(newsField: DailyNewsField, date: string, targetPath: string): string {
  return [
    `Create the EBE Daily News briefing for ${date}.`,
    `Daily field: ${newsField.directoryName}`,
    `Target file: ${targetPath}`,
    "",
    "Use `.agents/skills/news-skills/SKILL.md` and the EBE shared contract.",
    "Collect reliable domestic and international sources covering yesterday through today, verify important claims, generate an imagegen infographic, and write the daily news article in Japanese.",
    "Stop without publishing if the target file already exists.",
  ].join("\n");
}

async function firstExistingVaultPath(paths: string[]): Promise<string | undefined> {
  for (const relativePath of paths) {
    try {
      await fs.access(path.join(config.paths.vaultRoot, relativePath));
      return relativePath;
    } catch {
      // Keep scanning.
    }
  }
  return undefined;
}

function currentJstDate(): string {
  return jstParts(new Date()).date;
}

function jstParts(date: Date): { date: string; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    hour: Number.parseInt(value("hour"), 10),
    minute: Number.parseInt(value("minute"), 10),
  };
}

function assertIsoDate(date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid daily news date. Expected YYYY-MM-DD, got: ${date}`);
  }
}
