param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-z0-9][a-z0-9-]*$')]
  [string]$PageId,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^\d+(?:\.\d+)*$')]
  [string]$StartOrder,

  [Parameter(Mandatory = $true)]
  [ValidateSet('publish-provisional', 'hold')]
  [string]$ManualReviewAction,

  [string]$ProvisionalReason = '',

  [string]$CodexPath = 'codex'
)

$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = $utf8NoBom
[Console]::InputEncoding = $utf8NoBom
[Console]::OutputEncoding = $utf8NoBom
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$sourceProfile = Join-Path $repositoryRoot '.codex\profiles\stage2-controller.config.toml'
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }
$installedProfile = Join-Path $codexHome 'stage2-controller.config.toml'

if (-not (Test-Path -LiteralPath $sourceProfile)) {
  throw "Missing controller profile: $sourceProfile"
}
if (-not (Test-Path -LiteralPath $installedProfile)) {
  throw "Controller profile is not installed: $installedProfile"
}
if ((Get-FileHash -Algorithm SHA256 -LiteralPath $sourceProfile).Hash -ne
    (Get-FileHash -Algorithm SHA256 -LiteralPath $installedProfile).Hash) {
  throw "Installed controller profile differs from the repository profile; reinstall it before running"
}

$env:STAGE2_MCP_PAGE_ID = $PageId
$env:STAGE2_MCP_WORKER_ID = "codex-restricted-$PageId-worker"
$publishProvisional = $ManualReviewAction -eq 'publish-provisional'
$env:STAGE2_MCP_ALLOW_PROVISIONAL_PUBLISH = if ($publishProvisional) { '1' } else { '0' }

$publicationReason = $ProvisionalReason.Trim() -replace '[\r\n]+', ' '
if ($publishProvisional -and [string]::IsNullOrWhiteSpace($publicationReason)) {
  $publicationReason = "User-authorized Stage 2 controller policy: publish the final blocked candidate for $PageId as a clearly marked provisional page"
}
if ($publicationReason.Length -gt 500) {
  throw 'ProvisionalReason must be at most 500 characters'
}

$manualReviewInstruction = if ($publishProvisional) {
@"
The caller explicitly selected publish-provisional for this page. When inspection reports workflowState manual-review, active false, canPublishProvisional true, and a candidateHash, call stage2_publish_provisional_page exactly once with pageId $PageId, that exact candidateHash, and this reason: $publicationReason. Then inspect once more and require publicationState published-provisional before reporting success. This is a provisional publication, never an L3 pass.
"@
} else {
@"
The caller explicitly selected hold for manual review. If inspection reports workflowState manual-review, report the candidateHash, blockers, and publication state, do not call stage2_publish_provisional_page, and stop.
"@
}

$prompt = @"
Run exactly one Stage 2 stage for pageId $PageId as a controller-only agent.

1. Call stage2_resolve_recommended_page with order $StartOrder. Require status resolved, pageId $PageId, tracked true, and active false. If the exact resolver returns another page, an untracked page, or an active lease, report the mismatch and stop. You may call stage2_status only for a compact safety check. Do not use stage2_next_recommended_page to resolve this explicitly requested page because that tool intentionally skips terminal states.
2. Select exactly one custom agent from pageState: use stage2_content_generation for content-generation-queued, stage2_audit for audit-queued, or stage2_repair for repair-queued. Reject every other nonterminal state. Spawn that agent with no inherited/full-history fork. Give it only this compact task: claim pageId $PageId once, complete its assigned role, submit exactly one result, report the controller response, and stop.
3. Wait for that agent. Do not spawn another worker. Call stage2_inspect_publication_candidate for $PageId once to determine the post-submission workflow and publication state. Apply the manual-review rule below when applicable, report the worker result plus the final inspection, and stop. Do not process another page, and do not attempt claim or submit yourself.

$manualReviewInstruction

Your MCP capability profile exposes only status, next-page, publication inspection, and—only when explicitly authorized by the launcher—the page-locked provisional publish tool. Your local shell, project filesystem, network, apps, plugins, and web search are disabled. Each child has a separate role-specific MCP profile locked to $PageId and one claim/one submission.
"@

& $CodexPath --strict-config --dangerously-bypass-hook-trust --cd $repositoryRoot exec --profile stage2-controller --json $prompt
exit $LASTEXITCODE
