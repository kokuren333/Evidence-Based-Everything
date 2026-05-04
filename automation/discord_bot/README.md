# EBE Discord Bot

Discord slash-command automation for Evidence Based Everything.

The bot accepts article requests from Discord, runs Codex in isolated Git worktrees, and publishes successful jobs to the private vault repository. Article generation can run with up to four workers, while merge/commit/push is serialized to protect the main vault.

This guide is written for a public repository. It intentionally avoids hardcoded user names, local paths, GitHub account names, repository names, Discord IDs, and tokens. Put machine-specific values in `.env`, GitHub Secrets, or GitHub Actions Variables.

## What This Bot Does

```text
Discord slash command
  -> queue a job
  -> create an isolated Git worktree
  -> run Codex with the EBE instructions
  -> commit durable generated artifacts on a job branch
  -> merge/push successful jobs to the private vault repository
  -> notify Discord when the job starts, succeeds, or fails
```

Default generation settings:

```text
max article workers: 4
max publisher workers: 1
default model: gpt-5.5
default reasoning effort: low
```

## Security Model

- Real secrets live only in `.env`, which is ignored by Git.
- Runtime queue data lives in `data/`, ignored by Git.
- Runtime logs live in `logs/`, ignored by Git.
- Worker worktrees must be outside the vault repository.
- `/codex` and `/git-debug` are restricted to `DISCORD_ADMIN_USER_IDS`.
- The public mirror workflow copies source files and `.env.example`, but not `.env`, `data/`, `logs/`, `node_modules/`, `.cache/`, or `dist/`.
- Do not commit personal access tokens, Codex auth files, Discord tokens, `.env`, or local runtime databases.
- Prefer a dedicated private repository token or Git Credential Manager for push access.

## Repository Layout

```text
Evidence-Based-Everything/
  automation/
    discord_bot/
      .env.example
      README.md
      package.json
      scripts/
      src/
      data/          # local only, ignored
      logs/          # local only, ignored
      node_modules/  # local only, ignored
```

The worker worktree root must be outside the vault repository:

```text
good:
  D:\ebe-worktrees
  /srv/ebe-worktrees

bad:
  Evidence-Based-Everything/worktrees
```

## Prerequisites

Install these on the machine that will run the bot:

1. Git
2. Node.js 20 or newer
3. Codex CLI
4. Access to clone and push the private vault repository
5. A Discord application with a bot token

Check the local tools:

```powershell
git --version
node -v
npm -v
codex --version
```

Node must be version 20 or newer.

## Discord Application Setup

Create a Discord application in the Discord Developer Portal.

1. Open the Discord Developer Portal.
2. Create a new application.
3. Open the Bot page and create or reset the bot token.
4. Copy the bot token for `DISCORD_TOKEN`.
5. Open General Information and copy the Application ID for `DISCORD_CLIENT_ID`.
6. Invite the bot to your Discord server with these scopes:

```text
bot
applications.commands
```

The bot needs permission to receive slash commands and send messages in the channel where it is used.

To get IDs:

1. Enable Developer Mode in Discord.
2. Right-click the server and copy the server ID for `DISCORD_GUILD_ID`.
3. Right-click your user and copy the user ID for `DISCORD_ADMIN_USER_IDS`.

Multiple admin user IDs can be comma-separated:

```env
DISCORD_ADMIN_USER_IDS=111111111111111111,222222222222222222
```

## GitHub Setup

This project can use a private source repository and a public mirror repository.

In the private repository, configure:

```text
Secrets:
  PUBLIC_MIRROR_TOKEN

Variables:
  PUBLIC_MIRROR_REPOSITORY
```

`PUBLIC_MIRROR_REPOSITORY` should be in `owner/repository` form.

Example value:

```text
owner/public-repository-name
```

Do not put this value directly in the workflow if you want a reusable public setup.

## Clone And Configure

Clone the private vault repository:

```powershell
git clone <private-repository-url> Evidence-Based-Everything
cd Evidence-Based-Everything
```

Create a worktree root outside the repository:

```powershell
mkdir C:\ebe-worktrees
```

Set up the bot:

```powershell
cd .\automation\discord_bot
Copy-Item .env.example .env
notepad .env
```

Fill `.env` with local values. Keep `.env` private.

Minimal example:

```env
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
DISCORD_ADMIN_USER_IDS=

EBE_VAULT_ROOT=
EBE_WORKTREE_ROOT=

EBE_MAX_WORKERS=4
EBE_MAX_PUBLISHERS=1

CODEX_DEFAULT_MODEL=gpt-5.5
CODEX_DEFAULT_REASONING_EFFORT=low
CODEX_COMMAND_TEMPLATE=codex exec --model {model} -c model_reasoning_effort={effort} --cd {cwd} --dangerously-bypass-approvals-and-sandbox -

GIT_REMOTE=origin
GIT_BRANCH=main
GIT_COMMIT_MESSAGE=article update
GIT_BOT_USER_NAME=ebe-discord-bot
GIT_BOT_USER_EMAIL=ebe-discord-bot@example.invalid
```

`EBE_VAULT_ROOT` is the absolute path to the cloned vault repository. `EBE_WORKTREE_ROOT` is the absolute path to the external worker directory.

## Install And Start

Run:

```powershell
npm install
npm run typecheck
.\scripts\check-env.ps1
npm run register
npm run build
npm start
```

If PowerShell blocks script execution, run this in the same terminal session:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\check-env.ps1
```

After startup, test from Discord:

```text
/bot-health
/git-status
```

Then submit a small article job:

```text
/article query:"水分補給の基礎をEBE記事として作成する"
```

Queue the 10 daily news briefings manually:

```text
/daily-news
/daily-news date:"2026-05-02"
```

The scheduled daily news runner queues the same 10 jobs at 06:00 JST when enabled. It refuses to queue if any article for that date already exists under `11_Daily/`, or if non-failed daily jobs for that date already exist in the queue/history.

## Environment Variables

Required:

```env
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
DISCORD_ADMIN_USER_IDS=
EBE_VAULT_ROOT=
EBE_WORKTREE_ROOT=
```

`EBE_WORKTREE_ROOT` must not be inside `EBE_VAULT_ROOT`.

Useful optional settings:

```env
EBE_MAX_WORKERS=4
EBE_MAX_PUBLISHERS=1
EBE_RESOURCE_GUARD_ENABLED=true
EBE_MAX_MEMORY_PERCENT=85
EBE_MAX_CPU_PERCENT=95
EBE_DAILY_NEWS_ENABLED=true
DISCORD_DAILY_NEWS_CHANNEL_ID=
EBE_DAILY_NEWS_HOUR_JST=6
EBE_DAILY_NEWS_MINUTE_JST=0
EBE_KEEP_FAILED_WORKTREES=true
EBE_KEEP_SUCCESSFUL_WORKTREES=false
```

The resource guard may delay new jobs if memory or CPU usage is high.

## Slash Commands

- `/article query:"..." mode:new`
- `/multi_article query:"..." count:15`
- `/codex query:"..."`
- `/job-status job_id:"..."`
- `/job-cancel job_id:"..."`
- `/job-retry job_id:"..."`
- `/daily-news date:"2026-05-02"`
- `/job-cleanup older_than_days:7 dry_run:true`
- `/job-list`
- `/worker-list`
- `/queue-pause`
- `/queue-resume`
- `/git-status`
- `/git-debug action:status`
- `/git-debug action:all`
- `/bot-health`

`/article` immediately queues a job and reports the job ID. The bot posts start, success, and failure updates to the invoking channel.

`/multi_article` expands one broad theme into multiple article titles and queues each title as a normal `/article` job. For example, `/multi_article query:"英文法を網羅" count:15` queues 15 new article jobs covering that theme from overview through advanced topics.

`/codex` is admin-only. It queues a freeform Codex CLI request in `EBE_VAULT_ROOT` with the configured Codex command template. It does not create a worktree and does not automatically commit or push changes.

`/daily-news` is admin-only. It queues one daily news job for each of the 10 fixed fields and defaults to today's JST date.

`/git-debug action:all` runs add/commit/push for the main vault and should be used sparingly. It is admin-only.

`/job-cancel`, `/job-retry`, `/job-cleanup`, `/queue-pause`, and `/queue-resume` are admin-only.

## Publish Flow

```text
/article
  -> queued
  -> worker creates git worktree
  -> Codex runs EBE workflow in that worktree
  -> worker commits generated durable artifacts on a job branch
  -> publisher rebases the job branch onto the latest main
  -> MOC-only rebase conflicts are repaired in the worker worktree
  -> publisher serially merges job branch into main
  -> publisher pushes to the private origin
  -> GitHub Actions updates the public mirror
```

## Codex Command Template

The prompt is sent through stdin. The default is:

```env
CODEX_COMMAND_TEMPLATE=codex exec --model {model} -c model_reasoning_effort={effort} --cd {cwd} --dangerously-bypass-approvals-and-sandbox -
```

If your local Codex CLI uses different flags, change only `.env`; do not edit source code. Available placeholders:

- `{model}`
- `{effort}`
- `{cwd}`
- `{promptFile}`

You can test the Codex command manually:

```powershell
"hello" | codex exec --model gpt-5.5 -c model_reasoning_effort=low --cd "<path-to-vault-or-worktree>" --dangerously-bypass-approvals-and-sandbox -
```

## Mobile Obsidian Reading

This bot is designed so article generation happens on one always-on machine, while phones and tablets can read the resulting Vault.

Recommended pattern:

```text
Bot host:
  clone private repository
  generate articles
  push changes

iPhone / Android:
  pull or sync private repository
  read in Obsidian
```

### Option A: Obsidian Sync

Use Obsidian Sync if you want the simplest mobile setup.

1. Open the Vault on the bot host or desktop.
2. Enable Obsidian Sync for the Vault.
3. Install Obsidian on iPhone or Android.
4. Sign in to the same Obsidian account.
5. Open the synced Vault.

This avoids mobile Git setup. Make sure the bot host remains the only machine that generates and pushes articles.

### Option B: Git-Based Mobile Pull

Use a mobile Git client or Obsidian Git-compatible workflow if you prefer repository-based sync.

Recommended mobile policy:

```text
mobile devices: pull/read
bot host: generate/commit/push
```

This avoids merge conflicts caused by editing the same Vault from multiple devices.

General steps:

1. Install Obsidian on iPhone or Android.
2. Install or configure a Git sync method for the device.
3. Clone or pull the private repository onto the device.
4. Open the cloned folder as an Obsidian Vault.
5. Pull after the bot finishes article generation.

Use a read-only or limited token on mobile when possible.

## Run At Startup

On Windows, Task Scheduler can start the bot automatically.

Suggested action:

```text
Program:
  powershell.exe

Arguments:
  -ExecutionPolicy Bypass -File "<path-to-repo>\automation\discord_bot\scripts\start-bot.ps1"

Start in:
  <path-to-repo>\automation\discord_bot
```

Use "At log on" first while testing. Switch to "At startup" after the setup is stable.

## Operational Notes

- Keep the main vault worktree clean while the bot is running.
- Article generation is parallel, but shared MOC/index files are still a natural conflict point.
- Before publishing, the bot rebases each worker branch onto the latest main. MOC-only conflicts are resolved in the worker worktree and followed by a MOC repair Codex pass.
- If a non-MOC conflict occurs, the job becomes `failed_review_required`; its worktree is kept by default.
- Failed worktrees are kept when `EBE_KEEP_FAILED_WORKTREES=true`.
- Successful worktrees are removed by default.
- If a queued job does not start even though fewer than four workers are running, check resource guard logs in `logs/`.
- If the bot appears to start every job as `slot: 1/4`, make sure only one bot process is running.
- If the bot stops while a job is active, the next startup marks interrupted `running`, `waiting_publish`, and `publishing` jobs as `failed_review_required`. Use `/job-retry` to create a fresh queued copy.

## Troubleshooting

Check whether multiple bot processes are running on Windows:

```powershell
Get-CimInstance Win32_Process -Filter "name = 'node.exe'" |
  Select-Object ProcessId, CommandLine
```

Stop duplicate bot processes:

```powershell
Get-CimInstance Win32_Process -Filter "name = 'node.exe'" |
  Where-Object { $_.CommandLine -like "*automation*discord_bot*" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId }
```

Read runtime logs:

```powershell
Get-ChildItem .\logs
Get-Content .\logs\*.log
```

If Codex fails, inspect the job worktree log:

```powershell
notepad "<worktree-root>\<job-id>\_working\discord_jobs\<job-id>-codex-output.log"
```
