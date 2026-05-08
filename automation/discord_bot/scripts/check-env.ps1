Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$required = @(
  "DISCORD_TOKEN",
  "DISCORD_CLIENT_ID",
  "DISCORD_ADMIN_USER_IDS",
  "EBE_VAULT_ROOT",
  "EBE_WORKTREE_ROOT"
)

$envFile = Join-Path (Resolve-Path (Join-Path $PSScriptRoot "..")) ".env"
if (-not (Test-Path -LiteralPath $envFile)) {
  throw ".env was not found: $envFile"
}

$values = @{}
Get-Content -LiteralPath $envFile | ForEach-Object {
  $line = $_.Trim()
  if ($line -eq "" -or $line.StartsWith("#")) { return }
  $parts = $line.Split("=", 2)
  if ($parts.Count -eq 2) {
    $values[$parts[0].Trim()] = $parts[1].Trim()
  }
}

foreach ($name in $required) {
  if (-not $values.ContainsKey($name) -or [string]::IsNullOrWhiteSpace($values[$name])) {
    throw "Missing required .env value: $name"
  }
}
if ((-not $values.ContainsKey("DISCORD_GUILD_IDS") -or [string]::IsNullOrWhiteSpace($values["DISCORD_GUILD_IDS"])) -and
    (-not $values.ContainsKey("DISCORD_GUILD_ID") -or [string]::IsNullOrWhiteSpace($values["DISCORD_GUILD_ID"]))) {
  throw "Missing required .env value: DISCORD_GUILD_IDS or DISCORD_GUILD_ID"
}

$vaultRoot = $values["EBE_VAULT_ROOT"]
$worktreeRoot = $values["EBE_WORKTREE_ROOT"]
if (-not (Test-Path -LiteralPath $vaultRoot)) {
  throw "EBE_VAULT_ROOT does not exist: $vaultRoot"
}
if (-not (Test-Path -LiteralPath $worktreeRoot)) {
  New-Item -ItemType Directory -Force -Path $worktreeRoot | Out-Null
}
if ($worktreeRoot.StartsWith($vaultRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "EBE_WORKTREE_ROOT must not be inside EBE_VAULT_ROOT."
}

foreach ($name in @("DISCORD_CLIENT_ID")) {
  if ($values[$name] -notmatch "^\d{15,25}$") {
    throw "$name should look like a Discord numeric ID."
  }
}
$guildIdsRaw = if ($values.ContainsKey("DISCORD_GUILD_IDS") -and -not [string]::IsNullOrWhiteSpace($values["DISCORD_GUILD_IDS"])) {
  $values["DISCORD_GUILD_IDS"]
} else {
  $values["DISCORD_GUILD_ID"]
}
foreach ($id in $guildIdsRaw.Split(",")) {
  if ($id.Trim() -notmatch "^\d{15,25}$") {
    throw "Discord guild IDs should look like Discord numeric IDs: $id"
  }
}

foreach ($id in $values["DISCORD_ADMIN_USER_IDS"].Split(",")) {
  if ($id.Trim() -notmatch "^\d{15,25}$") {
    throw "DISCORD_ADMIN_USER_IDS contains a value that does not look like a Discord numeric ID: $id"
  }
}

if ($values.ContainsKey("EBE_DAILY_NEWS_ENABLED") -and $values["EBE_DAILY_NEWS_ENABLED"] -match "^(1|true|yes|on)$") {
  if (-not $values.ContainsKey("DISCORD_DAILY_NEWS_CHANNEL_ID") -or [string]::IsNullOrWhiteSpace($values["DISCORD_DAILY_NEWS_CHANNEL_ID"])) {
    Write-Warning "EBE_DAILY_NEWS_ENABLED is true, but DISCORD_DAILY_NEWS_CHANNEL_ID is empty. Scheduled daily news will not start."
  } elseif ($values["DISCORD_DAILY_NEWS_CHANNEL_ID"] -notmatch "^\d{15,25}$") {
    throw "DISCORD_DAILY_NEWS_CHANNEL_ID should look like a Discord numeric ID."
  }
}

$probe = Join-Path $worktreeRoot ".ebe-write-test"
Set-Content -LiteralPath $probe -Value "ok"
Remove-Item -LiteralPath $probe -Force

Write-Host "Tool versions:"
git --version
npm -v
codex --version

Write-Host "Git remotes:"
git -C $vaultRoot remote -v

Write-Host ".env looks usable."
