import { config } from "./config.js";
import { createDiscordClient } from "./discord/client.js";
import { JobStore } from "./queue/jobStore.js";
import { WorkerPool } from "./queue/workerPool.js";
import { startDailyForecastScheduler } from "./services/dailyForecast.js";
import { startDailyNewsScheduler } from "./services/dailyNews.js";
import { Notifier } from "./services/notifier.js";
import { ensureDir } from "./utils/paths.js";

await ensureDir(config.paths.dataDir);
await ensureDir(config.paths.logDir);
await ensureDir(config.paths.worktreeRoot);

const store = new JobStore();
await store.init();
const recovered = await store.recoverInterruptedJobs();
if (recovered.length > 0) {
  console.warn(`Recovered ${recovered.length} interrupted jobs as failed_review_required.`);
}

let workerPool: WorkerPool;
const client = createDiscordClient(store, () => workerPool);
const notifier = new Notifier(client);
workerPool = new WorkerPool(store, notifier);

await client.login(config.discord.token);
workerPool.start();
const dailyNewsTimer = startDailyNewsScheduler(store, notifier);
const dailyForecastTimer = startDailyForecastScheduler(store, notifier);

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function shutdown(): Promise<void> {
  workerPool.stop();
  if (dailyNewsTimer) clearInterval(dailyNewsTimer);
  if (dailyForecastTimer) clearInterval(dailyForecastTimer);
  client.destroy();
  process.exit(0);
}
