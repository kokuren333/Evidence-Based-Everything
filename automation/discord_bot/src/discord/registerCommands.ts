import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from "../config.js";

const commands = [
  new SlashCommandBuilder()
    .setName("article")
    .setDescription("Queue an EBE article creation or update job.")
    .addStringOption((option) =>
      option.setName("query").setDescription("Article theme or update request.").setRequired(true).setMaxLength(1800),
    )
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Article workflow mode.")
        .setRequired(false)
        .addChoices({ name: "new", value: "new" }, { name: "update", value: "update" }),
    ),
  new SlashCommandBuilder()
    .setName("multi_article")
    .setDescription("Queue multiple EBE article jobs that cover one theme.")
    .addStringOption((option) =>
      option.setName("query").setDescription("Theme to cover across multiple articles.").setRequired(true).setMaxLength(600),
    )
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("Number of article jobs to queue, 2-25.")
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(25),
    ),
  new SlashCommandBuilder()
    .setName("codex")
    .setDescription("Admin-only: run a free Codex query from the EBE vault root.")
    .addStringOption((option) =>
      option.setName("query").setDescription("Freeform Codex request.").setRequired(true).setMaxLength(1800),
    ),
  new SlashCommandBuilder()
    .setName("job-status")
    .setDescription("Show one job status.")
    .addStringOption((option) => option.setName("job_id").setDescription("Job ID.").setRequired(true)),
  new SlashCommandBuilder()
    .setName("job-cancel")
    .setDescription("Admin-only: cancel a queued or running job.")
    .addStringOption((option) => option.setName("job_id").setDescription("Job ID.").setRequired(true)),
  new SlashCommandBuilder()
    .setName("job-retry")
    .setDescription("Admin-only: retry a failed or cancelled job.")
    .addStringOption((option) => option.setName("job_id").setDescription("Job ID.").setRequired(true)),
  new SlashCommandBuilder()
    .setName("daily-news")
    .setDescription("Admin-only: queue the 10 daily news briefings immediately.")
    .addStringOption((option) =>
      option
        .setName("date")
        .setDescription("Optional JST date to generate, YYYY-MM-DD. Defaults to today.")
        .setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("daily_forecast")
    .setDescription("Admin-only: queue the 5 daily forecasting articles immediately.")
    .addStringOption((option) =>
      option
        .setName("date")
        .setDescription("Optional JST date to generate, YYYY-MM-DD. Defaults to today.")
        .setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("moc-maintenance")
    .setDescription("Admin-only: rebuild published and daily Obsidian MOCs in bulk.")
    .addStringOption((option) =>
      option
        .setName("scope")
        .setDescription("Which MOC set to rebuild. Defaults to all.")
        .setRequired(false)
        .addChoices(
          { name: "all", value: "all" },
          { name: "published", value: "published" },
          { name: "daily", value: "daily" },
        ),
    ),
  new SlashCommandBuilder()
    .setName("image_maintenance")
    .setDescription("Admin-only: inspect and repair broken article image paths.")
    .addStringOption((option) =>
      option
        .setName("scope")
        .setDescription("Which article set to inspect. Defaults to all.")
        .setRequired(false)
        .addChoices(
          { name: "all", value: "all" },
          { name: "published", value: "published" },
          { name: "daily", value: "daily" },
        ),
    ),
  new SlashCommandBuilder()
    .setName("job-cleanup")
    .setDescription("Admin-only: list or remove old failed job worktrees.")
    .addIntegerOption((option) =>
      option.setName("older_than_days").setDescription("Only clean jobs older than this many days.").setRequired(false),
    )
    .addBooleanOption((option) =>
      option.setName("dry_run").setDescription("List targets without removing worktrees.").setRequired(false),
    ),
  new SlashCommandBuilder().setName("job-list").setDescription("Show recent jobs."),
  new SlashCommandBuilder().setName("worker-list").setDescription("Show active article workers."),
  new SlashCommandBuilder().setName("queue-pause").setDescription("Admin-only: pause starting new queued jobs."),
  new SlashCommandBuilder().setName("queue-resume").setDescription("Admin-only: resume starting queued jobs."),
  new SlashCommandBuilder().setName("git-status").setDescription("Show private vault git status."),
  new SlashCommandBuilder()
    .setName("git-debug")
    .setDescription("Admin-only git diagnostics or add/commit/push sync.")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Debug action.")
        .setRequired(true)
        .addChoices({ name: "status", value: "status" }, { name: "all", value: "all" }),
    ),
  new SlashCommandBuilder().setName("bot-health").setDescription("Show bot health."),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(config.discord.token);

for (const guildId of config.discord.guildIds) {
  await rest.put(Routes.applicationGuildCommands(config.discord.clientId, guildId), { body: commands });
  console.log(`Registered ${commands.length} guild slash commands for guild ${guildId}.`);
}
