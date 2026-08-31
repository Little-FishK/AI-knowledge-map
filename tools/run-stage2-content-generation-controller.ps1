param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-z0-9][a-z0-9-]*$')]
  [string]$PageId,

  [string]$Reason = 'Generate chapter-by-chapter knowledge analysis material for the new editorial workflow',

  [string]$CodexPath = 'codex'
)

$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = $utf8NoBom
[Console]::InputEncoding = $utf8NoBom
[Console]::OutputEncoding = $utf8NoBom
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$sourceProfile = Join-Path $repositoryRoot '.codex\profiles\stage2-controller.config.toml'
$codexHomePath = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }
$installedProfile = Join-Path $codexHomePath 'stage2-controller.config.toml'

if (-not (Test-Path -LiteralPath $sourceProfile)) {
  throw "Missing controller profile: $sourceProfile"
}
if (-not (Test-Path -LiteralPath $installedProfile)) {
  throw "Controller profile is not installed: $installedProfile"
}
if ((Get-FileHash -Algorithm SHA256 -LiteralPath $sourceProfile).Hash -ne
    (Get-FileHash -Algorithm SHA256 -LiteralPath $installedProfile).Hash) {
  throw 'Installed controller profile differs from the repository profile; reinstall it before running'
}

$queueReason = $Reason.Trim() -replace '[\r\n]+', ' '
if ($queueReason.Length -lt 3 -or $queueReason.Length -gt 500) {
  throw 'Reason must contain 3 to 500 characters'
}

$env:STAGE2_MCP_PAGE_ID = $PageId
$env:STAGE2_MCP_WORKER_ID = "codex-content-generation-$PageId"
$env:STAGE2_MCP_ALLOW_PROVISIONAL_PUBLISH = '0'

$prompt = @"
Run exactly one Stage 2 content-generation task for pageId $PageId as a controller-only agent.

1. Call stage2_enqueue_content_generation exactly once with pageId $PageId and this reason: $queueReason
2. Require status queued and nextState content-generation-queued. If the controller rejects the request, report the exact response and stop.
3. Spawn exactly one fresh stage2_content_generation custom agent with no inherited/full-history fork. Tell it only to claim pageId $PageId once, process every eligible chapter in order with the fixed prompt from its task packet, submit exactly one result, report the controller response, and stop.
4. Wait for that agent. Do not spawn another worker. Call stage2_inspect_publication_candidate once to verify that there is no active lease and that publication state was not elevated by content generation. Report the output document path from the worker response and stop.

Do not claim or submit yourself. Do not process another page. Do not run audit, repair, editorial import, finalization, or provisional publication. Your project filesystem, shell, network, apps, and web search are disabled; use only the page-locked Stage 2 controller tools.
"@

& $CodexPath --strict-config --dangerously-bypass-hook-trust --cd $repositoryRoot exec --profile stage2-controller --json $prompt
exit $LASTEXITCODE
