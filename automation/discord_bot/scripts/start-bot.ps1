Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$botDir = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $botDir

npm start
