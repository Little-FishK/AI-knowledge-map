param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$deploymentRoot = Join-Path $repo '.tmp/translation-deployments'
$reportDir = Join-Path $repo ('.tmp/workspace-cleanup/' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
function Git-Read([string[]]$Arguments) {
    $result = & git -c "safe.directory=$($repo.Replace('\','/'))" -C $repo @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Git inspection failed: $($Arguments[0])" }
    return ($result -join "`n")
}
$baseline = Get-Content -LiteralPath (Join-Path $deploymentRoot 'baseline.json') -Raw | ConvertFrom-Json
$publicHead = Git-Read @('rev-parse','refs/remotes/origin/gh-pages')
$inventory = Git-Read @('worktree','list','--porcelain')
$inventory | Set-Content -LiteralPath (Join-Path $reportDir 'worktrees-before.txt') -Encoding utf8
Git-Read @('status','--porcelain','--untracked-files=normal') | Set-Content -LiteralPath (Join-Path $reportDir 'source-status.txt') -Encoding utf8
$lockPath = Join-Path $deploymentRoot 'deployment.lock'
$lock = $null
$rows = [Collections.Generic.List[object]]::new()
try {
    # Share the publisher's lock so a new deployment cannot start during cleanup.
    $lock = [IO.File]::Open($lockPath, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
    foreach ($block in ($inventory -split "`n`n")) {
        if ($block -notmatch '(?m)^worktree (.+)$') { continue }
        $target = [IO.Path]::GetFullPath($Matches[1].Trim())
        # Only disposable controller-created checkouts, never other tasks' worktrees.
        if ([IO.Path]::GetDirectoryName($target) -ne [IO.Path]::GetFullPath($deploymentRoot)) { continue }
        if ([IO.Path]::GetFileName($target) -notmatch '^checkout-\d+-[a-f0-9]+$') { continue }
        $head = if ($block -match '(?m)^HEAD (.+)$') { $Matches[1].Trim() } else { '' }
        $row = [ordered]@{ path=$target; commit=$head; state='retained'; reason=''; bytes=0 }
        if ($block -match '(?m)^(locked|prunable)' -or !$head) { $row.reason='locked or unavailable' }
        elseif ($head -eq $baseline.commit -or $head -eq $publicHead) { $row.reason='current baseline or release head' }
        elseif (!(Test-Path -LiteralPath $target -PathType Container)) { $row.reason='missing path' }
        elseif ((Get-Item -LiteralPath $target).Attributes -band [IO.FileAttributes]::ReparsePoint) { $row.reason='reparse point' }
        else {
            & git -c "safe.directory=$($repo.Replace('\','/'))" -C $repo merge-base --is-ancestor $head $publicHead
            $ancestor = $LASTEXITCODE
            $dirty = & git -c "safe.directory=$($target.Replace('\','/'))" -C $target status --porcelain --untracked-files=all --ignored
            if ($LASTEXITCODE -ne 0) { throw "Cannot inspect $target" }
            if ($ancestor -ne 0) { $row.reason='not proven merged into release history' }
            elseif ($dirty) { $row.reason='contains modified, untracked or ignored files' }
            else {
                $files = @(Get-ChildItem -LiteralPath $target -Recurse -Force -File)
                $row.bytes = ($files | Measure-Object -Property Length -Sum).Sum
                $row.state = 'eligible'
                $row.reason = 'clean checkout; commit retained in release history and branch'
                if ($Apply) {
                    # No --force: Git must independently confirm that removal is safe.
                    & git -c "safe.directory=$($repo.Replace('\','/'))" -C $repo worktree remove -- $target
                    if ($LASTEXITCODE -ne 0) { throw "Worktree removal refused: $target" }
                    $row.state = 'removed'
                }
            }
        }
        $rows.Add([pscustomobject]$row)
        $rows | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $reportDir 'worktrees.json') -Encoding utf8
    }
} finally {
    if ($lock) { $lock.Dispose(); Remove-Item -LiteralPath $lockPath }
}
[pscustomobject]@{ apply=[bool]$Apply; report=$reportDir; inspected=$rows.Count; removed=@($rows | Where-Object state -eq 'removed').Count; eligible=@($rows | Where-Object state -eq 'eligible').Count; retained=@($rows | Where-Object state -eq 'retained').Count; bytes=($rows | Where-Object { $_.state -in 'removed','eligible' } | Measure-Object bytes -Sum).Sum } | ConvertTo-Json
