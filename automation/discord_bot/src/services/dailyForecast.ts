import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import type { Job } from "../types.js";
import type { JobStore } from "../queue/jobStore.js";
import type { Notifier } from "./notifier.js";

export interface DailyForecastType {
  name: string;
  slug: string;
  fileName: string;
  title: string;
}

export const dailyForecastTypes: DailyForecastType[] = [
  forecastType("zodiac", "zodiac.md", "12星座別・今日の運勢"),
  forecastType("blood-type", "blood-type.md", "血液型別・今日の運勢"),
  forecastType("eto", "eto.md", "干支別・今日の運勢"),
  forecastType("mbti", "mbti.md", "MBTI別・今日の運勢"),
  forecastType("lucky-action", "lucky-action.md", "今日の開運アクション"),
];

export interface DailyForecastEnqueueResult {
  date: string;
  jobs: Job[];
  skippedReason?: string;
}

export async function enqueueDailyForecastJobs(
  store: JobStore,
  input: {
    channelId: string;
    guildId: string | null;
    discordUserId: string;
    date?: string;
    force?: boolean;
  },
): Promise<DailyForecastEnqueueResult> {
  const date = input.date ?? currentJstDate();
  assertIsoDate(date);
  const [year, month] = date.split("-");
  const plans = dailyForecastTypes.map((forecast) => ({
    forecast,
    targetPath: dailyForecastTargetPath(forecast, date),
  }));
  const existingFiles = new Set(await existingVaultPaths(plans.map((plan) => plan.targetPath)));
  const existingJobs = (await store.forecastJobsForDate(date)).filter(
    (job) => !["failed", "failed_review_required", "cancelled"].includes(job.status),
  );
  const existingJobTargets = new Set(existingJobs.map((job) => job.forecast?.targetPath).filter(Boolean));
  const plansToQueue = input.force
    ? plans
    : plans.filter((plan) => !existingFiles.has(plan.targetPath) && !existingJobTargets.has(plan.targetPath));

  if (plansToQueue.length === 0 && !input.force) {
    throw new Error(
      [
        `Daily forecast already exists or is already queued/running for every type on ${date}.`,
        existingFiles.size ? `existing files: ${existingFiles.size}` : undefined,
        existingJobs.length ? `active jobs: ${existingJobs.map((job) => job.id).join(", ")}` : undefined,
      ]
        .filter(Boolean)
        .join(" "),
    );
  }

  const jobs: Job[] = [];
  for (const { forecast, targetPath } of plansToQueue) {
    const job = await store.create({
      query: buildDailyForecastQuery(forecast, date, targetPath),
      mode: "new",
      jobType: "daily_forecast",
      discordUserId: input.discordUserId,
      channelId: input.channelId,
      guildId: input.guildId,
      model: config.codex.model,
      reasoningEffort: config.codex.reasoningEffort,
      forecast: {
        date,
        year,
        month,
        forecastType: forecast.name,
        slug: forecast.slug,
        fileName: forecast.fileName,
        targetPath,
      },
    });
    jobs.push(job);
  }

  const skippedCount = plans.length - plansToQueue.length;
  return {
    date,
    jobs,
    skippedReason: skippedCount > 0 ? `Skipped ${skippedCount} types with existing files or active jobs.` : undefined,
  };
}

export function startDailyForecastScheduler(store: JobStore, notifier: Notifier): NodeJS.Timeout | undefined {
  if (!config.dailyForecast.enabled) return undefined;
  if (!config.dailyForecast.channelId) {
    console.warn("Daily forecast scheduler is enabled but DISCORD_DAILY_FORECAST_CHANNEL_ID is empty; scheduler not started.");
    return undefined;
  }

  let lastTriggeredDate = "";
  const tick = async () => {
    const now = jstParts(new Date());
    if (now.hour !== config.dailyForecast.hourJst || now.minute !== config.dailyForecast.minuteJst) return;
    if (lastTriggeredDate === now.date) return;
    lastTriggeredDate = now.date;
    try {
      const result = await enqueueDailyForecastJobs(store, {
        channelId: config.dailyForecast.channelId,
        guildId: config.discord.guildId,
        discordUserId: "daily-forecast-scheduler",
        date: now.date,
      });
      await notifier.send(
        config.dailyForecast.channelId,
        `daily forecast queued: \`${result.date}\` jobs=\`${result.jobs.length}\``,
      );
    } catch (error) {
      await notifier.send(
        config.dailyForecast.channelId,
        `daily forecast schedule skipped/failed: \`${now.date}\`\n\`\`\`text\n${String(error).slice(0, 1200)}\n\`\`\``,
      );
    }
  };

  void tick();
  return setInterval(() => void tick(), 60_000);
}

export function dailyForecastTargetPath(forecast: DailyForecastType, date: string): string {
  const [year, month] = date.split("-");
  return ["12_Forecasting", "daily", year, month, date, forecast.fileName].join("/");
}

function forecastType(name: string, fileName: string, title: string): DailyForecastType {
  return { name, slug: name, fileName, title };
}

function buildDailyForecastQuery(forecast: DailyForecastType, date: string, targetPath: string): string {
  return [
    `Create the EBE Daily Forecasting article for ${date}.`,
    `Forecast type: ${forecast.name}`,
    `Article title theme: ${forecast.title}`,
    `Target file: ${targetPath}`,
    "",
    "Use `.agents/skills/ebe-daily-forecasting/SKILL.md` and the EBE shared contract.",
    "Collect reliable sources for today's cultural, seasonal, news, astronomy/calendar, personality-theory, or wellbeing context as appropriate to this forecast type.",
    "Generate an imagegen raster visual card, copy it to `50_Assets/Forecasting/`, insert it at the top, and log the image.",
    "Make the article current and source-informed, not a reusable template. Check nearby existing 12_Forecasting files when present and avoid repeating yesterday's framing, colors, items, and lead metaphors.",
    "Stop without publishing if the target file already exists.",
  ].join("\n");
}

async function existingVaultPaths(paths: string[]): Promise<string[]> {
  const checks = await Promise.all(
    paths.map(async (relativePath) => {
      try {
        await fs.access(path.join(config.paths.vaultRoot, relativePath));
        return relativePath;
      } catch {
        return undefined;
      }
    }),
  );
  return checks.filter((relativePath): relativePath is string => Boolean(relativePath));
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
    throw new Error(`Invalid daily forecast date. Expected YYYY-MM-DD, got: ${date}`);
  }
}
